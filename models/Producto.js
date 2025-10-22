import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Boolean, default: true },
  categoria: { type: String }, // opcional, agregar si lo necesitas
  unidadMedida: { type: String }, // opcional
  ultimaActualizacion: { type: Date, default: Date.now }
});

// Middleware para actualizar fecha automáticamente al guardar
productoSchema.pre('save', function(next) {
  this.ultimaActualizacion = new Date();
  next();
});

const Producto = mongoose.model("Producto", productoSchema);

export default Producto;