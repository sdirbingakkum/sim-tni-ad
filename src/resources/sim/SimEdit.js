// src/resources/sim/SimEdit.js
import React from "react";
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
} from "react-admin";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Alert } from '@material-ui/lab';

// Komponen & helper Anda
import NoIdentitasInput from "./helpers/input/NoIdentitasInput";
import isBiiSus from "./helpers/input/conditions/isBiiSus";
import hasJenisPemohon from "./helpers/input/conditions/hasJenisPemohon";
import isPrajuritTniAd from "./helpers/input/conditions/isPrajuritTniAd";
import isPnsTniAd from "./helpers/input/conditions/isPnsTniAd";
import InputJenisPemohon from "./helpers/input/InputJenisPemohon";
import SimEditToolbar from "./helpers/edit/SimEditToolbar";

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

// Komponen untuk menampilkan info existing data
const ExistingDataInfo = ({ formData }) => {
  const hasExistingFiles = formData?.pas_foto || formData?.tanda_tangan || formData?.sidik_jari;

  if (!hasExistingFiles) return null;

  return (
    <Alert severity="info" style={{ marginBottom: 16 }}>
      <Typography variant="body2">
        📋 <strong>Data Existing:</strong> Record ini sudah memiliki gambar tersimpan.
        Anda dapat melihat preview dan menggantinya jika diperlukan.
        <br />
        💾 <strong>Instant Update:</strong> Gambar baru akan langsung tersimpan ke server saat dipilih/dibuat.
      </Typography>
    </Alert>
  );
};

// Fungsi untuk normalisasi data file
const normalizeFileData = (record, fileFields) => {
  if (!record) return record;

  const normalizedRecord = { ...record };

  fileFields.forEach(({ source, fileNameField }) => {
    const mainValue = record[source];
    const pathValue = record[fileNameField];

    if (mainValue || pathValue) {
      let fileData = null;

      if (typeof mainValue === 'string' && mainValue.startsWith('http')) {
        fileData = {
          src: mainValue,
          title: source,
          path: pathValue || mainValue
        };
      } else if (mainValue && typeof mainValue === 'object' && mainValue.src) {
        fileData = {
          ...mainValue,
          src: mainValue.src,
          title: mainValue.title || source,
          path: mainValue.path || pathValue
        };
      } else if (pathValue && pathValue.startsWith('http')) {
        fileData = {
          src: pathValue,
          title: source,
          path: pathValue
        };
      }

      if (fileData) {
        normalizedRecord[source] = fileData;
      }
    }
  });

  return normalizedRecord;
};

const SimEdit = ({ permissions, ...props }) => {
  const fileFields = [
    { source: "pas_foto", bucket: SIM_BUCKET, folder: SIM_PAS_FOTO_FOLDER, fileNameField: "pas_foto_path" },
    { source: "tanda_tangan", bucket: SIM_BUCKET, folder: SIM_TANDA_TANGAN_FOLDER, fileNameField: "tanda_tangan_path" },
    { source: "sidik_jari", bucket: SIM_BUCKET, folder: SIM_SIDIK_JARI_FOLDER, fileNameField: "sidik_jari_path" },
  ];

  const handleSave = async (values) => {
    try {
      console.log("📝 Updating SIM with instant uploaded files:", values);

      // File sudah di-upload secara instant, hanya perlu update metadata
      const result = await dataProvider.update(
        "sim",
        { id: values.id, data: values },
        fileFields
      );

      console.log("✅ SIM updated successfully with instant uploaded files");
      return result;
    } catch (error) {
      console.error("❌ Error updating SIM data:", error);
      throw error;
    }
  };

  const transform = (data) => {
    if (!data) return data;
    console.log("[SimEdit] Raw data from server:", data);

    const normalizedData = normalizeFileData(data, fileFields);
    console.log("[SimEdit] Normalized data:", normalizedData);

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
          <TextInput source="id" disabled label="ID SIM" />
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
          <FormDataConsumer>
            {({ formData }) => <ExistingDataInfo formData={formData} />}
          </FormDataConsumer>

          <Typography variant="h6" gutterBottom color="primary">📷 Pas Foto</Typography>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Opsi 1: Ambil Foto Baru dari Kamera</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Kamera akan menampilkan foto yang sudah ada (jika ada) dan memungkinkan Anda menggantinya.
            </Typography>
            <CameraInput
              source="pas_foto"
              label="Ambil/Ganti Foto"
              bucketName={SIM_BUCKET}
              folderPath={SIM_PAS_FOTO_FOLDER}
            />
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Opsi 2: Unggah File Gambar Baru</Typography>
            <EnhancedImageInput
              source="pas_foto"
              label="Pilih file pas foto baru (akan langsung mengganti yang lama)"
              bucketName={SIM_BUCKET}
              folderPath={SIM_PAS_FOTO_FOLDER}
              placeholder={<p>📁 Letakkan file baru di sini untuk mengganti pas foto (langsung tersimpan)</p>}
            />
          </Box>

          <Alert severity="warning" style={{ marginTop: 16 }}>
            <Typography variant="caption">
              ⚠️ <strong>Perhatian:</strong> Jika Anda mengganti foto, foto lama akan diganti dengan foto baru.
              Perubahan langsung tersimpan di server.
            </Typography>
          </Alert>
        </FormTab>

        <FormTab label="Tanda Tangan" path="tanda_tangan">
          <FormDataConsumer>
            {({ formData }) => <ExistingDataInfo formData={formData} />}
          </FormDataConsumer>

          <Typography variant="h6" gutterBottom color="primary">✍️ Tanda Tangan</Typography>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Opsi 1: Gambar Ulang Tanda Tangan</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Komponen akan menampilkan tanda tangan yang sudah ada dan memungkinkan Anda membuat yang baru.
            </Typography>
            <SignaturePadInput source="tanda_tangan" />
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Opsi 2: Unggah Gambar Tanda Tangan Baru</Typography>
            <EnhancedImageInput
              source="tanda_tangan"
              label="Pilih file tanda tangan baru (akan langsung mengganti yang lama)"
              bucketName={SIM_BUCKET}
              folderPath={SIM_TANDA_TANGAN_FOLDER}
              placeholder={<p>📁 Letakkan file baru di sini untuk mengganti tanda tangan (langsung tersimpan)</p>}
            />
          </Box>

          <Alert severity="warning" style={{ marginTop: 16 }}>
            <Typography variant="caption">
              ⚠️ <strong>Perhatian:</strong> Jika Anda membuat/mengunggah tanda tangan baru, yang lama akan diganti.
              Perubahan langsung tersimpan di server.
            </Typography>
          </Alert>
        </FormTab>

        <FormTab label="Sidik Jari" path="sidik_jari">
          <FormDataConsumer>
            {({ formData }) => <ExistingDataInfo formData={formData} />}
          </FormDataConsumer>

          <Typography variant="h6" gutterBottom color="primary">👆 Sidik Jari</Typography>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>Unggah Gambar Sidik Jari Baru</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Komponen akan menampilkan sidik jari yang sudah ada (jika ada) dan memungkinkan Anda menggantinya.
            </Typography>
            <FingerprintInput
              source="sidik_jari"
              label="Pilih File Sidik Jari Baru"
            />
          </Box>

          <Alert severity="info" style={{ marginTop: 16 }}>
            <Typography variant="caption">
              💡 <strong>Tips:</strong> Jika tidak ingin mengubah sidik jari, biarkan input kosong.
              File baru akan langsung mengganti yang lama jika dipilih.
            </Typography>
          </Alert>
        </FormTab>
      </TabbedForm>
    </Edit>
  ) : null;
};

export default SimEdit;