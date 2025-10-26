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
import CommanderSignatureUpload from "./CommanderSignatureUpload";

// Normalizer: pastikan field 'tanda_tangan_komandan' selalu STRING sebelum kirim ke dataProvider
const normalizeSignatureField = (data) => {
  const v = data?.tanda_tangan_komandan;
  if (Array.isArray(v)) {
    // dari ImageInput: bisa [stringURL] atau [{src}]
    const first = v[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return first.src || "";
    return "";
  }
  if (typeof v === "object" && v !== null) {
    return v.src || "";
  }
  return v ?? ""; // biarkan string lama / kosong
};

const SatlakCreate = (props) => {
  return (
    <Create {...props} title="Tambah SATLAK">
      <TabbedForm
        variant="outlined"
        transform={(data) => ({
          ...data,
          tanda_tangan_komandan: normalizeSignatureField(data),
        })}
      >
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
          {/* Opsi 1: gambar langsung (signature pad lama) */}
          <SignaturePadInput source="tanda_tangan_komandan" />
          {/* Opsi 2: upload file (URL string) */}
          <CommanderSignatureUpload source="tanda_tangan_komandan" />
        </FormTab>

        <FormTab label="Stempel">
          <StempelInput source="stempel" label="Stempel" />
        </FormTab>
      </TabbedForm>
    </Create>
  );
};

export default SatlakCreate;
