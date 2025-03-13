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

export default function ResponsablesModal({ open, onOpenChange, equipo }) {
  const router = useRouter();
  const { user } = useUser();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado para el nuevo responsable
  const [newResponsable, setNewResponsable] = useState({
    nombre_resp: '',
    fecha_entrega: new Date().toISOString().slice(0, 10),
    cargador_entregado: '',
    mouse_entregado: '',
    detalle_adicional: '',
    observacion_estado: '',
    correo_monitoreo: user?.email || ''
  });

  // Obtener el historial de responsables ordenado por fecha (más reciente primero)
  const responsables = equipo?.historial_resp || [];
  const sortedResponsables = [...responsables].sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewResponsable(prev => ({ ...prev, [name]: value }));
  };

  // Guardar nuevo responsable
  const handleSaveResponsable = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!newResponsable.nombre_resp) {
        throw new Error("El nombre del responsable es obligatorio");
      }
      
      // Crear nueva entrada de responsable
      const nuevoRegistro = {
        id: uuidv4(),
        responsable: newResponsable.nombre_resp,
        fecha: newResponsable.fecha_entrega,
        cargador_entregado: newResponsable.cargador_entregado,
        mouse_entregado: newResponsable.mouse_entregado,
        detalle: newResponsable.detalle_adicional,
        observaciones: newResponsable.observacion_estado,
        correo_monitoreo: newResponsable.correo_monitoreo
      };
      
      // Obtener el historial actual
      const historialActual = equipo.historial_resp || [];
      
      // Actualizar el equipo en la base de datos
      const { error } = await supabaseClient
        .from('inventario')
        .update({
          historial_resp: [...historialActual, nuevoRegistro]
        })
        .eq('id', equipo.id);
      
      if (error) throw error;
      
      // Resetear formulario y actualizar UI
      setNewResponsable({
        nombre_resp: '',
        fecha_entrega: new Date().toISOString().slice(0, 10),
        cargador_entregado: '',
        mouse_entregado: '',
        detalle_adicional: '',
        observacion_estado: '',
        correo_monitoreo: user?.email || ''
      });
      setShowAddForm(false);
      
      // Refrescar datos
      router.refresh();
      
      // Cerrar el modal y volver a abrir para actualizar la lista
      onOpenChange(false);
      setTimeout(() => onOpenChange(true), 100);
      
    } catch (err) {
      console.error('Error al guardar responsable:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <WideDialogContent>
        <DialogHeader className="text-center">
          <DialogTitle className="text-[#2baae2] text-xl">Historial de Responsables</DialogTitle>
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
              Agregar Responsable
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

        {/* Formulario para agregar nuevo responsable */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-4">Nuevo Responsable</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre del Responsable*
                </label>
                <input
                  type="text"
                  name="nombre_resp"
                  value={newResponsable.nombre_resp}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  name="fecha_entrega"
                  value={newResponsable.fecha_entrega}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cargador entregado
                </label>
                <input
                  type="text"
                  name="cargador_entregado"
                  value={newResponsable.cargador_entregado}
                  onChange={handleInputChange}
                  placeholder="Ej: Dell 65W, Adaptador USB-C"
                  className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mouse entregado
                </label>
                <input
                  type="text"
                  name="mouse_entregado"
                  value={newResponsable.mouse_entregado}
                  onChange={handleInputChange}
                  placeholder="Ej: Logitech M170, Mouse inalámbrico"
                  className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Detalles Adicionales
                </label>
                <textarea
                  name="detalle_adicional"
                  value={newResponsable.detalle_adicional}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                  placeholder="Detalles adicionales de la entrega..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Observaciones del Estado
                </label>
                <textarea
                  name="observacion_estado"
                  value={newResponsable.observacion_estado}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none"
                  placeholder="Estado del equipo al momento de la entrega..."
                ></textarea>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-white text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveResponsable}
                disabled={isLoading}
                className="bg-[#2baae2] hover:bg-black hover:text-[#2baae2] text-black"
              >
                {isLoading ? "Guardando..." : "Guardar Responsable"}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de responsables */}
        <div className="space-y-4">
          {sortedResponsables.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              No hay registros de responsables para este equipo.
            </div>
          ) : (
            sortedResponsables.map(resp => (
              <div key={resp.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-white">{resp.responsable}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(resp.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {resp.cargador_entregado && (
                    <div className="text-sm">
                      <span className="text-gray-400">Cargador:</span> {resp.cargador_entregado}
                    </div>
                  )}
                  
                  {resp.mouse_entregado && (
                    <div className="text-sm">
                      <span className="text-gray-400">Mouse:</span> {resp.mouse_entregado}
                    </div>
                  )}
                </div>
                
                {(resp.detalle || resp.observaciones) && (
                  <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resp.detalle && (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Detalles:</h4>
                        <p className="text-sm text-white">{resp.detalle}</p>
                      </div>
                    )}
                    
                    {resp.observaciones && (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Observaciones:</h4>
                        <p className="text-sm text-white">{resp.observaciones}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {resp.correo_monitoreo && (
                  <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                    Registrado por: {resp.correo_monitoreo}
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