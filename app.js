import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
import dotenv from 'dotenv';

import conectarDB from './db.js';

// Routers
import empleadosRouter from './routes/empleados.js';
import tareasRouter from './routes/tareas.js';
import pedidosRouter from './routes/pedidos.js';
import insumosRouter from './routes/insumos.js';
import productosRouter from './routes/productos.js';

// Modelos
import Empleado from './models/Empleado.js';
import Pedido from './models/Pedido.js';
import Insumo from './models/Insumo.js';
import Producto from './models/Producto.js';
import TareaModel from './models/Tarea.js';

// Controladores
import PedidosController from './controllers/pedidosController.js';

dotenv.config();
conectarDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Instancia de controlador
const pedidosController = new PedidosController();
const tareaModel = new TareaModel();

// Configuración Pug
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// RUTAS API
app.use('/api/empleados', empleadosRouter);
app.use('/api/tareas', tareasRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/insumos', insumosRouter);
app.use('/api/productos', productosRouter);

// HELPER de manejo de errores async
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// RUTAS VISTAS
app.get('/', (req, res) => res.redirect('/empleados'));

// ---------- EMPLEADOS ----------
app.get('/empleados', catchAsync(async (req, res) => {
  const empleados = await Empleado.find();
  res.render('empleados/index', { page: 'empleados', empleados });
}));

app.get('/empleados/nuevo', (req, res) => res.render('empleados/nuevo', { page: 'empleados' }));

app.post('/empleados/nuevo', catchAsync(async (req, res) => {
  await Empleado.create(req.body);
  res.redirect('/empleados');
}));

app.get('/empleados/editar/:id', catchAsync(async (req, res) => {
  const empleado = await Empleado.findById(req.params.id);
  if (!empleado) return res.status(404).render('error', { error: 'Empleado no encontrado', code: 404 });
  res.render('empleados/editar', { page: 'empleados', empleado });
}));

app.post('/empleados/editar/:id', catchAsync(async (req, res) => {
  const empleado = await Empleado.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!empleado) return res.status(404).render('error', { error: 'Empleado no encontrado', code: 404 });
  res.redirect('/empleados');
}));

app.post('/empleados/eliminar/:id', catchAsync(async (req, res) => {
  const empleado = await Empleado.findByIdAndDelete(req.params.id);
  if (!empleado) return res.status(404).render('error', { error: 'Empleado no encontrado', code: 404 });
  res.redirect('/empleados');
}));

// ---------- TAREAS (VISTAS PUG) ----------
app.get("/tareas", catchAsync(async (req, res) => {
  try {
    const tareas = await tareaModel.getAll();
    const empleados = await Empleado.find();
    res.render('tareas/index', { page: 'tareas', tareas, empleados });
  } catch (err) {
    res.status(500).render('error', { error: 'Error al cargar tareas', code: 500 });
  }
}));

app.get("/tareas/nueva", catchAsync(async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.render('tareas/nueva', { page: 'tareas', empleados });
  } catch (err) {
    res.status(500).render('error', { error: 'Error al cargar formulario', code: 500 });
  }
}));

app.get("/tareas/editar/:id", catchAsync(async (req, res) => {
  try {
    const tarea = await tareaModel.getById(req.params.id);
    const empleados = await Empleado.find();
    if (!tarea) return res.status(404).render('error', { error: 'Tarea no encontrada', code: 404 });
    res.render('tareas/editar', { page: 'tareas', tarea, empleados });
  } catch (err) {
    res.status(500).render('error', { error: 'Error al cargar tarea', code: 500 });
  }
}));

// ---------- INSUMOS ----------
app.get('/insumos', catchAsync(async (req, res) => {
  const insumos = await Insumo.find();
  res.render('insumos/index', { page: 'insumos', insumos });
}));

app.get('/insumos/nuevo', (req, res) => res.render('insumos/nuevo', { page: 'insumos' }));
app.post('/insumos/nuevo', catchAsync(async (req, res) => {
  await Insumo.create(req.body);
  res.redirect('/insumos');
}));

app.get('/insumos/editar/:id', catchAsync(async (req, res) => {
  const insumo = await Insumo.findById(req.params.id);
  if (!insumo) return res.status(404).render('error', { error: 'Insumo no encontrado', code: 404 });
  res.render('insumos/editar', { page: 'insumos', insumo });
}));

app.post('/insumos/editar/:id', catchAsync(async (req, res) => {
  const insumo = await Insumo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!insumo) return res.status(404).render('error', { error: 'Insumo no encontrado', code: 404 });
  res.redirect('/insumos');
}));

app.post('/insumos/eliminar/:id', catchAsync(async (req, res) => {
  const insumo = await Insumo.findByIdAndDelete(req.params.id);
  if (!insumo) return res.status(404).render('error', { error: 'Insumo no encontrado', code: 404 });
  res.redirect('/insumos');
}));

// ---------- PRODUCTOS ----------
app.get('/productos', catchAsync(async (req, res) => {
  const productos = await Producto.find();
  res.render('productos/index', { page: 'productos', productos });
}));

app.get('/productos/nuevo', (req, res) => res.render('productos/nuevo', { page: 'productos' }));
app.post('/productos/nuevo', catchAsync(async (req, res) => {
  await Producto.create(req.body);
  res.redirect('/productos');
}));

app.get('/productos/editar/:id', catchAsync(async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  if (!producto) return res.status(404).render('error', { error: 'Producto no encontrado', code: 404 });
  res.render('productos/editar', { page: 'productos', producto });
}));

app.post('/productos/editar/:id', catchAsync(async (req, res) => {
  const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!producto) return res.status(404).render('error', { error: 'Producto no encontrado', code: 404 });
  res.redirect('/productos');
}));

app.post('/productos/eliminar/:id', catchAsync(async (req, res) => {
  const producto = await Producto.findByIdAndDelete(req.params.id);
  if (!producto) return res.status(404).render('error', { error: 'Producto no encontrado', code: 404 });
  res.redirect('/productos');
}));

// ---------- PEDIDOS ----------
app.get('/pedidos', pedidosController.renderIndex.bind(pedidosController));
app.get('/pedidos/nuevo', pedidosController.renderNuevo.bind(pedidosController));
app.post('/pedidos/nuevo', catchAsync(async (req, res) => pedidosController.create(req, res)));
app.get('/pedidos/editar/:id', pedidosController.renderEditar.bind(pedidosController));
app.post('/pedidos/editar/:id', catchAsync(async (req, res) => pedidosController.update(req, res)));
app.post('/pedidos/eliminar/:id', catchAsync(async (req, res) => pedidosController.delete(req, res)));

// ---------- FILTROS ----------
app.get('/filtros', catchAsync(async (req, res) => {
  const empleados = await Empleado.find();
  res.render('filters', { page: 'filtros', empleados });
}));

app.get('/tareas/filtrar', catchAsync(async (req, res) => {
  const tareas = await tareaModel.filtrar(req.query);
  const empleados = await Empleado.find();
  res.render('tareas/index', { page: 'tareas', tareas, empleados, filtros: req.query });
}));

// MANEJO DE ERRORES
app.use((req, res) => {
  res.status(404).render('error', { error: 'Página no encontrada', code: 404 });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Error del servidor', code: 500 });
});

// SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});