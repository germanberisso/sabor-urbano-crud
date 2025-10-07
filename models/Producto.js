import mongoose from '../database.js';

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Boolean, default: true }
}, { timestamps: true });

const ProductoModel = mongoose.model('Producto', productoSchema);

class Producto {
  async getAll() {
    return await ProductoModel.find().lean();
  }

  async getById(id) {
    return await ProductoModel.findById(id).lean();
  }

  async create(datos) {
    const producto = new ProductoModel({
      nombre: datos.nombre,
      precio: Number(datos.precio),
      stock: datos.stock !== undefined ? Boolean(datos.stock) : true
    });
    return await producto.save();
  }

  async update(id, datos) {
    if (datos.precio !== undefined) datos.precio = Number(datos.precio);
    if (datos.stock !== undefined) datos.stock = Boolean(datos.stock);

    const actualizado = await ProductoModel.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
    if (!actualizado) throw new Error('Producto no encontrado');
    return actualizado;
  }

  async toggleStock(id) {
    const producto = await ProductoModel.findById(id);
    if (!producto) throw new Error('Producto no encontrado');
    producto.stock = !producto.stock;
    return await producto.save();
  }

  async delete(id) {
    const eliminado = await ProductoModel.findByIdAndDelete(id);
    if (!eliminado) throw new Error('Producto no encontrado');
    return { id: eliminado._id };
  }
}

export default Producto;