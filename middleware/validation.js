import mongoose from 'mongoose';

class ValidationMiddleware {
    // Valida campos obligatorios en body
    static validarCamposRequeridos(camposRequeridos) {
        return (req, res, next) => {
            const camposFaltantes = [];
            for (const campo of camposRequeridos) {
                if (!req.body[campo] || req.body[campo].toString().trim() === "") {
                    camposFaltantes.push(campo);
                }
            }
            if (camposFaltantes.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Campos requeridos faltantes: ${camposFaltantes.join(", ")}`,
                    camposFaltantes,
                });
            }
            next();
        };
    }

    // Valida formato de email
    static validarEmail(req, res, next) {
        const { email } = req.body;
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Formato de email no válido",
                });
            }
        }
        next();
    }

    // Valida campo numérico >= 0
    static validarNumerico(campo) {
        return (req, res, next) => {
            const valor = req.body[campo];
            if (valor !== undefined && (isNaN(Number(valor)) || Number(valor) < 0)) {
                return res.status(400).json({
                    success: false,
                    message: `El campo ${campo} debe ser un número válido mayor o igual a 0`,
                });
            }
            next();
        };
    }

    // Valida formato de fecha
    static validarFecha(campo) {
        return (req, res, next) => {
            const fecha = req.body[campo];
            if (fecha && isNaN(Date.parse(fecha))) {
                return res.status(400).json({
                    success: false,
                    message: `El campo ${campo} debe ser una fecha válida`,
                });
            }
            next();
        };
    }

    // Sanitiza strings en body
    static sanitizarDatos(req, res, next) {
        for (const key in req.body) {
            if (typeof req.body[key] === "string") {
                req.body[key] = req.body[key].trim();
            }
        }
        next();
    }

    // Log de requests
    static logRequest(req, res, next) {
        const timestamp = new Date().toISOString();
        const method = req.method;
        const url = req.originalUrl;
        const ip = req.ip || req.connection.remoteAddress;
        console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
        if ((method === "POST" || method === "PUT") && req.body) {
            console.log(`[${timestamp}] Body:`, JSON.stringify(req.body, null, 2));
        }
        next();
    }

    // Valida parámetro id como ObjectId de MongoDB (params, query o body)
    static validarMongoId(campo, origen = "params") {
        return (req, res, next) => {
            const valor = req[origen][campo];
            if (!mongoose.Types.ObjectId.isValid(valor)) {
                return res.status(400).json({
                    success: false,
                    message: `El campo ${campo} debe ser un ObjectId válido de MongoDB`,
                });
            }
            next();
        };
    }

    // Valida arrays de ObjectId
    static validarMongoIdArray(campo, origen = "body") {
        return (req, res, next) => {
            const valores = req[origen][campo];
            if (!Array.isArray(valores)) {
                return res.status(400).json({
                    success: false,
                    message: `El campo ${campo} debe ser un array`,
                });
            }
            for (const id of valores) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({
                        success: false,
                        message: `El campo ${campo} contiene un valor no válido: ${id}`,
                    });
                }
            }
            next();
        };
    }

    // Valida filtros de query (fechas, límite)
    static validarFiltros(req, res, next) {
        const { fechaDesde, fechaHasta, limite } = req.query;
        if (fechaDesde && isNaN(Date.parse(fechaDesde))) {
            return res.status(400).json({
                success: false,
                message: "fechaDesde debe ser una fecha válida",
            });
        }
        if (fechaHasta && isNaN(Date.parse(fechaHasta))) {
            return res.status(400).json({
                success: false,
                message: "fechaHasta debe ser una fecha válida",
            });
        }
        if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
            return res.status(400).json({
                success: false,
                message: "fechaDesde debe ser menor que fechaHasta",
            });
        }
        if (limite && (isNaN(parseInt(limite)) || parseInt(limite) <= 0)) {
            return res.status(400).json({
                success: false,
                message: "limite debe ser un número mayor a 0",
            });
        }
        next();
    }

    // Middleware global de manejo de errores
    static manejarErrores(err, req, res, next) {
        console.error("Error capturado por middleware:", err);
        if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
            return res.status(400).json({
                success: false,
                message: "JSON mal formateado en el body de la request",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? err.message : "Contacte al administrador",
        });
    }

    // Establece headers CORS y content-type
    static establecerHeaders(req, res, next) {
        if (req.url.startsWith("/api/")) {
            res.header("Content-Type", "application/json; charset=utf-8");
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        next();
    }
}

export default ValidationMiddleware;