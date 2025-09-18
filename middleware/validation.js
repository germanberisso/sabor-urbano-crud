// Middleware para validaciones y manejo de solicitudes
class ValidationMiddleware {
  // Valida campos requeridos en el cuerpo de la solicitud
  static validarCamposRequeridos(camposRequeridos) {
    return (req, res, next) => {
      const camposFaltantes = [];
      // Verifica si los campos requeridos están presentes y no vacíos
      for (const campo of camposRequeridos) {
        if (!req.body[campo] || req.body[campo].toString().trim() === "") {
          camposFaltantes.push(campo);
        }
      }
      // Retorna error si faltan campos
      if (camposFaltantes.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Campos requeridos faltantes: ${camposFaltantes.join(", ")}`,
          camposFaltantes: camposFaltantes,
        });
      }
      // Continúa al siguiente middleware
      next();
    };
  }

  // Valida el formato del email en el cuerpo de la solicitud
  static validarEmail(req, res, next) {
    const { email } = req.body;
    // Verifica el formato del email si está presente
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Formato de email no válido",
        });
      }
    }
    // Continúa al siguiente middleware
    next();
  }

  // Valida que un campo sea numérico y no negativo
  static validarNumerico(campo) {
    return (req, res, next) => {
      const valor = req.body[campo];
      // Verifica si el valor es un número válido y no negativo
      if (valor !== undefined && (isNaN(Number(valor)) || Number(valor) < 0)) {
        return res.status(400).json({
          success: false,
          message: `El campo ${campo} debe ser un número válido mayor o igual a 0`,
        });
      }
      // Continúa al siguiente middleware
      next();
    };
  }

  // Valida que un campo sea una fecha válida
  static validarFecha(campo) {
    return (req, res, next) => {
      const fecha = req.body[campo];
      // Verifica si el campo es una fecha válida
      if (fecha && isNaN(Date.parse(fecha))) {
        return res.status(400).json({
          success: false,
          message: `El campo ${campo} debe ser una fecha válida`,
        });
      }
      // Continúa al siguiente middleware
      next();
    };
  }

  // Sanitiza datos de entrada eliminando espacios en blanco
  static sanitizarDatos(req, res, next) {
    // Limpia espacios en blanco de valores string en el cuerpo
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    }
    // Continúa al siguiente middleware
    next();
  }

  // Registra información de las solicitudes entrantes
  static logRequest(req, res, next) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    // Log de método, URL e IP
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    // Log del cuerpo para solicitudes POST y PUT
    if ((method === "POST" || method === "PUT") && req.body) {
      console.log(`[${timestamp}] Body:`, JSON.stringify(req.body, null, 2));
    }
    // Continúa al siguiente middleware
    next();
  }

  // Valida que el parámetro ID en la URL sea numérico y positivo
  static validarParametroId(req, res, next) {
    const { id } = req.params;
    // Verifica si el ID es un número válido y mayor a 0
    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "El ID debe ser un número válido mayor a 0",
      });
    }
    // Continúa al siguiente middleware
    next();
  }

  // Valida parámetros de búsqueda en query params
  static validarFiltros(req, res, next) {
    const { fechaDesde, fechaHasta, limite } = req.query;
    // Valida formato de fechaDesde si está presente
    if (fechaDesde && isNaN(Date.parse(fechaDesde))) {
      return res.status(400).json({
        success: false,
        message: "fechaDesde debe ser una fecha válida",
      });
    }
    // Valida formato de fechaHasta si está presente
    if (fechaHasta && isNaN(Date.parse(fechaHasta))) {
      return res.status(400).json({
        success: false,
        message: "fechaHasta debe ser una fecha válida",
      });
    }
    // Valida que fechaDesde sea menor que fechaHasta
    if (
      fechaDesde &&
      fechaHasta &&
      new Date(fechaDesde) > new Date(fechaHasta)
    ) {
      return res.status(400).json({
        success: false,
        message: "fechaDesde debe ser menor que fechaHasta",
      });
    }
    // Valida que limite sea un número positivo
    if (limite && (isNaN(parseInt(limite)) || parseInt(limite) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "limite debe ser un número mayor a 0",
      });
    }
    // Continúa al siguiente middleware
    next();
  }

  // Maneja errores de manera consistente
  static manejarErrores(err, req, res, next) {
    console.error("Error capturado por middleware:", err);
    // Maneja error de JSON mal formateado
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
        success: false,
        message: "JSON mal formateado en el body de la request",
      });
    }
    // Maneja errores genéricos del servidor
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Contacte al administrador",
    });
  }

  // Establece headers de respuesta para la API
  static establecerHeaders(req, res, next) {
    // Configura Content-Type para rutas de API
    if (req.url.startsWith("/api/")) {
      res.header("Content-Type", "application/json; charset=utf-8");
    }
    // Configura headers CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    // Continúa al siguiente middleware
    next();
  }
}

module.exports = ValidationMiddleware;