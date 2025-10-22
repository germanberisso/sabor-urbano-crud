import mongoose from "mongoose";

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: "" },
  area: { type: String, required: true },
  estado: {
    type: String,
    enum: ["pendiente", "en_proceso", "finalizada"],
    default: "pendiente",
  },
  prioridad: {
    type: String,
    enum: ["baja", "media", "alta"],
    default: "media",
  },
  // SOLUCIÓN (1/4): Corregimos el tipo de dato.
  // Para referenciar a otra colección en MongoDB, se debe usar ObjectId.
  // El error silencioso ocurría porque se intentaba guardar un texto (el ID del empleado) en un campo de tipo Número.
  empleadoAsignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', default: null },
  pedidoAsociado: { type: Number, default: null },
  observaciones: { type: String, default: "" },
  fechaCreacion: { type: Date, default: Date.now },
  fechaInicio: { type: Date, default: null },
  fechaFinalizacion: { type: Date, default: null },
});

const Tarea = mongoose.model("Tarea", tareaSchema);

// Mantenemos la estructura de clase `TareaModel`
export default class TareaModel {
  async getAll() {
    // SOLUCIÓN (2/4): Usamos .populate() para traer los datos del empleado referenciado
    // en lugar de solo su ID. Esto nos permitirá mostrar su nombre en la vista.
    return await Tarea.find().populate('empleadoAsignado').lean();
  }

  async getById(id) {
    return await Tarea.findById(id).populate('empleadoAsignado').lean();
  }

  async filtrar(filtros) {
    const query = {};

    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.prioridad) query.prioridad = filtros.prioridad;
    if (filtros.area) query.area = filtros.area;
    if (filtros.empleadoAsignado)
      query.empleadoAsignado = filtros.empleadoAsignado;

    // ... (resto de la lógica de filtros)
    if (filtros.fechaDesde || filtros.fechaHasta) {
      query.fechaCreacion = {};
      if (filtros.fechaDesde)
        query.fechaCreacion.$gte = new Date(filtros.fechaDesde);
      if (filtros.fechaHasta)
        query.fechaCreacion.$lte = new Date(filtros.fechaHasta);
    }

    return await Tarea.find(query).populate('empleadoAsignado').lean();
  }

  async create(datos) {
    // SOLUCIÓN (3/4): Eliminamos `parseInt`. Mongoose se encarga de convertir
    // el string del ID a ObjectId. Si el valor es un string vacío, lo convertimos a `null`.
    const tarea = new Tarea({
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      area: datos.area,
      estado: datos.estado || "pendiente",
      prioridad: datos.prioridad || "media",
      empleadoAsignado: datos.empleadoAsignado || null,
      pedidoAsociado: datos.pedidoAsociado ? parseInt(datos.pedidoAsociado) : null,
      observaciones: datos.observaciones || "",
    });
    return await tarea.save();
  }

  async update(id, datos) {
    const camposPermitidos = [
      "titulo",
      "descripcion",
      "area",
      "estado",
      "prioridad",
      "empleadoAsignado",
      "pedidoAsociado",
      "observaciones",
    ];

    const actualizacion = {};
    for (const campo of camposPermitidos) {
      if (datos[campo] !== undefined) {
        if (campo === 'empleadoAsignado') {
          actualizacion[campo] = datos[campo] || null; // Manejar string vacío
        } else {
          actualizacion[campo] = datos[campo];
        }
      }
    }

    return await Tarea.findByIdAndUpdate(id, actualizacion, {
      new: true,
      lean: true,
    });
  }

  async iniciar(id) {
    return await Tarea.findByIdAndUpdate(
      id,
      {
        estado: "en_proceso",
        fechaInicio: new Date(),
      },
      { new: true, lean: true }
    );
  }

  async finalizar(id) {
    return await Tarea.findByIdAndUpdate(
      id,
      {
        estado: "finalizada",
        fechaFinalizacion: new Date(),
      },
      { new: true, lean: true }
    );
  }

  async delete(id) {
    return await Tarea.findByIdAndDelete(id).lean();
  }
}