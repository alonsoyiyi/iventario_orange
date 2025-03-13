'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';

export default function ProtectedLayout({ children }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  // Redirigir a la página de login si no hay usuario
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirigir a la página de login
      router.push('/api/auth/login');
    }
  }, [user, isLoading, router, pathname]);

  // Mostrar carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2baae2] mb-4"></div>
          <p className="text-white">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario y ya no está cargando, no rendericemos nada
  // el useEffect se encargará de la redirección
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2baae2] mb-4"></div>
          <p className="text-white">Redireccionando al login...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario, mostrar el layout con el contenido
  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}