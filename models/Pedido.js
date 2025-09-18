// Importa módulos para manejo de archivos y rutas
const fs = require('fs').promises;
const path = require('path');

// Clase para gestionar operaciones CRUD de pedidos usando JSON
class Pedido {
    // Inicializa la ruta al archivo pedidos.json
    constructor() {
        this.filePath = path.join(__dirname, '../data/pedidos.json');
    }

    // Lee todos los pedidos desde el archivo JSON
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

    // Obtiene un pedido por su ID
    async getById(id) {
        try {
            const pedidos = await this.getAll();
            return pedidos.find(pedido => pedido.id === parseInt(id));
        } catch (error) {
            console.error('Error al obtener pedido por ID:', error);
            return null;
        }
    }

    // Filtra pedidos por tipo (presencial o delivery)
    async getByTipo(tipo) {
        try {
            const pedidos = await this.getAll();
            return pedidos.filter(pedido => pedido.tipo === tipo);
        } catch (error) {
            console.error('Error al filtrar por tipo:', error);
            return [];
        }
    }

    // Filtra pedidos por plataforma (rappi, pedidosya, propia, local)
    async getByPlataforma(plataforma) {
        try {
            const pedidos = await this.getAll();
            return pedidos.filter(pedido => pedido.plataforma === plataforma);
        } catch (error) {
            console.error('Error al filtrar por plataforma:', error);
            return [];
        }
    }

    // Filtra pedidos por estado (e.g., pendiente, en_preparacion)
    async getByEstado(estado) {
        try {
            const pedidos = await this.getAll();
            return pedidos.filter(pedido => pedido.estado === estado);
        } catch (error) {
            console.error('Error al filtrar por estado:', error);
            return [];
        }
    }

    // Crea un nuevo pedido con valores por defecto
    async create(nuevoPedido) {
        try {
            const pedidos = await this.getAll();
            // Genera un nuevo ID incremental
            const nuevoId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;
            // Crea el objeto pedido con valores por defecto
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
            // Guarda los cambios en el archivo JSON
            await this.saveAll(pedidos);
            return pedido;
        } catch (error) {
            console.error('Error al crear pedido:', error);
            throw error;
        }
    }

    // Actualiza un pedido existente
    async update(id, datosActualizados) {
        try {
            const pedidos = await this.getAll();
            const index = pedidos.findIndex(pedido => pedido.id === parseInt(id));
            // Verifica si el pedido existe
            if (index === -1) {
                throw new Error('Pedido no encontrado');
            }
            // Actualiza los datos del pedido
            pedidos[index] = { ...pedidos[index], ...datosActualizados };
            await this.saveAll(pedidos);
            return pedidos[index];
        } catch (error) {
            console.error('Error al actualizar pedido:', error);
            throw error;
        }
    }

    // Elimina un pedido
    async delete(id) {
        try {
            const pedidos = await this.getAll();
            const pedidosFiltrados = pedidos.filter(pedido => pedido.id !== parseInt(id));
            // Verifica si el pedido existía
            if (pedidos.length === pedidosFiltrados.length) {
                throw new Error('Pedido no encontrado');
            }
            // Guarda los cambios en el archivo JSON
            await this.saveAll(pedidosFiltrados);
            return true;
        } catch (error) {
            console.error('Error al eliminar pedido:', error);
            throw error;
        }
    }

    // Calcula estadísticas de pedidos por tipo, plataforma y estado
    async getEstadisticas() {
        try {
            const pedidos = await this.getAll();
            // Genera estadísticas agrupadas
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

    // Guarda todos los pedidos en el archivo JSON
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