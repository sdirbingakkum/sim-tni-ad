import React, { useState, useEffect, useCallback } from "react";
import { useDataProvider, NumberInput } from "react-admin";
import { useForm } from "react-final-form";

const NoIdentitasInput = ({ jenis_pemohon_id, ...rest }) => {
  const dataProvider = useDataProvider();
  const form = useForm();
  const [label, setLabel] = useState();

  const switchLabel = useCallback(() => {
    switch (jenis_pemohon_id) {
      case 1:
        setLabel("NRP");
        break;
      case 2:
        setLabel("NIP");
        break;
      case 3:
        setLabel("NIK");
        break;
      default:
        break;
    }
  }, [jenis_pemohon_id]);

  useEffect(() => {
    switchLabel();
  }, [switchLabel]);

  const fetchPemohon = useCallback(
    async no_identitas => {
      const { data: pemohon } = await dataProvider.getList("pemohon", {
        pagination: { page: 1, perPage: 1 },
        sort: { field: "id", order: "ASC" },
        filter: {
          jenis_pemohon_id: jenis_pemohon_id,
          no_identitas: no_identitas
        }
      });

      return pemohon[0];
    },
    [dataProvider, jenis_pemohon_id]
  );

  const onChange = async e => {
    const val = e.target.value;
    const pemohon = await fetchPemohon(val);

    if (pemohon) {
      form.batch(() => {
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
    } else {
      form.batch(() => {
        form.change("nama", undefined);
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
    }
  };

  return (
    <NumberInput
      source="no_identitas"
      label={label}
      onChange={onChange}
      {...rest}
    />
  );
};

export default NoIdentitasInput;
