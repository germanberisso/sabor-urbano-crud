// Importa el modelo de Pedido para interactuar con los datos
const PedidoModel = require('../models/Pedido');

// Controlador para gestionar operaciones CRUD de pedidos
class PedidosController {
    // Inicializa el modelo de Pedido
    constructor() {
        this.pedidoModel = new PedidoModel();
    }

    // Obtiene todos los pedidos de la base de datos
    async getAll(req, res) {
        try {
            const pedidos = await this.pedidoModel.getAll();
            // Responde con lista de pedidos y su cantidad
            res.json({
                success: true,
                data: pedidos,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Error en getAll pedidos:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener los pedidos',
                error: error.message
            });
        }
    }

    // Obtiene un pedido específico por su ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const pedido = await this.pedidoModel.getById(id);
            // Verifica si el pedido existe
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }
            // Responde con los datos del pedido
            res.json({
                success: true,
                data: pedido
            });
        } catch (error) {
            console.error('Error en getById pedido:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener el pedido',
                error: error.message
            });
        }
    }

    // Filtra pedidos por tipo (presencial o delivery)
    async getByTipo(req, res) {
        try {
            const { tipo } = req.params;
            // Lista de tipos válidos para validación
            const tiposValidos = ['presencial', 'delivery'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo no válido. Use: presencial o delivery'
                });
            }
            const pedidos = await this.pedidoModel.getByTipo(tipo);
            // Responde con pedidos filtrados por tipo
            res.json({
                success: true,
                data: pedidos,
                tipo: tipo,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Error en getByTipo:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al filtrar pedidos por tipo',
                error: error.message
            });
        }
    }

    // Filtra pedidos por plataforma (e.g., rappi, pedidosya)
    async getByPlataforma(req, res) {
        try {
            const { plataforma } = req.params;
            // Lista de plataformas válidas para validación
            const plataformasValidas = ['rappi', 'pedidosya', 'propia', 'local'];
            if (!plataformasValidas.includes(plataforma)) {
                return res.status(400).json({
                    success: false,
                    message: 'Plataforma no válida. Use: rappi, pedidosya, propia, local'
                });
            }
            const pedidos = await this.pedidoModel.getByPlataforma(plataforma);
            // Responde con pedidos filtrados por plataforma
            res.json({
                success: true,
                data: pedidos,
                plataforma: plataforma,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Error en getByPlataforma:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al filtrar pedidos por plataforma',
                error: error.message
            });
        }
    }

    // Filtra pedidos por estado (e.g., en_preparacion, entregado)
    async getByEstado(req, res) {
        try {
            const { estado } = req.params;
            const pedidos = await this.pedidoModel.getByEstado(estado);
            // Responde con pedidos filtrados por estado
            res.json({
                success: true,
                data: pedidos,
                estado: estado,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Error en getByEstado pedidos:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al filtrar pedidos por estado',
                error: error.message
            });
        }
    }

    // Crea un nuevo pedido con validaciones
    async create(req, res) {
        try {
            const datosPedido = req.body;
            // Verifica campos obligatorios
            if (!datosPedido.cliente || !datosPedido.items || !datosPedido.total) {
                return res.status(400).json({
                    success: false,
                    message: 'Cliente, items y total son obligatorios'
                });
            }
            // Valida tipo contra lista predefinida
            const tiposValidos = ['presencial', 'delivery'];
            if (!tiposValidos.includes(datosPedido.tipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo debe ser: presencial o delivery'
                });
            }
            // Valida plataforma contra lista predefinida
            const plataformasValidas = ['rappi', 'pedidosya', 'propia', 'local'];
            if (!plataformasValidas.includes(datosPedido.plataforma)) {
                return res.status(400).json({
                    success: false,
                    message: 'Plataforma debe ser: rappi, pedidosya, propia o local'
                });
            }
            // Valida que items sea un arreglo no vacío
            if (!Array.isArray(datosPedido.items) || datosPedido.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe incluir al menos un item'
                });
            }
            const nuevoPedido = await this.pedidoModel.create(datosPedido);
            // Responde con el pedido creado
            res.status(201).json({
                success: true,
                message: 'Pedido creado exitosamente',
                data: nuevoPedido
            });
        } catch (error) {
            console.error('Error en create pedido:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al crear el pedido',
                error: error.message
            });
        }
    }

    // Actualiza un pedido existente
    async update(req, res) {
        try {
            const { id } = req.params;
            const datosActualizados = req.body;
            // Verifica si el pedido existe
            const pedidoExistente = await this.pedidoModel.getById(id);
            if (!pedidoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }
            const pedidoActualizado = await this.pedidoModel.update(id, datosActualizados);
            // Responde con el pedido actualizado
            res.json({
                success: true,
                message: 'Pedido actualizado exitosamente',
                data: pedidoActualizado
            });
        } catch (error) {
            console.error('Error en update pedido:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el pedido',
                error: error.message
            });
        }
    }

    // Elimina un pedido
    async delete(req, res) {
        try {
            const { id } = req.params;
            const resultado = await this.pedidoModel.delete(id);
            // Responde con confirmación de eliminación
            res.json({
                success: true,
                message: 'Pedido eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en delete pedido:', error);
            // Maneja error si el pedido no existe
            if (error.message === 'Pedido no encontrado') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                // Maneja otros errores internos
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el pedido',
                    error: error.message
                });
            }
        }
    }

    // Obtiene estadísticas de pedidos por tipo, plataforma y estado
    async getEstadisticas(req, res) {
        try {
            const estadisticas = await this.pedidoModel.getEstadisticas();
            // Responde con estadísticas agrupadas
            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error en getEstadisticas pedidos:', error);
            // Maneja errores internos del servidor
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de pedidos',
                error: error.message
            });
        }
    }
}

module.exports = PedidosController;