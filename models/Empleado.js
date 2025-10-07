import mongoose from 'mongoose';

// Definición del esquema de empleado
const empleadoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  telefono: { type: String, default: '' },
  rol: { 
    type: String, 
    enum: ['administrador', 'cocinero', 'repartidor', 'mozo', 'encargado_stock'],
    required: true 
  },
  area: { 
    type: String, 
    enum: ['cocina', 'reparto', 'salon', 'inventario', 'administracion'],
    required: true 
  },
  sueldo: { type: Number, default: 0 },
  fechaIngreso: { type: Date, default: Date.now }
});

// Crea el modelo en Mongo
const Empleado = mongoose.model('Empleado', empleadoSchema);

export default class EmpleadoModel {
  
  // 🔹 Obtener todos los empleados
  async getAll() {
    return await Empleado.find().lean();
  }

  // 🔹 Obtener un empleado por ID
  async getById(id) {
    return await Empleado.findById(id).lean();
  }

  // 🔹 Crear nuevo empleado
  async create(datosEmpleado) {
    const existeEmail = await Empleado.findOne({ email: datosEmpleado.email });
    if (existeEmail) throw new Error('El email ya está en uso');

    const datosFiltrados = {};
    for (const key in datosEmpleado) {
      const valor = datosEmpleado[key];
      if (valor !== undefined && valor !== '') {
        datosFiltrados[key] = valor;
      }
    }

    const nuevoEmpleado = new Empleado(datosFiltrados);
    await nuevoEmpleado.save();
    return nuevoEmpleado.toObject();
  }

  // 🔹 Actualizar empleado
  async update(id, datosActualizados) {
    if (datosActualizados.email) {
      const emailEnUso = await Empleado.findOne({ 
        email: datosActualizados.email, 
        _id: { $ne: id } 
      });
      if (emailEnUso) throw new Error('El email ya está en uso');
    }

    // Convertir sueldo a número si viene
    if (datosActualizados.sueldo !== undefined) {
      datosActualizados.sueldo = Number(datosActualizados.sueldo);
    }

    const datosFiltrados = {};
    for (const key in datosActualizados) {
      const valor = datosActualizados[key];
      if (valor !== undefined && valor !== '') {
        datosFiltrados[key] = valor;
      }
    }

    const empleadoActualizado = await Empleado.findByIdAndUpdate(
      id,
      { $set: datosFiltrados },
      { new: true, runValidators: true }
    ).lean();

    if (!empleadoActualizado) throw new Error('Empleado no encontrado');
    return empleadoActualizado;
  }

  // 🔹 Eliminar empleado
  async delete(id) {
    const resultado = await Empleado.findByIdAndDelete(id);
    if (!resultado) throw new Error('Empleado no encontrado');
  }
}