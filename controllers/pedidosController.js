// controllers/pedidosController.js
import PedidoModel from "../models/Pedido.js";
import ProductoModel from "../models/Producto.js";

class PedidosController {
  constructor() {
    this.pedidoModel = new PedidoModel();
    this.productoModel = new ProductoModel();
  }

  // ------------------ MÉTODOS API ------------------

  async getAll(req, res) {
    try {
      const pedidos = await this.pedidoModel.getAll();
      res.json({ success: true, data: pedidos, total: pedidos.length });
    } catch (error) {
      console.error("Error en getAll pedidos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener pedidos",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const pedido = await this.pedidoModel.getById(id);
      if (!pedido)
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });
      res.json({ success: true, data: pedido });
    } catch (error) {
      console.error("Error en getById pedido:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener pedido",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    // try {
    //     const { productos: productosIds, tipo, plataforma, total, nombreCliente, telefonoCliente, direccionCliente } = req.body;
    //     console.log(productosIds, tipo, plataforma, total)
    //     if (!productosIds || !tipo || !plataforma || !total) {
    //       return res.status(400).json({ success: false, message: 'Campos requeridos faltantes' });
    //     }

    //     // Asegurarse de que productosIds sea array
    //     const idsArray = Array.isArray(productosIds) ? productosIds : [productosIds];

    //     // Construir items con cantidad
    //     const items = [];
    //     const productosSeleccionados = await Promise.all(idsArray.map(id => this.productoModel.getById(parseInt(id))));

    //     productosSeleccionados.forEach(p => {
    //       const cantidad = parseInt(req.body[`cantidad-${p.id}`]) || 1;
    //       items.push({ producto: p.nombre, precio: p.precio, cantidad });
    //     });

    //     const itemsText = items.map(i => `${i.cantidad} x ${i.producto}`).join(', ');

    //     // Cliente si es delivery
    //     let cliente = {};
    //     if (tipo === 'delivery') {
    //       if (!nombreCliente || !telefonoCliente || !direccionCliente) {
    //         return res.status(400).json({ success: false, message: 'Faltan datos de cliente para delivery' });
    //       }
    //       cliente = { nombre: nombreCliente, telefono: telefonoCliente, direccion: direccionCliente };
    //     }

    //     const nuevoPedido = await this.pedidoModel.create({ items, itemsText, total, tipo, plataforma, cliente });
    //     res.status(201).json({ success: true, message: 'Pedido creado', data: nuevoPedido });

    //   } catch (error) {
    //     console.error('Error al crear pedido:', error);
    //     res.status(500).json({ success: false, message: 'Error al crear pedido', error: error.message });
    //   }
    try {
      const {
        items: itemsBody,
        tipo,
        plataforma,
        nombreCliente,
        telefonoCliente,
        direccionCliente,
      } = req.body;
      if (!itemsBody || !tipo || !plataforma) {
        return res
          .status(400)
          .json({ success: false, message: "Campos requeridos faltantes" });
      }

      // Construir array de items con nombre, precio y cantidad
      const items = [];
      let total = 0;
      for (const id in itemsBody) {
        // Verifica que el checkbox esté marcado
        if (itemsBody[id].seleccionado) {
          const producto = await this.productoModel.getById(parseInt(id));
          if (!producto) continue;

          const cantidad = parseInt(itemsBody[id].cantidad) || 1;
          const precio = Number(producto.precio); // asegurar número
          items.push({
            id: producto.id,
            producto: producto.nombre,
            precio,
            cantidad,
          });
          total += precio * cantidad;
        }
      }

      if (items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Debe seleccionar al menos un producto",
        });
      }

      const itemsText = items
        .map((i) => `${i.cantidad} x ${i.producto}`)
        .join(", ");

      // Cliente si es delivery
      let cliente = {};
      if (tipo === "delivery") {
        if (!nombreCliente || !telefonoCliente || !direccionCliente) {
          return res.status(400).json({
            success: false,
            message: "Faltan datos de cliente para delivery",
          });
        }
      }

      const nuevoPedido = await this.pedidoModel.create({
        items,
        itemsText,
        total,
        tipo,
        plataforma,
        nombreCliente,
        telefonoCliente,
        direccionCliente,
      });

      res.status(201).json({
        success: true,
        message: "Pedido creado exitosamente",
        data: nuevoPedido,
      });
    } catch (error) {
      console.error("Error al crear pedido:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear pedido",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        items: itemsBody,
        tipo,
        plataforma,
        nombreCliente,
        telefonoCliente,
        direccionCliente,
      } = req.body;

      const pedidoExistente = await this.pedidoModel.getById(id);
      if (!pedidoExistente)
        return res
          .status(404)
          .json({ success: false, message: "Pedido no encontrado" });

      if (!itemsBody || !tipo || !plataforma) {
        return res
          .status(400)
          .json({ success: false, message: "Campos requeridos faltantes" });
      }

      // Reconstruir array de items y calcular total
      const items = [];
      let total = 0;
      for (const itemId in itemsBody) {
        if (itemsBody[itemId].seleccionado) {
          const producto = await this.productoModel.getById(parseInt(itemId));
          if (!producto) continue;
          const cantidad = parseInt(itemsBody[itemId].cantidad) || 1;
          const precio = Number(producto.precio);
          items.push({
            id: producto.id,
            producto: producto.nombre,
            precio,
            cantidad,
          });
          total += precio * cantidad;
        }
      }

      if (items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Debe seleccionar al menos un producto",
        });
      }

      const itemsText = items
        .map((i) => `${i.cantidad} x ${i.producto}`)
        .join(", ");

      // Datos del cliente si es delivery
      let cliente = {};
      if (tipo === "delivery") {
        if (!nombreCliente || !telefonoCliente || !direccionCliente) {
          return res.status(400).json({
            success: false,
            message: "Faltan datos de cliente para delivery",
          });
        }
      }

      const datosActualizados = {
        items,
        itemsText,
        total,
        tipo,
        plataforma,
        nombreCliente,
        telefonoCliente,
        direccionCliente,
      };

      const pedidoActualizado = await this.pedidoModel.update(
        id,
        datosActualizados
      );

      res.json({
        success: true,
        message: "Pedido actualizado exitosamente",
        data: pedidoActualizado,
      });
    } catch (error) {
      console.error("Error en update pedido:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar pedido",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.pedidoModel.delete(id);
      res.json({ success: true, message: "Pedido eliminado exitosamente" });
    } catch (error) {
      console.error("Error en delete pedido:", error);
      if (error.message === "Pedido no encontrado") {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al eliminar pedido",
          error: error.message,
        });
      }
    }
  }

  // ------------------ MÉTODOS VISTAS ------------------

  async renderIndex(req, res) {
    try {
      const pedidos = await this.pedidoModel.getAll();
      res.render("pedidos/index", { page: "pedidos", pedidos });
    } catch (error) {
      console.error("Error al renderizar index de pedidos:", error);
      res.status(500).send("Error al cargar la página");
    }
  }

  async renderNuevo(req, res) {
    try {
      const productos = await this.productoModel.getAll(); // Traer todos los productos
      res.render("pedidos/nuevo", { page: "pedidos", productos });
    } catch (error) {
      console.error("Error al renderizar nuevo pedido:", error);
      res.status(500).render("error", {
        error: "Error al cargar formulario de pedido",
        code: 500,
      });
    }
  }

  async renderEditar(req, res) {
    try {
      const { id } = req.params;
      const pedido = await this.pedidoModel.getById(id);
      if (!pedido) return res.status(404).send("Pedido no encontrado");

      const productos = await this.productoModel.getAll(); // Para poder editar productos
      res.render("pedidos/editar", { page: "pedidos", pedido, productos });
    } catch (error) {
      console.error("Error al renderizar editar pedido:", error);
      res.status(500).send("Error al cargar la página");
    }
  }
}

export default PedidosController;
