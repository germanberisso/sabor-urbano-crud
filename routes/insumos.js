import express from "express";
import insumosController from "../controllers/insumosController.js";
import ValidationMiddleware from "../middleware/validation.js";

const router = express.Router();

// --- Middleware de logs ---
router.use(ValidationMiddleware.logRequest);

// --- Validaciones específicas para insumos ---
const validarCamposInsumo = ValidationMiddleware.validarCamposRequeridos([
  "nombre",
  "categoria",
  "stock",
  "stockMinimo"
]);

const validarNumericos = [
  ValidationMiddleware.validarNumerico("stock"),
  ValidationMiddleware.validarNumerico("stockMinimo")
];

// --- Rutas ---
router.get("/", insumosController.getAll);
router.get("/bajo-stock", insumosController.getBajoStock);
router.get("/alertas", insumosController.getAlertas);

router.get(
  "/:id",
  ValidationMiddleware.validarParametroId,
  insumosController.getById
);

router.post(
  "/",
  ValidationMiddleware.sanitizarDatos,
  validarCamposInsumo,
  validarNumericos,
  insumosController.create
);

router.put(
  "/:id",
  ValidationMiddleware.validarParametroId,
  ValidationMiddleware.sanitizarDatos,
  validarCamposInsumo,
  validarNumericos,
  insumosController.update
);

router.patch(
  "/:id/stock",
  ValidationMiddleware.validarParametroId,
  ValidationMiddleware.validarNumerico("stock"),
  insumosController.actualizarStock
);

router.delete(
  "/:id",
  ValidationMiddleware.validarParametroId,
  insumosController.delete
);

export default router;