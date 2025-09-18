// Importa el modelo de Insumo para interactuar con los datos
const InsumoModel = require('../models/Insumo');

// Controlador para gestionar operaciones CRUD de insumos
class InsumosController {
    // Inicializa el modelo de Insumo
    constructor() {
        this.insumoModel = new InsumoModel();
    }

    // Obtiene todos los insumos de la base de datos
    async getAll(req, res) {
        try {
            const insumos = await this.insumoModel.getAll();
            // Responde con lista de insumos y su cantidad
            res.json({
                success: true,
                data: insumos,
                total: insumos.length
            });
        } catch (error) {
            console.error('Error en getAll insumos:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener los insumos',
                error: error.message
            });
        }
    }

    // Obtiene un insumo específico por su ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const insumo = await this.insumoModel.getById(id);
            // Verifica si el insumo existe
            if (!insumo) {
                return res.status(404).json({
                    success: false,
                    message: 'Insumo no encontrado'
                });
            }
            // Responde con los datos del insumo
            res.json({
                success: true,
                data: insumo
            });
        } catch (error) {
            console.error('Error en getById insumo:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener el insumo',
                error: error.message
            });
        }
    }

    // Obtiene insumos con stock por debajo del mínimo
    async getBajoStock(req, res) {
        try {
            const insumosBajoStock = await this.insumoModel.getBajoStock();
            // Responde con insumos de stock bajo y mensaje contextual
            res.json({
                success: true,
                data: insumosBajoStock,
                total: insumosBajoStock.length,
                mensaje: insumosBajoStock.length > 0 ? 'Insumos con stock bajo detectados' : 'Todos los insumos tienen stock adecuado'
            });
        } catch (error) {
            console.error('Error en getBajoStock:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener insumos con stock bajo',
                error: error.message
            });
        }
    }

    // Obtiene alertas activas de stock
    async getAlertas(req, res) {
        try {
            const alertas = await this.insumoModel.getAlertas();
            // Responde con alertas y estado de alertas activas
            res.json({
                success: true,
                data: alertas,
                total: alertas.length,
                alertasActivas: alertas.length > 0
            });
        } catch (error) {
            console.error('Error en getAlertas:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener alertas de stock',
                error: error.message
            });
        }
    }

    // Filtra insumos por categoría
    async getByCategoria(req, res) {
        try {
            const { categoria } = req.params;
            const insumos = await this.insumoModel.getByCategoria(categoria);
            // Responde con insumos filtrados por categoría
            res.json({
                success: true,
                data: insumos,
                categoria: categoria,
                total: insumos.length
            });
        } catch (error) {
            console.error('Error en getByCategoria:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al filtrar insumos por categoría',
                error: error.message
            });
        }
    }

    // Crea un nuevo insumo con validaciones
    async create(req, res) {
        try {
            const datosInsumo = req.body;
            // Verifica campos obligatorios
            if (!datosInsumo.nombre || !datosInsumo.categoria) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y categoría son obligatorios'
                });
            }
            // Valida que stock sea un número válido
            if (datosInsumo.stock && isNaN(parseInt(datosInsumo.stock))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock debe ser un número'
                });
            }
            // Valida que stock mínimo sea un número válido
            if (datosInsumo.stockMinimo && isNaN(parseInt(datosInsumo.stockMinimo))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock mínimo debe ser un número'
                });
            }
            const nuevoInsumo = await this.insumoModel.create(datosInsumo);
            // Responde con el insumo creado
            res.status(201).json({
                success: true,
                message: 'Insumo creado exitosamente',
                data: nuevoInsumo
            });
        } catch (error) {
            console.error('Error en create insumo:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al crear el insumo',
                error: error.message
            });
        }
    }

    // Actualiza el stock de un insumo
    async actualizarStock(req, res) {
        try {
            const { id } = req.params;
            const { stock } = req.body;
            // Valida que stock sea un número válido
            if (!stock || isNaN(parseInt(stock))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock debe ser un número válido'
                });
            }
            const insumoActualizado = await this.insumoModel.actualizarStock(id, stock);
            // Responde con el insumo actualizado
            res.json({
                success: true,
                message: 'Stock actualizado exitosamente',
                data: insumoActualizado
            });
        } catch (error) {
            console.error('Error en actualizarStock:', error);
            // Maneja error si el insumo no existe
            if (error.message === 'Insumo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Maneja otros errores internos
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar stock',
                    error: error.message
                });
            }
        }
    }

    // Descuenta una cantidad específica del stock
    async descontarStock(req, res) {
        try {
            const { id } = req.params;
            const { cantidad } = req.body;
            // Valida que cantidad sea un número válido
            if (!cantidad || isNaN(parseInt(cantidad))) {
                return res.status(400).json({
                    success: false,
                    message: 'Cantidad debe ser un número válido'
                });
            }
            const insumoActualizado = await this.insumoModel.descontarStock(id, cantidad);
            // Responde con el insumo actualizado
            res.json({
                success: true,
                message: 'Stock descontado exitosamente',
                data: insumoActualizado
            });
        } catch (error) {
            console.error('Error en descontarStock:', error);
            // Maneja errores de stock insuficiente o insumo no encontrado
            if (error.message === 'Stock insuficiente' || error.message === 'Insumo no encontrado') {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Maneja otros errores internos
                res.status(500).json({
                    success: false,
                    message: 'Error al descontar stock',
                    error: error.message
                });
            }
        }
    }

    // Actualiza un insumo existente
    async update(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            // Verifica si el insumo existe
            const insumoExistente = await this.insumoModel.getById(id);
            if (!insumoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Insumo no encontrado'
                });
            }
            const insumoActualizado = await this.insumoModel.update(id, datosActualizados);
            // Responde con el insumo actualizado
            res.json({
                success: true,
                message: 'Insumo actualizado exitosamente',
                data: insumoActualizado
            });
        } catch (error) {
            console.error('Error en update insumo:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el insumo',
                error: error.message
            });
        }
    }

    // Elimina un insumo
    async delete(req, res) {
        try {
            const { id } = req.params;
            const resultado = await this.insumoModel.delete(id);
            // Responde con confirmación de eliminación
            res.json({
                success: true,
                message: 'Insumo eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en delete insumo:', error);
            // Maneja error si el insumo no existe
            if (error.message === 'Insumo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Maneja otros errores internos
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el insumo',
                    error: error.message
                });
            }
        }
    }
}

module.exports = InsumosController;