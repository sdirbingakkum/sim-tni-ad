import React from "react";
import { DateInput } from "react-admin";
import { useForm } from "react-final-form";
import moment from "moment";

const TanggalLahirInput = props => {
  const form = useForm();

  const onChange = e => {
    const value = e.target.value;

    form.change("berlaku_hingga", moment(value).add(5, "y"));
  };

  return (
    <DateInput
      source="pemohon.tanggal_lahir"
      label="Tanggal Lahir"
      {...props}
      onChange={onChange}
    />
  );
};

export default TanggalLahirInput;
