'use client';

import { createContext, useState, useContext } from 'react';

// Crear el contexto
export const GlobalContext = createContext();

// Proveedor del contexto
export function GlobalProvider({ children }) {
  const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);

  // Valores que serán compartidos
  const value = {
    isEquipoModalOpen,
    setIsEquipoModalOpen,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext debe ser usado dentro de un GlobalProvider');
  }
  return context;
}