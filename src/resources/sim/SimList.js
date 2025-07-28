import React, { useState, useEffect } from "react";
import {
  List,
  Datagrid,
  DateField,
  ReferenceField,
  TextField,
  EditButton,
  DeleteButton,
  downloadCSV,
} from "react-admin";
import jsonExport from "jsonexport/dist";

const exporter = async (records, fetchRelatedRecords) => {
  const satlak = await fetchRelatedRecords(records, "satlak_id", "satlak");
  const pemohon = await fetchRelatedRecords(records, "pemohon_id", "pemohon");
  const golongan_sim_tni = await fetchRelatedRecords(
    records,
    "golongan_sim_tni_id",
    "golongan_sim_tni"
  );
  const permohonan_sim_tni = await fetchRelatedRecords(
    records,
    "permohonan_sim_tni_id",
    "permohonan_sim_tni"
  );

  const data = records.map((record) => ({
    ...record,
    satlak: satlak[record.satlak_id].kode,
    pemohon: pemohon[record.pemohon_id].nama,
    golongan: golongan_sim_tni[record.golongan_sim_tni_id].nama,
    permohonan: permohonan_sim_tni[record.permohonan_sim_tni_id].nama,
  }));

  jsonExport(
    data,
    {
      headers: ["id", "satlak", "pemohon", "golongan", "permohonan"],
    },
    (err, csv) => {
      downloadCSV(csv, "sim");
    }
  );
};

const SimList = ({ permissions, ...rest }) => {
  // Tambahkan log untuk melihat permissions saat komponen ini dirender
  // console.log("[SimList] Permissions diterima:", permissions);

  if (permissions) {
    let simFilter = null; // Default filter adalah null (tidak ada filter)

    // Hanya terapkan filter satlak_id jika permissions.satlak_id adalah angka yang valid
    // dan bukan 1 (untuk admin)
    if (typeof permissions.satlak_id === 'number' && permissions.satlak_id !== 1) {
      simFilter = { satlak_id: permissions.satlak_id };
    }
    // Jika permissions.satlak_id adalah 1, atau undefined, atau null, atau bukan angka,
    // maka simFilter akan tetap null.

    // console.log("[SimList] Filter yang diterapkan untuk SIM:", simFilter);

    return (
      <List
        {...rest}
        title="Daftar SIM"
        sort={{ field: "created", order: "DESC" }}
        filter={simFilter}
        exporter={exporter}
      >
        <Datagrid>
          <DateField source="created" label="Pada Tanggal" />
          <DateField source="berlaku_hingga" label="Berlaku Hingga" />
          <ReferenceField source="satlak_id" reference="satlak" label="SATLAK">
            <TextField source="kode" />
          </ReferenceField>
          <ReferenceField
            source="permohonan_sim_tni_id"
            reference="permohonan_sim_tni"
            label="Permohonan"
          >
            <TextField source="nama" />
          </ReferenceField>
          <ReferenceField
            source="golongan_sim_tni_id"
            reference="golongan_sim_tni"
            label="Golongan"
          >
            <TextField source="nama" />
          </ReferenceField>
          <ReferenceField
            source="kualifikasi_pengemudi_id"
            reference="kualifikasi_pengemudi"
            label="Kualifikasi"
          >
            <TextField source="kode" />
          </ReferenceField>
          <ReferenceField
            source="pemohon_id"
            reference="pemohon"
            label="Pemohon"
          >
            <TextField source="nama" />
          </ReferenceField>
          <ReferenceField
            source="pemohon_id"
            reference="pemohon"
            label="NRP/NIP"
          >
            <TextField source="no_identitas" />
          </ReferenceField>
          <EditButton />
          <DeleteButton />
        </Datagrid>
      </List>
    );
  } else {
    // console.warn("[SimList] Object permissions tidak tersedia.");
    return null;
  }
};

export default SimList;
