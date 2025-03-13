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

export default function EquipoFormModal({ open, onOpenChange }) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Manejar el envío del formulario
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extraer datos del formulario
      const { equipoData, responsableData, cambioData, imagen } = formData;
      
      // Preparar datos del equipo
      let nuevoEquipo = {
        ...equipoData
      };
      
      // Subir imagen si existe
      if (imagen) {
        const imageData = await uploadImageToSupabase(imagen);
        nuevoEquipo.img_url = imageData.img_url;
        nuevoEquipo.img_path = imageData.img_path;
      }
      
      // Preparar historial de responsables si se completó la información
      if (responsableData && responsableData.nombre_resp) {
        nuevoEquipo.historial_resp = [
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
      } else {
        nuevoEquipo.historial_resp = [];
      }
      
      // Preparar historial de cambios si se completó la información
      if (cambioData && cambioData.nombre_cambio) {
        nuevoEquipo.historial_cambio = [
          {
            id: uuidv4(),
            tipo_cambio: cambioData.nombre_cambio,
            fecha: cambioData.fecha_cambio,
            descripcion: cambioData.detalle_cambio,
            usuario: cambioData.correo_monitoreo
          }
        ];
      } else {
        nuevoEquipo.historial_cambio = [];
      }
      
      // Crear nuevo equipo en la base de datos
      const { data, error } = await supabaseClient
        .from('inventario')
        .insert([nuevoEquipo])
        .select();
      
      if (error) throw error;
      
      // Éxito - cerrar modal y recargar datos
      onOpenChange(false);
      router.refresh();
      
      // Opcional: navegar a la página de detalle del nuevo equipo
      if (data && data[0]?.id) {
        router.push(`/inventario/${data[0].id}`);
      }
      
    } catch (err) {
      console.error('Error al crear equipo:', err);
      setError(err.message || 'Ocurrió un error al crear el equipo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <WideDialogContent>
        <DialogHeader className="text-center">
          <DialogTitle className="text-[#2baae2] text-xl">Agregar Nuevo Equipo</DialogTitle>
        </DialogHeader>
        
        <EquipoForm
          initialData={{}}
          isLoading={isLoading}
          error={error}
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          userEmail={user?.email || ''}
        />
      </WideDialogContent>
    </Dialog>
  );
}