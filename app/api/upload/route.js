import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@auth0/nextjs-auth0';

// Cliente de Supabase con clave de servicio para bypass de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

export async function POST(request) {
  try {
    // Verificar autenticación
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener el archivo de formData
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json({ error: 'No se encontró ninguna imagen' }, { status: 400 });
    }
    
    // Convertir el archivo a buffer para subirlo
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generar nombre de archivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName;
    
    // Subir a Supabase Storage con el cliente admin
    const { data, error } = await supabaseAdmin.storage
      .from('inventario-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Error de Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Obtener la URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('inventario-images')
      .getPublicUrl(filePath);
    
    return NextResponse.json({
      img_url: urlData.publicUrl,
      img_path: filePath
    });
    
  } catch (error) {
    console.error('Error en la API de carga:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}