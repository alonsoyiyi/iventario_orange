'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import supabaseClient from '@/utils/supabaseClient';
import { cn } from "@/lib/utils";
import EquipoForm from './EquipoForm';

// Sobreescribir el componente DialogContent para darle más ancho
const WideDialogContent = ({ className, ...props }) => (
  <DialogContent
    className={cn(
      "sm:max-w-[90%] xl:max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto bg-[#1a1a1a] text-white border border-gray-800",
      className
    )}
    {...props}
  />
);

export default function EquipoEditFormModal({ open, onOpenChange, equipoId }) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equipoData, setEquipoData] = useState(null);

  // Cargar los datos del equipo cuando se abre el modal
  useEffect(() => {
    if (open && equipoId) {
      fetchEquipoData();
    }
  }, [open, equipoId]);

  // Función para obtener los datos del equipo de Supabase
  const fetchEquipoData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseClient
        .from('inventario')
        .select('*')
        .eq('id', equipoId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Equipo no encontrado');

      // Procesar datos y expandir estructuras JSON si existen
      const processedData = {
        ...data,
        // Asegurarse que se pueda acceder a los campos correctamente
        serial_codigo_mac: data.serial_codigo_mac || data.serial_codigo_MAC || ''
      };

      setEquipoData(processedData);
    } catch (err) {
      console.error('Error al cargar los datos del equipo:', err);
      setError(err.message || 'Error al cargar los datos del equipo');
    } finally {
      setIsLoading(false);
    }
  };

  // Subir imagen a Supabase Storage a través de nuestra API
  const uploadImageToSupabase = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir la imagen');
      }
      
      const imageData = await response.json();
      return imageData;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw new Error('No se pudo subir la imagen: ' + error.message);
    }
  };

  // Manejar el envío del formulario de edición
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extraer datos del formulario
      const { equipoData: newEquipoData, responsableData, cambioData, imagen } = formData;
      
      // Preparar datos actualizados del equipo
      let updatedEquipo = {
        ...newEquipoData
      };
      
      // Subir imagen nueva si existe
      if (imagen) {
        const imageData = await uploadImageToSupabase(imagen);
        updatedEquipo.img_url = imageData.img_url;
        updatedEquipo.img_path = imageData.img_path;
      }
      
      // Actualizar historial de responsables si se completó la información
      if (responsableData && responsableData.nombre_resp) {
        // Obtener el historial actual o inicializar uno nuevo
        const currentHistorial = Array.isArray(equipoData.historial_resp) 
          ? equipoData.historial_resp 
          : [];
        
        // Añadir nuevo registro al historial
        updatedEquipo.historial_resp = [
          ...currentHistorial,
          {
            id: uuidv4(),
            responsable: responsableData.nombre_resp,
            fecha: responsableData.fecha_entrega,
            cargador_entregado: responsableData.cargador_entregado,
            mouse_entregado: responsableData.mouse_entregado,
            detalle: responsableData.detalle_adicional,
            observaciones: responsableData.observacion_estado,
            correo_monitoreo: responsableData.correo_monitoreo
          }
        ];
      }
      
      // Actualizar historial de cambios si se completó la información
      if (cambioData && cambioData.nombre_cambio) {
        // Obtener el historial actual o inicializar uno nuevo
        const currentHistorial = Array.isArray(equipoData.historial_cambio) 
          ? equipoData.historial_cambio 
          : [];
        
        // Añadir nuevo registro al historial
        updatedEquipo.historial_cambio = [
          ...currentHistorial,
          {
            id: uuidv4(),
            tipo_cambio: cambioData.nombre_cambio,
            fecha: cambioData.fecha_cambio,
            descripcion: cambioData.detalle_cambio,
            usuario: cambioData.correo_monitoreo
          }
        ];
      }
      
      // Actualizar equipo en la base de datos
      const { data, error } = await supabaseClient
        .from('inventario')
        .update(updatedEquipo)
        .eq('id', equipoId)
        .select();
      
      if (error) throw error;
      
      // Éxito - cerrar modal y recargar datos
      onOpenChange(false);
      router.refresh();
      
      // Opcional: navegar a la página de detalle del equipo
      router.push(`/inventario/${equipoId}`);
      
    } catch (err) {
      console.error('Error al actualizar equipo:', err);
      setError(err.message || 'Ocurrió un error al actualizar el equipo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <WideDialogContent>
        <DialogHeader className="text-center">
          <DialogTitle className="text-[#2baae2] text-xl">Editar Equipo</DialogTitle>
        </DialogHeader>
        
        {isLoading && !equipoData ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2baae2]"></div>
          </div>
        ) : error && !equipoData ? (
          <div className="p-6 text-center">
            <div className="mb-4 text-red-500">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Error al cargar datos</h3>
            <p className="text-gray-400">{error}</p>
            <button 
              onClick={fetchEquipoData}
              className="mt-4 px-4 py-2 bg-[#2baae2] text-black rounded hover:bg-blue-600"
            >
              Reintentar
            </button>
          </div>
        ) : equipoData && (
          <EquipoForm
            initialData={equipoData}
            isLoading={isLoading}
            error={error}
            mode="edit"
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            userEmail={user?.email || ''}
          />
        )}
      </WideDialogContent>
    </Dialog>
  );
}