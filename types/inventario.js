/**
 * @typedef {Object} HistorialResp
 * @property {string} nombre_resp - Nombre del responsable
 * @property {string} fecha_entrega - Fecha de entrega
 * @property {string} cargador_entregado - Estado del cargador entregado
 * @property {string} mouse_entregado - Estado del mouse entregado
 * @property {string} detalle_adicional - Detalles adicionales
 * @property {string} observacion_estado - Observaciones del estado
 * @property {string} correo_monitoreo - Correo de monitoreo
 */

/**
 * @typedef {Object} HistorialCambio
 * @property {string} nombre_cambio - Nombre del cambio
 * @property {string} fecha_cambio - Fecha del cambio
 * @property {string} detalle_cambio - Detalle del cambio
 * @property {string} correo_monitoreo - Correo de monitoreo
 */

/**
 * @typedef {Object} Inventario
 * @property {string} id - ID único del inventario
 * @property {string} marca - Marca del dispositivo
 * @property {string} img_url - URL de la imagen en Supabase Storage
 * @property {string} img_path - Ruta de la imagen en Supabase Storage
 * @property {string} modelo - Modelo del dispositivo
 * @property {string} serial_codigo_mac - Número de serie o MAC
 * @property {string} procesador - Tipo de procesador
 * @property {string} almacenamiento - Capacidad de almacenamiento
 * @property {string} ram - Cantidad de memoria RAM
 * @property {string} nic_red - Información de red
 * @property {string} pulgadas - Tamaño de pantalla
 * @property {string} cantidad - Cantidad disponible
 * @property {string} cargador_probable - Estado del cargador
 * @property {string} estado - Estado general del dispositivo
 * @property {string} categoria - Categoría del dispositivo
 * @property {string} correo_monitoreo - Correo de contacto
 * @property {Array<HistorialResp>} historial_resp - Historial de responsables
 * @property {Array<HistorialCambio>} historial_cambio - Historial de cambios
 * @property {string} created_at - Fecha de creación
 */

// Este archivo es principalmente para documentación y puede ser usado 
// para TypeScript si decides migrar en el futuro