import Insumo from "../models/Insumo.js";

class InsumosController {
  // Obtener todos los insumos
  async getAll(req, res) {
    try {
      const insumos = await Insumo.find();
      res.json({ success: true, data: insumos });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener insumos", error });
    }
  }

  // Obtener por ID
  async getById(req, res) {
    try {
      const insumo = await Insumo.findById(req.params.id);
      if (!insumo)
        return res.status(404).json({ success: false, message: "Insumo no encontrado" });
      res.json({ success: true, data: insumo });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener insumo", error });
    }
  }

  // Crear nuevo insumo
  async create(req, res) {
    try {
      const { nombre, categoria, stock, stockMinimo, unidadMedida, proveedor } = req.body;
      const estado = this.determinarEstado(stock, stockMinimo);
      const nuevoInsumo = new Insumo({
        nombre,
        categoria,
        stock,
        stockMinimo,
        unidadMedida,
        proveedor,
        estado,
      });
      const insumoGuardado = await nuevoInsumo.save();
      res.status(201).json({ success: true, data: insumoGuardado });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al crear insumo", error });
    }
  }

  // Actualizar campos
  async update(req, res) {
    try {
      const { id } = req.params;
      const datos = req.body;
      if (datos.stock !== undefined) {
        const insumoActual = await Insumo.findById(id);
        const stockMin = datos.stockMinimo ?? insumoActual.stockMinimo;
        datos.estado = this.determinarEstado(datos.stock, stockMin);
        datos.ultimaActualizacion = new Date();
        }
      const insumoActualizado = await Insumo.findByIdAndUpdate(id, datos, { new: true });
      if (!insumoActualizado)
        return res.status(404).json({ success: false, message: "Insumo no encontrado" });
      res.json({ success: true, data: insumoActualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al actualizar insumo", error });
    }
  }

  // Eliminar
  async delete(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await Insumo.findByIdAndDelete(id);
      if (!eliminado)
        return res.status(404).json({ success: false, message: "Insumo no encontrado" });
      res.json({ success: true, message: "Insumo eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al eliminar insumo", error });
    }
  }

  // Obtener insumos con bajo stock
  async getBajoStock(req, res) {
    try {
      const insumos = await Insumo.find({ $expr: { $lte: ["$stock", "$stockMinimo"] } });
      res.json({ success: true, data: insumos });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener bajo stock", error });
    }
  }

  // Obtener alertas
  async getAlertas(req, res) {
    try {
      const insumos = await Insumo.find({ $expr: { $lte: ["$stock", "$stockMinimo"] } });
      const alertas = insumos.map(i => ({
        id: i._id,
        nombre: i.nombre,
        stockActual: i.stock,
        stockMinimo: i.stockMinimo,
        estado: i.estado,
        proveedor: i.proveedor,
      }));
      res.json({ success: true, data: alertas });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener alertas", error });
    }
  }

  // Actualizar stock
  async actualizarStock(req, res) {
    try {
      const { id } = req.params;
      const { nuevoStock } = req.body;
      const insumo = await Insumo.findById(id);
      if (!insumo)
        return res.status(404).json({ success: false, message: "Insumo no encontrado" });

      insumo.stock = nuevoStock;
      insumo.estado = this.determinarEstado(insumo.stock, insumo.stockMinimo);
      insumo.ultimaActualizacion = new Date();

      await insumo.save();
      res.json({ success: true, data: insumo });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al actualizar stock", error });
    }
  }

  // Lógica de estado
  determinarEstado(stock, stockMinimo) {
    if (stock === 0) return "sin_stock";
    if (stock <= stockMinimo) return "bajo_stock";
    return "disponible";
  }
}

export default new InsumosController();