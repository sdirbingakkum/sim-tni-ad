import React from "react"; // useEffect, useState tidak digunakan di sini
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  EditButton,
  DeleteButton,
} from "react-admin";
import KodeSatlakField from "../satlak/helpers/KodeSatlakField";

const PenggunaList = ({ permissions, ...props }) => {
  // --- AWAL BLOK DEBUG ---
  console.log("[PenggunaList] Props diterima:", props);
  console.log("[PenggunaList] Permissions diterima:", permissions);

  if (permissions) {
    console.log("[PenggunaList] permissions.satlak_id:", permissions.satlak_id);
    console.log(
      "[PenggunaList] Kondisi (permissions.satlak_id !== 1):",
      permissions.satlak_id !== 1
    );

    // Pastikan kita menggunakan permissions.satlak_id dari object permissions yang sudah dicek
    const filter =
      permissions.satlak_id !== 1
        ? { satlak_id: permissions.satlak_id }
        : null;

    console.log("[PenggunaList] Filter yang akan diterapkan:", filter);
    // --- AKHIR BLOK DEBUG ---

    return (
      <List
        {...props}
        title="Daftar Pengguna"
        sort={{ field: "id", order: "ASC" }}
        filter={filter} // Pastikan filter ini yang digunakan oleh List
      >
        <Datagrid>
          <TextField source="id" label="Id" />
          <ReferenceField
            source="lingkup_id"
            reference="lingkup"
            label="Lingkup"
          >
            <TextField source="kode" />
          </ReferenceField>
          <ReferenceField source="satlak_id" reference="satlak" label="Satlak">
            <KodeSatlakField />
          </ReferenceField>
          <ReferenceField
            source="jenis_pengguna_id"
            reference="jenis_pengguna"
            label="Jenis Pengguna"
          >
            <TextField source="nama" />
          </ReferenceField>
          <TextField source="nama" label="Nama" />
          <ReferenceField
            source="pangkat_id"
            reference="pangkat"
            label="Pangkat"
          >
            <TextField source="kode" />
          </ReferenceField>
          <ReferenceField source="korps_id" reference="korps" label="Korps">
            <TextField source="kode" />
          </ReferenceField>
          <TextField source="nrp_nip" label="NRP/NIP" />
          <EditButton />
          <DeleteButton />
        </Datagrid>
      </List>
    );
  } else {
    console.warn("[PenggunaList] Object permissions tidak tersedia.");
    return null;
  }
};

export default PenggunaList;
