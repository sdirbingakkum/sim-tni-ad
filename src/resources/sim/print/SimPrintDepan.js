import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDataProvider, useRedirect, Title } from "react-admin";
import moment from "moment";
import monthToRoman from "./monthToRoman";
import SimCanvasDepan from "./SimCanvasDepan";
import { Card, CardContent, CardActions, Button } from "@material-ui/core";
import ReactToPrint from "react-to-print";

const SimPrintDepan = ({
  match: {
    params: { id },
  },
  ...rest
}) => {
  const componentRef = useRef();
  const dataProvider = useDataProvider();
  const redirect = useRedirect();
  const [sim, setSim] = useState();
  const [satlak, setSatlak] = useState();
  const [pemohon, setPemohon] = useState();
  const [permohonan_sim_tni, setPermohonanSimTni] = useState();
  const [golongan_sim_tni, setGolonganSimTni] = useState();
  const [lingkup, setLingkup] = useState();
  const [markas, setMarkas] = useState();
  const [pangkat_komandan, setPangkatKomandan] = useState();
  const [korps_komandan, setKorpsKomandan] = useState();
  const [pangkat, setPangkat] = useState();
  const [korps, setKorps] = useState();
  const [golongan_pns, setGolonganPns] = useState();
  const [golongan_darah, setGolonganDarah] = useState();
  const [kode_sim_display, setKodeSimDisplay] = useState();
  const [nama_display, setNamaDisplay] = useState();
  const [tempat_tanggal_lahir_display, setTempatTanggalLahirDisplay] =
    useState();
  const [pangkat_nrp_nip_display, setPangkatNrpNipDisplay] = useState();
  const [kesatuan_display, setKesatuanDisplay] = useState();
  const [golongan_darah_display, setGolonganDarahDisplay] = useState();
  const [dibuat_di_display, setDibuatDiDisplay] = useState();
  const [pada_tanggal_display, setPadaTanggalDisplay] = useState();
  const [berlaku_hingga_display, setBerlakuHinggaDisplay] = useState();
  const [label_komandan_display, setLabelKomandanDisplay] = useState();
  const [nama_komandan_display, setNamaKomandanDisplay] = useState();
  const [
    pangkat_korps_nrp_komandan_display,
    setPangkatKorpsNrpKomandanDisplay,
  ] = useState();
  const [tanda_tangan_komandan_display, setTandaTanganKomandanDisplay] =
    useState();
  const [stempel_satlak_display, setStempelSatlakDisplay] = useState();
  const [tanda_tangan_display, setTandaTanganDisplay] = useState();
  const [pas_foto_display, setPasFotoDisplay] = useState();
  const [sidik_jari_display, setSidikJariDisplay] = useState();
  const [sim_image, setSimImage] = useState();

  const fetchSim = useCallback(async () => {
    if (id) {
      const { data: sim } = await dataProvider.getOne("sim", { id: id });

      console.log(sim);

      setSim(sim);
    } else {
    }
    console.log("SIM_ERROR => ID TIDAK DITEMUKAN");
  }, [dataProvider, id]);

  const fetchFromSim = useCallback(async () => {
    if (sim) {
      const {
        satlak_id,
        pemohon_id,
        permohonan_sim_tni_id,
        golongan_sim_tni_id,
      } = sim;

      if (satlak_id) {
        const { data: satlak } = await dataProvider.getOne("satlak", {
          id: satlak_id,
        });

        setSatlak(satlak);
      }

      if (pemohon_id) {
        const { data: pemohon } = await dataProvider.getOne("pemohon", {
          id: pemohon_id,
        });

        setPemohon(pemohon);
      }

      if (permohonan_sim_tni_id) {
        const { data: permohonan_sim_tni } = await dataProvider.getOne(
          "permohonan_sim_tni",
          {
            id: permohonan_sim_tni_id,
          }
        );

        setPermohonanSimTni(permohonan_sim_tni);
      }

      if (golongan_sim_tni_id) {
        const { data: golongan_sim_tni } = await dataProvider.getOne(
          "golongan_sim_tni",
          {
            id: sim.golongan_sim_tni_id,
          }
        );

        setGolonganSimTni(golongan_sim_tni);
      }
    }
  }, [dataProvider, sim]);

  const fetchFromSatlak = useCallback(async () => {
    if (satlak) {
      const { lingkup_id, markas_id, pangkat_komandan_id, korps_komandan_id } =
        satlak;

      if (lingkup_id) {
        const { data: lingkup } = await dataProvider.getOne("lingkup", {
          id: lingkup_id,
        });

        setLingkup(lingkup);
      }

      if (markas_id) {
        const { data: markas } = await dataProvider.getOne("ibukota_provinsi", {
          id: markas_id,
        });

        setMarkas(markas);
      }

      if (pangkat_komandan_id) {
        const { data: pangkat_komandan } = await dataProvider.getOne(
          "pangkat",
          {
            id: pangkat_komandan_id,
          }
        );

        setPangkatKomandan(pangkat_komandan);
      }

      if (korps_komandan_id) {
        const { data: korps_komandan } = await dataProvider.getOne("korps", {
          id: korps_komandan_id,
        });

        setKorpsKomandan(korps_komandan);
      }
    }
  }, [dataProvider, satlak]);

  const fetchFromPemohon = useCallback(async () => {
    if (pemohon) {
      const { pangkat_id, korps_id, golongan_pns_id, golongan_darah_id } =
        pemohon;

      if (pangkat_id) {
        const { data: pangkat } = await dataProvider.getOne("pangkat", {
          id: pangkat_id,
        });

        setPangkat(pangkat);
      }

      if (korps_id) {
        const { data: korps } = await dataProvider.getOne("korps", {
          id: korps_id,
        });

        setKorps(korps);
      }

      if (golongan_pns_id) {
        const { data: golongan_pns } = await dataProvider.getOne(
          "golongan_pns",
          {
            id: golongan_pns_id,
          }
        );

        setGolonganPns(golongan_pns);
      }

      if (golongan_darah_id) {
        const { data: golongan_darah } = await dataProvider.getOne(
          "golongan_darah",
          {
            id: golongan_darah_id,
          }
        );

        setGolonganDarah(golongan_darah);
      }
    }
  }, [dataProvider, pemohon]);

  useEffect(() => {
    fetchSim();
  }, [fetchSim]);

  useEffect(() => {
    fetchFromSim();
  }, [fetchFromSim]);

  useEffect(() => {
    fetchFromSatlak();
  }, [fetchFromSatlak]);

  useEffect(() => {
    fetchFromPemohon();
  }, [fetchFromPemohon]);

  const createKodeSimDisplay = useCallback(() => {
    const satlak_kode = satlak && satlak.kode ? satlak.kode + "." : "";
    const sim_id =
      sim && sim.id ? sim.id.toString().padStart(4, "0") + "." : "";
    const pemohon_bulan_tahun_lahir =
      pemohon && pemohon.tanggal_lahir
        ? moment(pemohon.tanggal_lahir).format("MMYY") + "/"
        : "";
    const golongan_sim_tni_nama =
      golongan_sim_tni && golongan_sim_tni.nama
        ? golongan_sim_tni.nama + "."
        : "";
    const permohonan_sim_tni_kode =
      permohonan_sim_tni && permohonan_sim_tni.kode
        ? permohonan_sim_tni.kode + "/"
        : "";
    const sim_created_bulan_tahun =
      sim && sim.created
        ? monthToRoman(moment(sim.created).format("M")) +
          "/" +
          moment(sim.created).format("YYYY")
        : "";
    const kode_sim_display =
      satlak_kode +
      sim_id +
      pemohon_bulan_tahun_lahir +
      golongan_sim_tni_nama +
      permohonan_sim_tni_kode +
      sim_created_bulan_tahun;

    setKodeSimDisplay(kode_sim_display);
  }, [satlak, sim, pemohon, golongan_sim_tni, permohonan_sim_tni]);

  const createNamaDisplay = useCallback(() => {
    const nama_display = pemohon && pemohon.nama ? pemohon.nama : "";

    setNamaDisplay(nama_display);
  }, [pemohon]);

  const createTempatTanggalLahirDisplay = useCallback(() => {
    const tempat_lahir_display =
      pemohon && pemohon.tempat_lahir
        ? pemohon.tempat_lahir.toUpperCase() + "/"
        : "";
    const tanggal_lahir_display =
      pemohon && pemohon.tanggal_lahir
        ? moment(pemohon.tanggal_lahir).format("DD-MM-YYYY")
        : "";
    const tempat_tanggal_lahir_display =
      tempat_lahir_display + tanggal_lahir_display;

    setTempatTanggalLahirDisplay(tempat_tanggal_lahir_display);
  }, [pemohon]);

  const createPangkatNrpNipDisplay = useCallback(() => {
    const pangkat_display = pangkat && pangkat.kode ? pangkat.kode + " " : "";
    const korps_display = korps && korps.kode ? korps.kode + "/" : "";
    const golongan_pns_display =
      golongan_pns && golongan_pns.nama ? golongan_pns.nama + "/" : "";
    const pemohon_display =
      pemohon && pemohon.no_identitas ? pemohon.no_identitas : "";
    const pangkat_nrp_nip_display =
      pangkat_display.toUpperCase() +
      korps_display +
      golongan_pns_display +
      pemohon_display;

    setPangkatNrpNipDisplay(pangkat_nrp_nip_display);
  }, [pangkat, korps, golongan_pns, pemohon]);

  const createKesatuanDisplay = useCallback(() => {
    const kesatuan_display =
      pemohon && pemohon.kesatuan ? pemohon.kesatuan : "";
    setKesatuanDisplay(kesatuan_display);
  }, [pemohon]);

  const createGolonganDarahDisplay = useCallback(() => {
    const golongan_darah_display =
      golongan_darah && golongan_darah.nama ? golongan_darah.nama : "";
    setGolonganDarahDisplay(golongan_darah_display);
  }, [golongan_darah]);

  const createDibuatDiDisplay = useCallback(() => {
    const dibuat_di_display =
      markas && markas.nama ? markas.nama.toUpperCase() : "";

    setDibuatDiDisplay(dibuat_di_display);
  }, [markas]);

  const createPadaTanggalDisplay = useCallback(() => {
    const pada_tanggal_display =
      sim && sim.created ? moment(sim.created).format("DD-MM-YYYY") : "";

    setPadaTanggalDisplay(pada_tanggal_display);
  }, [sim]);

  const createBerlakuHinggaDisplay = useCallback(() => {
    const berlaku_hingga_display =
      sim && sim.berlaku_hingga
        ? moment(sim.berlaku_hingga).format("DD-MM-YYYY")
        : "";

    setBerlakuHinggaDisplay(berlaku_hingga_display);
  }, [sim]);

  const createLabelKomandanDisplay = useCallback(() => {
    const isPuspomad = lingkup && lingkup.id === 1;
    const satlak_kode_romawi_display =
      satlak && satlak.kode_romawi ? satlak.kode_romawi + "/" : "";
    const satlak_kode_display =
      satlak && satlak.kode ? satlak.kode.toUpperCase() : "";

    const satlak_kode_kode_romawi_display =
      satlak_kode_romawi_display + satlak_kode_display;

    const label_komandan_display = isPuspomad
      ? lingkup && lingkup.label_komandan
        ? lingkup.label_komandan
        : ""
      : lingkup && lingkup.label_komandan
      ? lingkup.label_komandan + " " + satlak_kode_kode_romawi_display
      : "";

    setLabelKomandanDisplay(label_komandan_display);
  }, [lingkup, satlak]);

  const createNamaKomandanDisplay = useCallback(() => {
    const nama_komandan_display =
      satlak && satlak.nama_komandan ? satlak.nama_komandan : "";

    setNamaKomandanDisplay(nama_komandan_display);
  }, [satlak]);

  const createPangkatKorpsNrpKomandanDisplay = useCallback(() => {
    const pangkat_komandan_display =
      pangkat_komandan && pangkat_komandan.kode
        ? pangkat_komandan.kode + " "
        : "";
    const korps_komandan_display =
      korps_komandan && korps_komandan.kode ? korps_komandan.kode + " " : "";
    const nrp_komandan_display =
      satlak && satlak.nrp_komandan ? satlak.nrp_komandan : "";
    const pangkat_korps_nrp_komandan_display =
      pangkat_komandan_display.toUpperCase() +
      korps_komandan_display +
      "NRP " +
      nrp_komandan_display;

    setPangkatKorpsNrpKomandanDisplay(pangkat_korps_nrp_komandan_display);
  }, [pangkat_komandan, korps_komandan, satlak]);

  const createTandaTanganKomandanDisplay = useCallback(() => {
    const tanda_tangan_komandan_display =
      satlak && satlak.tanda_tangan ? satlak.tanda_tangan : null;

    setTandaTanganKomandanDisplay(tanda_tangan_komandan_display);
  }, [satlak]);

  const createStempelSatlakDisplay = useCallback(() => {
    const stempel_satlak_display =
      satlak && satlak.stempel ? satlak.stempel : null;

    setStempelSatlakDisplay(stempel_satlak_display);
  }, [satlak]);

  const createTandaTanganDisplay = useCallback(() => {
    const tanda_tangan_display =
      sim && sim.tanda_tangan ? sim.tanda_tangan : null;

    setTandaTanganDisplay(tanda_tangan_display);
  }, [sim]);

  const createPasFotoDisplay = useCallback(() => {
    const pas_foto_display = sim && sim.pas_foto ? sim.pas_foto : null;

    setPasFotoDisplay(pas_foto_display);
  }, [sim]);

  // const createSidikJariDisplay = useCallback(() => {
  //   const sidik_jari_display =
  //     sim && sim.sidik_jari ? sim.sidik_jari.src : null;
  //   setSidikJariDisplay(sidik_jari_display);
  // }, [sim]);

  const createSidikJariDisplay = useCallback(() => {
    const sidik_jari_display = sim && sim.sidik_jari ? sim.sidik_jari : null;
    setSidikJariDisplay(sidik_jari_display);
  }, [sim]);

  useEffect(() => {
    createKodeSimDisplay();
    createNamaDisplay();
    createTempatTanggalLahirDisplay();
    createPangkatNrpNipDisplay();
    createKesatuanDisplay();
    createGolonganDarahDisplay();
    createDibuatDiDisplay();
    createPadaTanggalDisplay();
    createBerlakuHinggaDisplay();
    createLabelKomandanDisplay();
    createNamaKomandanDisplay();
    createPangkatKorpsNrpKomandanDisplay();
    createTandaTanganKomandanDisplay();
    createStempelSatlakDisplay();
    createTandaTanganDisplay();
    createPasFotoDisplay();
    createSidikJariDisplay();
  }, [
    createKodeSimDisplay,
    createNamaDisplay,
    createTempatTanggalLahirDisplay,
    createPangkatNrpNipDisplay,
    createKesatuanDisplay,
    createGolonganDarahDisplay,
    createDibuatDiDisplay,
    createPadaTanggalDisplay,
    createBerlakuHinggaDisplay,
    createLabelKomandanDisplay,
    createNamaKomandanDisplay,
    createPangkatKorpsNrpKomandanDisplay,
    createTandaTanganKomandanDisplay,
    createStempelSatlakDisplay,
    createTandaTanganDisplay,
    createPasFotoDisplay,
    createSidikJariDisplay,
  ]);

  const content = {
    kode_sim: kode_sim_display,
    nama: nama_display,
    tempat_tanggal_lahir: tempat_tanggal_lahir_display,
    pangkat_nrp_nip: pangkat_nrp_nip_display,
    kesatuan: kesatuan_display,
    golongan_darah: golongan_darah_display,
    dibuat_di: dibuat_di_display,
    pada_tanggal: pada_tanggal_display,
    berlaku_hingga: berlaku_hingga_display,
    label_komandan: label_komandan_display,
    nama_komandan: nama_komandan_display,
    pangkat_korps_nrp_komandan: pangkat_korps_nrp_komandan_display,
    tanda_tangan_komandan: tanda_tangan_komandan_display,
    stempel: stempel_satlak_display,
    tanda_tangan: tanda_tangan_display,
    pas_foto: pas_foto_display,
    sidik_jari: sidik_jari_display,
  };

  const simCanvasRef = React.createRef();

  useEffect(() => {
    setSimImage(
      simCanvasRef.current.toDataURL({
        mimeType: "image/png",
        width: 325,
        height: 204,
        quality: 2,
        pixelRatio: 10,
      })
    );
  });

  const onAfterPrint = () => {
    redirect(`/print_belakang/${id}`);
  };

  return (
    <Card>
      <Title title="Cetak SIM" />
      <CardContent>
        <img src={sim_image} width={325} height={204} ref={componentRef} />
        <SimCanvasDepan content={content} ref={simCanvasRef} />
      </CardContent>
      <CardActions>
        <ReactToPrint
          trigger={() => (
            <Button variant="contained" color="primary">
              Cetak Depan
            </Button>
          )}
          content={() => componentRef.current}
          onAfterPrint={onAfterPrint}
        />
      </CardActions>
    </Card>
  );
};

export default SimPrintDepan;
