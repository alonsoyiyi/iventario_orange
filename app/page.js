'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  // Redirigir usuarios autenticados al inventario
  useEffect(() => {
    if (user) {
      router.push('/inventario');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-[#1a1a1a] py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image 
            src="/logo.png" 
            alt="Orange Inventario Logo"
            width={40}
            height={40}
            className="rounded-md"
            priority
          />
          <h1 className="text-xl font-bold text-white">Orange Inventario</h1>
        </div>

        {!isLoading && !user && (
          <Link 
            href="/api/auth/login"
            className="bg-[#2baae2] hover:bg-[#239dcf] text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Iniciar Sesión
          </Link>
        )}

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Hola, {user.name || user.email}
            </span>
            <Link 
              href="/api/auth/logout"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Cerrar Sesión
            </Link>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Sistema de Inventario Orange
          </h2>
          
          <p className="text-xl text-gray-300 mb-10">
            Gestiona de manera eficiente todo el equipamiento de Orange,
            desde laptops y teléfonos hasta servidores y accesorios.
          </p>

          {isLoading ? (
            <div className="inline-block">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2baae2]"></div>
            </div>
          ) : user ? (
            <Link 
              href="/inventario"
              className="bg-[#2baae2] hover:bg-[#239dcf] text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors inline-block"
            >
              Ir al Inventario
            </Link>
          ) : (
            <Link 
              href="/api/auth/login"
              className="bg-[#2baae2] hover:bg-[#239dcf] text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors inline-block"
            >
              Ingresar al Sistema
            </Link>
          )}
        </div>
      </main>

      <footer className="bg-[#1a1a1a] py-4 px-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Orange Inventario - Todos los derechos reservados
      </footer>
    </div>
  );
}