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
  FileInput,
  FileField,
  useNotify,
} from "react-admin";
import SignaturePadInput from "../../helpers/input/SignaturePadInput";
import StempelInput from "../../helpers/input/StempelInput";
import dataProvider from "../../providers/data";

// Custom component for file uploads using the dataProvider
const SupabaseFileInput = (props) => {
  const {
    source,
    label,
    accept = "image/*",
    bucketName = "images",
    folderPath = "stempel",
  } = props;
  const notify = useNotify();

  const handleFileUpload = async (files) => {
    if (!files || !files.length) return;

    try {
      const file = files[0];
      // Use the dataProvider's uploadFile method
      const { url, path } = await dataProvider.uploadFile(
        file,
        bucketName,
        folderPath
      );

      // Format the data as needed for your database
      return {
        src: url,
        path: path,
        bucket: bucketName,
        title: file.name,
      };
    } catch (error) {
      notify(`Upload error: ${error.message}`, { type: "error" });
      return null;
    }
  };

  return (
    <FileInput
      source={source}
      label={label}
      accept={accept}
      parse={handleFileUpload}
      multiple={false}
    >
      <FileField source="src" title="title" />
    </FileInput>
  );
};

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
          <SignaturePadInput />
        </FormTab>
        <FormTab label="Stempel">
          <StempelInput source="stempel" label="Stempel" />
        </FormTab>
      </TabbedForm>
    </Create>
  );
};

export default SatlakCreate;
