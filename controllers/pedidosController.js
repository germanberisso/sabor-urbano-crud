import Pedido from "../models/Pedido.js"; // Modelo Mongoose
import Producto from "../models/Producto.js"; // Para obtener productos disponibles
import ValidationMiddleware from "../middleware/validation.js"; 

class PedidosController {
  constructor() {
    this.pedidoModel = Pedido;
  }

  // Renderiza listado de pedidos (vista principal)
  async renderIndex(req, res) {
    try {
      const pedidos = await this.pedidoModel.find().sort({ numeroOrden: -1 });
      res.render("pedidos/index", { page: "pedidos", pedidos });
    } catch (error) {
      console.error("Error al renderizar pedidos:", error);
      res.status(500).render("error", { error: "Error al cargar pedidos", code: 500 });
    }
  }

  //Renderiza formulario para nuevo pedido
  async renderNuevo(req, res) {
    try {
      const productos = await Producto.find(); // Para mostrar en el form
      res.render("pedidos/nuevo", { page: "pedidos", productos });
    } catch (error) {
      console.error("Error al cargar formulario nuevo pedido:", error);
      res.status(500).render("error", { error: "Error al cargar formulario de pedido", code: 500 });
    }
  }

  // Crea pedido nuevo (desde Pug o API)
  async create(req, res) {
    try {
      const { tipo, nombreCliente, telefono, direccion, items } = req.body;

      // Validación básica (también podrías usar tu middleware)
      if (!tipo || (tipo === "delivery" && (!nombreCliente || !telefono || !direccion))) {
        return res.status(400).render("error", {
          error: "Faltan datos requeridos para delivery",
          code: 400,
        });
      }

      // Obtiene el último número de orden para hacer el nuevo incremental
      const ultimo = await this.pedidoModel.findOne().sort({ numeroOrden: -1 });
      const numeroOrden = ultimo ? ultimo.numeroOrden + 1 : 1;

      // Crea el pedido
      const nuevoPedido = new this.pedidoModel({
        numeroOrden,
        tipo,
        nombreCliente: tipo === "delivery" ? nombreCliente : null,
        telefono: tipo === "delivery" ? telefono : null,
        direccion: tipo === "delivery" ? direccion : null,
        items,
        estado: "pendiente",
        fecha: new Date(),
      });

      await nuevoPedido.save();

      res.redirect("/pedidos");
    } catch (error) {
      console.error("Error al crear pedido:", error);
      res.status(500).render("error", { error: "Error al crear pedido", code: 500 });
    }
  }

  //Renderiza formulario de edición
  async renderEditar(req, res) {
    try {
      const pedido = await this.pedidoModel.findById(req.params.id);
      const productos = await Producto.find();

      if (!pedido) {
        return res.status(404).render("error", { error: "Pedido no encontrado", code: 404 });
      }

      res.render("pedidos/editar", { page: "pedidos", pedido, productos });
    } catch (error) {
      console.error("Error al cargar edición:", error);
      res.status(500).render("error", { error: "Error al cargar pedido", code: 500 });
    }
  }

  //Actualiza pedido
  async update(req, res) {
    try {
      const { id } = req.params;
      const { tipo, nombreCliente, telefono, direccion, items, estado } = req.body;

      const pedido = await this.pedidoModel.findById(id);
      if (!pedido) {
        return res.status(404).render("error", { error: "Pedido no encontrado", code: 404 });
      }

      pedido.tipo = tipo;
      pedido.nombreCliente = tipo === "delivery" ? nombreCliente : null;
      pedido.telefono = tipo === "delivery" ? telefono : null;
      pedido.direccion = tipo === "delivery" ? direccion : null;
      pedido.items = items;
      pedido.estado = estado;

      await pedido.save();
      res.redirect("/pedidos");
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      res.status(500).render("error", { error: "Error al actualizar pedido", code: 500 });
    }
  }

  // Elimina pedido
  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.pedidoModel.findByIdAndDelete(id);
      res.redirect("/pedidos");
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      res.status(500).render("error", { error: "Error al eliminar pedido", code: 500 });
    }
  }
}

export default PedidosController;