import mongoose from '../database.js';

const insumoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  stock: { type: Number, default: 0 },
  stockMinimo: { type: Number, default: 5 },
  unidadMedida: { type: String },
  proveedor: { type: String },
  estado: { type: String, enum: ['disponible','bajo_stock','sin_stock'], default: 'disponible' },
  ultimaActualizacion: { type: Date, default: Date.now }
}, { timestamps: true });

const InsumoModel = mongoose.model('Insumo', insumoSchema);

class Insumo {
  async getAll() {
    return await InsumoModel.find().lean();
  }

  async getById(id) {
    return await InsumoModel.findById(id).lean();
  }

  async getBajoStock() {
    return await InsumoModel.find({ $expr: { $lte: ["$stock", "$stockMinimo"] } }).lean();
  }

  async getByCategoria(categoria) {
    return await InsumoModel.find({ categoria }).lean();
  }

  async create(datos) {
    datos.estado = this.determinarEstado(datos.stock, datos.stockMinimo ?? 5);
    const insumo = new InsumoModel(datos);
    return await insumo.save();
  }

  async update(id, datos) {
    if (datos.stock !== undefined) {
      datos.estado = this.determinarEstado(datos.stock, datos.stockMinimo ?? 5);
      datos.ultimaActualizacion = new Date();
    }
    const actualizado = await InsumoModel.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
    if (!actualizado) throw new Error('Insumo no encontrado');
    return actualizado;
  }

  async actualizarStock(id, nuevoStock) {
    const insumo = await InsumoModel.findById(id);
    if (!insumo) throw new Error('Insumo no encontrado');
    insumo.stock = Number(nuevoStock);
    insumo.estado = this.determinarEstado(insumo.stock, insumo.stockMinimo);
    insumo.ultimaActualizacion = new Date();
    return await insumo.save();
  }

  async descontarStock(id, cantidad) {
    const insumo = await InsumoModel.findById(id);
    if (!insumo) throw new Error('Insumo no encontrado');
    if (insumo.stock - cantidad < 0) throw new Error('Stock insuficiente');

    insumo.stock -= cantidad;
    insumo.estado = this.determinarEstado(insumo.stock, insumo.stockMinimo);
    insumo.ultimaActualizacion = new Date();
    return await insumo.save();
  }

  async toggleStock(id) {
    const insumo = await InsumoModel.findById(id);
    if (!insumo) throw new Error('Insumo no encontrado');
    insumo.stock = insumo.stock > 0 ? 0 : insumo.stockMinimo + 1;
    insumo.estado = this.determinarEstado(insumo.stock, insumo.stockMinimo);
    insumo.ultimaActualizacion = new Date();
    return await insumo.save();
  }

  async delete(id) {
    const eliminado = await InsumoModel.findByIdAndDelete(id);
    if (!eliminado) throw new Error('Insumo no encontrado');
    return { id: eliminado._id };
  }

  async getAlertas() {
    const bajos = await this.getBajoStock();
    return bajos.map(i => ({
      id: i._id,
      nombre: i.nombre,
      stockActual: i.stock,
      stockMinimo: i.stockMinimo,
      estado: i.estado,
      proveedor: i.proveedor
    }));
  }

  determinarEstado(stock, stockMinimo) {
    if (stock <= 0) return 'sin_stock';
    if (stock <= stockMinimo) return 'bajo_stock';
    return 'disponible';
  }
}

export default Insumo;