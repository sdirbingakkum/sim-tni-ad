export const filterByPengajuanSim = (data, permohonan_sim_tni) =>
  data.filter(res => res.permohonan_sim_tni_id === permohonan_sim_tni.id);

export const filterByGolonganSim = (data, golongan_sim_tni) =>
  data.filter(res => res.golongan_sim_tni_id === golongan_sim_tni.id);
