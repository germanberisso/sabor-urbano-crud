// Importa módulos para manejo de archivos y rutas
const fs = require('fs').promises;
const path = require('path');

// Clase para gestionar operaciones CRUD de insumos usando JSON
class Insumo {
    // Inicializa la ruta al archivo insumos.json
    constructor() {
        this.filePath = path.join(__dirname, '../data/insumos.json');
    }

    // Lee todos los insumos desde el archivo JSON
    async getAll() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            const json = JSON.parse(data);
            return json.insumos || [];
        } catch (error) {
            console.error('Error al leer insumos:', error);
            return [];
        }
    }

    // Obtiene un insumo por su ID
    async getById(id) {
        try {
            const insumos = await this.getAll();
            return insumos.find(insumo => insumo.id === parseInt(id));
        } catch (error) {
            console.error('Error al obtener insumo por ID:', error);
            return null;
        }
    }

    // Filtra insumos con stock igual o menor al mínimo
    async getBajoStock() {
        try {
            const insumos = await this.getAll();
            return insumos.filter(insumo => insumo.stock <= insumo.stockMinimo);
        } catch (error) {
            console.error('Error al obtener insumos con stock bajo:', error);
            return [];
        }
    }

    // Filtra insumos por categoría
    async getByCategoria(categoria) {
        try {
            const insumos = await this.getAll();
            return insumos.filter(insumo => insumo.categoria === categoria);
        } catch (error) {
            console.error('Error al filtrar por categoría:', error);
            return [];
        }
    }

    // Crea un nuevo insumo con valores por defecto
    async create(nuevoInsumo) {
        try {
            const insumos = await this.getAll();
            // Genera un nuevo ID incremental
            const nuevoId = insumos.length > 0 ? Math.max(...insumos.map(i => i.id)) + 1 : 1;
            // Crea el objeto insumo con estado calculado
            const insumo = {
                id: nuevoId,
                nombre: nuevoInsumo.nombre,
                categoria: nuevoInsumo.categoria,
                stock: parseInt(nuevoInsumo.stock) || 0,
                stockMinimo: parseInt(nuevoInsumo.stockMinimo) || 5,
                unidadMedida: nuevoInsumo.unidadMedida,
                proveedor: nuevoInsumo.proveedor,
                ultimaActualizacion: new Date().toISOString(),
                estado: this.determinarEstado(nuevoInsumo.stock, nuevoInsumo.stockMinimo)
            };
            insumos.push(insumo);
            // Guarda los cambios en el archivo JSON
            await this.saveAll(insumos);
            return insumo;
        } catch (error) {
            console.error('Error al crear insumo:', error);
            throw error;
        }
    }

    // Actualiza el stock de un insumo y su estado
    async actualizarStock(id, nuevoStock) {
        try {
            const insumos = await this.getAll();
            const index = insumos.findIndex(insumo => insumo.id === parseInt(id));
            // Verifica si el insumo existe
            if (index === -1) {
                throw new Error('Insumo no encontrado');
            }
            const stockActualizado = parseInt(nuevoStock);
            // Calcula el nuevo estado según el stock
            const estado = this.determinarEstado(stockActualizado, insumos[index].stockMinimo);
            // Actualiza los datos del insumo
            insumos[index] = {
                ...insumos[index],
                stock: stockActualizado,
                estado: estado,
                ultimaActualizacion: new Date().toISOString()
            };
            await this.saveAll(insumos);
            return insumos[index];
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            throw error;
        }
    }

    // Descuenta una cantidad del stock de un insumo
    async descontarStock(id, cantidad) {
        try {
            const insumo = await this.getById(id);
            // Verifica si el insumo existe
            if (!insumo) {
                throw new Error('Insumo no encontrado');
            }
            // Valida que haya stock suficiente
            const nuevoStock = insumo.stock - parseInt(cantidad);
            if (nuevoStock < 0) {
                throw new Error('Stock insuficiente');
            }
            return await this.actualizarStock(id, nuevoStock);
        } catch (error) {
            console.error('Error al descontar stock:', error);
            throw error;
        }
    }

    // Determina el estado del insumo según su stock
    determinarEstado(stock, stockMinimo) {
        if (stock <= stockMinimo) {
            return 'bajo_stock';
        } else if (stock === 0) {
            return 'sin_stock';
        } else {
            return 'disponible';
        }
    }

    // Genera alertas para insumos con stock bajo
    async getAlertas() {
        try {
            const insumosConBajoStock = await this.getBajoStock();
            // Retorna datos relevantes para alertas
            return insumosConBajoStock.map(insumo => ({
                id: insumo.id,
                nombre: insumo.nombre,
                stockActual: insumo.stock,
                stockMinimo: insumo.stockMinimo,
                estado: insumo.estado,
                proveedor: insumo.proveedor
            }));
        } catch (error) {
            console.error('Error al obtener alertas:', error);
            return [];
        }
    }

    // Actualiza un insumo existente
    async update(id, datosActualizados) {
        try {
            const insumos = await this.getAll();
            const index = insumos.findIndex(insumo => insumo.id === parseInt(id));
            // Verifica si el insumo existe
            if (index === -1) {
                throw new Error('Insumo no encontrado');
            }
            // Recalcula el estado si se actualiza el stock
            if (datosActualizados.stock !== undefined) {
                datosActualizados.estado = this.determinarEstado(
                    parseInt(datosActualizados.stock),
                    datosActualizados.stockMinimo || insumos[index].stockMinimo
                );
                datosActualizados.ultimaActualizacion = new Date().toISOString();
            }
            // Actualiza los datos del insumo
            insumos[index] = { ...insumos[index], ...datosActualizados };
            await this.saveAll(insumos);
            return insumos[index];
        } catch (error) {
            console.error('Error al actualizar insumo:', error);
            throw error;
        }
    }

    // Elimina un insumo
    async delete(id) {
        try {
            const insumos = await this.getAll();
            const insumosFiltrados = insumos.filter(insumo => insumo.id !== parseInt(id));
            // Verifica si el insumo existía
            if (insumos.length === insumosFiltrados.length) {
                throw new Error('Insumo no encontrado');
            }
            // Guarda los cambios en el archivo JSON
            await this.saveAll(insumosFiltrados);
            return true;
        } catch (error) {
            console.error('Error al eliminar insumo:', error);
            throw error;
        }
    }

    // Guarda todos los insumos en el archivo JSON
    async saveAll(insumos) {
        try {
            const data = JSON.stringify({ insumos }, null, 2);
            await fs.writeFile(this.filePath, data, 'utf8');
        } catch (error) {
            console.error('Error al guardar insumos:', error);
            throw error;
        }
    }
}

module.exports = Insumo;