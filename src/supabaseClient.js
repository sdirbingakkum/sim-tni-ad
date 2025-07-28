// Create a file called supabaseClient.js in your src directory

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anonymous Key is missing. Please check your environment variables."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
