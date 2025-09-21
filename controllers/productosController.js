import ProductoModel from '../models/Producto.js'; // Importa el modelo de Producto para manejar datos

class ProductosController { // Clase del controlador: lógica para rutas de productos
    constructor() { // Constructor inicializa el modelo
        this.productoModel = new ProductoModel(); // Instancia del modelo para acceder a métodos
    }

    async getAll(req, res) { // Obtiene todos los productos: GET /
        try {
            const productos = await this.productoModel.getAll(); // Llama al modelo para array de productos
            res.json({ // Respuesta JSON exitosa
                success: true,
                data: productos,
                total: productos.length // Incluye conteo
            });
        } catch (error) {
            console.error('Error en getAll productos:', error); // Log del error
            res.status(500).json({ // Error 500
                success: false,
                message: 'Error al obtener los productos',
                error: error.message
            });
        }
    }
    
    async getById(req, res) { // Obtiene producto por ID: GET /:id
        try {
            const { id } = req.params; // Extrae ID
            const producto = await this.productoModel.getById(id); // Busca en modelo
            if (!producto) { // Si no encontrado
                return res.status(404).json({ // 404
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            res.json({ // Éxito
                success: true,
                data: producto
            });
        } catch (error) {
            console.error('Error en getById producto:', error); // Log
            res.status(500).json({ // 500
                success: false,
                message: 'Error al obtener el producto',
                error: error.message
            });
        }
    }

    async create(req, res) { // Crea nuevo producto: POST /
        try {
            const datosProducto = req.body; // Datos del body
    
            // Convertir stock a boolean si viene del formulario
            if (typeof datosProducto.stock === 'string') {
                datosProducto.stock = datosProducto.stock === 'true';
            }
    
            // Validación de campos obligatorios
            if (!datosProducto.nombre || !datosProducto.precio || datosProducto.stock === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, precio y stock son obligatorios'
                });
            }
    
            const nuevoProducto = await this.productoModel.create(datosProducto); // Crea en modelo
    
            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: nuevoProducto
            });
        } catch (error) {
            console.error('Error en create producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el producto',
                error: error.message
            });
        }
    }

    async update(req, res) { // Actualiza producto: PUT /:id
        try {
            const { id } = req.params; // ID
            const datosActualizados = req.body; // Datos
            if (typeof datosActualizados.stock === 'string') {
                datosActualizados.stock = datosActualizados.stock === 'true';
            }
    
            console.log(datosActualizados)
            const productoExistente = await this.productoModel.getById(id); // Verifica existencia
            if (!productoExistente) {
                return res.status(404).json({ // 404
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            const productoActualizado = await this.productoModel.update(id, datosActualizados); // Actualiza
            res.json({ // Éxito
                success: true,
                message: 'Producto actualizado exitosamente',
                data: productoActualizado
            });
        } catch (error) {
            console.error('Error en update producto:', error); // Log
            res.status(500).json({ // 500
                success: false,
                message: 'Error al actualizar el producto',
                error: error.message
            });
        }
    }

    async delete(req, res) { // Elimina producto: DELETE /:id
    try {
      const { id } = req.params; // ID
      await this.productoModel.delete(id); // Llama a modelo (no retorna data en este caso)
      res.json({ // Éxito simple
        success: true,
        message: 'Producto eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error en delete producto:', error); // Log
      if (error.message === 'Producto no encontrado') { // 404
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        });
      } else {
        res.status(500).json({ // 500
          success: false,
          message: 'Error al eliminar el producto',
          error: error.message,
        });
      }
    }
  }
}

export default ProductosController; // Exporta clase