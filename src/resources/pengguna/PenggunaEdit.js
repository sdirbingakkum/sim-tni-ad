import React from "react";
import {
  FormDataConsumer,
  Edit,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  TextInput
} from "react-admin";

const PenggunaEdit = ({ permissions, ...props }) => {
  return permissions ? (
    <Edit {...props} title="Tambah Pengguna">
      <SimpleForm variant="outlined">
        <ReferenceInput
          source="lingkup_id"
          reference="lingkup"
          label="Lingkup"
          sort={{ field: "id", order: "ASC" }}
          disabled={permissions.satlak_id !== 1}
          defaultValue={
            permissions.satlak_id !== 1 ? permissions.lingkup_id : undefined
          }
        >
          <SelectInput optionText="kode" />
        </ReferenceInput>
        <FormDataConsumer subscription={{ values: true }}>
          {({ formData, ...rest }) =>
            formData.lingkup_id && (
              <ReferenceInput
                source="satlak_id"
                reference="satlak"
                label="Satlak"
                sort={{ field: "id", order: "ASC" }}
                filter={{ lingkup_id: formData.lingkup_id }}
                {...rest}
                disabled={permissions.satlak_id !== 1}
                defaultValue={
                  permissions.satlak_id !== 1
                    ? permissions.satlak_id
                    : undefined
                }
              >
                <SelectInput optionText="kode" />
              </ReferenceInput>
            )
          }
        </FormDataConsumer>
        <ReferenceInput
          source="jenis_pengguna_id"
          reference="jenis_pengguna"
          label="Jenis Pengguna"
          sort={{ field: "id", order: "ASC" }}
        >
          <SelectInput optionText="nama" />
        </ReferenceInput>
        <TextInput source="nama" label="Nama" />
        <ReferenceInput
          source="pangkat_id"
          reference="pangkat"
          label="Pangkat"
          sort={{ field: "id", order: "ASC" }}
        >
          <SelectInput optionText="kode" />
        </ReferenceInput>
        <ReferenceInput
          source="korps_id"
          reference="korps"
          label="Korps"
          sort={{ field: "id", order: "ASC" }}
          allowEmpty
        >
          <SelectInput optionText="kode" />
        </ReferenceInput>
        <TextInput source="nrp_nip" label="NRP/NIP" />
        <TextInput source="kata_sandi" label="Kata Sandi" />
      </SimpleForm>
    </Edit>
  ) : null;
};

export default PenggunaEdit;
