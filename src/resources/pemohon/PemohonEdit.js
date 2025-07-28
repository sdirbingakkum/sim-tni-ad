import React, { useEffect, useState } from "react";
import {
  Edit,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  AutocompleteInput,
  TextInput,
  DateInput,
  NumberInput,
  FormDataConsumer
} from "react-admin";
import moment from "moment";
import NoIdentitasInput from "./helpers/input/NoIdentitasInput";
import hasJenisPemohon from "./helpers/input/conditions/hasJenisPemohon";
import isPrajuritTniAd from "./helpers/input/conditions/isPrajuritTniAd";
import isPnsTniAd from "./helpers/input/conditions/isPnsTniAd";
import InputJenisPemohon from "./helpers/input/InputJenisPemohon";

const PemohonEdit = ({ permissions, ...props }) => {
  const [initialValues, setInitialValues] = useState();

  useEffect(() => {
    if (permissions) {
      const updated = moment();

      setInitialValues({ updated });
    }
  }, [permissions]);

  return permissions ? (
    <Edit {...props} title="Ubah Pemohon">
      <SimpleForm initialValues={initialValues} variant="outlined">
        <InputJenisPemohon />
        <FormDataConsumer subscription={{ values: true }}>
          {({ formData, ...rest }) =>
            hasJenisPemohon(formData) && (
              <NoIdentitasInput
                jenis_pemohon_id={formData.jenis_pemohon_id}
                {...rest}
              />
            )
          }
        </FormDataConsumer>
        <TextInput source="nama" label="Nama" />
        <FormDataConsumer subscription={{ values: true }}>
          {({ formData, ...rest }) =>
            (isPrajuritTniAd(formData) || isPnsTniAd(formData)) && (
              <ReferenceInput
                source="pangkat_id"
                reference="pangkat"
                label="Pangkat"
                sort={{ field: "id", order: "ASC" }}
                {...rest}
                defaultValue={isPnsTniAd(formData) ? 23 : null}
                disabled={isPnsTniAd(formData)}
              >
                <SelectInput optionText="kode" />
              </ReferenceInput>
            )
          }
        </FormDataConsumer>
        <FormDataConsumer subscription={{ values: true }}>
          {({ formData, ...rest }) =>
            isPrajuritTniAd(formData) && (
              <ReferenceInput
                source="korps_id"
                reference="korps"
                label="Korps"
                sort={{ field: "id", order: "ASC" }}
                {...rest}
              >
                <AutocompleteInput optionText="kode" />
              </ReferenceInput>
            )
          }
        </FormDataConsumer>
        <FormDataConsumer subscription={{ values: true }}>
          {({ formData, ...rest }) =>
            isPnsTniAd(formData) && (
              <ReferenceInput
                source="golongan_pns_id"
                reference="golongan_pns"
                label="Golongan PNS"
                sort={{ field: "id", order: "ASC" }}
                {...rest}
              >
                <AutocompleteInput optionText="nama" />
              </ReferenceInput>
            )
          }
        </FormDataConsumer>
        <FormDataConsumer subscription={{ values: true }}>
          {({ formData, ...rest }) =>
            (isPrajuritTniAd(formData) || isPnsTniAd(formData)) && (
              <TextInput source="jabatan" label="Jabatan" {...rest} />
            )
          }
        </FormDataConsumer>
        <FormDataConsumer subscription={{ values: true }}>
          {({ formData, ...rest }) =>
            isPrajuritTniAd(formData) && (
              <TextInput source="kesatuan" label="Kesatuan" {...rest} />
            )
          }
        </FormDataConsumer>
        <TextInput source="alamat" label="Alamat" />
        <TextInput source="tempat_lahir" label="Tempat Lahir" />
        <DateInput source="tanggal_lahir" label="Tanggal Lahir" />
        <ReferenceInput
          source="golongan_darah_id"
          reference="golongan_darah"
          label="Golongan Darah"
          sort={{ field: "id", order: "ASC" }}
        >
          <SelectInput optionText="nama" />
        </ReferenceInput>
        <FormDataConsumer subscription={{ values: true }}>
          {({ formData, ...rest }) =>
            isPrajuritTniAd(formData) && (
              <NumberInput
                source="no_ktp_prajurit"
                label="No. KTP Prajurit"
                {...rest}
              />
            )
          }
        </FormDataConsumer>
      </SimpleForm>
    </Edit>
  ) : null;
};

export default PemohonEdit;
