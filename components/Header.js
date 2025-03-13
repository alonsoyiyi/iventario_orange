'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useContext } from 'react';
// Importamos un contexto global para manejar el estado del modal
import { GlobalContext } from '@/contexts/GlobalContext';

// Función para generar breadcrumbs basados en la ruta actual
function generateBreadcrumbs(pathname) {
  // Ignorar rutas vacías o solo con slash
  const paths = pathname.split('/').filter(path => path);
  
  if (paths.length === 0) return [];
  
  // Crear los breadcrumbs
  return paths.map((path, index) => {
    // Construir la URL hasta este punto
    const url = '/' + paths.slice(0, index + 1).join('/');
    
    // Formatear el nombre para mostrar (capitalizar primera letra)
    let name = path.charAt(0).toUpperCase() + path.slice(1);
    
    // Si es un ID (como en /inventario/123), mostrar "Detalle"
    if (index > 0 && /^[a-f0-9-]+$/.test(path)) {
      name = 'Detalle';
    }
    
    return {
      name,
      url
    };
  });
}

export default function Header() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(pathname);
  
  // Determinar si estamos en la página principal de inventario para mostrar el botón de agregar
  const isInventarioMain = pathname === '/inventario';
  
  // Obtener el estado del modal del contexto global o usar una función alternativa
  // Si no tienes un contexto global, puedes usar esta otra opción
  const handleAddEquipo = () => {
    // Opción 1: Si estás en la página de inventario, comunícate con un evento customizado
    if (isInventarioMain) {
      const event = new CustomEvent('openEquipoModal', { detail: { open: true } });
      window.dispatchEvent(event);
    } 
    // Opción 2: O navega a la página principal y luego activa el modal
    else {
      // Primero navegar a la página de inventario
      router.push('/inventario?openModal=true');
    }
  };

  return (
    <header className="bg-[#1a1a1a] border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo - Ahora más grande (50x50) y con más margen */}
          <div className="flex-shrink-0 mr-8">
            <Link href="/inventario">
              <Image 
                src="/images/logo.png"
                alt="Orange Logo"
                width={150}  
                height={80}  
                className="rounded"
                priority
              />
            </Link>
          </div>
          
          {/* Breadcrumbs - Más espacio desde el logo (mr-8 arriba) */}
          <div className="hidden md:flex items-center mr-4">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={breadcrumb.url} className="flex items-center">
                    {index > 0 && (
                      <svg className="h-4 w-4 text-gray-500 mx-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <Link 
                      href={breadcrumb.url}
                      className={`text-sm ${
                        index === breadcrumbs.length - 1
                          ? 'text-[#2baae2] font-medium'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {breadcrumb.name}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          
          {/* Título con fondo azul - Ahora centrado */}
          <div className="bg-[#2baae2] rounded py-2 px-4 mr-auto flex items-center justify-center flex-1 max-w-xs mx-auto">
            <h1 className="text-black font-medium text-sm text-center w-full">Inventario de equipos Orange</h1>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center space-x-4 ml-4">
            {/* Botón Agregar Equipo (solo en página principal de inventario) */}
            {isInventarioMain && (
              <button
                onClick={handleAddEquipo}
                className="bg-[#2baae2] hover:bg-black text-black hover:text-white px-4 py-2 rounded flex items-center transition-colors"
              >
                <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Agregar Equipo</span>
              </button>
            )}
            
            {/* Botón Cerrar Sesión */}
            {user && (
              <Link 
                href="/api/auth/logout"
                className="bg-[#2baae2] hover:bg-black text-black hover:text-white px-4 py-2 rounded flex items-center transition-colors"
                replace={true}
              >
                <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 7a1 1 0 100-2 1 1 0 000 2zm-2 3a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Breadcrumbs en pantallas pequeñas */}
      <div className="md:hidden border-t border-gray-700">
        <div className="mx-auto px-4 py-2">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap pb-1">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.url} className="flex items-center">
                  {index > 0 && (
                    <svg className="h-4 w-4 text-gray-500 mx-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <Link 
                    href={breadcrumb.url}
                    className={`text-sm flex-shrink-0 ${
                      index === breadcrumbs.length - 1
                        ? 'text-[#2baae2] font-medium'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {breadcrumb.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </header>
  );
}