import data from "./data";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with provided credentials
const supabaseClient = createClient(
  "https://ocqghycfqgrvlgqjoort.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcWdoeWNmcWdydmxncWpvb3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjkwNzEsImV4cCI6MjA1NzEwNTA3MX0.p3DWXSu6vWL1ey0CeKBhWaeD0iu54Fk6iEHohPNWCRU"
);

// const fetchPengguna = async (nrp_nip, kata_sandi) => {
//   const { data: pengguna } = await data.getList("pengguna", {
//     pagination: { page: 1, perPage: 1 },
//     sort: { field: "id", order: "ASC" },
//     filter: {
//       nrp_nip: nrp_nip,
//       kata_sandi: kata_sandi,
//     },
//   });

//   console.log("HELLO INI ADALAH PENGGUNA", pengguna);
//   return pengguna[0];
// };

const fetchPengguna = async (nrp_nip, kata_sandi) => {
  try {
    // Gunakan Supabase client secara langsung untuk lebih banyak kontrol
    const { data, error } = await supabaseClient
      .from("pengguna")
      .select("*")
      .eq("nrp_nip", nrp_nip)
      .eq("kata_sandi", kata_sandi)
      .limit(1);

    if (error) {
      return null;
    }

    // Jika ditemukan pengguna yang cocok, kembalikan pengguna pertama
    // Jika tidak ada yang cocok, kembalikan null
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    return null;
  }
};

export default {
  login: async ({ username, password }) => {
    const nrp_nip = username;
    const kata_sandi = password;

    const pengguna = await fetchPengguna(nrp_nip, kata_sandi);

    if (pengguna) {
      localStorage.setItem("token", JSON.stringify(pengguna));
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },
  checkAuth: () => {
    return localStorage.getItem("token") ? Promise.resolve() : Promise.reject();
  },
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getPermissions: () => {
    const role = localStorage.getItem("token");

    return role ? Promise.resolve(JSON.parse(role)) : Promise.reject();
  },
};
