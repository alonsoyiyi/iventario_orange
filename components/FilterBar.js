import { useState, useEffect } from 'react';
import Link from 'next/link';
import supabaseClient from '@/utils/supabaseClient'; // Cambiamos para usar el cliente correcto

// Añadir un prop para ocultar el botón de agregar equipo
export default function FilterBar({ onFilterChange, onSearch, hideAddButton = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categorías predeterminadas que siempre deben mostrarse
  const defaultCategories = [
    'Laptops Windows',
    'Laptops Apple',
    'Cargadores',
    'Monitores',
    'PCS',
    'Teléfonos',
    'Impresoras',
    'Telecomunicaciones',
    'Televisores',
    'Equipos de video',
    'Equipos de Audio',
    'Accesorios Audiovisuales'
  ];

  // Cargar categorías únicas desde Supabase y combinarlas con las predeterminadas
  useEffect(() => {
    async function fetchCategories() {
      try {
        // Obtenemos todos los equipos para extraer categorías únicas
        const { data, error } = await supabaseClient
          .from('inventario')
          .select('categoria')
          .not('categoria', 'is', null);
        
        if (error) throw error;
        
        // Extraer categorías únicas de la base de datos
        let dbCategories = [];
        if (data && data.length > 0) {
          dbCategories = [...new Set(data.map(item => item.categoria))].filter(Boolean);
        }
        
        // Combinar las categorías predeterminadas con las de la base de datos
        const combinedCategories = [...defaultCategories];
        
        // Agregar cualquier categoría nueva de la base de datos que no esté ya en las predeterminadas
        dbCategories.forEach(category => {
          if (!combinedCategories.includes(category)) {
            combinedCategories.push(category);
          }
        });
        
        // Ordenar alfabéticamente
        combinedCategories.sort();
        
        setCategories(combinedCategories);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        // Si hay un error, al menos mostramos las categorías predeterminadas
        setCategories([...defaultCategories].sort());
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategories();
  }, []);

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch && onSearch(value);
  };

  // Manejar selección de filtro
  const handleFilterClick = (category) => {
    const newFilter = activeFilter === category ? '' : category;
    setActiveFilter(newFilter);
    onFilterChange && onFilterChange(newFilter);
  };

  return (
    <div className="w-64 bg-[#242424] text-white min-h-screen p-4 flex flex-col">
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium mb-2">
          Buscar equipos
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            className="w-full bg-gray-700 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2baae2]"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Título de filtros */}
      <h3 className="text-sm font-medium uppercase tracking-wider mb-3">
        Categorías
      </h3>

      {/* Lista de filtros */}
      <div className="mb-6 flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-4 text-center text-gray-400 text-sm">Cargando categorías...</div>
        ) : (
          <ul className="space-y-1">
            {/* Opción "Todas" para restablecer el filtro */}
            <li>
              <button
                onClick={() => handleFilterClick('')}
                className={`w-full text-left py-2 px-3 text-sm rounded-md transition-colors ${
                  activeFilter === ''
                    ? 'bg-[#2baae2] text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                Todas
              </button>
            </li>
            
            {/* Lista de categorías */}
            {categories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => handleFilterClick(category)}
                  className={`w-full text-left py-2 px-3 text-sm rounded-md transition-colors ${
                    activeFilter === category
                      ? 'bg-[#2baae2] text-white'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botón para agregar equipo - solo se muestra si hideAddButton es false */}
      {!hideAddButton && (
        <div className="pt-4 border-t border-gray-700">
          <Link
            href="/inventario/nuevo"
            className="w-full block bg-[#2baae2] hover:bg-[#239dcf] text-black font-medium py-2 px-4 rounded-md text-center text-sm transition-colors"
          >
            + Agregar Equipo
          </Link>
        </div>
      )}
    </div>
  );
}