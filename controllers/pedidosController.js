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
      // Usar lean() para pasar objetos JS simples a Pug
      const pedidos = await this.pedidoModel.find().sort({ numeroOrden: -1 }).lean(); 
      // Mapear cliente para la vista si existe
      pedidos.forEach(p => {
        p.nombreCliente = p.cliente?.nombre || 'N/A'; // Mostrar N/A si no hay cliente
      });
      res.render("pedidos/index", { page: "pedidos", pedidos });
    } catch (error) {
      console.error("Error al renderizar pedidos:", error);
      res.status(500).render("error", { error: "Error al cargar pedidos", code: 500 });
    }
  }

  //Renderiza formulario para nuevo pedido
  async renderNuevo(req, res) {
    try {
      // Usar lean() para pasar objetos JS simples a Pug
      const productos = await Producto.find({ stock: true }).lean(); // Solo productos en stock
      res.render("pedidos/nuevo", { page: "pedidos", productos });
    } catch (error) {
      console.error("Error al cargar formulario nuevo pedido:", error);
      res.status(500).render("error", { error: "Error al cargar formulario de pedido", code: 500 });
    }
  }

  // Crea pedido nuevo (recibe datos del fetch del Pug original)
  async create(req, res) {
    // Log inicial MUY IMPORTANTE
    console.log("[PedidosController CREATE] Inicio - Datos recibidos:", JSON.stringify(req.body, null, 2)); 
    
    try {
      // Extraemos datos como los envía el script fetch original
      const { 
        tipo, 
        plataforma, 
        items: itemsDesdeFetch, // Objeto { "ID_PRODUCTO": { cantidad: X } }
        nombreCliente, 
        telefonoCliente, // Nombre que envía el fetch
        direccionCliente, // Nombre que envía el fetch
        total: totalDesdeFetch // Total calculado por JS (lo recalcularemos)
      } = req.body;

      // --- Validación INICIAL ---
      if (!tipo || !plataforma) {
         console.error("[PedidosController CREATE] Validación Fallida: Falta tipo o plataforma.");
         return res.status(400).json({ success: false, message: 'Tipo y Plataforma son requeridos.' });
      }
      if (tipo === "delivery" && (!nombreCliente || !telefonoCliente || !direccionCliente)) {
        console.error("[PedidosController CREATE] Validación Fallida: Faltan datos de delivery.");
        return res.status(400).json({ success: false, message: 'Nombre, teléfono y dirección son requeridos para delivery.' });
      }
      if (typeof itemsDesdeFetch !== 'object' || itemsDesdeFetch === null || Object.keys(itemsDesdeFetch).length === 0) {
        console.error("[PedidosController CREATE] Validación Fallida: No se seleccionaron items o formato incorrecto.");
        return res.status(400).json({ success: false, message: 'Debe seleccionar al menos un producto.' });
      }
      // --- FIN Validación INICIAL ---


      // --- Transformación de items ---
      console.log("[PedidosController CREATE] Iniciando transformación de items...");
      const idsProductosSeleccionados = Object.keys(itemsDesdeFetch);
      console.log("[PedidosController CREATE] IDs de productos seleccionados:", idsProductosSeleccionados);
      
      const productosEncontrados = await Producto.find({ 
          '_id': { $in: idsProductosSeleccionados } 
      }).lean(); 
      console.log("[PedidosController CREATE] Productos encontrados en BD:", productosEncontrados.length);


      if (productosEncontrados.length !== idsProductosSeleccionados.length) {
         const encontradosIds = productosEncontrados.map(p => p._id.toString());
         const faltantes = idsProductosSeleccionados.filter(id => !encontradosIds.includes(id));
         console.error("[PedidosController CREATE] Error Crítico: Productos NO encontrados:", faltantes);
         return res.status(400).json({ success: false, message: `Error: No se encontraron los siguientes productos: ${faltantes.join(', ')}.` });
      }

      let totalCalculadoBackend = 0;
      const itemsParaGuardar = productosEncontrados.map(producto => {
        const idStr = producto._id.toString();
        const cantidad = parseInt(itemsDesdeFetch[idStr]?.cantidad) || 1; 
        const precioUnitario = producto.precio; 
        
        if (typeof precioUnitario !== 'number' || isNaN(precioUnitario)) {
             const errorMsg = `Precio inválido para el producto "${producto.nombre}" (ID: ${idStr}). Precio recibido: ${producto.precio}`;
             console.error(`[PedidosController CREATE] ${errorMsg}`);
             throw new Error(errorMsg); 
        }

        const subtotal = cantidad * precioUnitario;
        totalCalculadoBackend += subtotal; 

        if (!producto.nombre || isNaN(cantidad) || isNaN(subtotal)) {
             const errorMsg = `Datos inválidos para item del producto ID ${idStr}`;
             console.error(`[PedidosController CREATE] ${errorMsg}`, {nombre: producto.nombre, cantidad, precioUnitario, subtotal});
             throw new Error(errorMsg);
        }
        
        console.log(`[PedidosController CREATE] Item procesado: ${producto.nombre} x${cantidad} ($${precioUnitario}) = $${subtotal}`);

        return {
          nombre: producto.nombre,
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          subtotal: subtotal,
        };
      });
      console.log(`[PedidosController CREATE] Total calculado en backend: ${totalCalculadoBackend}`);
      // --- Fin de la Transformación ---

      const ultimo = await this.pedidoModel.findOne().sort({ numeroOrden: -1 }).lean(); 
      const numeroOrden = ultimo ? ultimo.numeroOrden + 1 : 1;
      console.log(`[PedidosController CREATE] Asignando numeroOrden: ${numeroOrden}`);


      const datosPedido = {
         numeroOrden, 
         tipo,
         plataforma, 
         cliente: tipo === "delivery" ? { 
             nombre: nombreCliente,
             telefono: telefonoCliente, 
             direccion: direccionCliente 
         } : undefined, 
         items: itemsParaGuardar, 
         total: totalCalculadoBackend, 
         estado: "pendiente", 
      };

      console.log("[PedidosController CREATE] Objeto final listo para .save():", JSON.stringify(datosPedido, null, 2)); 

      const nuevoPedido = new this.pedidoModel(datosPedido);
      const pedidoGuardado = await nuevoPedido.save(); 

      console.log("[PedidosController CREATE] ÉXITO - Pedido guardado:", pedidoGuardado._id);

      res.status(201).json({ success: true, data: pedidoGuardado });

    } catch (error) {
      console.error("❌ [PedidosController CREATE] Ha ocurrido un error:", error.name, error.message); 

      if (error.name === 'ValidationError') {
            console.error("❌ Detalle Validación Mongoose:", error.errors);
            const mensajesError = Object.values(error.errors).map(err => `${err.path}: ${err.message}`).join('; ');
            return res.status(400).json({ success: false, message: `Error de Validación: ${mensajesError}` });
      } else if (error instanceof Error && error.message.startsWith('Precio inválido')) {
           return res.status(400).json({ success: false, message: error.message });
      }
      
      console.error("❌ Stack del Error:", error.stack); 
      res.status(500).json({ 
          success: false, 
          message: error.message || "Error interno del servidor al crear el pedido. Revisa la consola del servidor.", 
      });
    }
  }


  //Renderiza formulario de edición
  async renderEditar(req, res) {
    try {
      const pedido = await this.pedidoModel.findById(req.params.id).lean();
      if (!pedido) {
        return res.status(404).render("error", { error: "Pedido no encontrado", code: 404 });
      }
      
      const productos = await Producto.find({ stock: true }).lean(); // Solo productos en stock
      const datosCliente = pedido.cliente || {};

      // Mapear los items del pedido guardado para facilitar la selección en Pug
      const itemsPedidoMap = pedido.items.reduce((map, item) => {
          const productoOriginal = productos.find(p => p.nombre === item.nombre);
          if (productoOriginal) {
              // Usar _id como clave en el mapa
              map[productoOriginal._id.toString()] = { cantidad: item.cantidad };
          } else {
              console.warn(`[renderEditar] Producto "${item.nombre}" del pedido ${pedido.numeroOrden} no encontrado en productos activos.`);
          }
          return map;
      }, {});


      res.render("pedidos/editar", { 
          page: "pedidos", 
          pedido: { 
              ...pedido,
              nombreCliente: datosCliente.nombre,
              telefonoCliente: datosCliente.telefono, 
              direccionCliente: datosCliente.direccion,
              itemsMap: itemsPedidoMap // Pasamos el mapa para marcar los checkboxes
          }, 
          productos 
      });
    } catch (error) {
      console.error("Error al cargar formulario de edición:", error);
      res.status(500).render("error", { error: "Error al cargar pedido para editar", code: 500 });
    }
  }

  // Actualiza pedido (recibe datos del fetch del Pug de editar)
  async update(req, res) {
      // SOLUCIÓN (1/3): Log inicial
      console.log("[PedidosController UPDATE] Inicio - Datos recibidos:", JSON.stringify(req.body, null, 2)); 
      try {
          const { id } = req.params; // Obtenemos el ID de los parámetros de la URL
           // Validar que el ID sea un ObjectId válido antes de buscar
          if (!mongoose.Types.ObjectId.isValid(id)) {
                console.error(`[PedidosController UPDATE] Error: ID inválido recibido: ${id}`);
                return res.status(400).json({ success: false, message: "El ID del pedido proporcionado no es válido." });
          }

          const { 
              tipo, plataforma, items: itemsDesdeFetch, 
              nombreCliente, telefonoCliente, direccionCliente, 
              estado, tiempoEstimado, observaciones 
          } = req.body;

          // Buscamos el pedido existente
          const pedido = await this.pedidoModel.findById(id);
          if (!pedido) {
               console.error(`[PedidosController UPDATE] Error: Pedido ${id} no encontrado.`);
              return res.status(404).json({ success: false, message: "Pedido no encontrado para actualizar" });
          }

          // --- SOLUCIÓN (2/3): Transformación de items (igual que en create) ---
           console.log("[PedidosController UPDATE] Iniciando transformación de items...");
           const idsProductosSeleccionados = Object.keys(itemsDesdeFetch || {}); // Manejar caso sin items
           let itemsParaActualizar = [];
           let totalCalculadoBackend = 0;

           if (idsProductosSeleccionados.length > 0) {
                const productosEncontrados = await Producto.find({ '_id': { $in: idsProductosSeleccionados } }).lean();
                console.log("[PedidosController UPDATE] Productos encontrados en BD:", productosEncontrados.length);

                if (productosEncontrados.length !== idsProductosSeleccionados.length) {
                    const encontradosIds = productosEncontrados.map(p => p._id.toString());
                    const faltantes = idsProductosSeleccionados.filter(id => !encontradosIds.includes(id));
                    console.error("[PedidosController UPDATE] Error Crítico: Productos NO encontrados:", faltantes);
                    return res.status(400).json({ success: false, message: `Error: No se encontraron los siguientes productos para actualizar: ${faltantes.join(', ')}.` });
                }

                itemsParaActualizar = productosEncontrados.map(producto => {
                    const idStr = producto._id.toString();
                    const cantidad = parseInt(itemsDesdeFetch[idStr]?.cantidad) || 1;
                    const precioUnitario = producto.precio;
                    
                    if (typeof precioUnitario !== 'number' || isNaN(precioUnitario)) {
                        const errorMsg = `Precio inválido para actualizar el producto "${producto.nombre}" (ID: ${idStr}). Precio: ${producto.precio}`;
                        console.error(`[PedidosController UPDATE] ${errorMsg}`);
                        throw new Error(errorMsg);
                    }

                    const subtotal = cantidad * precioUnitario;
                    totalCalculadoBackend += subtotal;

                    if (!producto.nombre || isNaN(cantidad) || isNaN(subtotal)) {
                         const errorMsg = `Datos inválidos para actualizar item del producto ID ${idStr}`;
                         console.error(`[PedidosController UPDATE] ${errorMsg}`, {nombre: producto.nombre, cantidad, precioUnitario, subtotal});
                        throw new Error(errorMsg);
                    }
                    console.log(`[PedidosController UPDATE] Item procesado: ${producto.nombre} x${cantidad} ($${precioUnitario}) = $${subtotal}`);
                    return { nombre: producto.nombre, cantidad, precioUnitario, subtotal };
                });
                console.log(`[PedidosController UPDATE] Total calculado en backend: ${totalCalculadoBackend}`);
           } else {
                // Si no se enviaron items o el objeto estaba vacío, vaciamos los items y el total
                console.log("[PedidosController UPDATE] No se recibieron items, se vaciará el pedido.");
                itemsParaActualizar = [];
                totalCalculadoBackend = 0;
           }
          // --- Fin Transformación ---

          // Actualizar campos del pedido existente
          if(tipo !== undefined) pedido.tipo = tipo;
          if(plataforma !== undefined) pedido.plataforma = plataforma;
          if(estado !== undefined) pedido.estado = estado;
          pedido.tiempoEstimado = tiempoEstimado !== undefined && !isNaN(parseInt(tiempoEstimado)) 
              ? parseInt(tiempoEstimado) 
              : pedido.tiempoEstimado; 
          pedido.observaciones = observaciones !== undefined ? observaciones : pedido.observaciones;
          
          // Actualizamos items y total con los datos procesados
          pedido.items = itemsParaActualizar; 
          pedido.total = totalCalculadoBackend; 

          // Actualizar cliente anidado
          if (pedido.tipo === "delivery") {
               if (!pedido.cliente) pedido.cliente = {}; 
               if(nombreCliente !== undefined) pedido.cliente.nombre = nombreCliente;
               if(telefonoCliente !== undefined) pedido.cliente.telefono = telefonoCliente; 
               if(direccionCliente !== undefined) pedido.cliente.direccion = direccionCliente; 
          } else {
               pedido.cliente = undefined; 
          }

          console.log("[PedidosController UPDATE] Datos listos para actualizar:", JSON.stringify(pedido.toObject(), null, 2)); 

          const pedidoActualizado = await pedido.save(); // Intentamos guardar los cambios

           console.log("[PedidosController UPDATE] ÉXITO - Pedido actualizado:", pedidoActualizado._id);

          // SOLUCIÓN (3/3): Respondemos JSON al fetch
          res.json({ success: true, data: pedidoActualizado });

      } catch (error) {
           // Manejo de errores mejorado, respondiendo JSON
           console.error("❌ [PedidosController UPDATE] Ha ocurrido un error:", error.name, error.message); 

           if (error.name === 'ValidationError') {
              console.error("❌ Detalle Validación Mongoose al Actualizar:", error.errors);
              const mensajesError = Object.values(error.errors).map(err => `${err.path}: ${err.message}`).join('; ');
               return res.status(400).json({ success: false, message: `Error de Validación al actualizar: ${mensajesError}` });
          } else if (error instanceof Error && error.message.startsWith('Precio inválido')) {
               return res.status(400).json({ success: false, message: error.message });
          }
           
           console.error("❌ Stack del Error al Actualizar:", error.stack); 
           res.status(500).json({ 
               success: false, 
               message: error.message || "Error interno del servidor al actualizar el pedido.", 
          });
          // NO usamos res.redirect()
      }
  }


  // Elimina pedido (responde JSON para el fetch)
  async delete(req, res) {
    try {
      const { id } = req.params; // ID viene de la URL
      console.log(`[PedidosController DELETE] Intentando eliminar pedido ID: ${id}`);

      // Validar ObjectId ANTES de consultar
       if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`[PedidosController DELETE] Error: ID inválido recibido: ${id}`);
            return res.status(400).json({ success: false, message: "El ID del pedido proporcionado no es válido." });
       }
       
      const eliminado = await this.pedidoModel.findByIdAndDelete(id);

      if(!eliminado){
          console.error(`[PedidosController DELETE] Error: Pedido ${id} no encontrado.`);
          return res.status(404).json({ success: false, message: "Pedido no encontrado para eliminar" });
      }

      console.log(`[PedidosController DELETE] Pedido ${id} eliminado exitosamente.`);
       res.json({ success: true, message: "Pedido eliminado correctamente", data: eliminado });

    } catch (error) {
      console.error("❌ [PedidosController DELETE] Error:", error.message, error); 
       res.status(500).json({ 
           success: false, 
           message: "Error interno del servidor al eliminar el pedido.", 
           error: error.message 
       });
    }
  }

    // --- MÉTODOS ADICIONALES PARA API REST (usados por routes/pedidos.js) ---
    async getAll(req, res) {
        try {
            const pedidos = await this.pedidoModel.find().sort({ numeroOrden: -1 }).lean(); 
            res.json({ success: true, total: pedidos.length, data: pedidos });
        } catch (error) {
            console.error("Error API getAll Pedidos:", error);
            res.status(500).json({ success: false, message: "Error al obtener pedidos" });
        }
    }

    async getById(req, res) {
        try {
             // Validar ObjectId ANTES de consultar
             if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ success: false, message: "El ID del pedido proporcionado no es válido." });
             }
            const pedido = await this.pedidoModel.findById(req.params.id).lean(); 
            if (!pedido) {
                return res.status(404).json({ success: false, message: "Pedido no encontrado" });
            }
            res.json({ success: true, data: pedido });
        } catch (error) {
            console.error("Error API getById Pedido:", error);
            res.status(500).json({ success: false, message: "Error al obtener el pedido" });
        }
    }
}

// SOLUCIÓN: Necesitamos importar mongoose para usar mongoose.Types.ObjectId
import mongoose from "mongoose";

export default PedidosController;