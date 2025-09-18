// Importa módulos necesarios para la aplicación y rutas
const express = require('express');
const path = require('path');

// Importa rutas de la API
const tareasRoutes = require('./routes/tareas');
const empleadosRoutes = require('./routes/empleados');
const pedidosRoutes = require('./routes/pedidos');
const insumosRoutes = require('./routes/insumos');

// Importa middleware personalizado
const ValidationMiddleware = require('./middleware/validation');

// Inicializa la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000; // Define el puerto del servidor

// Configura el motor de plantillas Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Aplica middlewares básicos
app.use(express.json()); // Parsea solicitudes con cuerpo JSON
app.use(express.urlencoded({ extended: true })); // Parsea solicitudes con cuerpo URL-encoded
app.use(express.static(path.join(__dirname, 'public'))); // Sirve archivos estáticos desde la carpeta public

// Aplica middlewares personalizados globales
app.use(ValidationMiddleware.establecerHeaders); // Configura headers de respuesta (CORS, Content-Type)
app.use(ValidationMiddleware.logRequest); // Registra solicitudes entrantes
app.use(ValidationMiddleware.sanitizarDatos); // Sanitiza datos de entrada

// Ruta principal para el dashboard HTML
app.get('/', async (req, res) => {
    try {
        const TareaModel = require('./models/Tarea');
        const EmpleadoModel = require('./models/Empleado');
        const tareaModel = new TareaModel();
        const empleadoModel = new EmpleadoModel();
        // Obtiene datos para el dashboard
        const tareasPendientes = await tareaModel.getByEstado('pendiente');
        const totalEmpleados = await empleadoModel.getActivos();
        // Renderiza la vista index con datos dinámicos
        res.render('index', { 
            title: 'Sabor Urbano - Dashboard',
            tareasPendientes: tareasPendientes.length,
            totalEmpleados: totalEmpleados.length
        });
    } catch (error) {
        // Renderiza la vista index con mensaje de error en caso de fallo
        res.render('index', { 
            title: 'Sabor Urbano - Dashboard',
            error: 'Error al cargar datos del dashboard'
        });
    }
});

// Configura rutas de la API REST
app.use('/api/tareas', ValidationMiddleware.validarFiltros, tareasRoutes); // Rutas para tareas con validación de filtros
app.use('/api/empleados', empleadosRoutes); // Rutas para empleados
app.use('/api/pedidos', pedidosRoutes); // Rutas para pedidos
app.use('/api/insumos', insumosRoutes); // Rutas para insumos

// Rutas para vistas HTML adicionales
app.get('/tareas', async (req, res) => {
    try {
        const TareaModel = require('./models/Tarea');
        const tareaModel = new TareaModel();
        // Obtiene todas las tareas
        const tareas = await tareaModel.getAll();
        // Renderiza la vista de gestión de tareas
        res.render('tareas/index', { 
            title: 'Gestión de Tareas',
            tareas: tareas
        });
    } catch (error) {
        // Renderiza la vista con mensaje de error en caso de fallo
        res.render('tareas/index', { 
            title: 'Gestión de Tareas',
            error: 'Error al cargar las tareas'
        });
    }
});

app.get('/empleados', async (req, res) => {
    try {
        const EmpleadoModel = require('./models/Empleado');
        const empleadoModel = new EmpleadoModel();
        // Obtiene todos los empleados
        const empleados = await empleadoModel.getAll();
        // Renderiza la vista de gestión de empleados
        res.render('empleados/index', { 
            title: 'Gestión de Empleados',
            empleados: empleados
        });
    } catch (error) {
        // Renderiza la vista con mensaje de error en caso de fallo
        res.render('empleados/index', { 
            title: 'Gestión de Empleados',
            error: 'Error al cargar los empleados'
        });
    }
});

app.get('/filtros', (req, res) => {
    // Renderiza la vista del sistema de filtros
    res.render('filters', { 
        title: 'Sistema de Filtros'
    });
});

// Ruta para verificar el estado de la API
app.get('/api/status', (req, res) => {
    // Responde con información del estado del servidor
    res.json({
        success: true,
        service: 'Sabor Urbano Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Maneja errores 404 para rutas no encontradas
app.use((req, res) => {
    if (req.url.startsWith('/api/')) {
        // Responde con JSON para errores en la API
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado',
            suggestion: 'Consulte la documentación de la API'
        });
    } else {
        // Renderiza la vista de error para rutas HTML
        res.status(404).render('error', { 
            title: 'Página no encontrada',
            error: 'La página solicitada no existe',
            code: 404
        });
    }
});

// Aplica middleware para manejo de errores global
app.use(ValidationMiddleware.manejarErrores);

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
    // Muestra información del servidor al iniciar
    console.log('═══════════════════════════════════════════');
    console.log('🍕 SABOR URBANO - SISTEMA DE GESTIÓN');
    console.log('═══════════════════════════════════════════');
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📊 Dashboard HTML: http://localhost:${PORT}`);
    console.log(`📋 Gestión Tareas: http://localhost:${PORT}/tareas`);
    console.log(`👥 Gestión Empleados: http://localhost:${PORT}/empleados`);
    console.log(`🔍 Sistema Filtros: http://localhost:${PORT}/filtros`);
    console.log(`🔧 API REST: http://localhost:${PORT}/api`);
    console.log('═══════════════════════════════════════════');
});

module.exports = app;