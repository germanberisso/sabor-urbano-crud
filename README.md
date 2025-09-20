# Sabor Urbano - Sistema de Gestión Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-4.18.2-blue.svg)
![Pug](https://img.shields.io/badge/Pug-3.0.2-orange.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.1.3-purple.svg)

Sistema de gestión integral para el restaurante "Sabor Urbano", desarrollado con Node.js, Express y Programación Orientada a Objetos (ES6 modules). Incluye una API REST completa para operaciones CRUD, interfaces web responsivas con Pug para gestión visual, y filtros avanzados para tareas. Resuelve la unificación de pedidos (presenciales y delivery) y el control de inventario, con relaciones explícitas entre modelos: Cliente-Pedido, Tarea-Pedido y Tarea-Empleado.

## Tabla de Contenidos
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Interfaces Web](#interfaces-web)
- [Testing](#testing)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Normalización de Datos](#normalización-de-datos)
- [Tecnologías](#tecnologías)
- [Ejemplos](#ejemplos)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Responsabilidades del Equipo](#responsabilidades-del-equipo)
- [Bibliografía](#bibliografía)

## Características

### Funcionalidades Principales
- **Gestión de Tareas**: Control de actividades por áreas (gestión de pedidos, control de inventario). Soporta estados (pendiente, en proceso, finalizada), prioridades (alta, media, baja), asignación a empleados y asociación opcional con pedidos.
- **Gestión de Empleados**: Registro, edición y eliminación con roles (administrador, cocinero, repartidor, mozo, encargado_stock) y áreas (cocina, reparto, salón, inventario, administración).
- **Gestión de Clientes**: Registro con validación de email único y búsqueda por nombre/apellido.
- **Gestión de Pedidos**: Unifica pedidos presenciales y delivery (plataformas: Rappi, PedidosYa, propia, local). Parseo de ítems desde texto y cálculo proporcional de precios.
- **Control de Inventario**: Manejo de insumos por categorías (alimentos, bebidas, limpieza, utensilios, otros), con alertas de stock bajo/sin stock.
- **Filtros de Tareas**: Combina estado, prioridad, fechas (creación, inicio, finalización), empleado asignado, tipo de pedido (presencial/delivery) y plataforma.
- **Relaciones entre Modelos**:
  - **Cliente-Pedido**: Cada pedido está vinculado a un cliente mediante `clienteId`.
  - **Tarea-Pedido**: Tareas de gestión de pedidos pueden asociarse a un pedido vía `pedidoAsociado`.
  - **Tarea-Empleado**: Tareas pueden asignarse a un empleado vía `empleadoAsignado`.

### Características Técnicas
- API REST con CRUD y filtros avanzados, usando ES6 modules (migrado desde CommonJS).
- Modelos POO para entidades (Cliente, Empleado, Pedido, Insumo, Tarea).
- Middleware personalizado para validaciones (campos requeridos, email, números, fechas).
- Vistas Pug con formularios y tablas responsivas (Bootstrap) para CRUD completo.
- Base de datos JSON con validación de referencias cruzadas.
- Script de normalización para migración de datos y backups automáticos.

## Arquitectura

```
📁 sabor-urbano-crud/
├── 🎮 controllers/            # Lógica de negocio
│   ├── clientesController.js
│   ├── empleadosController.js
│   ├── insumosController.js
│   ├── pedidosController.js
│   └── tareasController.js
├── 🏗️ models/                # Clases POO con relaciones
│   ├── Cliente.js
│   ├── Empleado.js
│   ├── Insumo.js
│   ├── Pedido.js
│   └── Tarea.js
├── 🛣️ routes/                # Rutas API y vistas
│   ├── clientes.js
│   ├── empleados.js
│   ├── insumos.js
│   ├── pedidos.js
│   └── tareas.js
├── 🎨 views/                 # Vistas Pug
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
├── 🛡️ middleware/            # Validaciones personalizadas
│   └── validation.js
├── 📊 data/                 # Base de datos JSON
│   ├── areas.json
│   ├── clientes.json
│   ├── empleados.json
│   ├── insumos.json
│   ├── pedidos.json
│   ├── roles.json
│   └── tareas.json
├── 🔄 scripts/               # Utilidades
│   └── normalizar_datos_v1.js
├── ⚙️ package.json          # Dependencias
└── 🚀 app.js               # Servidor Express
```

## Instalación

### Prerrequisitos
- Node.js v18+.
- npm v8+.
- Editor de código (VS Code recomendado).
- Thunder Client/Postman para pruebas.

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
   # Desarrollo (auto-reload)
   npm run dev
   # Producción
   npm start
   ```

5. Verificar:
   - Servidor: http://localhost:3000 (redirige a /tareas).
   - API: http://localhost:3000/api/clientes.
   - Vistas: http://localhost:3000/tareas.

## Uso

### Interfaces Web
| URL | Descripción |
|-----|-------------|
| http://localhost:3000 | Redirige a tareas |
| http://localhost:3000/tareas | Lista, crear, editar tareas |
| http://localhost:3000/empleados | Gestión de empleados |
| http://localhost:3000/pedidos | Gestión de pedidos |
| http://localhost:3000/insumos | Control de inventario |
| http://localhost:3000/filtros | Filtros avanzados para tareas |

### API
- **Base URL**: http://localhost:3000/api
- **Formato**: JSON
- **Métodos**: GET, POST, PUT, DELETE, PATCH

## API Endpoints

### Clientes (/api/clientes)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Todos los clientes |
| GET | /:id | Cliente por ID |
| GET | /buscar?nombre=...&apellido=... | Buscar por nombre/apellido |
| GET | /validar-email?email=... | Validar email único |
| POST | / | Crear cliente |
| PUT | /:id | Actualizar cliente |
| DELETE | /:id | Eliminar cliente |

### Empleados (/api/empleados)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Todos los empleados |
| GET | /:id | Empleado por ID |
| GET | /rol/:rol | Filtrar por rol |
| GET | /area/:area | Filtrar por área |
| GET | /validar-email?email=... | Validar email único |
| GET | /roles | Roles disponibles |
| GET | /areas | Áreas disponibles |
| POST | / | Crear empleado |
| PUT | /:id | Actualizar empleado |
| DELETE | /:id | Eliminar empleado |

### Pedidos (/api/pedidos)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Todos los pedidos |
| GET | /:id | Pedido por ID |
| GET | /tipo/:tipo | Filtrar por tipo (presencial/delivery) |
| GET | /plataforma/:plataforma | Filtrar por plataforma |
| GET | /estado/:estado | Filtrar por estado |
| POST | / | Crear pedido (valida clienteId) |
| PUT | /:id | Actualizar pedido |
| DELETE | /:id | Eliminar pedido |

### Insumos (/api/insumos)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Todos los insumos |
| GET | /:id | Insumo por ID |
| GET | /bajo-stock | Insumos con stock bajo |
| GET | /alertas | Alertas de stock |
| GET | /categoria/:categoria | Filtrar por categoría |
| POST | / | Crear insumo |
| PUT | /:id | Actualizar insumo |
| PUT | /:id/stock | Actualizar stock |
| PUT | /:id/descontar | Descontar stock |
| DELETE | /:id | Eliminar insumo |

### Tareas (/api/tareas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | / | Todas (con filtros query) |
| GET | /:id | Tarea por ID |
| GET | /area/:area | Filtrar por área |
| POST | / | Crear tarea (valida empleadoAsignado, pedidoAsociado) |
| PUT | /:id | Actualizar tarea |
| PATCH | /:id/iniciar | Iniciar tarea |
| PATCH | /:id/finalizar | Finalizar tarea |
| DELETE | /:id | Eliminar tarea |

## Interfaces Web
- **Tareas**: Tabla con filtros (estado, prioridad, área). Formularios para crear/editar con selects para empleados/pedidos, soportando CRUD completo.
- **Empleados**: Tabla con rol/área. Formularios con validación de email.
- **Pedidos**: Lista con cliente/ítems. Formularios parsean ítems desde texto.
- **Insumos**: Tabla con alertas (bajo_stock/sin_stock). Formularios para stock.
- **Filtros**: Interfaz para combinar filtros en tareas.

## Testing
Prueba con Thunder Client/Postman. Ejemplos:
- **Crear pedido (relación con cliente)**:
  ```http
  POST http://localhost:3000/api/pedidos
  Content-Type: application/json

  {
    "clienteId": 1,
    "itemsText": "2 hamburguesas, 1 gaseosa",
    "total": 5000,
    "tipo": "delivery",
    "plataforma": "rappi"
  }
  ```
- **Crear tarea (relación con empleado/pedido)**:
  ```http
  POST http://localhost:3000/api/tareas
  Content-Type: application/json

  {
    "titulo": "Confirmar RAPPI-456",
    "area": "gestion_pedidos",
    "prioridad": "alta",
    "empleadoAsignado": 2,
    "pedidoAsociado": 1
  }
  ```
- **Filtrar tareas**:
  ```http
  GET http://localhost:3000/api/tareas?estado=pendiente&prioridad=alta
  ```
- **Error (clienteId inválido)**:
  ```http
  POST http://localhost:3000/api/pedidos
  Content-Type: application/json

  {
    "clienteId": 999,
    "itemsText": "1 pizza"
  }
  ```

## Estructura del Proyecto

### Modelos (POO)
- Clases: `Cliente`, `Empleado`, `Insumo`, `Pedido`, `Tarea`.
- Relaciones:
  - **Cliente-Pedido**: `pedidos.json` usa `clienteId` (valida con `Cliente.getById`).
  - **Tarea-Pedido**: `tareas.json` usa `pedidoAsociado` (valida con `Pedido.getById`).
  - **Tarea-Empleado**: `tareas.json` usa `empleadoAsignado` (valida con `Empleado.getById`).
- Métodos: CRUD (`getAll`, `create`, `update`, `delete`), filtros (`Tarea.filtrar`).

### Controladores
- Manejan lógica (ej: parseo de ítems en `pedidosController.js`).

### Rutas
- API: `/api/:recurso/:id`.
- Vistas: `/:recurso/nueva`, `/:recurso/editar/:id`.

### Middleware
- Validaciones: campos requeridos, email, números, fechas (en `validation.js`).

### Data (JSON)
- **clientes.json**: `{ id, nombre, apellido, email, telefono }`.
- **empleados.json**: `{ id, nombre, apellido, email, telefono, rol, area, fechaIngreso }`.
- **pedidos.json**: `{ id, numeroOrden, clienteId, items, total, tipo, plataforma, estado, fechaCreacion, tiempoEstimado, observaciones }`.
- **insumos.json**: `{ id, nombre, categoria, stock, stockMinimo, unidadMedida, proveedor, ultimaActualizacion, estado }`.
- **tareas.json**: `{ id, titulo, descripcion, area, estado, prioridad, empleadoAsignado, pedidoAsociado, observaciones, fechaCreacion, fechaInicio, fechaFinalizacion }`.
- **roles.json**, **areas.json**: Validación de formularios.

### Ejemplo de pedidos.json
```json
{
  "pedidos": [
    {
      "id": 1,
      "numeroOrden": "MESA-01",
      "clienteId": 5,
      "items": [
        { "producto": "Pizza Muzza", "cantidad": 1, "precio": 3033.33 }
      ],
      "total": 9100,
      "tipo": "presencial",
      "plataforma": "local",
      "estado": "entregado"
    }
  ]
}
```

## Normalización de Datos
`normalizar_datos_v1.js` asegura integridad de JSON:
- Normaliza categorías de insumos (ej: "verduras" → "alimentos").
- Convierte valores numéricos (stock, total).
- Valida referencias (clienteId, empleadoAsignado, pedidoAsociado).
- Completa campos faltantes (observaciones, fechas).
- Genera backups.
**Ejecutar**:
```bash
npm run normalizar
```

## Tecnologías
- **Backend**: Node.js v18+, Express 4.18.2 (ES6 modules).
- **Vistas**: Pug 3.0.2, Bootstrap 5.1.3, Font Awesome 6.0.0.
- **Desarrollo**: Nodemon, Thunder Client.

## Ejemplos
- **Crear empleado**:
  ```bash
  curl -X POST http://localhost:3000/api/empleados -H "Content-Type: application/json" -d '{"nombre":"Juan","apellido":"Doe","email":"juan@example.com","telefono":"11-1234-5678","rol":"cocinero","area":"cocina"}'
  ```
- **Crear pedido (con clienteId)**:
  ```bash
  curl -X POST http://localhost:3000/api/pedidos -H "Content-Type: application/json" -d '{"clienteId":1,"itemsText":"2 hamburguesas, 1 gaseosa","total":5000,"tipo":"delivery","plataforma":"rappi"}'
  ```
- **Filtrar tareas por área**:
  ```bash
  curl http://localhost:3000/api/tareas/area/gestion_pedidos
  ```
- **Descontar stock**:
  ```bash
  curl -X PUT http://localhost:3000/api/insumos/1/descontar -H "Content-Type: application/json" -d '{"cantidad":5}'
  ```

## Contribución
1. Fork el repositorio.
2. Crea branch: `git checkout -b feature/nueva`.
3. Commit: `git commit -m 'Nueva funcionalidad'`.
4. Push: `git push origin feature/nueva`.
5. Pull Request con plantilla en `.github/PULL_REQUEST_TEMPLATE.md`.
**Bugs**: Usa plantilla en `.github/ISSUE_TEMPLATE.md`.
**Estándares**: ESLint, comentarios en español, nombres descriptivos.

## Responsabilidades del Equipo
- **Juan Dualibe (Project Manager)**: Coordinó el equipo, asignó tareas y monitoreó avances. Colaboró en la configuración de `app.js` y pruebas en Thunder Client.
- **Nicolás Weibel (Backend Lead / Arquitecto)**: Diseñó la estructura del proyecto (carpetas, rutas, middlewares). Estableció estándares de código con ESLint y nombres claros. Implementó middlewares de validación (`validation.js`).
- **Germán Rodríguez (Database Manager)**: Estructuró los archivos JSON (`tareas.json`, `empleados.json`, etc.). Desarrolló modelos POO (`Tarea.js`, `Empleado.js`) con métodos CRUD. Documentó el uso de JSON como base de datos.
- **Rocío Gómez (API Developer)**: Implementó endpoints REST (`tareas.js`, `empleados.js`, etc.). Aseguró que la API cumpliera con estándares REST. Colaboró en pruebas de casos de uso.
- **Juan Manuel Gasbarro (Tester / QA)**: Diseñó y ejecutó pruebas manuales con Thunder Client. Validó respuestas y manejo de errores. Creó colecciones de pruebas y ejemplos para el README.

## Bibliografía
- Documentación Oficial Node.js: https://nodejs.org/docs
- Express.js Guide: https://expressjs.com/
- Pug Template Engine: https://pugjs.org/
- Bootstrap Documentation: https://getbootstrap.com/docs/5.1/
- Async/Await: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
- Guía completa para crear un CRUD en Express.js con node.js, Pug y Bootstrap 5 (YouTube): https://www.youtube.com/playlist?list=PLHwb2lmmluvkHEdqUTIjgyQEcszMCaW5Y