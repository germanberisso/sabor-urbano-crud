const PedidoModel = require('../models/Pedido');

class PedidosController {
    constructor() {
        this.pedidoModel = new PedidoModel();
    }

    // Obtener todos los pedidos
    async getAll(req, res) {
        try {
            const pedidos = await this.pedidoModel.getAll();
            
            res.json({
                success: true,
                data: pedidos,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Error en getAll pedidos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los pedidos',
                error: error.message
            });
        }
    }

    // Obtener pedido por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const pedido = await this.pedidoModel.getById(id);
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            res.json({
                success: true,
                data: pedido
            });
        } catch (error) {
            console.error('Error en getById pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el pedido',
                error: error.message
            });
        }
    }

    // Obtener pedidos por tipo (presencial, delivery)
    async getByTipo(req, res) {
        try {
            const { tipo } = req.params;
            
            // Validar tipo según especificaciones
            const tiposValidos = ['presencial', 'delivery'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo no válido. Use: presencial o delivery'
                });
            }

            const pedidos = await this.pedidoModel.getByTipo(tipo);
            
            res.json({
                success: true,
                data: pedidos,
                tipo: tipo,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Error en getByTipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al filtrar pedidos por tipo',
                error: error.message
            });
        }
    }

    // Obtener pedidos por plataforma
    async getByPlataforma(req, res) {
        try {
            const { plataforma } = req.params;
            
            // Validar plataforma según especificaciones
            const plataformasValidas = ['rappi', 'pedidosya', 'propia', 'local'];
            if (!plataformasValidas.includes(plataforma)) {
                return res.status(400).json({
                    success: false,
                    message: 'Plataforma no válida. Use: rappi, pedidosya, propia, local'
                });
            }

            const pedidos = await this.pedidoModel.getByPlataforma(plataforma);
            
            res.json({
                success: true,
                data: pedidos,
                plataforma: plataforma,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Error en getByPlataforma:', error);
            res.status(500).json({
                success: false,
                message: 'Error al filtrar pedidos por plataforma',
                error: error.message
            });
        }
    }

    // Obtener pedidos por estado
    async getByEstado(req, res) {
        try {
            const { estado } = req.params;
            const pedidos = await this.pedidoModel.getByEstado(estado);
            
            res.json({
                success: true,
                data: pedidos,
                estado: estado,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Error en getByEstado pedidos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al filtrar pedidos por estado',
                error: error.message
            });
        }
    }

    // Crear nuevo pedido
    async create(req, res) {
        try {
            const datosPedido = req.body;
            
            // Validaciones básicas
            if (!datosPedido.cliente || !datosPedido.items || !datosPedido.total) {
                return res.status(400).json({
                    success: false,
                    message: 'Cliente, items y total son obligatorios'
                });
            }

            // Validar tipo
            const tiposValidos = ['presencial', 'delivery'];
            if (!tiposValidos.includes(datosPedido.tipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo debe ser: presencial o delivery'
                });
            }

            // Validar plataforma
            const plataformasValidas = ['rappi', 'pedidosya', 'propia', 'local'];
            if (!plataformasValidas.includes(datosPedido.plataforma)) {
                return res.status(400).json({
                    success: false,
                    message: 'Plataforma debe ser: rappi, pedidosya, propia o local'
                });
            }

            // Validar items
            if (!Array.isArray(datosPedido.items) || datosPedido.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe incluir al menos un item'
                });
            }

            const nuevoPedido = await this.pedidoModel.create(datosPedido);
            
            res.status(201).json({
                success: true,
                message: 'Pedido creado exitosamente',
                data: nuevoPedido
            });
        } catch (error) {
            console.error('Error en create pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el pedido',
                error: error.message
            });
        }
    }

    // Actualizar pedido
    async update(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            
            // Verificar que el pedido existe
            const pedidoExistente = await this.pedidoModel.getById(id);
            if (!pedidoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            const pedidoActualizado = await this.pedidoModel.update(id, datosActualizados);
            
            res.json({
                success: true,
                message: 'Pedido actualizado exitosamente',
                data: pedidoActualizado
            });
        } catch (error) {
            console.error('Error en update pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el pedido',
                error: error.message
            });
        }
    }

    // Eliminar pedido
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const resultado = await this.pedidoModel.delete(id);
            
            res.json({
                success: true,
                message: 'Pedido eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en delete pedido:', error);
            if (error.message === 'Pedido no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el pedido',
                    error: error.message
                });
            }
        }
    }

    // Obtener estadísticas de pedidos
    async getEstadisticas(req, res) {
        try {
            const estadisticas = await this.pedidoModel.getEstadisticas();
            
            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error en getEstadisticas pedidos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de pedidos',
                error: error.message
            });
        }
    }
}

module.exports = PedidosController;