const fs = require('fs').promises;
const path = require('path');

class Pedido {
    constructor() {
        this.filePath = path.join(__dirname, '../data/pedidos.json');
    }

    // Método para leer todos los pedidos
    async getAll() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            const json = JSON.parse(data);
            return json.pedidos || [];
        } catch (error) {
            console.error('Error al leer pedidos:', error);
            return [];
        }
    }

    // Método para obtener pedido por ID
    async getById(id) {
        try {
            const pedidos = await this.getAll();
            return pedidos.find(pedido => pedido.id === parseInt(id));
        } catch (error) {
            console.error('Error al obtener pedido por ID:', error);
            return null;
        }
    }

    // Método para obtener pedidos por tipo (presencial, delivery)
    async getByTipo(tipo) {
        try {
            const pedidos = await this.getAll();
            return pedidos.filter(pedido => pedido.tipo === tipo);
        } catch (error) {
            console.error('Error al filtrar por tipo:', error);
            return [];
        }
    }

    // Método para obtener pedidos por plataforma (rappi, pedidosya, propia, local)
    async getByPlataforma(plataforma) {
        try {
            const pedidos = await this.getAll();
            return pedidos.filter(pedido => pedido.plataforma === plataforma);
        } catch (error) {
            console.error('Error al filtrar por plataforma:', error);
            return [];
        }
    }

    // Método para obtener pedidos por estado
    async getByEstado(estado) {
        try {
            const pedidos = await this.getAll();
            return pedidos.filter(pedido => pedido.estado === estado);
        } catch (error) {
            console.error('Error al filtrar por estado:', error);
            return [];
        }
    }

    // Método para crear nuevo pedido
    async create(nuevoPedido) {
        try {
            const pedidos = await this.getAll();
            const nuevoId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;
            
            const pedido = {
                id: nuevoId,
                numeroOrden: nuevoPedido.numeroOrden || `ORD-${nuevoId.toString().padStart(3, '0')}`,
                cliente: nuevoPedido.cliente,
                items: nuevoPedido.items,
                total: nuevoPedido.total,
                tipo: nuevoPedido.tipo, // presencial o delivery
                plataforma: nuevoPedido.plataforma, // rappi, pedidosya, propia, local
                estado: nuevoPedido.estado || 'pendiente',
                fechaCreacion: new Date().toISOString(),
                tiempoEstimado: nuevoPedido.tiempoEstimado || 30,
                observaciones: nuevoPedido.observaciones || ''
            };

            pedidos.push(pedido);
            await this.saveAll(pedidos);
            return pedido;
        } catch (error) {
            console.error('Error al crear pedido:', error);
            throw error;
        }
    }

    // Método para actualizar pedido
    async update(id, datosActualizados) {
        try {
            const pedidos = await this.getAll();
            const index = pedidos.findIndex(pedido => pedido.id === parseInt(id));
            
            if (index === -1) {
                throw new Error('Pedido no encontrado');
            }

            pedidos[index] = { ...pedidos[index], ...datosActualizados };
            await this.saveAll(pedidos);
            return pedidos[index];
        } catch (error) {
            console.error('Error al actualizar pedido:', error);
            throw error;
        }
    }

    // Método para eliminar pedido
    async delete(id) {
        try {
            const pedidos = await this.getAll();
            const pedidosFiltrados = pedidos.filter(pedido => pedido.id !== parseInt(id));
            
            if (pedidos.length === pedidosFiltrados.length) {
                throw new Error('Pedido no encontrado');
            }

            await this.saveAll(pedidosFiltrados);
            return true;
        } catch (error) {
            console.error('Error al eliminar pedido:', error);
            throw error;
        }
    }

    // Método para obtener estadísticas de pedidos
    async getEstadisticas() {
        try {
            const pedidos = await this.getAll();
            return {
                total: pedidos.length,
                porTipo: {
                    presencial: pedidos.filter(p => p.tipo === 'presencial').length,
                    delivery: pedidos.filter(p => p.tipo === 'delivery').length
                },
                porPlataforma: {
                    local: pedidos.filter(p => p.plataforma === 'local').length,
                    propia: pedidos.filter(p => p.plataforma === 'propia').length,
                    rappi: pedidos.filter(p => p.plataforma === 'rappi').length,
                    pedidosya: pedidos.filter(p => p.plataforma === 'pedidosya').length
                },
                porEstado: {
                    pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
                    en_preparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
                    listo: pedidos.filter(p => p.estado === 'listo').length,
                    en_camino: pedidos.filter(p => p.estado === 'en_camino').length,
                    entregado: pedidos.filter(p => p.estado === 'entregado').length,
                    finalizado: pedidos.filter(p => p.estado === 'finalizado').length
                }
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de pedidos:', error);
            return {};
        }
    }

    // Método privado para guardar todos los pedidos
    async saveAll(pedidos) {
        try {
            const data = JSON.stringify({ pedidos }, null, 2);
            await fs.writeFile(this.filePath, data, 'utf8');
        } catch (error) {
            console.error('Error al guardar pedidos:', error);
            throw error;
        }
    }
}

module.exports = Pedido;