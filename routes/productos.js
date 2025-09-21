import express from 'express'; // Express
import ProductosController from '../controllers/productosController.js'; // Controlador
import ValidationMiddleware from '../middleware/validation.js'; // Validaciones

const router = express.Router(); // Router productos
const productosController = new ProductosController(); // Instancia

const validarProducto = (req, res, next) => { // Middleware: valida para create/update productos
    const { nombre, precio, stock } = req.body; // Campos body

    if (req.method === 'PUT' && Object.keys(req.body).length === 0) { // PUT vacío
        return res.status(400).json({ success: false, message: 'Body vacío: envíe al menos un campo.' });
    }
    if (req.method === 'PUT') { // PUT sin campos válidos
        const alguno = [nombre, precio, stock].some(f => f !== undefined);
        if (!alguno) {
            return res.status(400).json({ success: false, message: 'Incluya algún campo para actualizar.' });
        }
    }
    next(); // Continúa
};

// Listado general
router.get('/', (req, res) => productosController.getAll(req, res)); // GET /productos: todos

// Detalle
router.get('/:id', (req, res) => productosController.getById(req, res)); // GET /productos/:id: uno

router.post('/',
    ValidationMiddleware.validarCamposRequeridos(['nombre', 'precio', 'stock']), // Obligatorios
    validarProducto, // Específicos
    (req, res) => productosController.create(req, res) // POST /productos: crea
);

router.put('/:id',
    validarProducto, // Valida
    (req, res) => productosController.update(req, res) // PUT /productos/:id: actualiza general
);

router.delete('/:id', (req, res) => productosController.delete(req, res)); // DELETE /productos/:id: elimina

export default router; // Exporta