import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { processFormWithImage, deleteImageFromSupabase } from '@/lib/processFile';

// GET - Obtener un elemento específico por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      // Si es error PGRST116 (no encontrado), devolver 404
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: false, 
          error: 'Elemento no encontrado' 
        }, { status: 404 });
      }
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT - Actualizar un elemento existente
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Obtener elemento existente
    const { data: existingItem, error: fetchError } = await supabase
      .from('inventario')
      .select('img_path')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      // Si es error PGRST116 (no encontrado), devolver 404
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ 
          success: false, 
          error: 'Elemento no encontrado' 
        }, { status: 404 });
      }
      throw fetchError;
    }
    
    // Procesar formulario con imagen
    const formData = await processFormWithImage(request);
    
    // Convertir campos JSON si vienen como strings
    let parsedData = { ...formData };
    
    if (formData.historial_resp) {
      try {
        parsedData.historial_resp = JSON.parse(formData.historial_resp);
      } catch (e) {
        // Mantener valor anterior
      }
    }
    
    if (formData.historial_cambio) {
      try {
        parsedData.historial_cambio = JSON.parse(formData.historial_cambio);
      } catch (e) {
        // Mantener valor anterior
      }
    }
    
    // Si hay una nueva imagen, eliminar la anterior
    if (formData.img_path && existingItem.img_path && formData.img_path !== existingItem.img_path) {
      await deleteImageFromSupabase(existingItem.img_path);
    }
    
    // Extraer los datos del formulario
    const {
      marca, modelo, serial_codigo_mac, procesador, 
      almacenamiento, ram, nic_red, pulgadas, cantidad, 
      cargador_probable, estado, correo_monitoreo,
      categoria, // Asegúrate de incluir el nuevo campo
      // ...otros campos
    } = formData;

    // Actualizaciones
    const updates = {
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
      categoria, // Incluir en las actualizaciones
    };

    // Si hay una nueva imagen, actualiza las URLs también
    if (formData.img_url) {
      updates.img_url = formData.img_url;
      updates.img_path = formData.img_path;
    }

    // Actualizar en la base de datos
    const { data, error } = await supabase
      .from('inventario')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data[0] 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 400 });
  }
}

// DELETE - Eliminar un elemento
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Obtener elemento existente para obtener la ruta de la imagen
    const { data: existingItem, error: fetchError } = await supabase
      .from('inventario')
      .select('img_path')
      .eq('id', id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    // Eliminar imagen si existe
    if (existingItem?.img_path) {
      await deleteImageFromSupabase(existingItem.img_path);
    }
    
    // Eliminar de la base de datos
    const { error } = await supabase
      .from('inventario')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {} 
    });
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