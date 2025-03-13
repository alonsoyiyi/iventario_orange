'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function RouteGuard({ children }) {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si no está cargando y no hay usuario y no estamos en la página principal
    if (!isLoading && !user && pathname !== '/') {
      // Redirigir al inicio
      router.push('/');
    }
  }, [isLoading, user, router, pathname]);

  // Mientras carga, mostrar un spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#2baae2]"></div>
      </div>
    );
  }

  // Si hay error de autenticación
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center max-w-lg">
          <h2 className="text-xl text-red-500 font-medium mb-2">Error de autenticación</h2>
          <p className="text-gray-300">{error.message}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-[#2baae2] hover:bg-[#239dcf] text-white font-medium py-2 px-4 rounded"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Si no estamos en la página de inicio y no hay usuario, no mostrar nada
  if (pathname !== '/' && !user) {
    return null;
  }

  // En cualquier otro caso, mostrar el contenido
  return children;
}