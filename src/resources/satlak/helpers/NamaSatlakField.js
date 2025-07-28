import React from "react";

const NamaSatlakField = ({ record: { nama, kode_romawi } }) => {
  return <span>{kode_romawi ? kode_romawi + "/" + nama : nama}</span>;
};

NamaSatlakField.defaultProps = {
  addLabel: true
};

export default NamaSatlakField;
