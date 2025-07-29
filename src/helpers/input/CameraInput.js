import React from "react";
import { Field } from "react-final-form";
import CameraComponent from "./components/CameraComponent";

const CameraInput = (props) => {
  // Enhanced CameraInput yang meneruskan semua props dan menambahkan preview support
  return (
    <Field
      name={props.source || "pas_foto"}
      component={CameraComponent}
      {...props}
    />
  );
};

export default CameraInput;