import Producto from "../models/Producto.js";

class ProductosController {

  // GET /api/productos
  async getAll(req, res) {
    try {
      const productos = await Producto.find(); // Todos los productos desde Mongo
      res.json({
        success: true,
        data: productos,
        total: productos.length
      });
    } catch (error) {
      console.error("Error en getAll productos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los productos",
        error: error.message
      });
    }
  }

  // GET /api/productos/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await Producto.findById(id); // Busca por ObjectId
      if (!producto) {
        return res.status(404).json({ success: false, message: "Producto no encontrado" });
      }
      res.json({ success: true, data: producto });
    } catch (error) {
      console.error("Error en getById producto:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el producto",
        error: error.message
      });
    }
  }

  // POST /api/productos
  async create(req, res) {
    try {
      const { nombre, precio, stock } = req.body;

      // Validaciones adicionales si fuera necesario
      if (!nombre || precio === undefined || stock === undefined) {
        return res.status(400).json({ success: false, message: "Nombre, precio y stock son obligatorios" });
      }

      const producto = new Producto({
        nombre,
        precio,
        stock
      });

      const nuevoProducto = await producto.save(); // Guarda en Mongo
      res.status(201).json({
        success: true,
        message: "Producto creado exitosamente",
        data: nuevoProducto
      });
    } catch (error) {
      console.error("Error en create producto:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear el producto",
        error: error.message
      });
    }
  }

  // PUT /api/productos/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;

      const productoExistente = await Producto.findById(id);
      if (!productoExistente) {
        return res.status(404).json({ success: false, message: "Producto no encontrado" });
      }

      // Actualiza campos permitidos
      if (datosActualizados.nombre !== undefined) productoExistente.nombre = datosActualizados.nombre;
      if (datosActualizados.precio !== undefined) productoExistente.precio = datosActualizados.precio;
      if (datosActualizados.stock !== undefined) productoExistente.stock = datosActualizados.stock;

      const productoActualizado = await productoExistente.save(); // Guarda cambios
      res.json({
        success: true,
        message: "Producto actualizado exitosamente",
        data: productoActualizado
      });
    } catch (error) {
      console.error("Error en update producto:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar el producto",
        error: error.message
      });
    }
  }

  // DELETE /api/productos/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await Producto.findByIdAndDelete(id); // Borra por ObjectId
      if (!eliminado) {
        return res.status(404).json({ success: false, message: "Producto no encontrado" });
      }
      res.json({ success: true, message: "Producto eliminado exitosamente" });
    } catch (error) {
      console.error("Error en delete producto:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar el producto",
        error: error.message
      });
    }
  }
}

export default ProductosController;