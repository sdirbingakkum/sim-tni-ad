// src/resources/sim/SimCreate.js
import React, { useEffect, useState } from "react";
import {
  Create,
  TabbedForm,
  FormTab,
  ReferenceInput,
  SelectInput,
  AutocompleteInput,
  TextInput,
  DateInput,
  FormDataConsumer,
} from "react-admin";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Alert } from '@material-ui/lab';
import moment from "moment";

// Komponen & helper Anda
import NoIdentitasInput from "./helpers/input/NoIdentitasInput";
import isBiiSus from "./helpers/input/conditions/isBiiSus";
import hasJenisPemohon from "./helpers/input/conditions/hasJenisPemohon";
import isPrajuritTniAd from "./helpers/input/conditions/isPrajuritTniAd";
import isPnsTniAd from "./helpers/input/conditions/isPnsTniAd";
import InputJenisPemohon from "./helpers/input/InputJenisPemohon";
import SimCreateToolbar from "./helpers/create/SimCreateToolbar";

// Import komponen instant upload
import CameraInput from "../../helpers/input/CameraInput";
import SignaturePadInput from "../../helpers/input/SignaturePadInput";
import FingerprintInput from "../../helpers/input/FingerprintInput";
import EnhancedImageInput from "../../helpers/input/EnhancedImageInput";

import dataProvider from "../../providers/data";

// Konstanta untuk bucket dan folder
const SIM_BUCKET = "gambar";
const SIM_PAS_FOTO_FOLDER = "pasfoto_sim";
const SIM_TANDA_TANGAN_FOLDER = "tanda_tangan_sim";
const SIM_SIDIK_JARI_FOLDER = "sidik_jari_sim";

const SimCreate = ({ permissions, ...props }) => {
  const [initialValues, setInitialValues] = useState({});
  const now = moment();

  useEffect(() => {
    if (permissions) {
      const createdDate = moment().format("YYYY-MM-DD");
      setInitialValues({
        satlak_id: permissions.satlak_id,
        created: createdDate,
      });
    }
  }, [permissions]);

  // Konfigurasi fileFields untuk dataProvider
  const fileFields = [
    { source: "pas_foto", bucket: SIM_BUCKET, folder: SIM_PAS_FOTO_FOLDER, fileNameField: "pas_foto_path" },
    { source: "tanda_tangan", bucket: SIM_BUCKET, folder: SIM_TANDA_TANGAN_FOLDER, fileNameField: "tanda_tangan_path" },
    { source: "sidik_jari", bucket: SIM_BUCKET, folder: SIM_SIDIK_JARI_FOLDER, fileNameField: "sidik_jari_path" },
  ];

  // Transform function untuk memastikan no_ktp_prajurit selalu ada
  const transform = (data) => {
    console.log("🔄 TRANSFORM called - Original data:", data);
    
    // Pastikan pemohon ada
    if (!data.pemohon) {
      data.pemohon = {};
    }
    
    // Pastikan no_ktp_prajurit selalu ada value (minimal "-")
    if (!data.pemohon.no_ktp_prajurit || data.pemohon.no_ktp_prajurit.trim() === "") {
      data.pemohon.no_ktp_prajurit = "-";
      console.log("✏️ Set default no_ktp_prajurit: '-'");
    }
    
    // Tambahkan berlaku_hingga
    data.berlaku_hingga = moment(data.created || now)
      .add(5, "y")
      .format("YYYY-MM-DD");
    
    console.log("✅ TRANSFORM result:", data);
    return data;
  };

  // handleSave - sekarang lebih sederhana karena transform sudah handle logic
  const handleSave = async (values) => {
    try {
      console.log("📝 handleSave called with values:", values);

      const transformedData = transform({ ...values });
      
      console.log("💾 Sending to dataProvider:", transformedData);

      // File sudah di-upload secara instant, dataProvider hanya perlu handle metadata
      const result = await dataProvider.create("sim", { data: transformedData }, fileFields);

      console.log("✅ SIM created successfully");
      return result;
    } catch (error) {
      console.error("❌ Error in handleSave:", error);
      console.error("❌ Error message:", error.message);
      throw error;
    }
  };

  return permissions ? (
    <Create {...props} title="Tambah SIM">
      <TabbedForm
        toolbar={<SimCreateToolbar />}
        initialValues={initialValues}
        variant="outlined"
        save={handleSave}
        transform={transform}
      >
        <FormTab label="Keterangan Edited">
          <DateInput source="created" label="Tanggal Permohonan" />
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
          <FormDataConsumer subscription={{ values: true }}>
            {({ formData, ...rest }) => isPnsTniAd(formData) && (
              <ReferenceInput source="pemohon.golongan_pns_id" reference="golongan_pns" label="Golongan PNS" sort={{ field: "id", order: "ASC" }} {...rest} isRequired={isPnsTniAd(formData)}>
                <AutocompleteInput optionText="nama" />
              </ReferenceInput>
            )}
          </FormDataConsumer>
          <FormDataConsumer subscription={{ values: true }}>
            {({ formData, ...rest }) => (isPrajuritTniAd(formData) || isPnsTniAd(formData)) && (
              <TextInput source="pemohon.jabatan" label="Jabatan" {...rest} />
            )}
          </FormDataConsumer>
          <TextInput source="pemohon.kesatuan" label="Kesatuan" />
          <TextInput source="pemohon.alamat" label="Alamat" multiline />
          <TextInput source="pemohon.tempat_lahir" label="Tempat Lahir" />
          <DateInput source="pemohon.tanggal_lahir" label="Tanggal Lahir" />
          <ReferenceInput source="pemohon.golongan_darah_id" reference="golongan_darah" label="Golongan Darah" sort={{ field: "id", order: "ASC" }}>
            <SelectInput optionText="nama" />
          </ReferenceInput>
          <FormDataConsumer subscription={{ values: true }}>
            {({ formData, ...rest }) => (isPrajuritTniAd(formData) || isPnsTniAd(formData)) && (
              <TextInput 
                source="pemohon.no_ktp_prajurit" 
                label="No. KTA" 
                {...rest}
                isRequired={true}
              />
            )}
          </FormDataConsumer>
        </FormTab>

        <FormTab label="Pas Foto" path="pas_foto">
          <Alert severity="info" style={{ marginBottom: 16 }}>
            <Typography variant="body2">
              💡 <strong>Instant Upload:</strong> Semua gambar akan langsung disimpan ke server setelah dipilih/diambil.
              Anda tidak perlu menunggu menyimpan form.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom color="primary">📷 Pas Foto</Typography>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Opsi 1: Ambil Foto Langsung dari Kamera</Typography>
            <CameraInput
              source="pas_foto"
              label="Ambil Foto"
              bucketName={SIM_BUCKET}
              folderPath={SIM_PAS_FOTO_FOLDER}
            />
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Opsi 2: Unggah File Gambar</Typography>
            <EnhancedImageInput
              source="pas_foto"
              label="Pilih atau seret file pas foto"
              bucketName={SIM_BUCKET}
              folderPath={SIM_PAS_FOTO_FOLDER}
              placeholder={<p>📁 Letakkan file di sini atau klik untuk memilih (akan langsung disimpan)</p>}
            />
          </Box>

          <Alert severity="success" style={{ marginTop: 16 }}>
            <Typography variant="caption">
              ✅ <strong>Sistem akan menggunakan input terakhir</strong> (kamera atau unggah file).
              File otomatis tersimpan di server.
            </Typography>
          </Alert>
        </FormTab>

        <FormTab label="Tanda Tangan" path="tanda_tangan">
          <Alert severity="info" style={{ marginBottom: 16 }}>
            <Typography variant="body2">
              ✍️ <strong>Instant Save:</strong> Tanda tangan akan langsung disimpan ke server setelah selesai ditandatangani.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom color="primary">✍️ Tanda Tangan</Typography>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Opsi 1: Gambar Tanda Tangan Langsung</Typography>
            <SignaturePadInput source="tanda_tangan" />
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Opsi 2: Unggah Gambar Tanda Tangan</Typography>
            <EnhancedImageInput
              source="tanda_tangan"
              label="Pilih atau seret file tanda tangan"
              bucketName={SIM_BUCKET}
              folderPath={SIM_TANDA_TANGAN_FOLDER}
              placeholder={<p>📁 Letakkan file di sini atau klik untuk memilih (akan langsung disimpan)</p>}
            />
          </Box>

          <Alert severity="success" style={{ marginTop: 16 }}>
            <Typography variant="caption">
              ✅ <strong>Sistem akan menggunakan input terakhir</strong> (gambar langsung atau unggah file).
              Tanda tangan otomatis tersimpan di server.
            </Typography>
          </Alert>
        </FormTab>

        <FormTab label="Sidik Jari" path="sidik_jari">
          <Alert severity="info" style={{ marginBottom: 16 }}>
            <Typography variant="body2">
              👆 <strong>Instant Upload:</strong> File sidik jari akan langsung disimpan ke server setelah dipilih.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom color="primary">👆 Sidik Jari</Typography>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Unggah Gambar Sidik Jari</Typography>
            <FingerprintInput
              source="sidik_jari"
              label="Pilih File Sidik Jari"
            />
          </Box>

          <Alert severity="success" style={{ marginTop: 16 }}>
            <Typography variant="caption">
              ✅ <strong>File akan langsung tersimpan</strong> di server setelah dipilih.
              Tidak perlu menunggu menyimpan form.
            </Typography>
          </Alert>
        </FormTab>
      </TabbedForm>
    </Create>
  ) : null;
};

export default SimCreate;
