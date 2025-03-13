'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import supabaseClient from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Componente para DialogContent más ancho
const WideDialogContent = ({ className, ...props }) => (
  <DialogContent
    className={cn(
      "sm:max-w-[90%] xl:max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto bg-[#1a1a1a] text-white border border-gray-800",
      className
    )}
    {...props}
  />
);

export default function CambiosModal({ open, onOpenChange, equipo }) {
  const router = useRouter();
  const { user } = useUser();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado para el nuevo cambio
  const [newCambio, setNewCambio] = useState({
    nombre_cambio: '',
    fecha_cambio: new Date().toISOString().slice(0, 10),
    detalle_cambio: '',
    correo_monitoreo: user?.email || ''
  });

  // Obtener el historial de cambios ordenado por fecha (más reciente primero)
  const cambios = equipo?.historial_cambio || [];
  const sortedCambios = [...cambios].sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCambio(prev => ({ ...prev, [name]: value }));
  };

  // Guardar nuevo cambio
  const handleSaveCambio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!newCambio.nombre_cambio) {
        throw new Error("El tipo de cambio es obligatorio");
      }
      
      // Crear nueva entrada de cambio
      const nuevoRegistro = {
        id: uuidv4(),
        tipo_cambio: newCambio.nombre_cambio,
        fecha: newCambio.fecha_cambio,
        descripcion: newCambio.detalle_cambio,
        usuario: newCambio.correo_monitoreo
      };
      
      // Obtener el historial actual
      const historialActual = equipo.historial_cambio || [];
      
      // Actualizar el equipo en la base de datos
      const { error } = await supabaseClient
        .from('inventario')
        .update({
          historial_cambio: [...historialActual, nuevoRegistro]
        })
        .eq('id', equipo.id);
      
      if (error) throw error;
      
      // Resetear formulario y actualizar UI
      setNewCambio({
        nombre_cambio: '',
        fecha_cambio: new Date().toISOString().slice(0, 10),
        detalle_cambio: '',
        correo_monitoreo: user?.email || ''
      });
      setShowAddForm(false);
      
      // Refrescar datos
      router.refresh();
      
      // Cerrar el modal y volver a abrir para actualizar la lista
      onOpenChange(false);
      setTimeout(() => onOpenChange(true), 100);
      
    } catch (err) {
      console.error('Error al guardar cambio:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <WideDialogContent>
        <DialogHeader className="text-center">
          <DialogTitle className="text-[#2baae2] text-xl">Historial de Cambios</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          {!showAddForm ? (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#2baae2] hover:bg-black hover:text-[#2baae2] text-black"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Cambio
            </Button>
          ) : (
            <Button 
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cancelar
            </Button>
          )}
        </div>

        {/* Formulario para agregar nuevo cambio */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-4">Nuevo Cambio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Cambio*
                </label>
                <input
                  type="text"
                  name="nombre_cambio"
                  value={newCambio.nombre_cambio}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                  placeholder="Ej: Actualización, Reparación, Mantenimiento..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha del Cambio
                </label>
                <input
                  type="date"
                  name="fecha_cambio"
                  value={newCambio.fecha_cambio}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Descripción del Cambio
              </label>
              <textarea
                name="detalle_cambio"
                value={newCambio.detalle_cambio}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                placeholder="Describa en detalle el cambio realizado..."
              ></textarea>
            </div>

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-white text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveCambio}
                disabled={isLoading}
                className="bg-[#2baae2] hover:bg-black hover:text-[#2baae2] text-black"
              >
                {isLoading ? "Guardando..." : "Guardar Cambio"}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de cambios */}
        <div className="space-y-4">
          {sortedCambios.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              No hay registros de cambios para este equipo.
            </div>
          ) : (
            sortedCambios.map(cambio => (
              <div key={cambio.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-white">{cambio.tipo_cambio}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(cambio.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {cambio.descripcion && (
                  <div className="mt-3 py-3 border-t border-gray-700">
                    <h4 className="text-sm text-gray-400 mb-1">Descripción:</h4>
                    <p className="text-sm text-white whitespace-pre-line">{cambio.descripcion}</p>
                  </div>
                )}
                
                {cambio.usuario && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500">
                    Registrado por: {cambio.usuario}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </WideDialogContent>
    </Dialog>
  );
}