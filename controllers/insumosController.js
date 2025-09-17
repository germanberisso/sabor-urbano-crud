const InsumoModel = require('../models/Insumo');

class InsumosController {
    constructor() {
        this.insumoModel = new InsumoModel();
    }

    // Obtener todos los insumos
    async getAll(req, res) {
        try {
            const insumos = await this.insumoModel.getAll();
            
            res.json({
                success: true,
                data: insumos,
                total: insumos.length
            });
        } catch (error) {
            console.error('Error en getAll insumos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los insumos',
                error: error.message
            });
        }
    }

    // Obtener insumo por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const insumo = await this.insumoModel.getById(id);
            
            if (!insumo) {
                return res.status(404).json({
                    success: false,
                    message: 'Insumo no encontrado'
                });
            }

            res.json({
                success: true,
                data: insumo
            });
        } catch (error) {
            console.error('Error en getById insumo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el insumo',
                error: error.message
            });
        }
    }

    // Obtener insumos con stock bajo
    async getBajoStock(req, res) {
        try {
            const insumosBajoStock = await this.insumoModel.getBajoStock();
            
            res.json({
                success: true,
                data: insumosBajoStock,
                total: insumosBajoStock.length,
                mensaje: insumosBajoStock.length > 0 ? 'Insumos con stock bajo detectados' : 'Todos los insumos tienen stock adecuado'
            });
        } catch (error) {
            console.error('Error en getBajoStock:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener insumos con stock bajo',
                error: error.message
            });
        }
    }

    // Obtener alertas de stock
    async getAlertas(req, res) {
        try {
            const alertas = await this.insumoModel.getAlertas();
            
            res.json({
                success: true,
                data: alertas,
                total: alertas.length,
                alertasActivas: alertas.length > 0
            });
        } catch (error) {
            console.error('Error en getAlertas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener alertas de stock',
                error: error.message
            });
        }
    }

    // Obtener insumos por categoría
    async getByCategoria(req, res) {
        try {
            const { categoria } = req.params;
            const insumos = await this.insumoModel.getByCategoria(categoria);
            
            res.json({
                success: true,
                data: insumos,
                categoria: categoria,
                total: insumos.length
            });
        } catch (error) {
            console.error('Error en getByCategoria:', error);
            res.status(500).json({
                success: false,
                message: 'Error al filtrar insumos por categoría',
                error: error.message
            });
        }
    }

    // Crear nuevo insumo
    async create(req, res) {
        try {
            const datosInsumo = req.body;
            
            // Validaciones básicas
            if (!datosInsumo.nombre || !datosInsumo.categoria) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y categoría son obligatorios'
                });
            }

            // Validar que stock y stockMinimo sean números
            if (datosInsumo.stock && isNaN(parseInt(datosInsumo.stock))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock debe ser un número'
                });
            }

            if (datosInsumo.stockMinimo && isNaN(parseInt(datosInsumo.stockMinimo))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock mínimo debe ser un número'
                });
            }

            const nuevoInsumo = await this.insumoModel.create(datosInsumo);
            
            res.status(201).json({
                success: true,
                message: 'Insumo creado exitosamente',
                data: nuevoInsumo
            });
        } catch (error) {
            console.error('Error en create insumo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el insumo',
                error: error.message
            });
        }
    }

    // Actualizar stock de insumo
    async actualizarStock(req, res) {
        try {
            const { id } = req.params;
            const { stock } = req.body;
            
            if (!stock || isNaN(parseInt(stock))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock debe ser un número válido'
                });
            }

            const insumoActualizado = await this.insumoModel.actualizarStock(id, stock);
            
            res.json({
                success: true,
                message: 'Stock actualizado exitosamente',
                data: insumoActualizado
            });
        } catch (error) {
            console.error('Error en actualizarStock:', error);
            if (error.message === 'Insumo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar stock',
                    error: error.message
                });
            }
        }
    }

    // Descontar stock (para uso en platos)
    async descontarStock(req, res) {
        try {
            const { id } = req.params;
            const { cantidad } = req.body;
            
            if (!cantidad || isNaN(parseInt(cantidad))) {
                return res.status(400).json({
                    success: false,
                    message: 'Cantidad debe ser un número válido'
                });
            }

            const insumoActualizado = await this.insumoModel.descontarStock(id, cantidad);
            
            res.json({
                success: true,
                message: 'Stock descontado exitosamente',
                data: insumoActualizado
            });
        } catch (error) {
            console.error('Error en descontarStock:', error);
            if (error.message === 'Stock insuficiente' || error.message === 'Insumo no encontrado') {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al descontar stock',
                    error: error.message
                });
            }
        }
    }

    // Actualizar insumo
    async update(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            
            // Verificar que el insumo existe
            const insumoExistente = await this.insumoModel.getById(id);
            if (!insumoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Insumo no encontrado'
                });
            }

            const insumoActualizado = await this.insumoModel.update(id, datosActualizados);
            
            res.json({
                success: true,
                message: 'Insumo actualizado exitosamente',
                data: insumoActualizado
            });
        } catch (error) {
            console.error('Error en update insumo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el insumo',
                error: error.message
            });
        }
    }

    // Eliminar insumo
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const resultado = await this.insumoModel.delete(id);
            
            res.json({
                success: true,
                message: 'Insumo eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en delete insumo:', error);
            if (error.message === 'Insumo no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
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