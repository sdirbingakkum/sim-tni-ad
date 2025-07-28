import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  }
}));

const TanggalSelector = ({ callback }) => {
  const classes = useStyles();
  const [sejak, setSejak] = useState();
  const [hingga, setHingga] = useState();

  const handleSejak = e => {
    setSejak(e.target.value);
  };

  const handleHingga = e => {
    setHingga(e.target.value);
  };

  useEffect(() => {
    callback({ sejak, hingga });
  }, [sejak, hingga]);

  return (
    <form className={classes.container} noValidate>
      <TextField
        label="SEJAK"
        type="date"
        onChange={handleSejak}
        className={classes.textField}
        InputLabelProps={{
          shrink: true
        }}
      />
      <TextField
        label="HINGGA"
        type="date"
        onChange={handleHingga}
        className={classes.textField}
        InputLabelProps={{
          shrink: true
        }}
      />
    </form>
  );
};

export default TanggalSelector;
