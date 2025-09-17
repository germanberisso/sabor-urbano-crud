const express = require('express');
const path = require('path');

// Importar rutas
const tareasRoutes = require('./routes/tareas');
const empleadosRoutes = require('./routes/empleados');
const pedidosRoutes = require('./routes/pedidos');
const insumosRoutes = require('./routes/insumos');

// Importar middleware personalizado
const ValidationMiddleware = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del motor de plantillas Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware personalizado global
app.use(ValidationMiddleware.establecerHeaders);
app.use(ValidationMiddleware.logRequest);
app.use(ValidationMiddleware.sanitizarDatos);

// Ruta principal con datos dinámicos PARA VISTA HTML
app.get('/', async (req, res) => {
    try {
        const TareaModel = require('./models/Tarea');
        const EmpleadoModel = require('./models/Empleado');
        
        const tareaModel = new TareaModel();
        const empleadoModel = new EmpleadoModel();
        
        const tareasPendientes = await tareaModel.getByEstado('pendiente');
        const totalEmpleados = await empleadoModel.getActivos();
        
        res.render('index', { 
            title: 'Sabor Urbano - Dashboard',
            tareasPendientes: tareasPendientes.length,
            totalEmpleados: totalEmpleados.length
        });
    } catch (error) {
        res.render('index', { 
            title: 'Sabor Urbano - Dashboard',
            error: 'Error al cargar datos del dashboard'
        });
    }
});

// Configuración de rutas API
app.use('/api/tareas', ValidationMiddleware.validarFiltros, tareasRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/insumos', insumosRoutes);

// Rutas para vistas HTML
app.get('/tareas', async (req, res) => {
    try {
        const TareaModel = require('./models/Tarea');
        const tareaModel = new TareaModel();
        const tareas = await tareaModel.getAll();
        
        res.render('tareas/index', { 
            title: 'Gestión de Tareas',
            tareas: tareas
        });
    } catch (error) {
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
        const empleados = await empleadoModel.getAll();
        
        res.render('empleados/index', { 
            title: 'Gestión de Empleados',
            empleados: empleados
        });
    } catch (error) {
        res.render('empleados/index', { 
            title: 'Gestión de Empleados',
            error: 'Error al cargar los empleados'
        });
    }
});

app.get('/filtros', (req, res) => {
    res.render('filters', { 
        title: 'Sistema de Filtros'
    });
});

// Rutas para documentación y estado
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        service: 'Sabor Urbano Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Manejo de errores 404
app.use((req, res) => {
    if (req.url.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado',
            suggestion: 'Consulte la documentación de la API'
        });
    } else {
        res.status(404).render('error', { 
            title: 'Página no encontrada',
            error: 'La página solicitada no existe',
            code: 404
        });
    }
});

// Manejo de errores del servidor
app.use(ValidationMiddleware.manejarErrores);

app.listen(PORT, () => {
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