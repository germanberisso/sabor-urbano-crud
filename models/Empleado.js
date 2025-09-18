// Importa módulos para manejo de archivos y rutas
const fs = require('fs').promises;
const path = require('path');

// Clase para gestionar operaciones CRUD de empleados usando JSON
class Empleado {
    // Inicializa la ruta al archivo empleados.json
    constructor() {
        this.filePath = path.join(__dirname, '../data/empleados.json');
    }

    // Lee todos los empleados desde el archivo JSON
    async getAll() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            const json = JSON.parse(data);
            return json.empleados || [];
        } catch (error) {
            console.error('Error al leer empleados:', error);
            return [];
        }
    }

    // NUEVOS MÉTODOS PARA ROLES Y ÁREAS

    // Lee la lista de roles desde roles.json
    async getRoles() {
        try {
            const rolesPath = path.join(__dirname, '../data/roles.json');
            const data = await fs.readFile(rolesPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer roles:', error);
            return [];
        }
    }

    // Lee la lista de áreas desde areas.json
    async getAreas() {
        try {
            const areasPath = path.join(__dirname, '../data/areas.json');
            const data = await fs.readFile(areasPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer áreas:', error);
            return [];
        }
    }

    // Valida si un rol es válido y está activo
    async validarRol(rol) {
        const roles = await this.getRoles();
        return roles.some(r => r.nombre === rol && r.activo);
    }

    // Valida si un área es válida y está activa
    async validarArea(area) {
        const areas = await this.getAreas();
        return areas.some(a => a.nombre === area && a.activa);
    }
    // FIN DE NUEVOS MÉTODOS

    // Obtiene un empleado por su ID
    async getById(id) {
        try {
            const empleados = await this.getAll();
            return empleados.find(empleado => empleado.id === parseInt(id));
        } catch (error) {
            console.error('Error al obtener empleado por ID:', error);
            return null;
        }
    }

    // Filtra empleados por rol, solo activos
    async getByRol(rol) {
        try {
            const empleados = await this.getAll();
            return empleados.filter(empleado => 
                empleado.rol === rol && empleado.activo
            );
        } catch (error) {
            console.error('Error al filtrar por rol:', error);
            return [];
        }
    }

    // Filtra empleados por área, solo activos
    async getByArea(area) {
        try {
            const empleados = await this.getAll();
            return empleados.filter(empleado => 
                empleado.area === area && empleado.activo
            );
        } catch (error) {
            console.error('Error al filtrar por área:', error);
            return [];
        }
    }

    // Obtiene todos los empleados activos
    async getActivos() {
        try {
            const empleados = await this.getAll();
            return empleados.filter(empleado => empleado.activo);
        } catch (error) {
            console.error('Error al obtener empleados activos:', error);
            return [];
        }
    }

    // Crea un nuevo empleado con validaciones
    async create(nuevoEmpleado) {
        try {
            // Valida que el email no esté en uso
            const emailUnico = await this.validarEmailUnico(nuevoEmpleado.email);
            if (!emailUnico) {
                throw new Error('El email ya está en uso');
            }
            const empleados = await this.getAll();
            // Genera un nuevo ID incremental
            const nuevoId = empleados.length > 0 ? Math.max(...empleados.map(e => e.id)) + 1 : 1;
            // Crea el objeto empleado con valores por defecto
            const empleado = {
                id: nuevoId,
                nombre: nuevoEmpleado.nombre,
                apellido: nuevoEmpleado.apellido,
                email: nuevoEmpleado.email,
                telefono: nuevoEmpleado.telefono,
                rol: nuevoEmpleado.rol, // administrador, cocinero, repartidor, mozo, encargado_stock
                area: nuevoEmpleado.area, // cocina, reparto, salon, inventario, administracion
                fechaIngreso: nuevoEmpleado.fechaIngreso || new Date().toISOString().split('T')[0],
                activo: true
            };
            empleados.push(empleado);
            // Guarda los cambios en el archivo JSON
            await this.saveAll(empleados);
            return empleado;
        } catch (error) {
            console.error('Error al crear empleado:', error);
            throw error;
        }
    }

    // Actualiza un empleado existente
    async update(id, datosActualizados) {
        try {
            const empleados = await this.getAll();
            const index = empleados.findIndex(empleado => empleado.id === parseInt(id));
            // Verifica si el empleado existe
            if (index === -1) {
                throw new Error('Empleado no encontrado');
            }
            // Valida email único si se actualiza
            if (datosActualizados.email) {
                const emailUnico = await this.validarEmailUnico(datosActualizados.email, parseInt(id));
                if (!emailUnico) {
                    throw new Error('El email ya está en uso');
                }
            }
            // Actualiza los datos del empleado
            empleados[index] = { ...empleados[index], ...datosActualizados };
            await this.saveAll(empleados);
            return empleados[index];
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            throw error;
        }
    }

    // Desactiva un empleado (eliminación lógica)
    async delete(id) {
        try {
            return await this.update(id, { activo: false });
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            throw error;
        }
    }

    // Valida si un email está disponible, excluyendo un ID opcional
    async validarEmailUnico(email, idExcluir = null) {
        try {
            const empleados = await this.getAll();
            return !empleados.some(emp => 
                emp.email === email && 
                emp.id !== idExcluir && 
                emp.activo
            );
        } catch (error) {
            console.error('Error al validar email:', error);
            return false;
        }
    }

    // Calcula estadísticas de empleados por rol y área
    async getEstadisticas() {
        try {
            const empleados = await this.getActivos();
            // Genera estadísticas agrupadas por rol y área
            const stats = {
                total: empleados.length,
                porRol: {
                    administrador: empleados.filter(e => e.rol === 'administrador').length,
                    cocinero: empleados.filter(e => e.rol === 'cocinero').length,
                    repartidor: empleados.filter(e => e.rol === 'repartidor').length,
                    mozo: empleados.filter(e => e.rol === 'mozo').length,
                    encargado_stock: empleados.filter(e => e.rol === 'encargado_stock').length
                },
                porArea: {
                    cocina: empleados.filter(e => e.area === 'cocina').length,
                    reparto: empleados.filter(e => e.area === 'reparto').length,
                    salon: empleados.filter(e => e.area === 'salon').length,
                    inventario: empleados.filter(e => e.area === 'inventario').length,
                    administracion: empleados.filter(e => e.area === 'administracion').length
                }
            };
            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas de empleados:', error);
            return {};
        }
    }

    // Guarda todos los empleados en el archivo JSON
    async saveAll(empleados) {
        try {
            const data = JSON.stringify({ empleados }, null, 2);
            await fs.writeFile(this.filePath, data, 'utf8');
        } catch (error) {
            console.error('Error al guardar empleados:', error);
            throw error;
        }
    }
}

module.exports = Empleado;