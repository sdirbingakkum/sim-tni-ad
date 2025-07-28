// src/resources/sim/SimEdit.js
import React from "react"; // useEffect, useState tidak lagi diperlukan untuk initialValues di Edit
import {
  Edit,
  TabbedForm,
  FormTab,
  ReferenceInput,
  SelectInput,
  AutocompleteInput,
  TextInput,
  DateInput,
  FormDataConsumer,
  ImageInput,
  // ImageField, // Dari react-admin, jika perlu untuk preview ImageInput standar
} from "react-admin";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
// moment tidak lagi digunakan untuk initialValues di sini, tapi mungkin berguna untuk hal lain
// import moment from "moment"; 

// Komponen & helper Anda
import NoIdentitasInput from "./helpers/input/NoIdentitasInput";
import isBiiSus from "./helpers/input/conditions/isBiiSus";
import hasJenisPemohon from "./helpers/input/conditions/hasJenisPemohon";
import isPrajuritTniAd from "./helpers/input/conditions/isPrajuritTniAd";
import isPnsTniAd from "./helpers/input/conditions/isPnsTniAd";
import InputJenisPemohon from "./helpers/input/InputJenisPemohon";
import SimEditToolbar from "./helpers/edit/SimEditToolbar";
// FingerprintInput tidak ada di SimCreate terakhir, jadi saya akan mengomentarinya di sini juga
// import FingerprintInput from "../../helpers/input/FingerprintInput"; 
import CameraInput from "../../helpers/input/CameraInput"; // Wrapper Anda
import SignaturePadInput from "../../helpers/input/SignaturePadInput"; // Wrapper Anda
import CustomImageField from "../../helpers/input/components/ImageField"; // Komponen preview kustom Anda
import dataProvider from "../../providers/data"; // Instance dataProvider Anda

// Konstanta untuk bucket dan folder (samakan dengan SimCreate.js)
const SIM_BUCKET = "gambar";
const SIM_PAS_FOTO_FOLDER = "pasfoto_sim";
const SIM_TANDA_TANGAN_FOLDER = "tanda_tangan_sim";
const SIM_SIDIK_JARI_FOLDER = "sidik_jari_sim";

// Fungsi normalisasi untuk menampilkan file yang sudah ada di form Edit
// Ini memastikan ImageInput dan CameraInput (untuk preview) mendapatkan format data yang benar
const normalizeFileFieldForDisplay = (record, fileFieldConfigurations) => {
  if (!record) return record;
  const recordCopy = { ...record };

  fileFieldConfigurations.forEach(({ source, fileNameField }) => {
    const mainFileValue = recordCopy[source];       // Nilai dari field utama (bisa URL string atau objek dari Camera)
    const pathValue = recordCopy[fileNameField];  // Nilai dari field _path (jika ada)

    let displaySrc = null;
    let displayTitle = source; // Judul default
    let displayPath = pathValue;

    if (typeof mainFileValue === 'string' && mainFileValue.startsWith('http')) {
      // Kasus 1: DB menyimpan URL langsung di field 'source'
      displaySrc = mainFileValue;
      if (!displayPath) displayPath = mainFileValue; // Gunakan URL sebagai path sementara jika _path kosong
    } else if (typeof mainFileValue === 'object' && mainFileValue !== null && 
               typeof mainFileValue.src === 'string' && mainFileValue.src.startsWith('http')) {
      // Kasus 2: DB menyimpan objek dari CameraComponent lama {src, path, title, bucket}
      displaySrc = mainFileValue.src;
      displayPath = mainFileValue.path || pathValue || mainFileValue.src; // Prioritaskan path dari objek
      displayTitle = mainFileValue.title || source;
    }
    // Tambahkan kasus lain jika ada format penyimpanan lama yang perlu ditangani

    if (displaySrc) {
      // Ubah nilai field menjadi objek yang bisa ditampilkan oleh ImageInput/CustomImageField
      // dan juga bisa dikenali oleh CameraComponent untuk preview awal (jika ia membaca record[source].src)
      recordCopy[source] = {
        src: displaySrc,
        title: displayTitle,
        path: displayPath, // Menyertakan path asli jika ada, untuk referensi
        // Properti 'rawFile' tidak di-set di sini karena ini adalah data yang sudah ada, bukan file baru.
        // ImageInput akan menampilkan 'src' dan jika pengguna memilih file baru, ia akan menambahkan 'rawFile'.
      };
    } else if (mainFileValue) {
      // Jika ada nilai tapi bukan format URL atau objek yang dikenali,
      // biarkan apa adanya atau set ke null agar input menampilkan placeholder.
      // Ini bisa terjadi jika field berisi data yang tidak valid atau format lama lainnya.
      // console.warn(`[normalizeFileFieldForDisplay] Format tidak dikenal untuk ${source}:`, mainFileValue);
      // recordCopy[source] = null; // Opsional: bersihkan jika tidak bisa ditampilkan
    }
  });
  return recordCopy;
};

const SimEdit = ({ permissions, ...props }) => {
  // Konfigurasi fileFields (sama seperti SimCreate)
  const fileFields = [
    { source: "pas_foto", bucket: SIM_BUCKET, folder: SIM_PAS_FOTO_FOLDER, fileNameField: "pas_foto_path" },
    { source: "tanda_tangan", bucket: SIM_BUCKET, folder: SIM_TANDA_TANGAN_FOLDER, fileNameField: "tanda_tangan_path" },
    { source: "sidik_jari", bucket: SIM_BUCKET, folder: SIM_SIDIK_JARI_FOLDER, fileNameField: "sidik_jari_path" },
  ];

  // handleSave disederhanakan, mengandalkan processFileUploads di dataProvider
  const handleSave = async (values) => {
    try {
      // console.log("[SimEdit] Values being sent to dataProvider.update:", values);
      // 'values' sudah berisi:
      // - Objek {src: 'URL_lama', ...} jika file tidak diubah (dari transform).
      // - Objek {src: 'URL_kamera_baru', path: ..., title: ...} jika dari CameraComponent baru.
      // - Objek {rawFile: File, ...} jika file baru diunggah via ImageInput.
      // - null jika file dihapus dari ImageInput.

      // 'berlaku_hingga' biasanya tidak diubah saat edit, kecuali ada fieldnya di form.
      // Jika perlu kalkulasi ulang, lakukan di sini atau pastikan 'values' sudah benar.

      const result = await dataProvider.update(
        "sim", // resource
        { id: values.id, data: values }, // params
        fileFields // fileFieldsConfig sebagai argumen ketiga
      );
      return result;
    } catch (error) {
      console.error("Error updating SIM data:", error);
      throw error;
    }
  };

  // Transformasi data dari server sebelum ditampilkan di form
  const transform = (data) => {
    if (!data) return data;
    // console.log("[SimEdit] Data from server (before transform):", data);
    const normalizedData = normalizeFileFieldForDisplay(data, fileFields);
    // console.log("[SimEdit] Data after transform (for form display):", normalizedData);
    return normalizedData;
  };

  return permissions ? (
    <Edit {...props} title="Edit SIM" transform={transform}>
      <TabbedForm
        toolbar={<SimEditToolbar />}
        variant="outlined"
        save={handleSave}
      >
        <FormTab label="Keterangan">
          <TextInput source="id" disabled label="ID SIM"/>
          <DateInput source="created" label="Tanggal Permohonan" disabled /> 
          <DateInput source="berlaku_hingga" label="Berlaku Hingga" disabled />
          <ReferenceInput source="permohonan_sim_tni_id" reference="permohonan_sim_tni" label="Permohonan SIM TNI" sort={{ field: "id", order: "ASC" }} isRequired>
            <SelectInput optionText="nama" />
          </ReferenceInput>
          <ReferenceInput source="golongan_sim_tni_id" reference="golongan_sim_tni" label="Golongan SIM TNI" sort={{ field: "id", order: "ASC" }} isRequired>
            <SelectInput optionText="nama" />
          </ReferenceInput>
          <FormDataConsumer subscription={{ values: true }}>
            {({ formData, ...rest }) => isBiiSus(formData) && (
              <ReferenceInput source="kualifikasi_pengemudi_id" reference="kualifikasi_pengemudi" label="Kualifikasi Pengemudi" sort={{ field: "id", order: "ASC" }} {...rest} isRequired={isBiiSus(formData)}>
                <SelectInput optionText="kode" />
              </ReferenceInput>
            )}
          </FormDataConsumer>
        </FormTab>

        <FormTab label="Pemohon">
          {/* Isi FormTab Pemohon (samakan dengan SimCreate) */}
          <InputJenisPemohon />
          <FormDataConsumer subscription={{ values: true }}>
            {({ formData, ...rest }) => hasJenisPemohon(formData) && (
                <NoIdentitasInput jenis_pemohon_id={formData.pemohon?.jenis_pemohon_id} {...rest} />
            )}
          </FormDataConsumer>
          <TextInput source="pemohon.nama" label="Nama" isRequired />
          <FormDataConsumer subscription={{ values: true }}>
            {({ formData, ...rest }) => (isPrajuritTniAd(formData) || isPnsTniAd(formData)) && (
                <ReferenceInput source="pemohon.pangkat_id" reference="pangkat" label="Pangkat" sort={{ field: "id", order: "ASC" }} {...rest} defaultValue={isPnsTniAd(formData) ? 23 : null} isRequired={isPrajuritTniAd(formData) || isPnsTniAd(formData)}>
                  <SelectInput optionText="kode" />
                </ReferenceInput>
            )}
          </FormDataConsumer>
          <FormDataConsumer subscription={{ values: true }}>
            {({ formData, ...rest }) => isPrajuritTniAd(formData) && (
                <ReferenceInput source="pemohon.korps_id" reference="korps" label="Korps" allowEmpty sort={{ field: "id", order: "ASC" }} {...rest} isRequired={isPrajuritTniAd(formData)}>
                  <SelectInput optionText="kode" />
                </ReferenceInput>
            )}
          </FormDataConsumer>
          {/* ... tambahkan field pemohon lainnya seperti di SimCreate ... */}
          <TextInput source="pemohon.kesatuan" label="Kesatuan" />
          <TextInput source="pemohon.alamat" label="Alamat" multiline />
          <TextInput source="pemohon.tempat_lahir" label="Tempat Lahir" />
          <DateInput source="pemohon.tanggal_lahir" label="Tanggal Lahir" />
           <ReferenceInput source="pemohon.golongan_darah_id" reference="golongan_darah" label="Golongan Darah" sort={{ field: "id", order: "ASC" }}>
            <SelectInput optionText="nama" />
          </ReferenceInput>
           <FormDataConsumer subscription={{ values: true }}>
            {({ formData, ...rest }) => isPrajuritTniAd(formData) && (
                <TextInput source="pemohon.no_ktp_prajurit" label="No. KTP Prajurit" {...rest} />
            )}
          </FormDataConsumer>
        </FormTab>

        <FormTab label="Pas Foto" path="pas_foto">
          <Typography variant="subtitle1" gutterBottom>Opsi 1: Ambil Foto Langsung dari Kamera</Typography>
          <CameraInput 
            source="pas_foto" 
            label="Ambil/Ganti Foto" 
            bucketName={SIM_BUCKET} 
            folderPath={SIM_PAS_FOTO_FOLDER} 
          />
          <Box mt={3} mb={1}><Typography variant="subtitle1" gutterBottom>Opsi 2: Unggah File Gambar Baru</Typography></Box>
          <ImageInput 
            source="pas_foto" 
            label="Pilih atau seret file pas foto baru" 
            accept="image/*" 
            placeholder={<p>Kosongkan atau letakkan file baru di sini jika ingin mengganti</p>}
          >
            <CustomImageField source="src" title="title" />
          </ImageInput>
           <Box mt={2}><Typography variant="caption">Catatan: Jika Anda mengubah foto, foto lama akan diganti saat disimpan.</Typography></Box>
        </FormTab>

        <FormTab label="Tanda Tangan" path="tanda_tangan">
          <Typography variant="subtitle1" gutterBottom>Opsi 1: Gambar Ulang Tanda Tangan</Typography>
          <SignaturePadInput 
            source="tanda_tangan" 
            // Tambahkan props yang relevan untuk SignaturePadInput
          />
           <Box mt={3} mb={1}><Typography variant="subtitle1" gutterBottom>Opsi 2: Unggah Gambar Tanda Tangan Baru</Typography></Box>
          <ImageInput 
            source="tanda_tangan" 
            label="Pilih atau seret file tanda tangan baru" 
            accept="image/*" 
            placeholder={<p>Kosongkan atau letakkan file baru di sini jika ingin mengganti</p>}
          >
            <CustomImageField source="src" title="title" />
          </ImageInput>
           <Box mt={2}><Typography variant="caption">Catatan: Jika Anda mengubah tanda tangan, yang lama akan diganti saat disimpan.</Typography></Box>
        </FormTab>

        <FormTab label="Sidik Jari" path="sidik_jari">
          <Typography variant="subtitle1" gutterBottom>Unggah Gambar Sidik Jari Baru (Jika Ada Perubahan)</Typography>
          <ImageInput 
            source="sidik_jari" 
            label="Unggah Gambar Sidik Jari" 
            accept="image/*" 
            placeholder={<p>Kosongkan atau letakkan file baru di sini jika ingin mengganti</p>}
          >
            <CustomImageField source="src" title="title" />
          </ImageInput>
        </FormTab>
      </TabbedForm>
    </Edit>
  ) : null;
};

export default SimEdit;
