// Importa los modelos necesarios para interactuar con datos
const TareaModel = require('../models/Tarea');
const EmpleadoModel = require('../models/Empleado');
const PedidoModel = require('../models/Pedido');

// Controlador para gestionar operaciones CRUD de tareas
class TareasController {
    // Inicializa los modelos de Tarea, Empleado y Pedido
    constructor() {
        this.tareaModel = new TareaModel();
        this.empleadoModel = new EmpleadoModel();
        this.pedidoModel = new PedidoModel();
    }

    // Obtiene todas las tareas, enriquecidas con datos de empleados y pedidos
    async getAll(req, res) {
        try {
            const tareas = await this.tareaModel.getAll();
            // Enriquecer tareas con información de empleado y pedido
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
            // Responde con lista de tareas enriquecidas y su cantidad
            res.json({
                success: true,
                data: tareasEnriquecidas,
                total: tareasEnriquecidas.length
            });
        } catch (error) {
            console.error('Error en getAll tareas:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener las tareas',
                error: error.message
            });
        }
    }

    // Obtiene una tarea específica por su ID, con datos relacionados
    async getById(req, res) {
        try {
            const { id } = req.params;
            const tarea = await this.tareaModel.getById(id);
            // Verifica si la tarea existe
            if (!tarea) {
                return res.status(404).json({
                    success: false,
                    message: 'Tarea no encontrada'
                });
            }
            // Enriquecer con información de empleado y pedido
            if (tarea.empleadoAsignado) {
                const empleado = await this.empleadoModel.getById(tarea.empleadoAsignado);
                tarea.empleadoInfo = empleado;
            }
            if (tarea.pedidoAsociado) {
                const pedido = await this.pedidoModel.getById(tarea.pedidoAsociado);
                tarea.pedidoInfo = pedido;
            }
            // Responde con los datos de la tarea
            res.json({
                success: true,
                data: tarea
            });
        } catch (error) {
            console.error('Error en getById tarea:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener la tarea',
                error: error.message
            });
        }
    }

    // Filtra tareas por área (gestión de pedidos o control de inventario)
    async getByArea(req, res) {
        try {
            const { area } = req.params;
            // Lista de áreas válidas para validación
            const areasValidas = ['gestion_pedidos', 'control_inventario'];
            if (!areasValidas.includes(area)) {
                return res.status(400).json({
                    success: false,
                    message: 'Área no válida. Use: gestion_pedidos o control_inventario'
                });
            }
            const tareas = await this.tareaModel.getByArea(area);
            // Responde con tareas filtradas por área
            res.json({
                success: true,
                data: tareas,
                area: area,
                total: tareas.length
            });
        } catch (error) {
            console.error('Error en getByArea:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al filtrar tareas por área',
                error: error.message
            });
        }
    }

    // Filtra tareas usando múltiples criterios (e.g., estado, prioridad)
    async filtrar(req, res) {
        try {
            const filtros = req.query;
            console.log('Filtros recibidos:', filtros);
            const tareas = await this.tareaModel.filtrar(filtros);
            // Responde con tareas filtradas y criterios usados
            res.json({
                success: true,
                data: tareas,
                filtros: filtros,
                total: tareas.length
            });
        } catch (error) {
            console.error('Error en filtrar tareas:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al filtrar tareas',
                error: error.message
            });
        }
    }

    // Crea una nueva tarea con validaciones
    async create(req, res) {
        try {
            const datosTarea = req.body;
            // Verifica campos obligatorios
            if (!datosTarea.titulo || !datosTarea.area) {
                return res.status(400).json({
                    success: false,
                    message: 'Título y área son obligatorios'
                });
            }
            // Valida área contra lista predefinida
            const areasValidas = ['gestion_pedidos', 'control_inventario'];
            if (!areasValidas.includes(datosTarea.area)) {
                return res.status(400).json({
                    success: false,
                    message: 'Área debe ser: gestion_pedidos o control_inventario'
                });
            }
            // Valida empleado asignado si se proporciona
            if (datosTarea.empleadoAsignado) {
                const empleado = await this.empleadoModel.getById(datosTarea.empleadoAsignado);
                if (!empleado || !empleado.activo) {
                    return res.status(400).json({
                        success: false,
                        message: 'Empleado no válido o inactivo'
                    });
                }
            }
            // Valida pedido asociado si se proporciona
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
            // Responde con la tarea creada
            res.status(201).json({
                success: true,
                message: 'Tarea creada exitosamente',
                data: nuevaTarea
            });
        } catch (error) {
            console.error('Error en create tarea:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al crear la tarea',
                error: error.message
            });
        }
    }

    // Actualiza una tarea existente
    async update(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            // Verifica si la tarea existe
            const tareaExistente = await this.tareaModel.getById(id);
            if (!tareaExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Tarea no encontrada'
                });
            }
            // Valida estado si se actualiza
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
            // Responde con la tarea actualizada
            res.json({
                success: true,
                message: 'Tarea actualizada exitosamente',
                data: tareaActualizada
            });
        } catch (error) {
            console.error('Error en update tarea:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la tarea',
                error: error.message
            });
        }
    }

    // Elimina una tarea
    async delete(req, res) {
        try {
            const { id } = req.params;
            const resultado = await this.tareaModel.delete(id);
            // Responde con confirmación de eliminación
            res.json({
                success: true,
                message: 'Tarea eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error en delete tarea:', error);
            // Maneja error si la tarea no existe
            if (error.message === 'Tarea no encontrada') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Maneja otros errores internos
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la tarea',
                    error: error.message
                });
            }
        }
    }

    // Obtiene estadísticas de tareas por área
    async getEstadisticas(req, res) {
        try {
            const estadisticas = await this.tareaModel.getEstadisticasPorArea();
            // Responde con estadísticas agrupadas
            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error en getEstadisticas:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    // Obtiene tareas pendientes de alta prioridad
    async getTareasUrgentes(req, res) {
        try {
            const tareas = await this.tareaModel.filtrar({
                estado: 'pendiente',
                prioridad: 'alta'
            });
            // Responde con tareas urgentes y su cantidad
            res.json({
                success: true,
                data: tareas,
                total: tareas.length
            });
        } catch (error) {
            console.error('Error en getTareasUrgentes:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener tareas urgentes',
                error: error.message
            });
        }
    }
}

module.exports = TareasController;