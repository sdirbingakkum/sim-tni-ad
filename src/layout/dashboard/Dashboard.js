import React, { useState, useCallback, useEffect } from "react";
import { useVersion, useDataProvider } from "react-admin";
import Rekapitulasi from "./components/statistics/Rekapitulasi";
import DiagramBatang from "./components/statistics/DiagramBatang";
import SatlakSelector from "./components/statistics/SatlakSelector";
import TanggalSelector from "./components/statistics/TanggalSelector";

const styles = {
  flex: { display: "flex" },
  flexColumn: { display: "flex", flexDirection: "column" },
  leftCol: { flex: 1, marginRight: "1em" },
  rightCol: { flex: 1, marginLeft: "1em" },
  singleCol: { marginTop: "1em", marginBottom: "1em" }
};

const Dashboard = ({ permissions }) => {
  const [state, setState] = useState({});
  const [satlak_selected, setSatlakSelected] = useState();
  const [tanggal_selected, setTanggalSelected] = useState();
  const version = useVersion();
  const dataProvider = useDataProvider();

  const satlakSelectorCallback = data => {
    setSatlakSelected(data);
  };

  const tanggalSelectorCallback = data => {
    setTanggalSelected(data);
  };

  const fetchSim = useCallback(async () => {
    let filter = null;

    if (permissions && permissions.lingkup_id === 2) {
      filter = { satlak_id: permissions.satlak_id };
    } else {
      if (satlak_selected === 0) {
        filter = {};
      } else {
        filter = { satlak_id: satlak_selected };
      }
    }

    const { data: sim_list } = await dataProvider.getList("sim", {
      pagination: { page: 1, perPage: 1000000000 },
      sort: { field: "created", order: "DESC" },
      filter: filter
    });

    const sim_list_sejak =
      tanggal_selected && tanggal_selected.sejak
        ? sim_list.filter(res => res.created >= tanggal_selected.sejak)
        : sim_list;

    const sim_list_hingga =
      tanggal_selected && tanggal_selected.hingga
        ? sim_list_sejak.filter(res => res.created <= tanggal_selected.hingga)
        : sim_list_sejak;

    setState(state => ({
      ...state,
      sim_list: sim_list_hingga
    }));
  }, [dataProvider, satlak_selected, tanggal_selected, permissions]);

  const fetchSatlak = useCallback(async () => {
    const { data: satlak_list } = await dataProvider.getList("satlak", {
      pagination: { page: 1, perPage: 1000000000 },
      sort: { field: "id", order: "ASC" }
    });

    setState(state => ({
      ...state,
      satlak_list
    }));
  }, [dataProvider]);

  useEffect(() => {
    fetchSim();
    fetchSatlak();
  }, [version, fetchSim, fetchSatlak]);

  return (
    <div style={styles.flex}>
      <div style={styles.leftCol}>
        <div style={styles.flex}>
          {/* <MonthlyRevenue value={revenue} />
          <NbNewOrders value={nbNewOrders} /> */}
        </div>
        <div style={styles.singleCol}>
          {/* <Welcome /> */}
          <DiagramBatang sim_list={state.sim_list} />
        </div>
        <div style={styles.singleCol}>
          <Rekapitulasi sim_list={state.sim_list} />
        </div>
      </div>
      <div style={styles.rightCol}>
        <div style={styles.flex}>
          <TanggalSelector callback={tanggalSelectorCallback} />
        </div>
        <div style={styles.flex}>
          {permissions && permissions.lingkup_id === 1 && (
            <SatlakSelector
              satlak_list={state.satlak_list}
              callback={satlakSelectorCallback}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
