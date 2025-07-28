import React from "react";

const KodeSatlakField = ({ record: { kode, kode_romawi } }) => {
  return <span>{kode_romawi ? kode_romawi + "/" + kode : kode}</span>;
};

KodeSatlakField.defaultProps = {
  addLabel: true
};

export default KodeSatlakField;
