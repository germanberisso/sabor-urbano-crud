// Importa módulos para manejo de archivos y rutas
const fs = require('fs').promises;
const path = require('path');

// Clase para gestionar operaciones CRUD de tareas usando JSON
class Tarea {
    // Inicializa la ruta al archivo tareas.json
    constructor() {
        this.filePath = path.join(__dirname, '../data/tareas.json');
    }

    // Lee todas las tareas desde el archivo JSON
    async getAll() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            const json = JSON.parse(data);
            return json.tareas || [];
        } catch (error) {
            console.error('Error al leer tareas:', error);
            return [];
        }
    }

    // Obtiene una tarea por su ID
    async getById(id) {
        try {
            const tareas = await this.getAll();
            return tareas.find(tarea => tarea.id === parseInt(id));
        } catch (error) {
            console.error('Error al obtener tarea por ID:', error);
            return null;
        }
    }

    // Filtra tareas por estado (pendiente, en_proceso, finalizada)
    async getByEstado(estado) {
        try {
            const tareas = await this.getAll();
            return tareas.filter(tarea => tarea.estado === estado);
        } catch (error) {
            console.error('Error al filtrar por estado:', error);
            return [];
        }
    }

    // Filtra tareas por área (gestion_pedidos, control_inventario)
    async getByArea(area) {
        try {
            const tareas = await this.getAll();
            return tareas.filter(tarea => tarea.area === area);
        } catch (error) {
            console.error('Error al filtrar por área:', error);
            return [];
        }
    }

    // Filtra tareas por empleado asignado
    async getByEmpleado(empleadoId) {
        try {
            const tareas = await this.getAll();
            return tareas.filter(tarea => tarea.empleadoAsignado === parseInt(empleadoId));
        } catch (error) {
            console.error('Error al filtrar por empleado:', error);
            return [];
        }
    }

    // Filtra tareas usando múltiples criterios
    async filtrar(filtros) {
        try {
            let tareas = await this.getAll();
            // Filtra por estado si se proporciona
            if (filtros.estado) {
                tareas = tareas.filter(tarea => tarea.estado === filtros.estado);
            }
            // Filtra por prioridad si se proporciona
            if (filtros.prioridad) {
                tareas = tareas.filter(tarea => tarea.prioridad === filtros.prioridad);
            }
            // Filtra por área si se proporciona
            if (filtros.area) {
                tareas = tareas.filter(tarea => tarea.area === filtros.area);
            }
            // Filtra por empleado asignado si se proporciona
            if (filtros.empleadoAsignado) {
                tareas = tareas.filter(tarea => tarea.empleadoAsignado === parseInt(filtros.empleadoAsignado));
            }
            // Filtra por fecha de creación (rango desde)
            if (filtros.fechaDesde) {
                tareas = tareas.filter(tarea => new Date(tarea.fechaCreacion) >= new Date(filtros.fechaDesde));
            }
            // Filtra por fecha de creación (rango hasta)
            if (filtros.fechaHasta) {
                tareas = tareas.filter(tarea => new Date(tarea.fechaCreacion) <= new Date(filtros.fechaHasta));
            }
            // Filtra por tipo de pedido si está relacionado
            if (filtros.tipoPedido && filtros.tipoPedido !== 'todos') {
                const PedidoModel = require('./Pedido');
                const pedidoModel = new PedidoModel();
                const pedidos = await pedidoModel.getAll();
                const pedidosFiltrados = pedidos.filter(pedido => pedido.tipo === filtros.tipoPedido);
                const pedidosIds = pedidosFiltrados.map(p => p.id);
                tareas = tareas.filter(tarea => 
                    tarea.pedidoAsociado === null || pedidosIds.includes(tarea.pedidoAsociado)
                );
            }
            return tareas;
        } catch (error) {
            console.error('Error al filtrar tareas:', error);
            return [];
        }
    }

    // Crea una nueva tarea con valores por defecto
    async create(nuevaTarea) {
        try {
            const tareas = await this.getAll();
            // Genera un nuevo ID incremental
            const nuevoId = tareas.length > 0 ? Math.max(...tareas.map(t => t.id)) + 1 : 1;
            // Crea el objeto tarea con valores por defecto
            const tarea = {
                id: nuevoId,
                titulo: nuevaTarea.titulo,
                descripcion: nuevaTarea.descripcion,
                area: nuevaTarea.area, // gestion_pedidos o control_inventario
                estado: 'pendiente', // pendiente, en_proceso, finalizada
                prioridad: nuevaTarea.prioridad || 'media', // alta, media, baja
                empleadoAsignado: parseInt(nuevaTarea.empleadoAsignado) || null,
                pedidoAsociado: parseInt(nuevaTarea.pedidoAsociado) || null,
                fechaCreacion: new Date().toISOString(),
                fechaInicio: null,
                fechaFinalizacion: null,
                observaciones: nuevaTarea.observaciones || ''
            };
            tareas.push(tarea);
            // Guarda los cambios en el archivo JSON
            await this.saveAll(tareas);
            return tarea;
        } catch (error) {
            console.error('Error al crear tarea:', error);
            throw error;
        }
    }

    // Actualiza una tarea existente
    async update(id, datosActualizados) {
        try {
            const tareas = await this.getAll();
            const index = tareas.findIndex(tarea => tarea.id === parseInt(id));
            // Verifica si la tarea existe
            if (index === -1) {
                throw new Error('Tarea no encontrada');
            }
            // Actualiza fechaInicio si la tarea pasa a en_proceso
            if (datosActualizados.estado === 'en_proceso' && !tareas[index].fechaInicio) {
                datosActualizados.fechaInicio = new Date().toISOString();
            }
            // Actualiza fechaFinalizacion si la tarea pasa a finalizada
            if (datosActualizados.estado === 'finalizada' && !tareas[index].fechaFinalizacion) {
                datosActualizados.fechaFinalizacion = new Date().toISOString();
            }
            // Actualiza los datos de la tarea
            tareas[index] = { ...tareas[index], ...datosActualizados };
            await this.saveAll(tareas);
            return tareas[index];
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            throw error;
        }
    }

    // Elimina una tarea
    async delete(id) {
        try {
            const tareas = await this.getAll();
            const tareasFiltradas = tareas.filter(tarea => tarea.id !== parseInt(id));
            // Verifica si la tarea existía
            if (tareas.length === tareasFiltradas.length) {
                throw new Error('Tarea no encontrada');
            }
            // Guarda los cambios en el archivo JSON
            await this.saveAll(tareasFiltradas);
            return true;
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            throw error;
        }
    }

    // Calcula estadísticas de tareas por área
    async getEstadisticasPorArea() {
        try {
            const tareas = await this.getAll();
            // Genera estadísticas agrupadas por área y estado
            return {
                gestion_pedidos: {
                    total: tareas.filter(t => t.area === 'gestion_pedidos').length,
                    pendientes: tareas.filter(t => t.area === 'gestion_pedidos' && t.estado === 'pendiente').length,
                    en_proceso: tareas.filter(t => t.area === 'gestion_pedidos' && t.estado === 'en_proceso').length,
                    finalizadas: tareas.filter(t => t.area === 'gestion_pedidos' && t.estado === 'finalizada').length
                },
                control_inventario: {
                    total: tareas.filter(t => t.area === 'control_inventario').length,
                    pendientes: tareas.filter(t => t.area === 'control_inventario' && t.estado === 'pendiente').length,
                    en_proceso: tareas.filter(t => t.area === 'control_inventario' && t.estado === 'en_proceso').length,
                    finalizadas: tareas.filter(t => t.area === 'control_inventario' && t.estado === 'finalizada').length
                }
            };
        } catch (error) {
            console.error('Error al obtener estadísticas por área:', error);
            return {};
        }
    }

    // Guarda todas las tareas en el archivo JSON
    async saveAll(tareas) {
        try {
            const data = JSON.stringify({ tareas }, null, 2);
            await fs.writeFile(this.filePath, data, 'utf8');
        } catch (error) {
            console.error('Error al guardar tareas:', error);
            throw error;
        }
    }
}

module.exports = Tarea;