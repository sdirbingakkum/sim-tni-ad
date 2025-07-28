import React from "react";
import {
  Edit,
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
    bucketName = "gambar",
    folderPath = "stempel",
  } = props;
  const notify = useNotify();

  // Format function to handle existing file data stored as URL string
  const formatFile = (value) => {
    if (!value) return undefined;

    // If it's just a URL string, convert it to the expected format
    if (typeof value === "string") {
      return {
        src: value,
        title: value.split("/").pop(),
      };
    }
    return value;
  };

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
      return url; // Return just the URL string to save in the database
    } catch (error) {
      console.error("Upload error details:", error);
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
      format={formatFile}
      multiple={false}
    >
      <FileField source="src" title="title" />
    </FileInput>
  );
};

const SatlakTitle = ({ record }) => {
  return <span>Edit SATLAK {record ? `"${record.nama}"` : ""}</span>;
};

const SatlakEdit = (props) => {
  const notify = useNotify();

  return (
    <Edit
      {...props}
      title={<SatlakTitle />}
      onFailure={(error) => {
        console.error("Edit failure:", error);
        notify(`Error: ${error.message}`, { type: "error" });
      }}
    >
      <TabbedForm variant="outlined">
        <FormTab label="Keterangan">
          <TextInput source="id" disabled />
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
 perPage={100}
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
          <SignaturePadInput source="tanda_tangan_komandan" />
        </FormTab>
        <FormTab label="Stempel">
          <StempelInput source="stempel" label="Stempel" />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export default SatlakEdit;
