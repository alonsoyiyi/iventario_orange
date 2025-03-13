import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { processFormWithImage } from '@/lib/processFile';

// GET - Obtener todos los elementos del inventario
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      count: data.length, 
      data 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Crear un nuevo elemento en el inventario
export async function POST(request) {
  try {
    const data = await processFormWithImage(request);
    
    // Extraer los datos del formulario
    const {
      marca, modelo, serial_codigo_mac, procesador, 
      almacenamiento, ram, nic_red, pulgadas, cantidad, 
      cargador_probable, estado, correo_monitoreo, 
      categoria, // Asegúrate de incluir el nuevo campo
      // ...otros campos
    } = data;

    // Crear el elemento en Supabase
    const { data: newItem, error } = await supabase
      .from('inventario')
      .insert([{ 
        marca, 
        modelo, 
        serial_codigo_mac, 
        procesador, 
        almacenamiento, 
        ram, 
        nic_red, 
        pulgadas, 
        cantidad, 
        cargador_probable, 
        estado, 
        correo_monitoreo,
        categoria, // Incluir en el insert
        img_url: data.img_url,
        img_path: data.img_path
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      data: newItem 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 400 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};