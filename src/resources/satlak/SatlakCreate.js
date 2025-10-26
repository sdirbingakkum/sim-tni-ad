import React from "react";
import {
  Create,
  TabbedForm,
  FormTab,
  ReferenceInput,
  SelectInput,
  AutocompleteInput,
  TextInput,
  NumberInput,
} from "react-admin";
import SignaturePadInput from "../../helpers/input/SignaturePadInput";
import StempelInput from "../../helpers/input/StempelInput";
import EnhancedImageInput from "../../helpers/input/EnhancedImageInput";

const SatlakCreate = (props) => {
  return (
    <Create {...props} title="Tambah SATLAK">
      <TabbedForm variant="outlined">
        <FormTab label="Keterangan">
          <ReferenceInput
            source="lingkup_id"
            reference="lingkup"
            label="Lingkup"
            sort={{ field: "id", order: "ASC" }}
          >
            <SelectInput optionText="kode" />
          </ReferenceInput>
          <TextInput source="nama" label="Nama" />
          <TextInput source="kode" label="Kode" />
          <TextInput source="kode_romawi" label="Kode Romawi" />
          <ReferenceInput
            source="markas_id"
            reference="ibukota_provinsi"
            label="Markas"
            sort={{ field: "id", order: "ASC" }}
          >
            <AutocompleteInput optionText="nama" />
          </ReferenceInput>
        </FormTab>

        <FormTab label="Komandan">
          <TextInput source="nama_komandan" label="Nama Komandan" />
          <NumberInput source="nrp_komandan" label="NRP Komandan" />
          <ReferenceInput
            source="pangkat_komandan_id"
            reference="pangkat"
            label="Pangkat Komandan"
            sort={{ field: "id", order: "ASC" }}
          >
            <AutocompleteInput optionText="kode" />
          </ReferenceInput>
          <ReferenceInput
            source="korps_komandan_id"
            reference="korps"
            label="Korps Komandan"
            sort={{ field: "id", order: "ASC" }}
          >
            <AutocompleteInput optionText="kode" />
          </ReferenceInput>
        </FormTab>

        <FormTab label="Tanda Tangan Komandan">
          {/* Opsi 1: tanda tangan via SigPlus (menulis ke name="tanda_tangan") */}
          <SignaturePadInput />

          {/* Opsi 2: unggah file (instant upload ke lokasi yang sama, field sama) */}
          <EnhancedImageInput
            source="tanda_tangan"
            label="Unggah Tanda Tangan (opsional)"
            bucketName="gambar"
            folderPath="tanda_tangan_sim"
            placeholder={<p>📁 Letakkan file di sini atau klik untuk memilih (langsung tersimpan)</p>}
          />
        </FormTab>

        <FormTab label="Stempel">
          <StempelInput source="stempel" label="Stempel" />
        </FormTab>
      </TabbedForm>
    </Create>
  );
};

export default SatlakCreate;
