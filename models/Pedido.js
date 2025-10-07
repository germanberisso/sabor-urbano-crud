import mongoose from '../database.js';

const pedidoSchema = new mongoose.Schema({
  numeroOrden: { type: String, required: true },
  items: { type: Array, default: [] },
  total: { type: Number, default: 0 },
  tipo: { type: String, enum: ['presencial','delivery'], required: true },
  plataforma: { type: String, default: 'local' },
  estado: { type: String, enum: ['pendiente','en_preparacion','entregado'], default: 'pendiente' },
  fechaCreacion: { type: Date, default: Date.now },
  tiempoEstimado: { type: Number, default: 30 },
  observaciones: { type: String, default: '' },
  nombreCliente: { type: String, default: null },
  telefonoCliente: { type: String, default: null },
  direccionCliente: { type: String, default: null }
});

const PedidoModel = mongoose.model('Pedido', pedidoSchema);

class Pedido {
  async getAll() {
    return await PedidoModel.find().lean();
  }

  async getById(id) {
    return await PedidoModel.findById(id).lean();
  }

  async getByTipo(tipo) {
    return await PedidoModel.find({ tipo }).lean();
  }

  async getByPlataforma(plataforma) {
    return await PedidoModel.find({ plataforma }).lean();
  }

  async getByEstado(estado) {
    return await PedidoModel.find({ estado }).lean();
  }

  async create(nuevoPedido) {
    // Validaciones básicas
    if (!nuevoPedido.tipo) throw new Error("El tipo de pedido es obligatorio");
    if (nuevoPedido.tipo === 'delivery') {
      if (!nuevoPedido.nombreCliente || !nuevoPedido.telefonoCliente || !nuevoPedido.direccionCliente) {
        throw new Error("Los pedidos de delivery requieren nombre, teléfono y dirección del cliente");
      }
    }

    if (!nuevoPedido.numeroOrden) {
      const count = await PedidoModel.countDocuments();
      nuevoPedido.numeroOrden = `ORD-${(count+1).toString().padStart(3,'0')}`;
    }

    const pedido = new PedidoModel(nuevoPedido);
    return await pedido.save();
  }

  async update(id, datosActualizados) {
    const actualizado = await PedidoModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true }).lean();
    if (!actualizado) throw new Error('Pedido no encontrado');
    return actualizado;
  }

  async delete(id) {
    const eliminado = await PedidoModel.findByIdAndDelete(id).lean();
    if (!eliminado) throw new Error('Pedido no encontrado');
    return eliminado;
  }
}

export default Pedido;