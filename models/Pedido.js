// models/Pedido.js
import { promises as fs } from "fs"; // fs.promises para trabajar con archivos usando async/await
import { join, dirname } from "path"; // Para manejar rutas de archivos y directorios
import { fileURLToPath } from "url"; // Para obtener la ruta del archivo actual en módulos ES6

class Pedido {
    constructor() {
        // Obtener la ruta del archivo actual (__dirname equivalente en ES6)
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        // Ruta del archivo JSON donde se almacenan los pedidos
        this.filePath = join(__dirname, "../data/pedidos.json");
    }

    // ------------------ MÉTODOS PRIVADOS ------------------

    // Leer el archivo JSON y devolver los pedidos
    async _readFile() {
        try {
            const data = await fs.readFile(this.filePath, "utf8"); // Leer archivo como string
            return JSON.parse(data).pedidos || []; // Parsear JSON y devolver array de pedidos
        } catch (error) {
            console.error("Error al leer pedidos:", error); // Log de error
            return []; // Si hay error, devolver array vacío
        }
    }

    // Escribir el array de pedidos de vuelta al archivo JSON
    async _writeFile(pedidos) {
        try {
            const data = JSON.stringify({ pedidos }, null, 2); // Convertir a JSON con indentación
            await fs.writeFile(this.filePath, data, "utf8"); // Escribir archivo
        } catch (error) {
            console.error("Error al guardar pedidos:", error); // Log de error
            throw error; // Lanzar error para que sea capturado en métodos públicos
        }
    }

    // Validar un pedido según su tipo y normalizar la propiedad cliente
    _validatePedido(nuevoPedido) {
        if (!nuevoPedido.tipo) {
            throw new Error("El tipo de pedido es obligatorio"); // Validación básica
        }

        // Siempre definir cliente como objeto o null
        if (!nuevoPedido.clienteNombre) {
            nuevoPedido.clienteNombre = null;
            nuevoPedido.clienteTelefono = null;
            nuevoPedido.clienteDireccion = null;
        }

        if (nuevoPedido.tipo === "presencial") {
            // Si es tipo mesa
            if (nuevoPedido.numeroOrden?.startsWith("MESA")) {
                nuevoPedido.clienteNombre = null; // Mesa no tiene cliente
            } else {
                // Mostrador -> cliente opcional
                if (nuevoPedido.clienteNombre && typeof nuevoPedido.clienteNombre !== "object") {
                    throw new Error("Cliente inválido en pedido de mostrador");
                }
            }
        }

        if (nuevoPedido.tipo === "delivery") {
            // Para delivery, debe haber nombre, teléfono y dirección
            console.log("Nuevo pedido en Pedido.js",nuevoPedido)
            //const c = nuevoPedido.cliente || {};
            if (!nuevoPedido.nombreCliente || !nuevoPedido.telefonoCliente || !nuevoPedido.direccionCliente) {
                throw new Error("Los pedidos de delivery requieren nombreCliente, teléfonoCliente y direccionCliente");
            }
        }

        return nuevoPedido; // Devolver pedido normalizado y validado
    }

    // ------------------ MÉTODOS PÚBLICOS ------------------

    // Obtener todos los pedidos
    async getAll() {
        return await this._readFile();
    }

    // Obtener un pedido por su ID
    async getById(id) {
        const pedidos = await this._readFile();
        return pedidos.find(p => p.id === parseInt(id)) || null; // Buscar por ID
    }

    // Filtrar pedidos por tipo (presencial, delivery)
    async getByTipo(tipo) {
        const pedidos = await this._readFile();
        return pedidos.filter(p => p.tipo === tipo);
    }

    // Filtrar pedidos por plataforma (rappi, pedidosya, local)
    async getByPlataforma(plataforma) {
        const pedidos = await this._readFile();
        return pedidos.filter(p => p.plataforma === plataforma);
    }

    // Filtrar pedidos por estado (pendiente, en_preparacion, entregado)
    async getByEstado(estado) {
        const pedidos = await this._readFile();
        return pedidos.filter(p => p.estado === estado);
    }

    // Crear un nuevo pedido
    async create(nuevoPedido) {
        let pedidos = await this._readFile(); // Leer pedidos existentes

        // Validar y normalizar datos
        nuevoPedido = this._validatePedido(nuevoPedido);

        // Generar nuevo ID incremental
        const nuevoId =
            pedidos.length > 0
                ? Math.max(...pedidos.map(p => p.id)) + 1
                : 1;

        // Construir objeto de pedido final
        const pedido = {
            id: nuevoId,
            numeroOrden: nuevoPedido.numeroOrden || `ORD-${nuevoId.toString().padStart(3, "0")}`, // Número de orden automático si no viene
            items: nuevoPedido.items || [], // Array de productos
            total: nuevoPedido.total || 0, // Total del pedido
            tipo: nuevoPedido.tipo, // Tipo (presencial, delivery)
            plataforma: nuevoPedido.plataforma || "local", // Plataforma de pedido
            estado: nuevoPedido.estado || "pendiente", // Estado inicial
            fechaCreacion: new Date().toISOString(), // Fecha de creación automática
            tiempoEstimado: nuevoPedido.tiempoEstimado || 30, // Tiempo estimado en minutos
            observaciones: nuevoPedido.observaciones || "", // Observaciones opcionales
            nombreCliente: nuevoPedido.nombreCliente || null, // Cliente normalizado
            telefonoCliente: nuevoPedido.telefonoCliente || null, // Cliente normalizado
            direccionCliente: nuevoPedido.direccionCliente || null // Cliente normalizado
        };

        pedidos.push(pedido); // Agregar al array
        await this._writeFile(pedidos); // Guardar en JSON

        return pedido; // Devolver pedido creado
    }

    // Actualizar un pedido existente
    async update(id, datosActualizados) {
        let pedidos = await this._readFile(); // Leer pedidos
        const index = pedidos.findIndex(p => p.id === parseInt(id)); // Buscar índice por ID

        if (index === -1) {
            throw new Error("Pedido no encontrado"); // Error si no existe
        }

        // Mezclar datos existentes con los nuevos
        const pedidoActualizado = {
            ...pedidos[index],
            ...datosActualizados,
        };

        // Validar después de mezclar datos
        this._validatePedido(pedidoActualizado);

        pedidos[index] = pedidoActualizado; // Reemplazar pedido en array
        await this._writeFile(pedidos); // Guardar cambios

        return pedidoActualizado; // Devolver pedido actualizado
    }

    // Eliminar un pedido por ID
    async delete(id) {
        let pedidos = await this._readFile(); // Leer pedidos
        const pedidosFiltrados = pedidos.filter(p => p.id !== parseInt(id)); // Filtrar el que se elimina

        if (pedidos.length === pedidosFiltrados.length) {
            throw new Error("Pedido no encontrado"); // Error si no existía
        }

        await this._writeFile(pedidosFiltrados); // Guardar cambios
        return true; // Confirmación
    }
}

export default Pedido; // Exportar clase para usar en controladores o rutas
