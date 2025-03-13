import { createClient } from '@supabase/supabase-js';

// Utilizar las variables de entorno directamente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Cliente de Supabase con clave anónima para operaciones públicas (frontend)
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Faltan las variables de entorno de Supabase para el cliente anónimo');
    // Devolvemos un cliente nulo que se puede verificar en lugar de arrojar un error
    // Esto permite una mejor experiencia en desarrollo
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
};

// Cliente de Supabase con clave de servicio para operaciones del servidor
// No lo exportamos por defecto para evitar que se use accidentalmente en el frontend
export const createServiceClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Faltan las variables de entorno de Supabase para el cliente de servicio');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Para compatibilidad con el código existente
const client = createSupabaseClient();
export default client;