import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Grid,
  makeStyles
} from "@material-ui/core";
import { useDataProvider } from "react-admin";
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

const DiagramBatang = ({ sim_list = [] }) => {
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

    const sim_per_golongan_per_pengajuan = sim_per_golongan.map(sim_list =>
      pengajuan_list.map(pengajuan => filterByPengajuanSim(sim_list, pengajuan))
    );

    setState(state => ({
      ...state,
      pengajuan_list,
      golongan_list,
      sim_per_pengajuan,
      sim_per_pengajuan_per_golongan,
      sim_per_golongan,
      sim_per_golongan_per_pengajuan
    }));
  }, [dataProvider, sim_list]);

  useEffect(() => {
    register();
  }, [register]);

  const { sim_per_golongan_per_pengajuan } = state;

  const data = [
    {
      name: "SIM A",
      baru: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[0][0].length
        : 0,
      perpanjang: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[0][1].length
        : 0,
      ganti: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[0][2].length
        : 0
    },
    {
      name: "SIM BI",
      baru: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[1][0].length
        : 0,
      perpanjang: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[1][1].length
        : 0,
      ganti: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[1][2].length
        : 0
    },
    {
      name: "SIM BII",
      baru: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[2][0].length
        : 0,
      perpanjang: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[2][1].length
        : 0,
      ganti: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[2][2].length
        : 0
    },
    {
      name: "SIM BII SUS",
      baru: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[3][0].length
        : 0,
      perpanjang: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[3][1].length
        : 0,
      ganti: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[3][2].length
        : 0
    },
    {
      name: "SIM C",
      baru: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[4][0].length
        : 0,
      perpanjang: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[4][1].length
        : 0,
      ganti: sim_per_golongan_per_pengajuan
        ? sim_per_golongan_per_pengajuan[4][2].length
        : 0
    }
  ];

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
                        GRAFIK PENYELENGGARAAN SIM TNI
                      </Typography>
                      <Typography variant="h6">
                        01/03/2020 s/d 03/03/2020
                      </Typography>
                      <Typography variant="h6">SATLAK PUSPOMAD</Typography>
                    </center>
                  </Print>
                </Grid>

                <Grid item xs={12}>
                  <center>
                    <BarChart
                      width={600}
                      height={400}
                      data={data}
                      margin={{
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={"name"} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="baru" fill="#8884d8" />
                      <Bar dataKey="perpanjang" fill="#CCCCCC" />
                      <Bar dataKey="ganti" fill="#82ca9d" />
                    </BarChart>
                  </center>
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

export default DiagramBatang;
