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
  FormDataConsumer,
} from "react-admin";
import Box from "@material-ui/core/Box";
import SignaturePadInput from "../../helpers/input/SignaturePadInput";
import StempelInput from "../../helpers/input/StempelInput";
import CommanderSignatureUpload from "./CommanderSignatureUpload";

// Normalizer: pastikan tanda_tangan_komandan = STRING URL sebelum kirim ke server
const toStringUrl = (v) => {
  if (Array.isArray(v)) {
    const f = v[0];
    if (typeof f === "string") return f;
    if (f && typeof f === "object") return f.src || "";
    return "";
  }
  if (v && typeof v === "object") return v.src || "";
  return v ?? "";
};

const SatlakCreate = (props) => {
  return (
    <Create {...props} title="Tambah SATLAK">
      <TabbedForm
        variant="outlined"
        transform={(data) => ({
          ...data,
          tanda_tangan_komandan: toStringUrl(data?.tanda_tangan_komandan),
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
          {/* Upload → set field ke STRING URL */}
          <CommanderSignatureUpload source="tanda_tangan_komandan" />

          {/* Preview + sinkron dengan SignaturePad */}
          <FormDataConsumer subscription={{ values: true }}>
            {({ formData }) => {
              const url = formData?.tanda_tangan_komandan || "";
              return (
                <Box mt={2}>
                  {url ? (
                    <Box mb={1}>
                      <img
                        src={url}
                        alt="Preview tanda tangan komandan"
                        style={{ maxWidth: "100%", height: "auto", borderRadius: 8, opacity: 0.9 }}
                      />
                    </Box>
                  ) : null}
                  {/* Paksa SignaturePad re-init saat URL berubah */}
                  <SignaturePadInput
                    key={url || "pad-empty"}
                    source="tanda_tangan_komandan"
                  />
                </Box>
              );
            }}
          </FormDataConsumer>
        </FormTab>

        <FormTab label="Stempel">
          <StempelInput source="stempel" label="Stempel" />
        </FormTab>
      </TabbedForm>
    </Create>
  );
};

export default SatlakCreate;
