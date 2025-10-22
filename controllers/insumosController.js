import Insumo from "../models/Insumo.js";

class InsumosController {
  // Obtener todos los insumos
  async getAll(req, res) {
    try {
      const insumos = await Insumo.find().lean();
      res.json({ success: true, data: insumos });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener insumos", error });
    }
  }

  // Obtener por ID
  async getById(req, res) {
    try {
      const insumo = await Insumo.findById(req.params.id).lean();
      if (!insumo)
        return res
          .status(404)
          .json({ success: false, message: "Insumo no encontrado" });
      res.json({ success: true, data: insumo });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener insumo", error });
    }
  }

  // Crear nuevo insumo
  async create(req, res) {
    try {
      const { nombre, categoria, stock, stockMinimo, unidadMedida, proveedor } =
        req.body;

      const stockNumero = Number(stock);
      const stockMinimoNumero = Number(stockMinimo);

      if (Number.isNaN(stockNumero) || Number.isNaN(stockMinimoNumero)) {
        return res.status(400).json({
          success: false,
          message: "Stock y stock mínimo deben ser numéricos",
        });
      }

      const estado = determinarEstado(stockNumero, stockMinimoNumero);
      const nuevoInsumo = new Insumo({
        nombre,
        categoria,
        stock: stockNumero,
        stockMinimo: stockMinimoNumero,
        unidadMedida,
        proveedor,
        estado,
        ultimaActualizacion: new Date(),
      });
      const insumoGuardado = await nuevoInsumo.save();
      res.status(201).json({ success: true, data: insumoGuardado });
    } catch (error) {
      console.error("Error en InsumosController.create:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al crear insumo",
          error: error?.message || error,
        });
    }
  }

  // Actualizar campos
  async update(req, res) {
    try {
      const { id } = req.params;
      const datos = req.body;
      const insumo = await Insumo.findById(id);

      if (!insumo) {
        return res
          .status(404)
          .json({ success: false, message: "Insumo no encontrado" });
      }

      if (datos.nombre !== undefined) insumo.nombre = datos.nombre;
      if (datos.categoria !== undefined) insumo.categoria = datos.categoria;
      if (datos.unidadMedida !== undefined)
        insumo.unidadMedida = datos.unidadMedida;
      if (datos.proveedor !== undefined) insumo.proveedor = datos.proveedor;

      if (datos.stockMinimo !== undefined) {
        const stockMinimoNumero = Number(datos.stockMinimo);
        if (Number.isNaN(stockMinimoNumero)) {
          return res.status(400).json({
            success: false,
            message: "Stock mínimo debe ser numérico",
          });
        }
        insumo.stockMinimo = stockMinimoNumero;
      }

      if (datos.stock !== undefined) {
        const stockNumero = Number(datos.stock);
        if (Number.isNaN(stockNumero)) {
          return res.status(400).json({
            success: false,
            message: "Stock debe ser numérico",
          });
        }
        insumo.stock = stockNumero;
      }

      insumo.estado = determinarEstado(insumo.stock, insumo.stockMinimo);
      insumo.ultimaActualizacion = new Date();

      const insumoActualizado = await insumo.save();

      res.json({ success: true, data: insumoActualizado });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar insumo", error });
    }
  }

  // Eliminar
  async delete(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await Insumo.findByIdAndDelete(id);
      if (!eliminado)
        return res
          .status(404)
          .json({ success: false, message: "Insumo no encontrado" });
      res.json({ success: true, message: "Insumo eliminado correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar insumo", error });
    }
  }

  // Obtener insumos con bajo stock
  async getBajoStock(req, res) {
    try {
      const insumos = await Insumo.find({
        $expr: { $lte: ["$stock", "$stockMinimo"] },
      }).lean();
      res.json({ success: true, data: insumos });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener bajo stock",
        error,
      });
    }
  }

  // Obtener alertas
  async getAlertas(req, res) {
    try {
      const insumos = await Insumo.find({
        $expr: { $lte: ["$stock", "$stockMinimo"] },
      }).lean();
      const alertas = insumos.map((i) => ({
        id: i._id,
        nombre: i.nombre,
        stockActual: i.stock,
        stockMinimo: i.stockMinimo,
        estado: i.estado,
        proveedor: i.proveedor,
      }));
      res.json({ success: true, data: alertas });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener alertas", error });
    }
  }

  // Actualizar stock
  async actualizarStock(req, res) {
    try {
      const { id } = req.params;
      const { nuevoStock } = req.body;
      const insumo = await Insumo.findById(id);
      if (!insumo)
        return res
          .status(404)
          .json({ success: false, message: "Insumo no encontrado" });

      const stockNumero = Number(nuevoStock);
      if (Number.isNaN(stockNumero)) {
        return res.status(400).json({
          success: false,
          message: "El nuevo stock debe ser numérico",
        });
      }

      insumo.stock = stockNumero;
      insumo.estado = determinarEstado(insumo.stock, insumo.stockMinimo);
      insumo.ultimaActualizacion = new Date();

      await insumo.save();
      res.json({ success: true, data: insumo });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar stock", error });
    }
  }

}

const determinarEstado = (stock, stockMinimo) => {
  if (stock === 0) return "sin_stock";
  if (stock <= stockMinimo) return "bajo_stock";
  return "disponible";
};

export default new InsumosController();
