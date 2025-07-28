import React, { useState, useCallback, useEffect } from "react";
import {
  makeStyles,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

const SatlakSelector = ({ satlak_list, callback }) => {
  const classes = useStyles();
  const [satlakSelected, setSatlakSelected] = useState(0);

  const handleChange = e => {
    setSatlakSelected(e.target.value);
  };

  useEffect(() => {
    callback(satlakSelected);
  }, [callback, satlakSelected]);

  return (
    <FormControl className={classes.formControl}>
      <InputLabel>PILIH SATLAK</InputLabel>
      <Select onChange={handleChange} value={satlakSelected} autoWidth>
        <MenuItem value={0}>Semua</MenuItem>
        {satlak_list
          ? satlak_list.map((satlak, index) => {
              return (
                <MenuItem key={index} value={satlak.id}>
                  {satlak.kode}
                </MenuItem>
              );
            })
          : null}
      </Select>
    </FormControl>
  );
};

export default SatlakSelector;
