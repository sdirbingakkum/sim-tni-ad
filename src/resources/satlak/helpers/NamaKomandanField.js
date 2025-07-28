import React, { useCallback } from "react";

const NamaKomandanField = ({
  record: { nama_komandan, pangkat_komandan_id, korps_komandan_id }
}) => {
  const dataProvider = useDataProvider()  

  const fetchPangkat = useCallback(async () => {
    if(pangkat_komandan_id){
        const {data: pangkat} = await 
    }
  }, [pangkat_komandan_id]);

  return <span>{kode_romawi ? kode_romawi + "/" + kode : kode}</span>;
};

NamaKomandanField.defaultProps = {
  addLabel: true
};

export default NamaKomandanField;
