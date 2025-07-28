import React, { useEffect, useState } from "react";
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  EditButton,
  DeleteButton
} from "react-admin";
import KodeSatlakField from "./helpers/KodeSatlakField";

const NamaSatlakFull = ({ record: { nama, kode_romawi } }) =>
  kode_romawi ? kode_romawi + "/" + nama : nama;

const SatlakList = ({ permissions, ...props }) => {
  if (permissions) {
    const filter =
      permissions && permissions.satlak_id !== 1
        ? { id: permissions.satlak_id }
        : null;

    return (
      <List
        {...props}
        title="Daftar SATLAK"
        sort={{ field: "id", order: "ASC" }}
        filter={filter}
      >
        <Datagrid>
          <TextField source="id" label="id" />
          <ReferenceField
            source="lingkup_id"
            reference="lingkup"
            label="Lingkup"
          >
            <TextField source="kode" label="Kode" />
          </ReferenceField>
          <NamaSatlakFull label="Nama" />
          <KodeSatlakField label="Kode" />
          <TextField source="nama_komandan" label="Nama Komandan" />
          <TextField source="nrp_komandan" label="NRP Komandan" />
          <ReferenceField
            source="pangkat_komandan_id"
            reference="pangkat"
            label="Pangkat"
          >
            <TextField source="kode" label="Kode" />
          </ReferenceField>
          <ReferenceField
            source="korps_komandan_id"
            reference="korps"
            label="Korps"
          >
            <TextField source="kode" label="Kode" />
          </ReferenceField>
          <EditButton />
          {permissions.satlak_id === 1 &&
            permissions.jenis_pengguna_id === 1 && <DeleteButton />}
        </Datagrid>
      </List>
    );
  } else {
    return null;
  }
};

export default SatlakList;
