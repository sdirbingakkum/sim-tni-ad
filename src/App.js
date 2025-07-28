import React from "react";
import { Admin, Resource } from "react-admin";
import { title } from "./providers/attrs";
import data from "./providers/data";
import SimCreate from "./resources/sim/SimCreate";
import SimList from "./resources/sim/SimList";
import SatlakCreate from "./resources/satlak/SatlakCreate";
import SatlakList from "./resources/satlak/SatlakList";
import PenggunaCreate from "./resources/pengguna/PenggunaCreate";
import PenggunaList from "./resources/pengguna/PenggunaList";
import auth from "./providers/auth";
import PemohonList from "./resources/pemohon/PemohonList";
import route from "./providers/route";
import SatlakEdit from "./resources/satlak/SatlakEdit";
import PenggunaEdit from "./resources/pengguna/PenggunaEdit";
import PemohonEdit from "./resources/pemohon/PemohonEdit";
import SimEdit from "./resources/sim/SimEdit";
import AppLayout from "./layout/AppLayout";
import myTheme from "./layout/MyTheme";
import Dashboard from "./layout/dashboard/Dashboard";

const dataProvider = data;
const authProvider = auth;
const customRoutes = route;
const appLayout = AppLayout;

const App = () => {
  return (
    <Admin
      title={title}
      dashboard={Dashboard}
      authProvider={authProvider}
      dataProvider={dataProvider}
      customRoutes={customRoutes}
      layout={appLayout}
      theme={myTheme}
    >
      {(permissions) => [
        <Resource
          name="sim"
          options={{ label: "SIM" }}
          create={SimCreate}
          edit={SimEdit}
          list={SimList}
        />,
        <Resource
          name="pemohon"
          options={{ label: "Pemohon" }}
          edit={PemohonEdit}
          list={PemohonList}
        />,
        <Resource
          name="pengguna"
          options={{ label: "Pengguna" }}
          create={PenggunaCreate}
          edit={PenggunaEdit}
          list={PenggunaList}
        />,
        <Resource name="jenis_pengguna" />,
        <Resource
          name="satlak"
          options={{ label: "SATLAK" }}
          create={
            permissions.satlak_id === 1 && permissions.jenis_pengguna_id === 1
              ? SatlakCreate
              : null
          }
          edit={SatlakEdit}
          list={SatlakList}
        />,
        <Resource name="ibukota_provinsi" />,
        <Resource name="lingkup" />,
        <Resource name="permohonan_sim_tni" />,
        <Resource name="golongan_sim_tni" />,
        <Resource name="kualifikasi_pengemudi" />,
        <Resource name="jenis_pemohon" />,
        <Resource name="golongan_pns" />,
        <Resource name="korps" />,
        <Resource name="pangkat" />,
        <Resource name="jenjang_kepangkatan" />,
        <Resource name="golongan_darah" />,
      ]}
    </Admin>
  );
};

export default App;
