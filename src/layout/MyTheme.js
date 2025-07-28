import { createTheme } from "@material-ui/core/styles";

const myTheme = createTheme({
  palette: {
    secondary: {
      light: "#5f5fc4",
      main: "#283593",
      dark: "#001064",
      contrastText: "#fff",
    },
  },
  overrides: {
    MuiFilledInput: {
      root: {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        "&$disabled": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
    },
  },
});

export default myTheme;
