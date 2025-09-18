// Importa el modelo de Empleado para interactuar con los datos
const EmpleadoModel = require('../models/Empleado');

// Controlador para gestionar operaciones CRUD de empleados
class EmpleadosController {
    // Inicializa el modelo de Empleado
    constructor() {
        this.empleadoModel = new EmpleadoModel();
    }

    // Obtiene todos los empleados de la base de datos
    async getAll(req, res) {
        try {
            const empleados = await this.empleadoModel.getAll();
            // Responde con lista de empleados y su cantidad
            res.json({
                success: true,
                data: empleados,
                total: empleados.length
            });
        } catch (error) {
            console.error('Error en getAll empleados:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener los empleados',
                error: error.message
            });
        }
    }

    // Obtiene solo los empleados con estado activo
    async getActivos(req, res) {
        try {
            const empleados = await this.empleadoModel.getActivos();
            // Responde con lista de empleados activos y su cantidad
            res.json({
                success: true,
                data: empleados,
                total: empleados.length
            });
        } catch (error) {
            console.error('Error en getActivos:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleados activos',
                error: error.message
            });
        }
    }

    // Obtiene un empleado específico por su ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const empleado = await this.empleadoModel.getById(id);
            // Verifica si el empleado existe
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }
            // Responde con los datos del empleado
            res.json({
                success: true,
                data: empleado
            });
        } catch (error) {
            console.error('Error en getById empleado:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener el empleado',
                error: error.message
            });
        }
    }

    // Filtra empleados por rol (e.g., cocinero, repartidor)
    async getByRol(req, res) {
        try {
            const { rol } = req.params;
            // Lista de roles válidos para validación
            const rolesValidos = ['administrador', 'cocinero', 'repartidor', 'mozo', 'encargado_stock'];
            if (!rolesValidos.includes(rol)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rol no válido. Use: administrador, cocinero, repartidor, mozo, encargado_stock'
                });
            }
            const empleados = await this.empleadoModel.getByRol(rol);
            // Responde con empleados filtrados por rol
            res.json({
                success: true,
                data: empleados,
                rol: rol,
                total: empleados.length
            });
        } catch (error) {
            console.error('Error en getByRol:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al filtrar empleados por rol',
                error: error.message
            });
        }
    }

    // Filtra empleados por área (e.g., cocina, reparto)
    async getByArea(req, res) {
        try {
            const { area } = req.params;
            // Lista de áreas válidas para validación
            const areasValidas = ['cocina', 'reparto', 'salon', 'inventario', 'administracion'];
            if (!areasValidas.includes(area)) {
                return res.status(400).json({
                    success: false,
                    message: 'Área no válida. Use: cocina, reparto, salon, inventario, administracion'
                });
            }
            const empleados = await this.empleadoModel.getByArea(area);
            // Responde con empleados filtrados por área
            res.json({
                success: true,
                data: empleados,
                area: area,
                total: empleados.length
            });
        } catch (error) {
            console.error('Error en getByArea empleados:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al filtrar empleados por área',
                error: error.message
            });
        }
    }

    // Crea un nuevo empleado con validaciones
    async create(req, res) {
        try {
            const datosEmpleado = req.body;
            // Verifica campos obligatorios
            if (!datosEmpleado.nombre || !datosEmpleado.apellido || !datosEmpleado.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, apellido y email son obligatorios'
                });
            }
            // Valida rol contra lista predefinida
            const rolesValidos = ['administrador', 'cocinero', 'repartidor', 'mozo', 'encargado_stock'];
            if (!rolesValidos.includes(datosEmpleado.rol)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rol no válido'
                });
            }
            // Valida área contra lista predefinida
            const areasValidas = ['cocina', 'reparto', 'salon', 'inventario', 'administracion'];
            if (!areasValidas.includes(datosEmpleado.area)) {
                return res.status(400).json({
                    success: false,
                    message: 'Área no válida'
                });
            }
            // Valida formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datosEmpleado.email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email no válido'
                });
            }
            const nuevoEmpleado = await this.empleadoModel.create(datosEmpleado);
            // Responde con el empleado creado
            res.status(201).json({
                success: true,
                message: 'Empleado creado exitosamente',
                data: nuevoEmpleado
            });
        } catch (error) {
            console.error('Error en create empleado:', error);
            // Maneja error de email duplicado
            if (error.message === 'El email ya está en uso') {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Maneja otros errores internos
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el empleado',
                    error: error.message
                });
            }
        }
    }

    // Actualiza un empleado existente
    async update(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            // Verifica si el empleado existe
            const empleadoExistente = await this.empleadoModel.getById(id);
            if (!empleadoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }
            // Valida formato de email si se actualiza
            if (datosActualizados.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(datosActualizados.email)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Formato de email no válido'
                    });
                }
            }
            const empleadoActualizado = await this.empleadoModel.update(id, datosActualizados);
            // Responde con el empleado actualizado
            res.json({
                success: true,
                message: 'Empleado actualizado exitosamente',
                data: empleadoActualizado
            });
        } catch (error) {
            console.error('Error en update empleado:', error);
            // Maneja error de email duplicado
            if (error.message === 'El email ya está en uso') {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Maneja otros errores internos
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el empleado',
                    error: error.message
                });
            }
        }
    }

    // Desactiva un empleado (eliminación lógica)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const empleadoDesactivado = await this.empleadoModel.delete(id);
            // Responde con el empleado desactivado
            res.json({
                success: true,
                message: 'Empleado desactivado exitosamente',
                data: empleadoDesactivado
            });
        } catch (error) {
            console.error('Error en delete empleado:', error);
            // Maneja error si el empleado no existe
            if (error.message === 'Empleado no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Maneja otros errores internos
                res.status(500).json({
                    success: false,
                    message: 'Error al desactivar el empleado',
                    error: error.message
                });
            }
        }
    }

    // Obtiene estadísticas de empleados por rol y área
    async getEstadisticas(req, res) {
        try {
            const estadisticas = await this.empleadoModel.getEstadisticas();
            // Responde con estadísticas agrupadas
            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error en getEstadisticas empleados:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de empleados',
                error: error.message
            });
        }
    }

    // Verifica si un email está disponible
    async validarEmail(req, res) {
        try {
            const { email, id } = req.query;
            // Verifica si se proporcionó email
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email es requerido'
                });
            }
            const esUnico = await this.empleadoModel.validarEmailUnico(email, id);
            // Responde con la disponibilidad del email
            res.json({
                success: true,
                disponible: esUnico,
                email: email
            });
        } catch (error) {
            console.error('Error en validarEmail:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al validar email',
                error: error.message
            });
        }
    }
}

module.exports = EmpleadosController;