import React, { useCallback } from "react";
import { useForm } from "react-final-form";
import { SaveButton, useDataProvider, useRedirect } from "react-admin";

const SimEditButton = ({ handleSubmitWithRedirect, basePath, ...props }) => {
  const form = useForm();
  const redirect = useRedirect();
  const dataProvider = useDataProvider();

  const updatePemohon = useCallback(
    async (id, data) => {
      const { data: pemohon } = await dataProvider.update("pemohon", {
        id: id,
        data: { ...data }
      });

      return pemohon;
    },
    [dataProvider]
  );

  const createPemohon = useCallback(
    async data => {
      const { data: pemohon } = await dataProvider.create("pemohon", {
        data: { ...data }
      });

      return pemohon;
    },
    [dataProvider]
  );

  const updateSim = useCallback(
    async (data, id) => {
      const { data: sim } = await dataProvider.update("sim", {
        id: id,
        data: { ...data }
      });

      return sim;
    },
    [dataProvider]
  );

  const handleClick = useCallback(async () => {
    const { pemohon, pemohon_id, id, ...rest } = form.getState().values;

    if (pemohon_id) {
      const updatedPemohon = await updatePemohon(pemohon_id, pemohon);

      if (updatedPemohon) {
        const updatedSim = await updateSim(
          {
            ...rest,
            pemohon_id: updatedPemohon.id
          },
          id
        );

        if (updatedSim) {
          redirect(`${basePath}/print_depan/${updatedSim.id}`);
        }
      }
    } else {
      const createdPemohon = await createPemohon(pemohon);

      if (createdPemohon) {
        const updatedSim = await updateSim(
          {
            ...rest,
            pemohon_id: createdPemohon.id
          },
          id
        );

        if (updatedSim) {
          redirect(`${basePath}/print_depan/${updatedSim.id}`);
        }
      }
    }
  }, [createPemohon, updateSim, form, redirect, updatePemohon]);

  return <SaveButton {...props} handleSubmitWithRedirect={handleClick} />;
};

export default SimEditButton;
