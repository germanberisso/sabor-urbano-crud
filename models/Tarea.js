import mongoose from '../database.js';
import Pedido from './Pedido.js';

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  area: { type: String, required: true },
  estado: { type: String, enum: ['pendiente','en_proceso','finalizada'], default: 'pendiente' },
  prioridad: { type: String, enum: ['baja','media','alta'], default: 'media' },
  empleadoAsignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', default: null },
  pedidoAsociado: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', default: null },
  observaciones: { type: String, default: '' },
  fechaCreacion: { type: Date, default: Date.now },
  fechaInicio: { type: Date, default: null },
  fechaFinalizacion: { type: Date, default: null }
});

const TareaModel = mongoose.model('Tarea', tareaSchema);

class Tarea {
  async getAll() {
    return await TareaModel.find().populate('empleadoAsignado').populate('pedidoAsociado').lean();
  }

  async getById(id) {
    return await TareaModel.findById(id).populate('empleadoAsignado').populate('pedidoAsociado').lean();
  }

  async filtrar(filtros) {
    const query = {};

    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.prioridad) query.prioridad = filtros.prioridad;
    if (filtros.area) query.area = filtros.area;
    if (filtros.empleadoAsignado) query.empleadoAsignado = filtros.empleadoAsignado;

    if (filtros.fechaDesde || filtros.fechaHasta) {
      query.fechaCreacion = {};
      if (filtros.fechaDesde) query.fechaCreacion.$gte = new Date(filtros.fechaDesde);
      if (filtros.fechaHasta) query.fechaCreacion.$lte = new Date(filtros.fechaHasta);
    }

    if (filtros.tipoPedido || filtros.plataforma) {
      const pedidoModel = new Pedido();
      let pedidos = await pedidoModel.getAll();

      if (filtros.tipoPedido && filtros.tipoPedido !== 'todos') pedidos = pedidos.filter(p => p.tipo === filtros.tipoPedido);
      if (filtros.plataforma) pedidos = pedidos.filter(p => p.plataforma === filtros.plataforma);

      const pedidosIds = pedidos.map(p => p._id);
      query.$or = [{ pedidoAsociado: { $in: pedidosIds } }, { pedidoAsociado: null }];
    }

    return await TareaModel.find(query)
      .populate('empleadoAsignado')
      .populate('pedidoAsociado')
      .lean();
  }

  async create(datos) {
    const tarea = new TareaModel(datos);
    return await tarea.save();
  }

  async update(id, datos) {
    const actualizado = await TareaModel.findByIdAndUpdate(id, datos, { new: true, runValidators: true }).lean();
    if (!actualizado) throw new Error('Tarea no encontrada');
    return actualizado;
  }

  async iniciar(id) {
    const tarea = await TareaModel.findById(id);
    if (!tarea) throw new Error('Tarea no encontrada');

    if (!tarea.fechaInicio) tarea.fechaInicio = new Date();
    tarea.estado = 'en_proceso';
    await tarea.save();

    return await tarea.populate('empleadoAsignado').populate('pedidoAsociado').lean();
  }

  async finalizar(id) {
    const tarea = await TareaModel.findById(id);
    if (!tarea) throw new Error('Tarea no encontrada');

    if (!tarea.fechaInicio) tarea.fechaInicio = new Date();
    tarea.fechaFinalizacion = new Date();
    tarea.estado = 'finalizada';
    await tarea.save();

    return await tarea.populate('empleadoAsignado').populate('pedidoAsociado').lean();
  }

  async delete(id) {
    const eliminado = await TareaModel.findByIdAndDelete(id).lean();
    if (!eliminado) throw new Error('Tarea no encontrada');
    return eliminado;
  }
}

export default Tarea;