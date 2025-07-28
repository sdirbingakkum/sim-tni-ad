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
  ImageInput,      // Dari react-admin
  // ImageField,   // Dari react-admin (tidak digunakan jika Anda pakai CustomImageField di bawah ImageInput)
} from "react-admin";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import moment from "moment";

// Komponen & helper Anda
import NoIdentitasInput from "./helpers/input/NoIdentitasInput";
import isBiiSus from "./helpers/input/conditions/isBiiSus";
import hasJenisPemohon from "./helpers/input/conditions/hasJenisPemohon";
import isPrajuritTniAd from "./helpers/input/conditions/isPrajuritTniAd";
import isPnsTniAd from "./helpers/input/conditions/isPnsTniAd";
import InputJenisPemohon from "./helpers/input/InputJenisPemohon";
import SimCreateToolbar from "./helpers/create/SimCreateToolbar";
import FingerprintInput from "../../helpers/input/FingerprintInput";
import CameraInput from "../../helpers/input/CameraInput"; // Wrapper Anda
import SignaturePadInput from "../../helpers/input/SignaturePadInput"; // Wrapper Anda
import CustomImageField from "../../helpers/input/components/ImageField"; // Komponen preview kustom Anda
import dataProvider from "../../providers/data"; // Instance dataProvider Anda

// Konstanta untuk bucket dan folder (samakan dengan dataProvider jika perlu)
const SIM_BUCKET = "gambar"; // Satu bucket untuk semua
const SIM_PAS_FOTO_FOLDER = "pasfoto_sim";
const SIM_TANDA_TANGAN_FOLDER = "tanda_tangan_sim";
const SIM_SIDIK_JARI_FOLDER = "sidik_jari_sim";

const SimCreate = ({ permissions, ...props }) => {
  const [initialValues, setInitialValues] = useState({});
  const now = moment(); // 'now' untuk default Tanggal Permohonan

  useEffect(() => {
    if (permissions) {
      const createdDate = moment().format("YYYY-MM-DD"); // Selalu gunakan tanggal saat ini untuk 'created'
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

  // handleSave yang meneruskan fileFields ke dataProvider.create
  const handleSave = async (values) => {
    try {
      const dataToSave = {
        ...values,
        berlaku_hingga: moment(values.created || now) // Gunakan values.created atau now
          .add(5, "y")
          .format("YYYY-MM-DD"),
        // 'updated' biasanya di-set oleh backend atau saat operasi update
      };

      // Panggil dataProvider.create dengan fileFields sebagai argumen ketiga
      const result = await dataProvider.create("sim", { data: dataToSave }, fileFields);
      return result;
    } catch (error) {
      console.error("Error saving SIM data:", error);
      throw error; // Lempar error agar React Admin menanganinya
    }
  };

  return permissions ? (
    <Create {...props} title="Tambah SIM">
      <TabbedForm
        toolbar={<SimCreateToolbar />}
        initialValues={initialValues} // initialValues dari state
        variant="outlined"
        save={handleSave} // save handler kustom
      >
        <FormTab label="Keterangan">
          <DateInput source="created" label="Tanggal Permohonan" />
          <ReferenceInput source="permohonan_sim_tni_id" reference="permohonan_sim_tni" label="Permohonan SIM TNI" sort={{ field: "id", order: "ASC" }}isRequired>
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
            {({ formData, ...rest }) => isPrajuritTniAd(formData) && (
                <TextInput source="pemohon.no_ktp_prajurit" label="No. KTP Prajurit" {...rest} />
            )}
          </FormDataConsumer>
        </FormTab>

        <FormTab label="Pas Foto" path="pas_foto">
          <Typography variant="subtitle1" gutterBottom>Opsi 1: Ambil Foto Langsung dari Kamera</Typography>
          <CameraInput 
            source="pas_foto" 
            label="Ambil Foto" 
            bucketName={SIM_BUCKET} 
            folderPath={SIM_PAS_FOTO_FOLDER} 
          />
          <Box mt={3} mb={1}><Typography variant="subtitle1" gutterBottom>Opsi 2: Unggah File Gambar</Typography></Box>
          <ImageInput 
            source="pas_foto" 
            label="Pilih atau seret file pas foto" 
            accept="image/*" 
            placeholder={<p>Letakkan file di sini atau klik untuk memilih</p>}
          >
            <CustomImageField source="src" title="title" />
          </ImageInput>
           <Box mt={2}><Typography variant="caption">Catatan: Sistem akan menggunakan input terakhir (kamera atau unggah).</Typography></Box>
        </FormTab>

        <FormTab label="Tanda Tangan" path="tanda_tangan">
          <Typography variant="subtitle1" gutterBottom>Opsi 1: Gambar Tanda Tangan Langsung</Typography>
          <SignaturePadInput 
            source="tanda_tangan" 
            // Tambahkan props lain untuk SignaturePadInput jika perlu
          />
           <Box mt={3} mb={1}><Typography variant="subtitle1" gutterBottom>Opsi 2: Unggah Gambar Tanda Tangan</Typography></Box>
          <ImageInput 
            source="tanda_tangan" 
            label="Pilih atau seret file tanda tangan" 
            accept="image/*" 
            placeholder={<p>Letakkan file di sini atau klik untuk memilih</p>}
          >
            <CustomImageField source="src" title="title" />
          </ImageInput>
           <Box mt={2}><Typography variant="caption">Catatan: Sistem akan menggunakan input terakhir (gambar langsung atau unggah).</Typography></Box>
        </FormTab>

        <FormTab label="Sidik Jari" path="sidik_jari">
          <Typography variant="subtitle1" gutterBottom>Unggah Gambar Sidik Jari</Typography>
          {/* Anda bisa menggunakan FingerprintInput kustom Anda jika ia menghasilkan File yang bisa diunggah, */}
          {/* atau tetap dengan ImageInput jika inputnya berupa file gambar. */}
          {/* Jika FingerprintInput adalah alat pemindai, outputnya perlu ditangani */}
          <ImageInput 
            source="sidik_jari"  // Pastikan source ini cocok dengan fileFields
            label="Unggah Gambar Sidik Jari" 
            accept="image/*" 
            placeholder={<p>Letakkan file di sini atau klik untuk memilih</p>}
          >
            <CustomImageField source="src" title="title" />
          </ImageInput>
          {/* Atau jika FingerprintInput Anda berbeda:
          <FingerprintInput source="sidik_jari" label="Pindai Sidik Jari" />
          Pastikan outputnya juga ditangani di processFileUploads
          */}
        </FormTab>
      </TabbedForm>
    </Create>
  ) : null;
};

export default SimCreate;
