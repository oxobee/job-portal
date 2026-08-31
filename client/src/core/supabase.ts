import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://vqxtdfmgwiwuphxxreik.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHRkZm1nd2l3dXBoeHhyZWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDUwMDIsImV4cCI6MjEwMzc4MTAwMn0.H4b17UAiPseyc60gm8IboEJ87dbuR29TGbcwyLcx6vs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
