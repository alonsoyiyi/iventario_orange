/**
 * Utilitarios para manejar los estados de los equipos de forma consistente
 */

// Lista de estados válidos
export const ESTADOS_VALIDOS = [
  'en uso',
  'mantenimiento',
  'guardado',
  'almacén',
  'desechado'
];

/**
 * Obtiene el color correspondiente a un estado
 * @param {string} status - El estado del equipo
 * @param {string} type - El tipo de color: 'bg' para fondo o 'text' para texto
 * @returns {string} - La clase CSS correspondiente
 */
export function getStatusColor(status, type = 'bg') {
  const normalizedStatus = status?.toLowerCase().trim();
  
  const colors = {
    'en uso': {
      bg: 'bg-green-500',
      text: 'text-green-400',
    },
    'mantenimiento': {
      bg: 'bg-yellow-500',
      text: 'text-yellow-400',
    },
    'guardado': {
      bg: 'bg-blue-500',
      text: 'text-blue-400',
    },
    'almacén': {
      bg: 'bg-white',
      text: 'text-white',
    },
    'almacen': {
      bg: 'bg-white',
      text: 'text-white',
    },
    'desechado': {
      bg: 'bg-red-500',
      text: 'text-red-400',
    }
  };

  return colors[normalizedStatus]?.[type] || (type === 'bg' ? 'bg-gray-500' : 'text-gray-400');
}