'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import supabaseClient from '@/utils/supabaseClient';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EquipoEditFormModal from '@/components/EquipoEditFormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ResponsablesModal from '@/components/ResponsablesModal';
import CambiosModal from '@/components/CambiosModal';

export default function DetalleEquipo() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para los modales
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResponsablesModalOpen, setIsResponsablesModalOpen] = useState(false);
  const [isCambiosModalOpen, setIsCambiosModalOpen] = useState(false);

  useEffect(() => {
    async function fetchEquipo() {
      try {
        setLoading(true);
        console.log('Iniciando fetch de equipo con ID:', id);
        
        if (!supabaseClient) {
          throw new Error('No se pudo conectar con la base de datos');
        }
        
        const { data, error } = await supabaseClient
          .from('inventario')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error en consulta:', error);
          throw error;
        }
        
        console.log('Datos obtenidos:', data);
        setEquipo(data);
      } catch (err) {
        console.error('Error al cargar el equipo:', err);
        setError('No se pudo cargar el detalle del equipo: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchEquipo();
    }
  }, [id]);

  // Función para eliminar equipo
  const handleDeleteEquipo = async () => {
    try {
      setIsDeleting(true);
      
      // Primero intentar eliminar la imagen si existe
      if (equipo.img_path) {
        await supabaseClient
          .storage
          .from('inventario-images')
          .remove([equipo.img_path]);
      }
      
      // Luego eliminar el registro
      const { error } = await supabaseClient
        .from('inventario')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Redireccionar al inventario
      router.push('/inventario');
      router.refresh();
      
    } catch (err) {
      console.error('Error al eliminar equipo:', err);
      alert('No se pudo eliminar el equipo: ' + err.message);
    } finally {
      setIsDeleting(false);
      setIsDeleteAlertOpen(false);
    }
  };

  // Función para mostrar valor o placeholder si está vacío
  const mostrarValor = (valor, placeholder = 'No especificado') => {
    return valor || placeholder;
  };

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'en uso':
        return 'text-green-400';
      case 'mantenimiento':
        return 'text-yellow-400';
      case 'guardado':
        return 'text-blue-400';
      case 'almacén':
      case 'almacen':
        return 'text-white';
      case 'desechado':
        return 'text-red-400';
      default:
        console.log('Estado no reconocido:', status);
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-1">
      <div className="flex-1 p-6 bg-[#121212]">
        {/* Botón de Volver */}
        <div className="mb-6">
          <Link 
            href="/inventario" 
            className="text-[#2baae2] hover:text-white flex items-center"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Inventario
          </Link>
        </div>
        
        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2baae2]"></div>
          </div>
        )}
        
        {/* Mensaje de error */}
        {error && !loading && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 p-4 rounded-md text-white mb-6">
            {error}
          </div>
        )}
        
        {/* Detalle del equipo */}
        {!loading && !error && equipo && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="md:flex">
              {/* Sección de imagen - Centrada y proporcionada */}
              <div className="md:w-1/3 h-64 md:h-auto relative bg-gray-700 flex items-center justify-center">
                {/* Botones de acción en la imagen */}
                <div className="absolute top-2 left-2 flex flex-row space-x-2 z-10">
                  {/* Botón Lupa */}
                  <button 
    className="bg-gray-800 hover:bg-[#2baae2] text-white hover:text-black p-2 rounded-full transition-colors"
    onClick={() => setIsImageModalOpen(true)}
    disabled={!equipo.img_url}
    title="Ampliar imagen"
  >
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  </button>
                  
                  {/* Botón Editar */}
                  <button 
    className="bg-gray-800 hover:bg-[#2baae2] text-white hover:text-black p-2 rounded-full transition-colors"
    onClick={() => setIsEditModalOpen(true)}
    title="Editar equipo"
  >
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  </button>
                  
                  {/* Botón Eliminar */}
                  <button 
    className="bg-gray-800 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
    onClick={() => setIsDeleteAlertOpen(true)}
    title="Eliminar equipo"
  >
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </button>
</div>

                {equipo.img_url ? (
                  <div className="relative w-4/5 h-4/5">
                    <Image
                      src={equipo.img_url}
                      alt={`${equipo.marca} ${equipo.modelo}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 80vw, 33vw"
                    />
                  </div>
                ) : (
                  <svg 
                    className="h-24 w-24 text-gray-500" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                
                {/* Etiqueta de categoría */}
                <div className="absolute top-2 right-2 bg-[#2baae2] text-black text-xs font-bold px-2 py-1 rounded">
                  {mostrarValor(equipo.categoria, 'Sin categoría')}
                </div>
              </div>
              
              {/* Sección de información */}
              <div className="md:w-2/3 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {`${mostrarValor(equipo.marca)} ${mostrarValor(equipo.modelo)}`}
                    </h1>
                  </div>
                  
                  {/* Estado */}
                  <div className="bg-gray-900 rounded-lg p-3 inline-block">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-white mr-2">Estado:</span>
                      <span className={`font-medium ${getStatusColor(equipo.estado)}`}>
                        {mostrarValor(equipo.estado)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Especificaciones técnicas */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4">
                    Especificaciones
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Columna 1 */}
                    <div>
                      {/* Serial/MAC movido aquí */}
                      <div className="bg-gray-700 rounded-lg p-3 mb-3">
                        <span className="text-gray-400 text-xs">Serial/MAC</span>
                        <p className="text-white">{mostrarValor(equipo.serial_codigo_mac)}</p>
                      </div>
                      
                      {equipo.procesador && (
                        <div className="bg-gray-700 rounded-lg p-3 mb-3">
                          <span className="text-gray-400 text-xs">Procesador</span>
                          <p className="text-white">{equipo.procesador}</p>
                        </div>
                      )}
                      
                      {equipo.almacenamiento && (
                        <div className="bg-gray-700 rounded-lg p-3 mb-3">
                          <span className="text-gray-400 text-xs">Almacenamiento</span>
                          <p className="text-white">{equipo.almacenamiento}</p>
                        </div>
                      )}
                      
                      {equipo.ram && (
                        <div className="bg-gray-700 rounded-lg p-3">
                          <span className="text-gray-400 text-xs">Memoria RAM</span>
                          <p className="text-white">{equipo.ram}</p>
                        </div>
                      )}
                    </div>

                    {/* Columna 2 */}
                    <div>
                      {equipo.pulgadas && (
                        <div className="bg-gray-700 rounded-lg p-3 mb-3">
                          <span className="text-gray-400 text-xs">Tamaño de pantalla</span>
                          <p className="text-white">{equipo.pulgadas}</p>
                        </div>
                      )}
                      
                      {equipo.nic_red && (
                        <div className="bg-gray-700 rounded-lg p-3 mb-3">
                          <span className="text-gray-400 text-xs">NIC/Red</span>
                          <p className="text-white">{equipo.nic_red}</p>
                        </div>
                      )}
                      
                      {equipo.cargador_probable && (
                        <div className="bg-gray-700 rounded-lg p-3 mb-3">
                          <span className="text-gray-400 text-xs">Cargador</span>
                          <p className="text-white">{equipo.cargador_probable}</p>
                        </div>
                      )}
                      
                      {equipo.correo_monitoreo && (
                        <div className="bg-gray-700 rounded-lg p-3">
                          <span className="text-gray-400 text-xs">Contacto de monitoreo</span>
                          <p className="text-[#2baae2]">{equipo.correo_monitoreo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Botones de Responsables y Cambios - Centrados y mismo ancho */}
                <div className="mt-8 flex justify-center space-x-4">
                  <button 
                    className="bg-[#2baae2] hover:bg-black text-black hover:text-white px-4 py-2 rounded flex items-center justify-center transition-colors w-40"
                    onClick={() => setIsResponsablesModalOpen(true)}
                  >
                    <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <span className="text-sm font-medium">Responsables</span>
                  </button>
                  
                  <button 
                    className="bg-[#2baae2] hover:bg-black text-black hover:text-white px-4 py-2 rounded flex items-center justify-center transition-colors w-40"
                    onClick={() => setIsCambiosModalOpen(true)}
                  >
                    <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                    </svg>
                    <span className="text-sm font-medium">Cambios</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para ver imagen ampliada */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl bg-gray-900 border border-gray-800">
          <div className="flex justify-center p-4">
            <div className="relative w-full h-[60vh]">
              {equipo?.img_url && (
                <Image
                  src={equipo.img_url}
                  alt={`${equipo?.marca || ''} ${equipo?.modelo || ''}`}
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para editar equipo */}
      <EquipoEditFormModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        equipoId={id}
      />

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-gray-900 text-white border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#2baae2]">¿Eliminar este equipo?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Esta acción no se puede deshacer. Eliminará permanentemente este equipo
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEquipo}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar equipo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResponsablesModal 
        open={isResponsablesModalOpen} 
        onOpenChange={setIsResponsablesModalOpen}
        equipo={equipo}
      />

      <CambiosModal 
        open={isCambiosModalOpen} 
        onOpenChange={setIsCambiosModalOpen}
        equipo={equipo}
      />
    </div>
  );
}