import { promises as fs } from 'fs'; // Importa promesas de fs para I/O asíncrono
import { join, dirname } from 'path'; // Para manejar rutas
import { fileURLToPath } from 'url'; // Para ruta actual en ES6

class Producto {
    constructor() { // Constructor inicializa la ruta al archivo JSON de productos
        const __filename = fileURLToPath(import.meta.url); // Archivo actual
        const __dirname = dirname(__filename); // Directorio actual
        this.filePath = join(__dirname, '../data/productos.json'); // Ruta completa al JSON
    }

    async getAll() { // Obtiene todos los productos del JSON
        try {
            const data = await fs.readFile(this.filePath, 'utf8'); // Lee archivo
            const json = JSON.parse(data); // Parsea JSON
            return json.productos || []; // Retorna array o vacío
        } catch (error) {
            console.error('Error al leer productos:', error); // Log error
            return []; // Vacío en error
        }
    }

    async getById(id) { // Busca productos por ID
        try {
            const productos = await this.getAll(); // Todos los productos
            return productos.find(producto => producto.id === parseInt(id)); // Encuentra y retorna, null si no
        } catch (error) {
            console.error('Error al obtener producto por ID:', error); // Log
            return null; // Null en error
        }
    }

    
    async create(nuevoProducto) { // Crea nuevo producto
        const data = await fs.readFile(this.filePath, 'utf-8');
        const json = JSON.parse(data);
        const productos = json.productos || [];
      
        const id = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;
      
        const producto = { 
          id,
          nombre: nuevoProducto.nombre,
          precio: Number(nuevoProducto.precio),
          stock: nuevoProducto.stock === 'true' || nuevoProducto.stock === true
        };
      
        productos.push(producto);
      
        // ⚠️ Guardar con la clave "productos"
        await fs.writeFile(this.filePath, JSON.stringify({ productos }, null, 2));
      
        return producto;
    }

    async actualizarStock(id, nuevoStock) { // Actualiza stock de un producto a un valor absoluto
        try {
            const productos = await this.getAll(); // Todos
            const index = productos.findIndex(producto => producto.id === parseInt(id)); // Índice
            if (index === -1) { // No encontrado
                throw new Error('Producto no encontrado');
            }
            const estado = !producto[index].stock; // Nuevo stock
            console.log("ESTADO ", estado)
            productos[index] = { // Actualiza objeto
                ...productos[index],
                stock: estado
            };
            await this.saveAll(productos); // Guarda
            return productos[index]; // Retorna actualizado
        } catch (error) {
            console.error('Error al actualizar stock:', error); // Log
            throw error;
        }
    }

    async update(id, datosActualizados) { // Actualiza campos de un producto
        try {
            const productos = await this.getAll(); // Todos
            const index = productos.findIndex(producto => producto.id === parseInt(id)); // Índice
            console.log("producto", productos[index])
            if (index === -1) { // No encontrado
                throw new Error('Producto no encontrado');
            }
            productos[index] = { ...productos[index], ...datosActualizados }; // Fusiona
            await this.saveAll(productos); // Guarda
            return productos[index]; // Retorna
        } catch (error) {
            console.error('Error al actualizar producto:', error); // Log
            throw error;
        }
    }

    async delete(id) { // Elimina un producto por ID
        try {
            const productos = await this.getAll(); // Todos
            const productosFiltrados = productos.filter(producto => producto.id !== parseInt(id)); // Filtra sin el ID
            if (productos.length === productosFiltrados.length) { // Si no se eliminó nada
                throw new Error('producto no encontrado');
            }
            await this.saveAll(productosFiltrados); // Guarda filtrados
            return true; // Confirma eliminación
        } catch (error) {
            console.error('Error al eliminar producto:', error); // Log
            throw error;
        }
    }

    async saveAll(productos) { // Guarda array completo en JSON
        try {
            const data = JSON.stringify({ productos }, null, 2); // Formatea JSON
            await fs.writeFile(this.filePath, data, 'utf8'); // Escribe
        } catch (error) {
            console.error('Error al guardar productos:', error); // Log
            throw error;
        }
    }
}

export default Producto; // Exporta clase