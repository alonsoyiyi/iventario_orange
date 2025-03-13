'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lista fija de categorías
const CATEGORIAS_FIJAS = [
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

// Clase común para todos los inputs del formulario
const inputClassName = "w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none";
const labelClassName = "block text-sm font-medium text-gray-300 mb-1";
const readOnlyClassName = "w-full p-2 rounded bg-[#242424] text-gray-400 border border-gray-700 focus:border-[#2baae2] focus:outline-none";
const textareaClassName = "w-full p-2 rounded bg-[#242424] text-white border border-gray-700 focus:border-[#2baae2] focus:outline-none";

export default function EquipoForm({ 
  initialData = {}, 
  isLoading = false,
  error = null,
  mode = 'create',
  onSubmit,
  onCancel,
  userEmail = ''
}) {
  // Estados para datos del formulario
  const [equipoData, setEquipoData] = useState({
    marca: initialData.marca || '',
    modelo: initialData.modelo || '',
    serial_codigo_mac: initialData.serial_codigo_mac || '',
    procesador: initialData.procesador || '',
    almacenamiento: initialData.almacenamiento || '',
    ram: initialData.ram || '',
    nic_red: initialData.nic_red || '',
    pulgadas: initialData.pulgadas || '',
    cantidad: initialData.cantidad || '1',
    cargador_probable: initialData.cargador_probable || '',
    estado: initialData.estado || 'en uso',
    categoria: initialData.categoria || '',
    correo_monitoreo: initialData.correo_monitoreo || userEmail
  });

  const [responsableData, setResponsableData] = useState({
    nombre_resp: '',
    fecha_entrega: new Date().toISOString().slice(0, 10),
    cargador_entregado: '',
    mouse_entregado: '',
    detalle_adicional: '',
    observacion_estado: '',
    correo_monitoreo: userEmail
  });

  const [cambioData, setCambioData] = useState({
    nombre_cambio: '',
    fecha_cambio: new Date().toISOString().slice(0, 10),
    detalle_cambio: '',
    correo_monitoreo: userEmail
  });

  // Estado para imagen
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData.img_url || null);

  // Actualizar email del usuario cuando cambia
  useEffect(() => {
    if (userEmail) {
      setEquipoData(prev => ({ ...prev, correo_monitoreo: userEmail }));
      setResponsableData(prev => ({ ...prev, correo_monitoreo: userEmail }));
      setCambioData(prev => ({ ...prev, correo_monitoreo: userEmail }));
    }
  }, [userEmail]);

  // Manejar la selección de imagen
  const handleImagenChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.includes('image/')) {
      // Manejar error de tipo de archivo
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      // Manejar error de tamaño
      return;
    }
    
    setImagen(file);
    
    // Crear URL de vista previa
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  // Manejadores de cambio para cada sección del formulario
  const handleEquipoChange = (e) => {
    const { name, value } = e.target;
    setEquipoData(prev => ({ ...prev, [name]: value }));
  };

  const handleResponsableChange = (e) => {
    const { name, value } = e.target;
    setResponsableData(prev => ({ ...prev, [name]: value }));
  };

  const handleCambioChange = (e) => {
    const { name, value } = e.target;
    setCambioData(prev => ({ ...prev, [name]: value }));
  };

  // Enviar el formulario a la función handler proporcionada
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar los datos para envío
    const formData = {
      equipoData,
      responsableData: responsableData.nombre_resp ? responsableData : null,
      cambioData: cambioData.nombre_cambio ? cambioData : null,
      imagen
    };
    
    // Llamar a la función de envío proporcionada por el componente padre
    onSubmit(formData);
  };

  // Textos según el modo
  const getTitleText = () => mode === 'create' ? 'Agregar Nuevo Equipo' : 'Editar Equipo';
  const getSubmitText = () => {
    if (isLoading) return 'Guardando...';
    return mode === 'create' ? 'Guardar Equipo' : 'Actualizar Equipo';
  };

  return (
    <>
      <Tabs defaultValue="equipo">
        <TabsList className="grid grid-cols-3 mb-4 mx-auto max-w-md">
          <TabsTrigger value="equipo">Datos del Equipo</TabsTrigger>
          <TabsTrigger value="responsable">Responsable</TabsTrigger>
          <TabsTrigger value="cambio">Cambio</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TabsContent value="equipo" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className={labelClassName}>
                  Marca*
                </label>
                <input
                  type="text"
                  name="marca"
                  value={equipoData.marca}
                  onChange={handleEquipoChange}
                  required
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Modelo*
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={equipoData.modelo}
                  onChange={handleEquipoChange}
                  required
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Serial / Código MAC*
                </label>
                <input
                  type="text"
                  name="serial_codigo_mac"
                  value={equipoData.serial_codigo_mac}
                  onChange={handleEquipoChange}
                  required
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Categoría*
                </label>
                <select
                  name="categoria"
                  value={equipoData.categoria}
                  onChange={handleEquipoChange}
                  required
                  className={inputClassName}
                >
                  <option value="">Seleccionar</option>
                  {CATEGORIAS_FIJAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={labelClassName}>
                  Procesador
                </label>
                <input
                  type="text"
                  name="procesador"
                  value={equipoData.procesador}
                  onChange={handleEquipoChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Almacenamiento
                </label>
                <input
                  type="text"
                  name="almacenamiento"
                  value={equipoData.almacenamiento}
                  onChange={handleEquipoChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  RAM
                </label>
                <input
                  type="text"
                  name="ram"
                  value={equipoData.ram}
                  onChange={handleEquipoChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  NIC / Red
                </label>
                <input
                  type="text"
                  name="nic_red"
                  value={equipoData.nic_red}
                  onChange={handleEquipoChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Pulgadas
                </label>
                <input
                  type="text"
                  name="pulgadas"
                  value={equipoData.pulgadas}
                  onChange={handleEquipoChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Correo
                </label>
                <input
                  type="email"
                  name="correo_monitoreo"
                  value={equipoData.correo_monitoreo}
                  readOnly
                  className={readOnlyClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Cantidad*
                </label>
                <input
                  type="number"
                  name="cantidad"
                  value={equipoData.cantidad}
                  onChange={handleEquipoChange}
                  required
                  min="1"
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Cargador Probable
                </label>
                <input
                  type="text"
                  name="cargador_probable"
                  value={equipoData.cargador_probable}
                  onChange={handleEquipoChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Estado*
                </label>
                <select
                  name="estado"
                  value={equipoData.estado}
                  onChange={handleEquipoChange}
                  required
                  className={inputClassName}
                >
                  <option value="en uso">En uso</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="guardado">Guardado</option>
                  <option value="almacén">Almacén</option>
                  <option value="desechado">Desechado</option>
                </select>
              </div>
              
              <div>
                <label className={labelClassName}>
                  Imagen del Equipo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className={inputClassName + " cursor-pointer"}
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img 
                      src={previewUrl} 
                      alt="Vista previa" 
                      className="h-32 object-contain bg-gray-800 rounded" 
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="responsable" className="space-y-4">
            <div className="p-4">
              <p className="text-gray-300 text-sm">
                Esta sección es opcional. Complete los datos si desea registrar un responsable para este equipo.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className={labelClassName}>
                  Nombre del Responsable
                </label>
                <input
                  type="text"
                  name="nombre_resp"
                  value={responsableData.nombre_resp}
                  onChange={handleResponsableChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  name="fecha_entrega"
                  value={responsableData.fecha_entrega}
                  onChange={handleResponsableChange}
                  className={inputClassName}
                />
              </div>
            
              <div>
                <label className={labelClassName}>
                  Cargador entregado
                </label>
                <input
                  type="text"
                  name="cargador_entregado"
                  value={responsableData.cargador_entregado}
                  onChange={handleResponsableChange}
                  placeholder="Ej: Dell 65W, Adaptador USB-C, etc."
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Mouse entregado
                </label>
                <input
                  type="text"
                  name="mouse_entregado"
                  value={responsableData.mouse_entregado}
                  onChange={handleResponsableChange}
                  placeholder="Ej: Logitech M170, Mouse inalámbrico, etc."
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>
                  Detalles Adicionales
                </label>
                <textarea
                  name="detalle_adicional"
                  value={responsableData.detalle_adicional}
                  onChange={handleResponsableChange}
                  rows="3"
                  className={textareaClassName}
                  placeholder="Escriba aquí cualquier detalle adicional sobre la entrega..."
                ></textarea>
              </div>
              
              <div>
                <label className={labelClassName}>
                  Observaciones del Estado
                </label>
                <textarea
                  name="observacion_estado"
                  value={responsableData.observacion_estado}
                  onChange={handleResponsableChange}
                  rows="3"
                  className={textareaClassName}
                  placeholder="Observaciones sobre el estado del equipo al momento de la entrega..."
                ></textarea>
              </div>
            </div>

            <div>
              <label className={labelClassName}>
                Contacto de monitoreo
              </label>
              <input
                type="email"
                name="correo_monitoreo"
                value={responsableData.correo_monitoreo}
                readOnly
                className={readOnlyClassName}
              />
              <p className="text-xs text-gray-500 mt-1">
                Este campo se autocompletó con tu correo electrónico
              </p>
            </div>
          </TabsContent>

          <TabsContent value="cambio" className="space-y-4">
            <div className="p-4">
              <p className="text-gray-300 text-sm">
                Esta sección es opcional. Complete los datos si desea registrar un cambio inicial para este equipo.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className={labelClassName}>
                  Tipo de cambio
                </label>
                <input
                  type="text"
                  name="nombre_cambio"
                  value={cambioData.nombre_cambio}
                  onChange={handleCambioChange}
                  placeholder="Ej: Registro Inicial, Actualización, etc."
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>
                  Fecha del Cambio
                </label>
                <input
                  type="date"
                  name="fecha_cambio"
                  value={cambioData.fecha_cambio}
                  onChange={handleCambioChange}
                  className={inputClassName}
                />
              </div>
            
              <div className="md:col-span-2">
                <label className={labelClassName}>
                  Detalle del Cambio
                </label>
                <textarea
                  name="detalle_cambio"
                  value={cambioData.detalle_cambio}
                  onChange={handleCambioChange}
                  rows="3"
                  className={textareaClassName}
                  placeholder="Describa aquí el detalle del cambio realizado..."
                ></textarea>
              </div>

              <div>
                <label className={labelClassName}>
                  Usuario que registra
                </label>
                <input
                  type="email"
                  name="correo_monitoreo"
                  value={cambioData.correo_monitoreo}
                  readOnly
                  className={readOnlyClassName}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este campo se autocompletó con tu correo electrónico
                </p>
              </div>
            </div>
          </TabsContent>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-gray-700 bg-[#242424] text-gray-300 hover:bg-[#2baae2] hover:text-black"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-[#2baae2] hover:bg-black hover:text-[#2baae2] text-black"
            >
              {getSubmitText()}
            </Button>
          </div>
        </form>
      </Tabs>
      
      {error && (
        <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-white text-sm mt-4">
          {error}
        </div>
      )}
    </>
  );
}