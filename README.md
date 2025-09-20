# Sabor Urbano - Sistema de Gestión Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-4.18.2-blue.svg)
![Pug](https://img.shields.io/badge/Pug-3.0.2-orange.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.1.3-purple.svg)

Sistema de gestión integral para restaurante desarrollado con Node.js, Express y Programación Orientada a Objetos (módulos ES6). Incluye API REST completa para operaciones CRUD, interfaces web responsivas con vistas Pug para gestión visual y un sistema de filtros avanzado para tareas.

## Tabla de Contenidos
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Interfaces Web](#interfaces-web)
- [Testing](#testing)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)
- [Ejemplos](#ejemplos)
- [Normalización de Datos](#normalización-de-datos)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Características

### Funcionalidades Principales
- **Gestión de Tareas**: Control de actividades por área (gestión de pedidos o control de inventario), con estados (pendiente, en proceso, finalizada) y prioridades (alta, media, baja). Soporte para asignación a empleados y asociación con pedidos.
- **Gestión de Empleados**: Registro, edición y eliminación de empleados por roles (administrador, cocinero, repartidor, mozo, encargado_stock) y áreas (cocina, reparto, salón, inventario, administración).
- **Gestión de Clientes**: Registro de clientes con validación de email único y búsqueda por nombre/apellido.
- **Gestión de Pedidos**: Control de pedidos presenciales o delivery, con plataformas (Rappi, PedidosYa, propia, local). Parseo de ítems desde texto y cálculo proporcional de precios.
- **Control de Inventario**: Manejo de insumos por categorías (alimentos, bebidas, limpieza, utensilios, otros), con actualización de stock, descuentos y alertas de stock bajo.
- **Sistema de Filtros**: Filtros combinados para tareas (por estado, prioridad, área, empleado, tipo de pedido, plataforma y rangos de fechas).

### Características Técnicas
- API REST con operaciones CRUD y filtros avanzados.
- Modelos basados en Programación Orientada a Objetos para manejo de datos JSON.
- Middleware personalizado para validaciones (campos requeridos, email, números, fechas) y logging.
- Interfaces web con formularios interactivos y tablas responsivas usando Bootstrap.
- Script de normalización para migración y validación de datos JSON.
- Validación de unicidad y formato en campos clave (emails, stocks, fechas).
- Uso de archivos JSON como base de datos simulada para simplicidad.

## Arquitectura

```
📁 sabor-urbano-crud/
├── 🎮 controllers/            # Controladores con lógica de negocio
│   ├── clientesController.js
│   ├── empleadosController.js
│   ├── insumosController.js
│   ├── pedidosController.js
│   └── tareasController.js
├── 🏗️ models/                # Modelos POO para manejo de datos
│   ├── Cliente.js
│   ├── Empleado.js
│   ├── Insumo.js
│   ├── Pedido.js
│   └── Tarea.js
├── 🛣️ routes/                # Rutas de la API REST
│   ├── clientes.js
│   ├── empleados.js
│   ├── insumos.js
│   ├── pedidos.js
│   └── tareas.js
├── 🎨 views/                 # Vistas Pug para interfaces web
│   ├── layout.pug
│   ├── error.pug
│   ├── filters.pug
│   ├── empleados/
│   │   ├── index.pug
│   │   ├── nuevo.pug
│   │   └── editar.pug
│   ├── insumos/
│   │   ├── index.pug
│   │   ├── nuevo.pug
│   │   └── editar.pug
│   ├── pedidos/
│   │   ├── index.pug
│   │   ├── nuevo.pug
│   │   └── editar.pug
│   └── tareas/
│       ├── index.pug
│       ├── nueva.pug
│       └── editar.pug
├── 🛡️ middleware/            # Middleware personalizado
│   └── validation.js
├── 📊 data/                 # Base de datos JSON
│   ├── areas.json
│   ├── clientes.json
│   ├── empleados.json
│   ├── insumos.json
│   ├── pedidos.json
│   ├── roles.json
│   └── tareas.json
├── 🔄 scripts/               # Scripts de utilidad
│   └── normalizar_datos_v1.js
├── ⚙️ package.json          # Dependencias
└── 🚀 app.js               # Servidor principal
```

## Instalación

### Prerrequisitos
- Node.js v18 o superior.
- npm v8 o superior.
- Editor de código (VS Code recomendado).
- Thunder Client para testing de API (opcional).

### Instalación Paso a Paso
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/sabor-urbano-crud.git
   cd sabor-urbano-crud
   ```

2. Instalar dependencias:
   ```bash
   npm install
   npm install express pug method-override
   npm install --save-dev nodemon
   ```

3. Verificar scripts en `package.json`:
   ```json
   {
     "scripts": {
       "start": "node app.js",
       "dev": "nodemon app.js",
       "normalizar": "node scripts/normalizar_datos_v1.js",
       "test": "echo \"Testing with Thunder Client\""
     }
   }
   ```

4. Iniciar el servidor:
   ```bash
   # Desarrollo (con auto-reload)
   npm run dev

   # Producción
   npm start
   ```

5. Verificar instalación:
   - Servidor: http://localhost:3000 (redirige a /tareas).
   - API: http://localhost:3000/api/clientes.
   - Interfaces: http://localhost:3000/tareas.

## Uso

### Acceso a las Interfaces Web
| URL | Descripción |
|-----|-------------|
| http://localhost:3000 | Redirige a tareas |
| http://localhost:3000/tareas | Lista, creación y edición de tareas |
| http://localhost:3000/empleados | Gestión de empleados |
| http://localhost:3000/pedidos | Gestión de pedidos |
| http://localhost:3000/insumos | Control de inventario |
| http://localhost:3000/filtros | Filtros avanzados para tareas |

### Acceso a la API
- **Base URL**: http://localhost:3000/api
- **Formato**: JSON
- **Métodos**: GET, POST, PUT, DELETE, PATCH

## API Endpoints

### Clientes (/api/clientes)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Obtener todos los clientes |
| GET | /:id | Obtener cliente por ID |
| GET | /buscar?nombre=...&apellido=... | Buscar por nombre/apellido |
| GET | /validar-email?email=... | Validar email único |
| POST | / | Crear cliente |
| PUT | /:id | Actualizar cliente |
| DELETE | /:id | Eliminar cliente |

### Empleados (/api/empleados)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Obtener todos los empleados |
| GET | /:id | Obtener empleado por ID |
| GET | /rol/:rol | Filtrar por rol |
| GET | /area/:area | Filtrar por área |
| GET | /validar-email?email=... | Validar email único |
| GET | /roles | Obtener roles disponibles |
| GET | /areas | Obtener áreas disponibles |
| POST | / | Crear empleado |
| PUT | /:id | Actualizar empleado |
| DELETE | /:id | Eliminar empleado |

### Pedidos (/api/pedidos)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Obtener todos los pedidos |
| GET | /:id | Obtener pedido por ID |
| GET | /tipo/:tipo | Filtrar por tipo (presencial/delivery) |
| GET | /plataforma/:plataforma | Filtrar por plataforma |
| GET | /estado/:estado | Filtrar por estado |
| POST | / | Crear pedido |
| PUT | /:id | Actualizar pedido |
| DELETE | /:id | Eliminar pedido |

### Insumos (/api/insumos)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Obtener todos los insumos |
| GET | /:id | Obtener insumo por ID |
| GET | /bajo-stock | Insumos con stock bajo |
| GET | /alertas | Alertas de stock bajo o sin stock |
| GET | /categoria/:categoria | Filtrar por categoría |
| POST | / | Crear insumo |
| PUT | /:id | Actualizar insumo |
| PUT | /:id/stock | Actualizar stock absoluto |
| PUT | /:id/descontar | Descontar stock |
| DELETE | /:id | Eliminar insumo |

### Tareas (/api/tareas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Obtener todas (soporta filtros query) |
| GET | /:id | Obtener tarea por ID |
| GET | /area/:area | Filtrar por área |
| POST | / | Crear tarea |
| PUT | /:id | Actualizar tarea |
| PATCH | /:id/iniciar | Iniciar tarea |
| PATCH | /:id/finalizar | Finalizar tarea |
| DELETE | /:id | Eliminar tarea |

## Interfaces Web
- **Tareas**: Tabla con filtros por estado, prioridad y área. Formularios para crear/editar tareas con asignación de empleados y pedidos.
- **Empleados**: Tabla con información de contacto, rol y área. Formularios con validación de email único y selects para roles/áreas.
- **Pedidos**: Lista con detalles de cliente, ítems y estado. Formularios para parsear ítems desde texto.
- **Insumos**: Tabla con stock y alertas visuales (bajo_stock, sin_stock). Formularios para gestionar stock.
- **Filtros**: Interfaz para combinar filtros en tareas (estado, prioridad, área, fechas).

## Testing
Prueba la API con Thunder Client o Postman. Ejemplos:

- **Crear tarea**:
  ```http
  POST http://localhost:3000/api/tareas
  Content-Type: application/json

  {
    "titulo": "Confirmar pedido",
    "descripcion": "Verificar pedido RAPPI-456",
    "area": "gestion_pedidos",
    "prioridad": "alta",
    "empleadoAsignado": 2
  }
  ```

- **Filtrar tareas pendientes de alta prioridad**:
  ```http
  GET http://localhost:3000/api/tareas?estado=pendiente&prioridad=alta
  ```

- **Validar email único**:
  ```http
  GET http://localhost:3000/api/empleados/validar-email?email=juan@example.com
  ```

- **Error por datos faltantes**:
  ```http
  POST http://localhost:3000/api/clientes
  Content-Type: application/json

  {
    "nombre": "Test"
  }
  ```

## Estructura del Proyecto

### Modelos (POO)
- Clases para cada entidad (`Cliente`, `Empleado`, `Insumo`, `Pedido`, `Tarea`) con métodos para CRUD y filtros.
- Ejemplo: `Tarea.filtrar()` soporta combinaciones de estado, prioridad, área, etc.

### Controladores
- Lógica de negocio, como parseo de ítems en pedidos o validación de stock.

### Rutas
- API REST con endpoints para CRUD y filtros.
- Rutas de vistas para formularios (`/tareas/nueva`, `/empleados/editar/:id`).

### Middleware
- Validaciones: campos requeridos, email, números, fechas.
- Sanitización de datos y logging de solicitudes.

### Data
- **clientes.json**: Clientes con id, nombre, apellido, email, teléfono.
- **empleados.json**: Empleados con rol y área.
- **insumos.json**: Insumos con stock, categoría y estado.
- **pedidos.json**: Pedidos con ítems, cliente y estado.
- **tareas.json**: Tareas con área, prioridad y referencias a empleados/pedidos.
- **roles.json** y **areas.json**: Validación de formularios.

### Ejemplo de clientes.json
```json
{
  "clientes": [
    {
      "id": 1,
      "nombre": "Lucía",
      "apellido": "Martínez",
      "email": "lucia.martinez@example.com",
      "telefono": "11-2233-4455"
    }
  ]
}
```
- **Campos**: `id` (número, requerido), `nombre` (string, requerido), `apellido` (string, requerido), `email` (string único, requerido), `telefono` (string, opcional).

## Tecnologías
- **Backend**: Node.js v18+, Express 4.18.2.
- **Vistas**: Pug 3.0.2, Bootstrap 5.1.3, Font Awesome 6.0.0.
- **Desarrollo**: Nodemon, Thunder Client.

## Ejemplos

- **Crear empleado**:
  ```bash
  curl -X POST http://localhost:3000/api/empleados -H "Content-Type: application/json" -d '{"nombre":"Juan","apellido":"Doe","email":"juan@example.com","telefono":"11-1234-5678","rol":"cocinero","area":"cocina"}'
  ```

- **Crear pedido**:
  ```bash
  curl -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"clienteId":1,"itemsText":"2 hamburguesas, 1 gaseosa","total":5000,"tipo":"delivery","plataforma":"rappi"}'
  ```

- **Descontar stock**:
  ```bash
  curl -X PUT http://localhost:3000/api/insumos/1/descontar -H "Content-Type: application/json" -d '{"cantidad":5}'
  ```

- **Filtrar insumos con stock bajo**:
  ```bash
  curl http://localhost:3000/api/insumos/bajo-stock
  ```

## Normalización de Datos
El script `normalizar_datos_v1.js` asegura la integridad de los archivos JSON:
- Normaliza categorías de insumos (ej: "verduras" → "alimentos").
- Convierte valores numéricos (stock, total, etc.).
- Valida referencias en tareas (empleados, pedidos).
- Completa campos faltantes (observaciones, fechas).
- Genera backups automáticos.

**Ejecutar**:
```bash
npm run normalizar
```

## Contribución
1. Fork el repositorio.
2. Crea branch: `git checkout -b feature/nueva-funcionalidad`.
3. Commit: `git commit -m 'Agregar funcionalidad'`.
4. Push: `git push origin feature/nueva-funcionalidad`.
5. Pull Request usando la plantilla en `.github/PULL_REQUEST_TEMPLATE.md`.

**Reportar Bugs**:
- Usa la plantilla en `.github/ISSUE_TEMPLATE.md`.

**Estándares**:
- Usa ESLint para formato.
- Comentarios en español.
- Nombres descriptivos.

## Equipo de Desarrollo
- Juan Dualibe  
- Nicolás Weibel  
- Rocío Gómez  
- Juan Manuel Gasbarro  
- Germán Rodríguez  