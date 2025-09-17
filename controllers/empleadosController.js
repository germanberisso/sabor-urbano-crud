const EmpleadoModel = require('../models/Empleado');

class EmpleadosController {
    constructor() {
        this.empleadoModel = new EmpleadoModel();
    }

    // Obtener todos los empleados
    async getAll(req, res) {
        try {
            const empleados = await this.empleadoModel.getAll();
            
            res.json({
                success: true,
                data: empleados,
                total: empleados.length
            });
        } catch (error) {
            console.error('Error en getAll empleados:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los empleados',
                error: error.message
            });
        }
    }

    // Obtener empleados activos
    async getActivos(req, res) {
        try {
            const empleados = await this.empleadoModel.getActivos();
            
            res.json({
                success: true,
                data: empleados,
                total: empleados.length
            });
        } catch (error) {
            console.error('Error en getActivos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleados activos',
                error: error.message
            });
        }
    }

    // Obtener empleado por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const empleado = await this.empleadoModel.getById(id);
            
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            res.json({
                success: true,
                data: empleado
            });
        } catch (error) {
            console.error('Error en getById empleado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el empleado',
                error: error.message
            });
        }
    }

    // Obtener empleados por rol
    async getByRol(req, res) {
        try {
            const { rol } = req.params;
            
            // Validar rol según especificaciones
            const rolesValidos = ['administrador', 'cocinero', 'repartidor', 'mozo', 'encargado_stock'];
            if (!rolesValidos.includes(rol)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rol no válido. Use: administrador, cocinero, repartidor, mozo, encargado_stock'
                });
            }

            const empleados = await this.empleadoModel.getByRol(rol);
            
            res.json({
                success: true,
                data: empleados,
                rol: rol,
                total: empleados.length
            });
        } catch (error) {
            console.error('Error en getByRol:', error);
            res.status(500).json({
                success: false,
                message: 'Error al filtrar empleados por rol',
                error: error.message
            });
        }
    }

    // Obtener empleados por área
    async getByArea(req, res) {
        try {
            const { area } = req.params;
            
            // Validar área según especificaciones
            const areasValidas = ['cocina', 'reparto', 'salon', 'inventario', 'administracion'];
            if (!areasValidas.includes(area)) {
                return res.status(400).json({
                    success: false,
                    message: 'Área no válida. Use: cocina, reparto, salon, inventario, administracion'
                });
            }

            const empleados = await this.empleadoModel.getByArea(area);
            
            res.json({
                success: true,
                data: empleados,
                area: area,
                total: empleados.length
            });
        } catch (error) {
            console.error('Error en getByArea empleados:', error);
            res.status(500).json({
                success: false,
                message: 'Error al filtrar empleados por área',
                error: error.message
            });
        }
    }

    // Crear nuevo empleado
    async create(req, res) {
        try {
            const datosEmpleado = req.body;
            
            // Validaciones básicas
            if (!datosEmpleado.nombre || !datosEmpleado.apellido || !datosEmpleado.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, apellido y email son obligatorios'
                });
            }

            // Validar rol
            const rolesValidos = ['administrador', 'cocinero', 'repartidor', 'mozo', 'encargado_stock'];
            if (!rolesValidos.includes(datosEmpleado.rol)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rol no válido'
                });
            }

            // Validar área
            const areasValidas = ['cocina', 'reparto', 'salon', 'inventario', 'administracion'];
            if (!areasValidas.includes(datosEmpleado.area)) {
                return res.status(400).json({
                    success: false,
                    message: 'Área no válida'
                });
            }

            // Validar email formato básico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datosEmpleado.email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email no válido'
                });
            }

            const nuevoEmpleado = await this.empleadoModel.create(datosEmpleado);
            
            res.status(201).json({
                success: true,
                message: 'Empleado creado exitosamente',
                data: nuevoEmpleado
            });
        } catch (error) {
            console.error('Error en create empleado:', error);
            if (error.message === 'El email ya está en uso') {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el empleado',
                    error: error.message
                });
            }
        }
    }

    // Actualizar empleado
    async update(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            
            // Verificar que el empleado existe
            const empleadoExistente = await this.empleadoModel.getById(id);
            if (!empleadoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            // Validar email formato si se está actualizando
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
            
            res.json({
                success: true,
                message: 'Empleado actualizado exitosamente',
                data: empleadoActualizado
            });
        } catch (error) {
            console.error('Error en update empleado:', error);
            if (error.message === 'El email ya está en uso') {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el empleado',
                    error: error.message
                });
            }
        }
    }

    // Eliminar empleado (desactivar)
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const empleadoDesactivado = await this.empleadoModel.delete(id);
            
            res.json({
                success: true,
                message: 'Empleado desactivado exitosamente',
                data: empleadoDesactivado
            });
        } catch (error) {
            console.error('Error en delete empleado:', error);
            if (error.message === 'Empleado no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al desactivar el empleado',
                    error: error.message
                });
            }
        }
    }

    // Obtener estadísticas de empleados
    async getEstadisticas(req, res) {
        try {
            const estadisticas = await this.empleadoModel.getEstadisticas();
            
            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error en getEstadisticas empleados:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de empleados',
                error: error.message
            });
        }
    }

    // Validar disponibilidad de email
    async validarEmail(req, res) {
        try {
            const { email } = req.query;
            const { id } = req.query; // Para excluir en caso de actualización
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email es requerido'
                });
            }

            const esUnico = await this.empleadoModel.validarEmailUnico(email, id);
            
            res.json({
                success: true,
                disponible: esUnico,
                email: email
            });
        } catch (error) {
            console.error('Error en validarEmail:', error);
            res.status(500).json({
                success: false,
                message: 'Error al validar email',
                error: error.message
            });
        }
    }
}

module.exports = EmpleadosController;