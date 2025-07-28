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
    async (no_identitas) => {
      try {
        // Ubah filter untuk menggunakan field yang sesuai berdasarkan jenis_pemohon_id
        let filterField = "no_identitas"; // default
        if (jenis_pemohon_id === 1) {
          filterField = "nrp"; // Gunakan nrp untuk TNI-AD (jenis_pemohon_id = 1)
        } else if (jenis_pemohon_id === 2) {
          filterField = "nip"; // Gunakan nip untuk PNS (jenis_pemohon_id = 2)
        } else if (jenis_pemohon_id === 3) {
          filterField = "nik"; // Gunakan nik untuk Umum (jenis_pemohon_id = 3)
        }

        const filter = {
          jenis_pemohon_id: jenis_pemohon_id,
        };

        // Tambahkan filter berdasarkan jenis identitas
        filter[filterField] = no_identitas;

        console.log("Fetching with filter:", filter);

        const { data: pemohon } = await dataProvider.getList("pemohon", {
          pagination: { page: 1, perPage: 20 },
          sort: { field: "id", order: "ASC" },
          filter: filter,
        });

        console.log("Fetched pemohon data:", pemohon);
        return pemohon.length > 0 ? pemohon[0] : null;
      } catch (error) {
        console.error("Error fetching pemohon:", error);
        return null;
      }
    },
    [dataProvider, jenis_pemohon_id]
  );

  const onChange = async (e) => {
    const val = e.target.value;
    console.log("Input value changed to:", val);
    console.log("Current jenis_pemohon_id:", jenis_pemohon_id);

    if (!val) {
      // Clear form fields if value is empty
      form.batch(() => {
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
      return;
    }

    const pemohon = await fetchPemohon(val);
    console.log("Pemohon found:", pemohon);

    if (pemohon) {
      form.batch(() => {
        form.change("pemohon.nama", pemohon.nama);
        // Gunakan field yang sesuai berdasarkan jenis_pemohon
        if (jenis_pemohon_id === 1) {
          form.change("pemohon.no_identitas", pemohon.nrp);
        } else if (jenis_pemohon_id === 2) {
          form.change("pemohon.no_identitas", pemohon.nip);
        } else if (jenis_pemohon_id === 3) {
          form.change("pemohon.no_identitas", pemohon.nik);
        }
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
    } else {
      // Clear form fields if no matching pemohon found
      form.batch(() => {
        form.change("pemohon.nama", undefined);
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
    }
  };

  return (
    <NumberInput
      source="pemohon.no_identitas"
      label={label}
      onChange={onChange}
      {...rest}
    />
  );
};

export default NoIdentitasInput;
