import React, { useCallback, useEffect } from "react";
import { useDataProvider, ReferenceInput, SelectInput } from "react-admin";
import { useForm } from "react-final-form";

const InputJenisPemohon = ({ record: { pemohon_id }, ...rest }) => {
  const form = useForm();
  const dataProvider = useDataProvider();

  const fetchPemohon = useCallback(async () => {
    const { data: pemohon } = await dataProvider.getOne("pemohon", {
      id: pemohon_id
    });

    if (pemohon) {
      form.batch(() => {
        form.change("pemohon_id", pemohon.id);
        form.change("pemohon.jenis_pemohon_id", pemohon.jenis_pemohon_id);
        form.change("pemohon.nama", pemohon.nama);
        form.change("pemohon.no_identitas", pemohon.no_identitas);
        form.change("pemohon.pangkat_id", pemohon.pangkat_id);
        form.change("pemohon.korps_id", pemohon.korps_id);
        form.change("pemohon.golongan_pns_id", pemohon.golongan_pns_id);
        form.change("pemohon.jabatan", pemohon.jabatan);
        form.change("pemohon.kesatuan", pemohon.kesatuan);
        form.change("pemohon.alamat", pemohon.alamat);
        form.change("pemohon.tempat_lahir", pemohon.tempat_lahir);
        form.change("pemohon.tanggal_lahir", pemohon.tanggal_lahir);
        form.change("pemohon.golongan_darah_id", pemohon.golongan_darah_id);
        form.change("pemohon.no_ktp_prajurit", pemohon.no_ktp_prajurit);
      });
    }
  }, [pemohon_id, dataProvider, form]);

  useEffect(() => {
    if (pemohon_id) fetchPemohon();
  }, [pemohon_id, fetchPemohon]);

  const onChange = () => {
    form.batch(() => {
      form.change("pemohon_id", undefined);
      form.change("pemohon.nama", undefined);
      form.change("pemohon.no_identitas", undefined);
      form.change("pemohon.pangkat_id", undefined);
      form.change("pemohon.korps_id", undefined);
      form.change("pemohon.golongan_pns_id", undefined);
      form.change("pemohon.jabatan", undefined);
      form.change("pemohon.kesatuan", undefined);
      form.change("pemohon.alamat", undefined);
      form.change("pemohon.tempat_lahir", undefined);
      form.change("pemohon.tanggal_lahir", undefined);
      form.change("pemohon.golongan_darah_id", undefined);
      form.change("pemohon.no_ktp_prajurit", undefined);
    });
  };

  return (
    <ReferenceInput
      source="pemohon.jenis_pemohon_id"
      reference="jenis_pemohon"
      label="Jenis Pemohon"
      sort={{ field: "id", order: "ASC" }}
      onChange={onChange}
      {...rest}
    >
      <SelectInput optionText="nama" />
    </ReferenceInput>
  );
};

export default InputJenisPemohon;
