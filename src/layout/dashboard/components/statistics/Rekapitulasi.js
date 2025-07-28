import React, { useEffect, useCallback, useState, useRef } from "react";
import { useDataProvider } from "react-admin";
import {
  makeStyles,
  Card,
  CardActions,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Typography,
  Grid
} from "@material-ui/core";
// import sim_fields from "../../../../resources/sim/fields";
// import pengajuan_sim from "../../../../resources/pengajuan_sim";
// import pengajuan_sim_fields from "../../../../resources/pengajuan_sim/fields";
// import golongan_sim from "../../../../resources/golongan_sim";
// import golongan_sim_fields from "../../../../resources/golongan_sim/fields";
import { filterByPengajuanSim, filterByGolonganSim } from "./filters";
import ReactToPrint from "react-to-print";
import PrintProvider, { Print, NoPrint } from "react-easy-print";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  container: {
    padding: "30px"
  },
  namaPangkat: {
    marginTop: "100px"
  }
}));

const Rekapitulasi = ({ sim_list = [] }) => {
  const [state, setState] = useState({});
  const dataProvider = useDataProvider();
  const componentRef = useRef();
  const classes = useStyles();

  const register = useCallback(async () => {
    const { data: pengajuan_list } = await dataProvider.getList(
      "permohonan_sim_tni",
      {
        pagination: { page: 1, perPage: 1000000000 },
        sort: { field: "id", order: "ASC" }
      }
    );
    const { data: golongan_list } = await dataProvider.getList(
      "golongan_sim_tni",
      {
        pagination: { page: 1, perPage: 1000000000 },
        sort: { field: "id", order: "ASC" }
      }
    );

    const sim_per_pengajuan = pengajuan_list.map(pengajuan => {
      return filterByPengajuanSim(sim_list, pengajuan);
    });

    const sim_per_pengajuan_per_golongan = sim_per_pengajuan.map(sim_list =>
      golongan_list.map(golongan => filterByGolonganSim(sim_list, golongan))
    );

    const sim_per_golongan = golongan_list.map(golongan => {
      return filterByGolonganSim(sim_list, golongan);
    });

    setState(state => ({
      ...state,
      pengajuan_list,
      golongan_list,
      sim_per_pengajuan,
      sim_per_pengajuan_per_golongan,
      sim_per_golongan
    }));
  }, [dataProvider, sim_list]);

  useEffect(() => {
    register();
  }, [register]);

  const {
    pengajuan_list,
    golongan_list,
    sim_per_pengajuan_per_golongan,
    sim_per_golongan
  } = state;

  return (
    <Card>
      <CardContent>
        <PrintProvider ref={componentRef}>
          <div className={classes.container}>
            <div className={classes.root}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Print printOnly>
                    <center>
                      <Typography variant="h6">
                        REKAPITULASI PENYELENGGARAAN SIM TNI
                      </Typography>
                      <Typography variant="h6">
                        01/03/2020 s/d 03/03/2020
                      </Typography>
                      <Typography variant="h6">SATLAK PUSPOMAD</Typography>
                    </center>
                  </Print>
                </Grid>

                <Grid item xs={12}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <Print printOnly>
                            <TableCell rowSpan={2} align="left">
                              NO
                            </TableCell>
                          </Print>
                          <TableCell rowSpan={2} align="left">
                            KEGIATAN
                          </TableCell>
                          <TableCell
                            colSpan={golongan_list ? golongan_list.length : 1}
                            align="center"
                          >
                            JENIS/GOLONGAN SIM
                          </TableCell>
                          <Print printOnly>
                            <TableCell rowSpan={2} align="center">
                              KETERANGAN
                            </TableCell>
                          </Print>
                        </TableRow>
                        <TableRow>
                          {golongan_list
                            ? golongan_list.map((value, index) => (
                                <TableCell key={index} align="center">
                                  {value.nama}
                                </TableCell>
                              ))
                            : []}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sim_per_pengajuan_per_golongan
                          ? sim_per_pengajuan_per_golongan.map(
                              (pengajuan, index_pengajuan) => (
                                <TableRow key={index_pengajuan}>
                                  <Print printOnly>
                                    <TableCell align="left">
                                      {pengajuan_list[index_pengajuan].id}
                                    </TableCell>
                                  </Print>
                                  <TableCell align="left">
                                    {pengajuan_list[index_pengajuan].id}
                                  </TableCell>
                                  {golongan_list
                                    ? golongan_list.map(
                                        (golongan, index_golongan) => (
                                          <TableCell
                                            key={index_golongan}
                                            align="center"
                                          >
                                            {pengajuan[index_golongan].length}
                                          </TableCell>
                                        )
                                      )
                                    : null}
                                  <Print printOnly>
                                    <TableCell align="center"></TableCell>
                                  </Print>
                                </TableRow>
                              )
                            )
                          : null}
                      </TableBody>
                      <TableHead>
                        <TableRow>
                          <Print printOnly>
                            <TableCell></TableCell>
                          </Print>
                          <TableCell align="left">JUMLAH</TableCell>
                          {golongan_list
                            ? golongan_list.map((value, index) => (
                                <TableCell key={index} align="center">
                                  {sim_per_golongan
                                    ? sim_per_golongan[index].length
                                    : null}
                                </TableCell>
                              ))
                            : []}
                          <Print printOnly>
                            <TableCell></TableCell>
                          </Print>
                        </TableRow>
                      </TableHead>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={3}></Grid>
                <Grid item xs={3}></Grid>
                <Grid item xs={3}></Grid>
                <Grid item xs={3}>
                  <Print printOnly>
                    <center>
                      <div>
                        <Typography>Jakarta, 2/09/1985</Typography>
                        <Typography>a.n DANPOMDAM, KASIGAKKUM</Typography>
                      </div>
                      <div className={classes.namaPangkat}>
                        <Typography>NAMA</Typography>
                        <Typography>PANGKAT</Typography>
                      </div>
                    </center>
                  </Print>
                </Grid>
              </Grid>
            </div>
          </div>
        </PrintProvider>
      </CardContent>
      <CardActions>
        <ReactToPrint
          trigger={() => <Button>Cetak</Button>}
          content={() => componentRef.current}
        />
      </CardActions>
    </Card>
  );
};

export default Rekapitulasi;
