'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ElementCard({ element }) {
  // Añadir un estado local para forzar renderizado en cliente
  const [mounted, setMounted] = useState(false);
  
  // Si no hay imagen, usar una imagen por defecto
  const imageUrl = element?.img_url || '/images/placeholders/no-image.png';
  
  // Generar un título para mostrar (marca + modelo)
  const title = `${element?.marca || ''} ${element?.modelo || ''}`.trim() || 'Elemento sin título';
  
  // Estado del elemento
  const status = element?.estado || 'No definido';
  
  // Función para determinar el color directamente
  const getStatusColorDirect = () => {
    // Normalizar el estado para comparación
    const normalizedStatus = status?.toLowerCase().trim();
    
    // Mapear estados a colores específicos - Solo los 5 estados oficiales
    if (normalizedStatus === 'en uso') return 'bg-green-500';
    if (normalizedStatus === 'mantenimiento') return 'bg-yellow-500';
    if (normalizedStatus === 'guardado') return 'bg-blue-500';
    if (normalizedStatus === 'almacén' || normalizedStatus === 'almacen') return 'bg-white';
    if (normalizedStatus === 'desechado') return 'bg-red-500';
    
    // Por defecto
    return 'bg-gray-500';
  };
  
  // Este useEffect se ejecutará solo una vez al montar el componente en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <Link 
      href={`/inventario/${element?.id}`}
      className="block"
    >
      <div className="bg-[#242424] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        {/* Imagen del elemento */}
        <div className="relative w-full pt-[75%]">
          <img
            src={imageUrl}
            alt={title}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
        
        {/* Título del elemento */}
        <div className="p-4">
          <h3 className="text-white font-medium text-lg mb-3 line-clamp-2" title={title}>
            {title}
          </h3>
          
          {/* Contenedor de estado mejorado */}
          <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
            <div className="flex items-center">
              <span 
                className={`w-3 h-3 rounded-full ${getStatusColorDirect()} mr-2`}
                title={`Estado: ${status}`}
              ></span>
              <span className="text-white text-sm font-medium">
                {status}
              </span>
            </div>
            
            {/* Icono de flecha para indicar que es clickeable */}
            <svg 
              className="h-4 w-4 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}