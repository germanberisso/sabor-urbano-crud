import express from "express";
import PedidosController from "../controllers/pedidosController.js";
import ValidationMiddleware from "../middleware/validation.js";

const router = express.Router();
const pedidosController = new PedidosController();

// 🔹 Middleware personalizado de validación para crear/actualizar pedidos
const validarPedido = (req, res, next) => {
  const {
    items,
    total,
    tipo,
    plataforma,
    estado,
    tiempoEstimado,
    observaciones,
    nombreCliente,
    telefonoCliente,
    direccionCliente,
  } = req.body;

  // 🧩 Verificar body vacío en PUT
  if (req.method === "PUT" && Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message:
        "El body de la solicitud no puede estar vacío. Debe incluir al menos un campo para actualizar.",
    });
  }

  // 🧩 Validar tipo
  if (tipo && !["presencial", "delivery"].includes(tipo)) {
    return res.status(400).json({
      success: false,
      message: "Tipo debe ser: presencial o delivery",
    });
  }

  // 🧩 Validar plataforma
  if (
    plataforma &&
    !["rappi", "pedidosya", "propia", "local"].includes(plataforma)
  ) {
    return res.status(400).json({
      success: false,
      message: "Plataforma debe ser: rappi, pedidosya, propia o local",
    });
  }

  // 🧩 Validar estado
  if (
    estado &&
    !["pendiente", "en_preparacion", "entregado"].includes(estado)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Estado debe ser: pendiente, en_preparacion o entregado",
    });
  }

  // 🧩 Validar campos obligatorios para delivery
  if (tipo === "delivery") {
    if (!nombreCliente || !telefonoCliente || !direccionCliente) {
      return res.status(400).json({
        success: false,
        message:
          "Los pedidos de delivery requieren nombreCliente, telefonoCliente y direccionCliente",
      });
    }
  }

  next();
};

//
// -------------------- RUTAS API --------------------
//

// GET /api/pedidos → todos los pedidos
router.get("/", (req, res) => pedidosController.getAll(req, res));

// GET /api/pedidos/:id → pedido por ID
router.get("/:id", (req, res) => pedidosController.getById(req, res));

// POST /api/pedidos → crear nuevo pedido
router.post(
  "/",
  ValidationMiddleware.validarCamposRequeridos(["items", "total", "tipo", "plataforma"]),
  validarPedido,
  (req, res) => pedidosController.create(req, res)
);

// PUT /api/pedidos/:id → actualizar pedido existente
router.put("/:id", validarPedido, (req, res) => pedidosController.update(req, res));

// DELETE /api/pedidos/:id → eliminar pedido
router.delete("/:id", (req, res) => pedidosController.delete(req, res));

export default router;