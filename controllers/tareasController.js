const TareaModel = require('../models/Tarea');
const EmpleadoModel = require('../models/Empleado');
const PedidoModel = require('../models/Pedido');

class TareasController {
    constructor() {
        this.tareaModel = new TareaModel();
        this.empleadoModel = new EmpleadoModel();
        this.pedidoModel = new PedidoModel();
    }

    // Obtener todas las tareas
    async getAll(req, res) {
        try {
            const tareas = await this.tareaModel.getAll();
            
            // Enriquecer con datos de empleados
            const tareasEnriquecidas = await Promise.all(
                tareas.map(async (tarea) => {
                    if (tarea.empleadoAsignado) {
                        const empleado = await this.empleadoModel.getById(tarea.empleadoAsignado);
                        tarea.empleado = empleado ? `${empleado.nombre} ${empleado.apellido}` : 'No asignado';
                    }
                    
                    if (tarea.pedidoAsociado) {
                        const pedido = await this.pedidoModel.getById(tarea.pedidoAsociado);
                        tarea.pedido = pedido ? pedido.numeroOrden : null;
                    }
                    
                    return tarea;
                })
            );

            res.json({
                success: true,
                data: tareasEnriquecidas,
                total: tareasEnriquecidas.length
            });
        } catch (error) {
            console.error('Error en getAll tareas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las tareas',
                error: error.message
            });
        }
    }

    // Obtener tarea por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const tarea = await this.tareaModel.getById(id);
            
            if (!tarea) {
                return res.status(404).json({
                    success: false,
                    message: 'Tarea no encontrada'
                });
            }

            // Enriquecer con datos relacionados
            if (tarea.empleadoAsignado) {
                const empleado = await this.empleadoModel.getById(tarea.empleadoAsignado);
                tarea.empleadoInfo = empleado;
            }

            if (tarea.pedidoAsociado) {
                const pedido = await this.pedidoModel.getById(tarea.pedidoAsociado);
                tarea.pedidoInfo = pedido;
            }

            res.json({
                success: true,
                data: tarea
            });
        } catch (error) {
            console.error('Error en getById tarea:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la tarea',
                error: error.message
            });
        }
    }

    // Obtener tareas por área (Gestión de Pedidos / Control de Inventario)
    async getByArea(req, res) {
        try {
            const { area } = req.params;
            
            // Validar área según especificaciones
            const areasValidas = ['gestion_pedidos', 'control_inventario'];
            if (!areasValidas.includes(area)) {
                return res.status(400).json({
                    success: false,
                    message: 'Área no válida. Use: gestion_pedidos o control_inventario'
                });
            }

            const tareas = await this.tareaModel.getByArea(area);
            
            res.json({
                success: true,
                data: tareas,
                area: area,
                total: tareas.length
            });
        } catch (error) {
            console.error('Error en getByArea:', error);
            res.status(500).json({
                success: false,
                message: 'Error al filtrar tareas por área',
                error: error.message
            });
        }
    }

    // Filtrar tareas con múltiples criterios
    async filtrar(req, res) {
        try {
            const filtros = req.query;
            
            console.log('Filtros recibidos:', filtros);
            
            const tareas = await this.tareaModel.filtrar(filtros);
            
            res.json({
                success: true,
                data: tareas,
                filtros: filtros,
                total: tareas.length
            });
        } catch (error) {
            console.error('Error en filtrar tareas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al filtrar tareas',
                error: error.message
            });
        }
    }

    // Crear nueva tarea
    async create(req, res) {
        try {
            const datosTarea = req.body;
            
            // Validaciones básicas
            if (!datosTarea.titulo || !datosTarea.area) {
                return res.status(400).json({
                    success: false,
                    message: 'Título y área son obligatorios'
                });
            }

            // Validar área
            const areasValidas = ['gestion_pedidos', 'control_inventario'];
            if (!areasValidas.includes(datosTarea.area)) {
                return res.status(400).json({
                    success: false,
                    message: 'Área debe ser: gestion_pedidos o control_inventario'
                });
            }

            // Validar empleado asignado si se proporciona
            if (datosTarea.empleadoAsignado) {
                const empleado = await this.empleadoModel.getById(datosTarea.empleadoAsignado);
                if (!empleado || !empleado.activo) {
                    return res.status(400).json({
                        success: false,
                        message: 'Empleado no válido o inactivo'
                    });
                }
            }

            // Validar pedido asociado si se proporciona
            if (datosTarea.pedidoAsociado) {
                const pedido = await this.pedidoModel.getById(datosTarea.pedidoAsociado);
                if (!pedido) {
                    return res.status(400).json({
                        success: false,
                        message: 'Pedido asociado no válido'
                    });
                }
            }

            const nuevaTarea = await this.tareaModel.create(datosTarea);
            
            res.status(201).json({
                success: true,
                message: 'Tarea creada exitosamente',
                data: nuevaTarea
            });
        } catch (error) {
            console.error('Error en create tarea:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear la tarea',
                error: error.message
            });
        }
    }

    // Actualizar tarea
    async update(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            
            // Verificar que la tarea existe
            const tareaExistente = await this.tareaModel.getById(id);
            if (!tareaExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Tarea no encontrada'
                });
            }

            // Validar estado si se está actualizando
            if (datosActualizados.estado) {
                const estadosValidos = ['pendiente', 'en_proceso', 'finalizada'];
                if (!estadosValidos.includes(datosActualizados.estado)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Estado debe ser: pendiente, en_proceso o finalizada'
                    });
                }
            }

            const tareaActualizada = await this.tareaModel.update(id, datosActualizados);
            
            res.json({
                success: true,
                message: 'Tarea actualizada exitosamente',
                data: tareaActualizada
            });
        } catch (error) {
            console.error('Error en update tarea:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la tarea',
                error: error.message
            });
        }
    }

    // Eliminar tarea
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const resultado = await this.tareaModel.delete(id);
            
            res.json({
                success: true,
                message: 'Tarea eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error en delete tarea:', error);
            if (error.message === 'Tarea no encontrada') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la tarea',
                    error: error.message
                });
            }
        }
    }

    // Obtener estadísticas por área
    async getEstadisticas(req, res) {
        try {
            const estadisticas = await this.tareaModel.getEstadisticasPorArea();
            
            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error en getEstadisticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    // Obtener tareas pendientes de alta prioridad
    async getTareasUrgentes(req, res) {
        try {
            const tareas = await this.tareaModel.filtrar({
                estado: 'pendiente',
                prioridad: 'alta'
            });
            
            res.json({
                success: true,
                data: tareas,
                total: tareas.length
            });
        } catch (error) {
            console.error('Error en getTareasUrgentes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tareas urgentes',
                error: error.message
            });
        }
    }
}

module.exports = TareasController;