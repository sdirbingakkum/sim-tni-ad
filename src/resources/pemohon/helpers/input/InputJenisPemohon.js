import React, { useCallback, useEffect } from "react";
import { useDataProvider, ReferenceInput, SelectInput } from "react-admin";
import { useForm } from "react-final-form";

const InputJenisPemohon = ({ record: { pemohon_id }, ...rest }) => {
  const form = useForm();
  const dataProvider = useDataProvider();

  console.log(pemohon_id);

  const fetchPemohon = useCallback(async () => {
    const { data: pemohon } = await dataProvider.getOne("pemohon", {
      id: pemohon_id
    });

    if (pemohon) {
      form.batch(() => {
        form.change("jenis_pemohon_id", pemohon.jenis_pemohon_id);
        form.change("nama", pemohon.nama);
        form.change("no_identitas", pemohon.no_identitas);
        form.change("pangkat_id", pemohon.pangkat_id);
        form.change("korps_id", pemohon.korps_id);
        form.change("golongan_pns_id", pemohon.golongan_pns_id);
        form.change("jabatan", pemohon.jabatan);
        form.change("kesatuan", pemohon.kesatuan);
        form.change("alamat", pemohon.alamat);
        form.change("tempat_lahir", pemohon.tempat_lahir);
        form.change("tanggal_lahir", pemohon.tanggal_lahir);
        form.change("golongan_darah_id", pemohon.golongan_darah_id);
        form.change("no_ktp_prajurit", pemohon.no_ktp_prajurit);
      });
    }
  }, [pemohon_id, dataProvider, form]);

  useEffect(() => {
    if (pemohon_id) fetchPemohon();
  }, [pemohon_id, fetchPemohon]);

  const onChange = () => {
    form.batch(() => {
      form.change("pemohon_id", undefined);
      form.change("nama", undefined);
      form.change("no_identitas", undefined);
      form.change("pangkat_id", undefined);
      form.change("korps_id", undefined);
      form.change("golongan_pns_id", undefined);
      form.change("jabatan", undefined);
      form.change("kesatuan", undefined);
      form.change("alamat", undefined);
      form.change("tempat_lahir", undefined);
      form.change("tanggal_lahir", undefined);
      form.change("golongan_darah_id", undefined);
      form.change("no_ktp_prajurit", undefined);
    });
  };

  return (
    <ReferenceInput
      source="jenis_pemohon_id"
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
