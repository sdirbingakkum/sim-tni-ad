import React from "react";
import {
  List,
  Datagrid,
  ReferenceField,
  TextField,
  EditButton,
  DeleteButton
} from "react-admin";

const PemohonList = props => {
  return (
    <List
      {...props}
      title="Daftar Pemohon"
      sort={{ field: "id", order: "ASC" }}
    >
      <Datagrid>
        <ReferenceField
          source="jenis_pemohon_id"
          reference="jenis_pemohon"
          label="Jenis Pemohon"
        >
          <TextField source="nama" />
        </ReferenceField>
        <TextField source="no_identitas" label="NRP/NIP" />
        <TextField source="nama" label="Nama" />
        <ReferenceField source="pangkat_id" reference="pangkat" label="Pangkat">
          <TextField source="kode" />
        </ReferenceField>
        <ReferenceField source="korps_id" reference="korps" label="Korps">
          <TextField source="kode" />
        </ReferenceField>
        <ReferenceField
          source="golongan_pns_id"
          reference="golongan_pns"
          label="Golongan PNS"
        >
          <TextField source="nama" />
        </ReferenceField>
        <TextField source="jabatan" label="Jabatan" />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export default PemohonList;
