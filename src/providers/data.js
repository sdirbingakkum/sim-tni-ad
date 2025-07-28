// dataProvider.js (Dimodifikasi dari versi "sebelum error" Anda)
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase client Anda (dari kode Anda)
const supabaseClient = createClient(
  "https://ocqghycfqgrvlgqjoort.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcWdoeWNmcWdydmxncWpvb3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjkwNzEsImV4cCI6MjA1NzEwNTA3MX0.p3DWXSu6vWL1ey0CeKBhWaeD0iu54Fk6iEHohPNWCRU"
);

// Daftar operator yang dikenal (dari kode Anda)
const KNOWN_OPERATORS = ["gte", "lte", "gt", "lt", "neq", "like", "ilike", "in"];

// mapFilters (dari kode Anda - ini versi yang sudah baik)
const mapFilters = (filterObject) => {
  const supabaseFilters = [];
  if (!filterObject || Object.keys(filterObject).length === 0) { // Tambahkan pengecekan objek kosong
    return supabaseFilters;
  }

  Object.keys(filterObject).forEach((key) => {
    const value = filterObject[key];
    if (value === undefined) { // Abaikan filter dengan nilai undefined
        // console.warn(`[mapFilters] Mengabaikan filter untuk key "${key}" karena nilainya undefined.`);
        return; 
    }
    let operatorFoundAndHandled = false;

    for (const op of KNOWN_OPERATORS) {
      const suffix = `_${op}`;
      if (key.endsWith(suffix)) {
        const field = key.slice(0, -suffix.length);
        if (field) {
          operatorFoundAndHandled = true;
          switch (op) {
            case "gte": supabaseFilters.push((query) => query.gte(field, value)); break;
            case "lte": supabaseFilters.push((query) => query.lte(field, value)); break;
            case "gt": supabaseFilters.push((query) => query.gt(field, value)); break;
            case "lt": supabaseFilters.push((query) => query.lt(field, value)); break;
            case "neq": supabaseFilters.push((query) => query.neq(field, value)); break;
            case "like": case "ilike": supabaseFilters.push((query) => query.ilike(field, `%${value}%`)); break;
            case "in":
              if (Array.isArray(value)) {
                supabaseFilters.push((query) => query.in(field, value));
              } else { console.warn(`[mapFilters] Operator "in" untuk key "${key}" diharapkan Array, tapi mendapat:`, value); }
              break;
            default: operatorFoundAndHandled = false; 
          }
        }
        if(operatorFoundAndHandled) break; // break dari loop for of KNOWN_OPERATORS
      }
    }

    if (!operatorFoundAndHandled) {
      if (value === null) {
        supabaseFilters.push((query) => query.is(key, null));
      } else if (Array.isArray(value)) {
        supabaseFilters.push((query) => query.in(key, value));
      } else { // value !== undefined sudah dicek di awal
        supabaseFilters.push((query) => query.eq(key, value));
      }
    }
  });
  return supabaseFilters;
};

// applyQueryModifiers (dari kode Anda)
const applyQueryModifiers = (query, params) => {
  if (params.filter && Object.keys(params.filter).length > 0) { // Tambahkan pengecekan objek kosong
    const filters = mapFilters(params.filter);
    filters.forEach((filterFn) => { // Ganti nama variabel agar tidak bentrok
      query = filterFn(query);
    });
  }
  if (params.sort) {
    const { field, order } = params.sort;
    query = query.order(field, { ascending: order.toUpperCase() === "ASC" }); // Tambahkan toUpperCase()
  }
  if (params.pagination) {
    const { page, perPage } = params.pagination;
    const start = (page - 1) * perPage;
    const end = page * perPage - 1;
    query = query.range(start, end);
  }
  return query;
};

// uploadFile (dari kode Anda - ini sudah baik untuk CameraComponent)
const uploadFile = async (
  file,
  bucketName,
  folderPath = "",
  fileNameOverride = null
) => {
  if (!file) {
    return null;
  }
  const fileName =
    fileNameOverride || `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

  // console.log(`[uploadFile] Uploading ${filePath} to ${bucketName}`);
  const { data, error } = await supabaseClient.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Biarkan upsert: true jika itu perilaku yang Anda inginkan
      contentType: file.type,
    });

  if (error) {
    console.error("[uploadFile] Supabase storage upload error:", error);
    if (error.message.includes("new row violates row-level security policy")) {
      throw new Error(`File upload denied due to security policy. Please check bucket permissions for "${bucketName}".`);
    }
    throw new Error(`Error uploading file: ${error.message}`);
  }

  const { data: { publicUrl } } = supabaseClient.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return { url: publicUrl, path: filePath, title: fileName /* Tambahkan title */ };
};


// Fungsi helper untuk konversi data URL ke objek File
const dataURLtoFile = (dataurl, filename) => {
  if (!dataurl || typeof dataurl !== 'string' || !dataurl.startsWith('data:image')) return null;
  try {
    let arr = dataurl.split(','), mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    let mime = mimeMatch[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  } catch (e) { console.error("[dataURLtoFile] Error converting data URL:", e); return null; }
}

// MODIFIKASI UTAMA ADA DI SINI: processFileUploads
const processFileUploads = async (data, fileFieldsConfig = []) => {
  if (!fileFieldsConfig || fileFieldsConfig.length === 0) return data;
  const processedData = { ...data };

  for (const fieldConfig of fileFieldsConfig) {
    const { source, bucket = "gambar", folder = "", fileNameField = null } = fieldConfig;
    let fieldValue = processedData[source];

    // 1. Jika field dikosongkan/null/undefined
    if (fieldValue === null || fieldValue === undefined) {
      processedData[source] = null;
      if (fileNameField) processedData[fileNameField] = null;
      // console.log(`[processFileUploads] Field "${source}" is null/undefined.`);
      continue;
    }

    let fileToUpload = null;
    let isOutputFromCurrentCameraComponent = false; // Output CameraComponent Anda saat ini: {src, path, title, bucket}

    // 2. Deteksi output dari CameraComponent Anda saat ini (yang sudah mengunggah)
    // Ini adalah FALLBACK jika CameraComponent tidak diubah untuk menghasilkan rawFile
    if (source === "pas_foto" && // Hanya untuk pas_foto atau field lain yang menggunakan CameraComponent jenis ini
        typeof fieldValue === 'object' && fieldValue !== null &&
        typeof fieldValue.src === 'string' && fieldValue.src.startsWith('http') &&
        typeof fieldValue.path === 'string' && fieldValue.title) {
      // console.log(`[processFileUploads] Field "${source}" adalah output dari CameraComponent (sudah diupload).`);
      isOutputFromCurrentCameraComponent = true;
    }
    // 3. Deteksi dataURL dari SignaturePadInput (FALLBACK jika SignaturePadInput tidak menghasilkan rawFile)
    else if (source === "tanda_tangan" && typeof fieldValue === 'string' && fieldValue.startsWith('data:image')) {
      // console.log(`[processFileUploads] Field "${source}" adalah dataURL, mengkonversi ke File.`);
      const signatureFile = dataURLtoFile(fieldValue, `ttd_${source}_${Date.now()}.png`);
      if (signatureFile) {
        fileToUpload = signatureFile; // Akan diunggah di langkah berikutnya
      } else {
        console.warn(`[processFileUploads] Gagal konversi dataURL untuk "${source}".`);
        // Biarkan fieldValue apa adanya, mungkin disimpan sebagai string base64 jika tidak ada penanganan lain.
      }
    }
    // 4. Deteksi format input file standar (termasuk jika CameraInput/SignaturePadInput sudah diubah menghasilkan rawFile)
    else if (fieldValue instanceof File) {
      fileToUpload = fieldValue;
    } else if (fieldValue && fieldValue.rawFile instanceof File) {
      fileToUpload = fieldValue.rawFile;
    } else if (fieldValue && fieldValue.src instanceof File) { // Jarang, tapi jaga-jaga
      fileToUpload = fieldValue.src;
    }

    // 5. Lakukan tindakan berdasarkan apa yang ditemukan
    if (isOutputFromCurrentCameraComponent) {
      // Gunakan URL dan Path dari output CameraComponent
      processedData[source] = fieldValue.src; // Simpan URL
      if (fileNameField) {
        processedData[fileNameField] = fieldValue.path; // Simpan path
      }
    } else if (fileToUpload) {
      // Ada file baru untuk diunggah
      // console.log(`[processFileUploads] Mengunggah file baru untuk "${source}".`);
      try {
        const uploadResult = await uploadFile(fileToUpload, bucket, folder); // Gunakan fungsi uploadFile yang sudah ada
        if (uploadResult && uploadResult.url) {
          processedData[source] = uploadResult.url; // Simpan URL
          if (fileNameField) {
            processedData[fileNameField] = uploadResult.path; // Simpan path
          }
        } else {
          console.error(`[processFileUploads] Upload untuk "${source}" gagal atau hasil tidak lengkap (URL/Path).`, uploadResult);
          // Pertimbangkan: Lempar error atau biarkan field lama (jika edit) atau set null
          // throw new Error(`Upload gagal untuk ${source}`);
        }
      } catch (error) {
        console.error(`[processFileUploads] Error saat mengunggah file untuk "${source}":`, error.message);
        throw error; // Lempar error agar proses simpan utama tahu ada masalah
      }
    } else if (typeof fieldValue === 'string' && fieldValue.startsWith('http')) {
      // Nilai sudah berupa URL (misalnya tidak diubah saat edit), pertahankan.
      // console.log(`[processFileUploads] Nilai untuk "${source}" sudah URL, dipertahankan.`);
      processedData[source] = fieldValue;
      // Asumsi fileNameField (jika ada) sudah terisi dengan benar dari data yang dimuat saat edit.
    } else if (typeof fieldValue === 'string' && fieldValue.startsWith('data:image') && source !== "tanda_tangan") {
        // Data URL untuk field lain yang tidak ditangani secara khusus
        console.warn(`[processFileUploads] Field "${source}" berisi data URL mentah dan tidak dikonversi secara spesifik. Mungkin akan disimpan sebagai base64 jika backend mengizinkan.`);
        processedData[source] = fieldValue; // Teruskan apa adanya
    }
    // Jika tidak ada kondisi di atas yang cocok, nilai asli dari form (processedData[source]) akan tetap.
    // Ini bisa jadi objek yang tidak dikenal, atau string yang bukan URL/dataURL.
  }
  return processedData;
};


const dataProvider = {
  getList: async (resource, params) => {
    let query = supabaseClient.from(resource).select("*", { count: "exact" });
    query = applyQueryModifiers(query, params);
    const { data, error, count } = await query;
    if (error) { throw new Error(`Error fetching ${resource}: ${error.message}`); }
    return { data: data || [], total: count || 0 };
  },

  getOne: async (resource, params) => {
    // Menggunakan implementasi getOne dari kode Anda
    try {
      const { count, error: countError } = await supabaseClient
        .from(resource).select("*", { count: "exact", head: true }).eq("id", params.id);
      if (countError) { console.error(`Error checking existence of ${resource}/${params.id}:`, countError); }
      else if (count === 0) { throw new Error(`Resource ${resource} with id ${params.id} not found`); }
      else if (count > 1) { console.warn(`Found ${count} rows for ${resource}/${params.id}, expected 1.`); }

      const { data, error } = await supabaseClient.from(resource).select("*").eq("id", params.id).maybeSingle();
      if (error) { throw new Error(`Error fetching ${resource}/${params.id}: ${error.message}`); }
      if (!data && !countError && count === 0) { /* Ini sudah ditangani di atas */ }
      else if (!data && !error) { throw new Error(`Resource ${resource} with id ${params.id} not found after check.`); } // Jaga-jaga
      return { data };
    } catch (error) { console.error(`Error in getOne for ${resource}/${params.id}:`, error); throw error; }
  },

  getMany: async (resource, params) => {
    const { data, error } = await supabaseClient.from(resource).select("*").in("id", params.ids);
    if (error) { throw new Error(`Error fetching multiple ${resource}: ${error.message}`); }
    return { data: data || [] };
  },

  getManyReference: async (resource, params) => {
    const { target, id } = params;
    let query = supabaseClient.from(resource).select("*", { count: "exact" }).eq(target, id);
    
    const modifiedParams = { ...params }; // Hindari mutasi params asli
    if (modifiedParams.filter) { delete modifiedParams.filter[target]; } // Hapus filter target jika ada di params.filter
    query = applyQueryModifiers(query, modifiedParams);

    const { data, error, count } = await query;
    if (error) { throw new Error(`Error fetching references for ${resource}: ${error.message}`); }
    return { data: data || [], total: count || 0 };
  },

  create: async (resource, params, fileFieldsConfig = []) => { // Terima fileFieldsConfig
    const dataToSave = await processFileUploads(params.data, fileFieldsConfig);
    const { data, error } = await supabaseClient.from(resource).insert(dataToSave).select();
    if (error) { throw new Error(`Error creating ${resource}: ${error.message}`); }
    // React Admin biasanya mengharapkan record tunggal yang baru dibuat
    return { data: data && data.length > 0 ? data[0] : null };
  },

  update: async (resource, params, fileFieldsConfig = []) => { // Terima fileFieldsConfig
    const dataToSave = await processFileUploads(params.data, fileFieldsConfig);
    // Pisahkan ID dari data jika ada di dataToSave, karena Supabase tidak suka ID di payload update
    const { id, ...updatePayload } = dataToSave;

    const { data, error } = await supabaseClient.from(resource).update(updatePayload).eq("id", params.id).select();
    if (error) { throw new Error(`Error updating ${resource}/${params.id}: ${error.message}`); }
    return { data: data && data.length > 0 ? data[0] : null };
  },

  updateMany: async (resource, params) => {
    // processFileUploads tidak praktis di sini karena params.data adalah satu objek untuk semua ID
    // Jika perlu penanganan file di updateMany, perlu logika kustom yang lebih kompleks.
    const { data, error } = await supabaseClient.from(resource).update(params.data).in("id", params.ids).select();
    if (error) { throw new Error(`Error updating multiple ${resource}: ${error.message}`); }
    // Kembalikan ID yang diupdate. React Admin biasanya mengharapkan array ID.
    // Supabase v2 update().in() tidak mengembalikan ID secara langsung di 'data' jika select() tidak spesifik.
    // Jadi, kita kembalikan params.ids sebagai konfirmasi.
    return { data: params.ids };
  },

  delete: async (resource, params) => {
    // Ambil record dulu (untuk dikembalikan & jika perlu hapus file terkait)
    const { data: record, error: fetchError } = await supabaseClient.from(resource).select("*").eq("id", params.id).single();
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: 0 rows
        throw new Error(`Error fetching record to delete ${resource}/${params.id}: ${fetchError.message}`);
    }
    
    // TODO Opsional: Hapus file terkait dari storage sebelum menghapus record
    // if (record) {
    //   const fileConfigs = fileFields.find(fc => fc.resource === resource); // Anda perlu cara mendapatkan config fileFields di sini
    //   if (fileConfigs && record[fileConfigs.pas_foto_path]) {
    //     await dataProvider.deleteFile(fileConfigs.bucket, record[fileConfigs.pas_foto_path]);
    //   }
    // }

    const { error } = await supabaseClient.from(resource).delete().eq("id", params.id);
    if (error) { throw new Error(`Error deleting ${resource}/${params.id}: ${error.message}`); }
    return { data: record || { id: params.id } }; // Kembalikan record yang dihapus atau minimal ID
  },

  deleteMany: async (resource, params) => {
    // TODO Opsional: Sama seperti delete, perlu loop untuk hapus file terkait per ID.
    const { error } = await supabaseClient.from(resource).delete().in("id", params.ids);
    if (error) { throw new Error(`Error deleting multiple ${resource}: ${error.message}`); }
    return { data: params.ids };
  },

  uploadFile: uploadFile, // Ekspos fungsi uploadFile

  deleteFile: async (bucketName, filePath) => {
    const { error } = await supabaseClient.storage.from(bucketName).remove([filePath]);
    if (error) { throw new Error(`Error deleting file: ${error.message}`); }
    return { success: true }; // Atau kembalikan data dari Supabase jika perlu
  },
};

export default dataProvider;
