import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import supabase from './supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Función para subir imagen a Supabase Storage
export const uploadImageToSupabase = async (file, folder = 'inventario') => {
  if (!file || !file.buffer) {
    return null;
  }
  
  try {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('inventario-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });
    
    if (error) {
      throw error;
    }
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('inventario-images')
      .getPublicUrl(filePath);
    
    return {
      path: filePath,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error al subir imagen a Supabase:', error);
    return null;
  }
};

// Función para eliminar imagen de Supabase Storage
export const deleteImageFromSupabase = async (filePath) => {
  if (!filePath) return true;
  
  try {
    const { error } = await supabase.storage
      .from('inventario-images')
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar imagen de Supabase:', error);
    return false;
  }
};

// Función para procesar el formulario y la imagen
export const processFormWithImage = async (req) => {
  const form = formidable({ 
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    multiples: false
  });

  return new Promise((resolve, reject) => {
    // Buffer para guardar los datos del archivo
    let fileBuffer = Buffer.alloc(0);
    let fileInfo = null;
    
    form.onPart = (part) => {
      if (!part.filename || part.name !== 'img') {
        // Dejar que formidable maneje los campos que no son archivos
        form._handlePart(part);
        return;
      }
      
      fileInfo = {
        originalname: part.filename,
        mimetype: part.mimetype
      };
      
      // Manejar el archivo manualmente
      part.on('data', (buffer) => {
        fileBuffer = Buffer.concat([fileBuffer, buffer]);
      });
      
      part.on('error', (err) => {
        reject(err);
      });
    };

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      const data = { ...fields };
      
      // Si hay una imagen (el buffer tiene contenido)
      if (fileBuffer.length > 0 && fileInfo) {
        try {
          // Preparar objeto de archivo
          const file = {
            buffer: fileBuffer,
            originalname: fileInfo.originalname,
            mimetype: fileInfo.mimetype
          };
          
          // Subir a Supabase Storage
          const imageData = await uploadImageToSupabase(file);
          if (imageData) {
            data.img_url = imageData.url;
            data.img_path = imageData.path;
          }
        } catch (error) {
          return reject(error);
        }
      }

      resolve(data);
    });
  });
};