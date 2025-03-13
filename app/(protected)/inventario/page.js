'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FilterBar from '@/components/FilterBar';
import supabaseClient from '@/utils/supabaseClient';
import ElementCard from '@/components/ElementCard';
import EquipoFormModal from '@/components/EquipoFormModal';
import { Button } from '@/components/ui/button';

export default function InventarioPage() {
  const { user, isLoading: userLoading } = useUser();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const searchParams = useSearchParams();

  // Verificar parámetro de URL para abrir el modal
  useEffect(() => {
    const openModal = searchParams.get('openModal');
    if (openModal === 'true') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  // Escuchar el evento personalizado del Header
  useEffect(() => {
    const handleOpenModal = (event) => {
      setIsFormOpen(true);
    };
    
    // Agregamos un event listener para el evento personalizado
    window.addEventListener('openEquipoModal', handleOpenModal);
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('openEquipoModal', handleOpenModal);
    };
  }, []);

  // Función para obtener los equipos de Supabase
  useEffect(() => {
    async function fetchEquipos() {
      try {
        setLoading(true);
        
        // Verificar que el cliente exista
        if (!supabaseClient) {
          throw new Error('No se pudo conectar con la base de datos');
        }
        
        // Consulta básica sin filtros iniciales
        const { data, error } = await supabaseClient
          .from('inventario')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        console.log("Datos cargados:", data);
        setEquipos(data || []);
        setFilteredEquipos(data || []);
      } catch (err) {
        console.error('Error al cargar inventario:', err);
        setError('No se pudieron cargar los equipos: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEquipos();
  }, []);

  // Filtrar equipos cuando cambian los filtros
  useEffect(() => {
    if (equipos.length > 0) {
      let filtered = [...equipos];
      
      // Filtro por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(equipo => 
          equipo.marca?.toLowerCase().includes(term) || 
          equipo.modelo?.toLowerCase().includes(term) ||
          equipo.serial_codigo_mac?.toLowerCase().includes(term)
        );
      }
      
      // Filtro por categoría
      if (categoryFilter) {
        filtered = filtered.filter(equipo => 
          equipo.categoria === categoryFilter
        );
      }
      
      setFilteredEquipos(filtered);
    }
  }, [searchTerm, categoryFilter, equipos]);

  // Manejar cambios en el filtro de categoría
  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
  };
  
  // Manejar cambios en la búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#121212]">
      <div className="p-6">
       
        
        {/* Contenedor que reorganiza el FilterBar y el contenido principal */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Barra lateral de filtros */}
          <div className="md:w-64 w-full">
            <FilterBar 
              onFilterChange={handleCategoryFilter} 
              onSearch={handleSearch}
              hideAddButton={true} 
            />
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1">
            {/* Mostrar mensaje de carga */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2baae2]"></div>
              </div>
            )}
            
            {/* Mostrar mensaje de error */}
            {error && !loading && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 p-4 rounded-md text-white mb-6">
                {error}
              </div>
            )}
            
            {/* Mostrar mensaje si no hay equipos */}
            {!loading && !error && filteredEquipos.length === 0 && (
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <p className="text-gray-400 mb-4">No se encontraron equipos</p>
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-[#2baae2] hover:bg-[#239dcf] text-black font-medium py-2 px-4 rounded transition-colors"
                >
                  Agregar Primer Equipo
                </Button>
              </div>
            )}
            
            {/* Mostrar equipos */}
            {!loading && !error && filteredEquipos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipos.map((equipo) => (
                  <div key={equipo.id} className="mb-4">
                    <ElementCard element={equipo} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de formulario */}
      <EquipoFormModal 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
      />
    </div>
  );
}