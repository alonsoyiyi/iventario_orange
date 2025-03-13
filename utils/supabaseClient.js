import { createClient } from '@supabase/supabase-js';

// Crear cliente para uso en el navegador (frontend)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar que las variables estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las variables de entorno de Supabase para el cliente frontend');
}

// Deshabilitar características de autenticación de Supabase
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

export default supabaseClient;