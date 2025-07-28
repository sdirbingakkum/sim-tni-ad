import React from "react";
import { Field } from "react-final-form";
import CameraComponent from "./components/CameraComponent";

const CameraInput = (props) => {
  // 'props' di sini akan mencakup 'source', 'label', 'bucketName', 'folderPath', dll.
  // yang Anda definisikan di SimCreate.js
  return (
    <Field
      name={props.source || "pas_foto"} // Gunakan props.source, atau default jika tidak ada
      component={CameraComponent}
      {...props} // <-- Teruskan semua props ke CameraComponent
    />
  );
};

export default CameraInput;
