# Sabor Urbano - Sistema de Gestión Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-4.18.2-blue.svg)
![Pug](https://img.shields.io/badge/Pug-3.0.2-orange.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.1.3-purple.svg)

Sistema de gestión integral para restaurante desarrollado con Node.js, Express y Programación Orientada a Objetos (módulos ES6). Incluye API REST completa, interfaces web responsivas con vistas Pug y sistema de filtros avanzado.

## Tabla de Contenidos
- Características (#-características)
- Arquitectura (#-arquitectura)
- Instalación (#-instalación)
- Uso (#-uso)
- API Endpoints (#-api-endpoints)
- Interfaces Web (#-interfaces-web)
- Testing (#-testing)
- Estructura del Proyecto (#-estructura-del-proyecto)
- Tecnologías (#-tecnologías)
- Ejemplos (#-ejemplos)
- Contribución (#-contribución)

---

## Características

### Funcionalidades Principales
- Gestión de Tareas - Control de actividades por área (Gestión de Pedidos / Control de Inventario)
- Gestión de Empleados - Administración de personal por roles y áreas
- Gestión de Clientes - Registro y búsqueda de clientes con validación de email
- Gestión de Pedidos - Control de pedidos presenciales y delivery con parseo de ítems
- Control de Inventario - Manejo de stock con alertas automáticas
- Sistema de Filtros - Búsquedas avanzadas y filtros combinados
- Interfaces Web - Dashboard responsivo con Bootstrap 5
- Validación de Formularios - Roles y áreas predefinidos

### Características Técnicas
- API REST completa con operaciones CRUD
- Programación Orientada a Objetos con 5 modelos principales
- Middleware personalizado para validaciones
- Dashboard en tiempo real con estadísticas
- Responsive Design con Bootstrap y Font Awesome
- Testing completo con Thunder Client
- Script de Normalización para migración de datos

---

## Arquitectura

```
📁 sabor-urbano-crud/
├── 🎮 controllers/          # Controladores con lógica de negocio
│   ├── clientesController.js
│   ├── empleadosController.js
│   ├── insumosController.js
│   ├── pedidosController.js
│   └── tareasController.js
├── 🏗️ models/              # Modelos POO para manejo de datos
│   ├── Cliente.js
│   ├── Empleado.js
│   ├── Insumo.js
│   ├── Pedido.js
│   └── Tarea.js
├── 🛣️ routes/              # Rutas de la API REST
│   ├── clientes.js
│   ├── empleados.js
│   ├── insumos.js
│   ├── pedidos.js
│   └── tareas.js
├── 🎨 views/               # Vistas Pug para interfaces web
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
├── 🛡️ middleware/          # Middleware personalizado
│   └── validation.js
├── 📊 data/               # Base de datos JSON
│   ├── clientes.json
│   ├── empleados.json
│   ├── pedidos.json
│   ├── insumos.json
│   ├── tareas.json
│   ├── roles.json         # Roles para validación de formularios
│   └── areas.json         # Áreas para validación de filtros
├── 🔄 scripts/             # Scripts de utilidad
│   └── normalizar_datos_v1.js
├── ⚙️ package.json        # Dependencias
└── 🚀 app.js             # Servidor principal
```

---

## Instalación

### Prerrequisitos
- Node.js v18 o superior  
- npm v8 o superior  
- Editor de código (VS Code recomendado)  
- Thunder Client para testing de API (opcional)

### Instalación Paso a Paso

Clonar el repositorio:
```bash
git clone https://github.com/germanberisso/sabor-urbano-crud.git
cd sabor-urbano-crud
```

Instalar dependencias:
```bash
npm install
```

Instalar dependencias específicas:
```bash
npm install express pug method-override
npm install --save-dev nodemon
```

Configurar scripts en package.json:
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "normalizar": "node scripts/normalizar_datos_v1.js"
  }
}
```

Iniciar el servidor:
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

Verificar instalación:
- ✅ Servidor corriendo: http://localhost:3000
- ✅ API REST: http://localhost:3000/api
- ✅ Interfaces: http://localhost:3000/tareas

---

## Uso

### Acceso a las Interfaces

| URL | Descripción |
|-----|-------------|
| http://localhost:3000 | Dashboard principal (redirige a tareas) |
| http://localhost:3000/tareas | Gestión de tareas |
| http://localhost:3000/empleados | Gestión de empleados |
| http://localhost:3000/pedidos | Gestión de pedidos |
| http://localhost:3000/insumos | Gestión de insumos |
| http://localhost:3000/filtros | Sistema de filtros |

### Acceso a la API
- Base URL: `http://localhost:3000/api`
- Formato: JSON
- Métodos: GET, POST, PUT, DELETE

---

## API Endpoints

### Gestión de Clientes (/api/clientes)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/clientes | Obtener todos los clientes |
| GET | /api/clientes/:id | Obtener cliente por ID |
| GET | /api/clientes/buscar?nombre=...&apellido=... | Buscar por nombre/apellido |
| GET | /api/clientes/validar-email?email=... | Validar email único |
| POST | /api/clientes | Crear nuevo cliente |
| PUT | /api/clientes/:id | Actualizar cliente |
| DELETE | /api/clientes/:id | Eliminar cliente |

### Gestión de Empleados (/api/empleados)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/empleados | Obtener todos los empleados |
| GET | /api/empleados/:id | Obtener empleado por ID |
| GET | /api/empleados/rol/:rol | Filtrar por rol |
| GET | /api/empleados/area/:area | Filtrar por área |
| GET | /api/empleados/validar-email?email=... | Validar email único |
| POST | /api/empleados | Crear nuevo empleado |
| PUT | /api/empleados/:id | Actualizar empleado |
| DELETE | /api/empleados/:id | Eliminar empleado |

#### Filtros Especializados

| Endpoint | Descripción |
|----------|-------------|
| /api/empleados/roles | Obtener roles disponibles (de roles.json) |
| /api/empleados/areas | Obtener áreas disponibles (de areas.json) |

### Gestión de Pedidos (/api/pedidos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/pedidos | Obtener todos los pedidos |
| GET | /api/pedidos/:id | Obtener pedido por ID |
| GET | /api/pedidos/tipo/:tipo | Filtrar por tipo |
| GET | /api/pedidos/plataforma/:plataforma | Filtrar por plataforma |
| GET | /api/pedidos/estado/:estado | Filtrar por estado |
| POST | /api/pedidos | Crear nuevo pedido |
| PUT | /api/pedidos/:id | Actualizar pedido |
| DELETE | /api/pedidos/:id | Eliminar pedido |

### Control de Inventario (/api/insumos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/insumos | Obtener todos los insumos |
| GET | /api/insumos/:id | Obtener insumo por ID |
| GET | /api/insumos/bajo-stock | Insumos con stock bajo |
| GET | /api/insumos/alertas | Alertas de stock |
| GET | /api/insumos/categoria/:categoria | Filtrar por categoría |
| POST | /api/insumos | Crear nuevo insumo |
| PUT | /api/insumos/:id | Actualizar insumo |
| PUT | /api/insumos/:id/stock | Actualizar stock absoluto |
| PUT | /api/insumos/:id/descontar | Descontar stock |
| DELETE | /api/insumos/:id | Eliminar insumo |

### Gestión de Tareas (/api/tareas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/tareas | Obtener todas las tareas |
| GET | /api/tareas/:id | Obtener tarea por ID |
| GET | /api/tareas/area/:area | Filtrar por área |
| POST | /api/tareas | Crear nueva tarea |
| PUT | /api/tareas/:id | Actualizar tarea |
| PATCH | /api/tareas/:id/iniciar | Iniciar tarea |
| PATCH | /api/tareas/:id/finalizar | Finalizar tarea |
| DELETE | /api/tareas/:id | Eliminar tarea |

#### Filtros Especializados

| Endpoint | Descripción |
|----------|-------------|
| /api/tareas?estado=...&prioridad=... | Filtros combinados |

---

## Interfaces Web

### Dashboard Principal
- Resumen de tareas pendientes y empleados activos
- Estadísticas en tiempo real por área
- Enlaces rápidos a funcionalidades de la API
- Navegación intuitiva con sidebar

### Gestión de Tareas
- Lista completa con filtros visuales
- Estados coloreados: Pendiente, En Proceso, Finalizada
- Prioridades: Alta, Media, Baja
- Filtros por área y empleado asignado

### Gestión de Empleados
- Tabla con información completa de contacto
- Filtros por rol y área de trabajo
- Estados visuales: Activo / Inactivo
- Validación de email en tiempo real

### Gestión de Pedidos
- Tabla con información de pedidos
- Formularios para nuevo y editar pedidos
- Integración con clientes

### Control de Inventario
- Tabla con insumos y stock
- Formularios para nuevo y editar insumos
- Alertas visuales para stock bajo

### Sistema de Filtros
- Interfaz centralizada para búsquedas
- Filtros organizados por módulo
- Ejemplos de filtros combinados
- Enlaces directos a resultados de API

---

## Testing

### Thunder Client Testing
El proyecto incluye ejemplos completos para testing con Thunder Client:

#### CRUD Básico
```http
# Crear tarea
POST http://localhost:3000/api/tareas
Content-Type: application/json

{
  "titulo": "Nueva tarea de prueba",
  "descripcion": "Tarea creada desde Thunder Client",
  "area": "gestion_pedidos",
  "prioridad": "alta",
  "empleadoAsignado": 2
}
```

#### Filtros Avanzados
```http
# Filtros combinados
GET http://localhost:3000/api/tareas?estado=pendiente&prioridad=alta

# Por área específica
GET http://localhost:3000/api/tareas/area/gestion_pedidos

# Empleados por rol
GET http://localhost:3000/api/empleados/rol/cocinero
```

#### Validación de Roles y Áreas
```http
# Obtener todos los roles
GET http://localhost:3000/api/empleados/roles

# Obtener todas las áreas
GET http://localhost:3000/api/empleados/areas
```

#### Validaciones de Error
```http
# Error 400 - Datos faltantes
POST http://localhost:3000/api/tareas
Content-Type: application/json

{
  "descripcion": "Sin título requerido"
}
```

---

## Estructura del Proyecto

### Modelos POO (Programación Orientada a Objetos)

#### Modelo Tarea (javascript)
```javascript
class Tarea {
  async getAll()                    // Obtener todas las tareas
  async getById(id)                 // Obtener por ID
  async create(datosTarea)          // Crear nueva tarea
  async update(id, datos)           // Actualizar tarea
  async delete(id)                  // Eliminar tarea
  async filtrar(filtros)            // Filtros avanzados
  async getByArea(area)             // Por área específica
}
```

#### Modelo Empleado (javascript)
```javascript
class Empleado {
  async getAll()                    // Todos los empleados
  async getById(id)                 // Por ID
  async getByRol(rol)               // Por rol específico
  async getByArea(area)             // Por área de trabajo
  async validarEmailUnico(email)    // Validación de email
  async getRoles()                  // Obtener roles disponibles
  async getAreas()                  // Obtener áreas disponibles
  async create(data)                // Crear
  async update(id, data)            // Actualizar
  async delete(id)                  // Eliminar
}
```

### Middleware Personalizado (javascript)
```javascript
// Validaciones implementadas
validarCamposRequeridos(['titulo', 'area'])
validarEmail()                    // Formato email
validarNumerico('stock')          // Números >= 0
validarFecha('fechaIngreso')      // Fechas válidas
sanitizarDatos()                  // Limpiar strings
logRequest()                      // Logging HTTP
manejarErrores()                  // Manejo centralizado
```

### Base de Datos JSON

#### Archivos de Datos
- clientes.json - Registro de clientes con emails únicos
- tareas.json - Registro de todas las tareas del sistema
- empleados.json - Información de empleados con roles y áreas
- pedidos.json - Pedidos presenciales y delivery
- insumos.json - Inventario con control de stock

#### Archivos de Validación
- roles.json - Definición de roles del sistema (administrador, cocinero, repartidor, mozo, encargado_stock)
- areas.json - Definición de áreas funcionales (cocina, reparto, salon, inventario, administracion)

---

## Tecnologías

### Backend
- Node.js v18+ - Runtime de JavaScript
- Express.js 4.18.2 - Framework web
- Pug 3.0.2 - Motor de plantillas

### Frontend
- Bootstrap 5.1.3 - Framework CSS
- Font Awesome 6.0.0 - Iconografía
- CSS Custom - Gradientes y efectos

### Desarrollo
- Nodemon - Auto-reload en desarrollo
- Thunder Client - Testing de API
- JSON Files - Base de datos simulada

---

## Ejemplos

### Crear Nueva Tarea (bash)
```bash
curl -X POST http://localhost:3000/api/tareas \
-H "Content-Type: application/json" \
-d '{
  "titulo": "Confirmar pedido RAPPI-456",
  "descripcion": "Verificar pedido desde Rappi",
  "area": "gestion_pedidos",
  "prioridad": "alta",
  "empleadoAsignado": 4
}'
```

### Registrar Empleado (bash)
```bash
curl -X POST http://localhost:3000/api/empleados \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Pedro",
  "apellido": "González",
  "email": "pedro@saborurbano.com",
  "telefono": "11-1234-5678",
  "rol": "cocinero",
  "area": "cocina"
}'
```

### Crear Pedido (bash)
```bash
curl -X POST http://localhost:3000/api/pedidos \
-H "Content-Type: application/json" \
-d '{
  "clienteId": 1,
  "itemsText": "2 hamburguesas, 1 gaseosa",
  "total": 5000,
  "tipo": "delivery",
  "plataforma": "rappi"
}'
```

### Actualizar Stock (bash)
```bash
curl -X PUT http://localhost:3000/api/insumos/1/stock \
-H "Content-Type: application/json" \
-d '{
  "stock": 25
}'
```

### Filtros Combinados (bash)
```bash
# Tareas pendientes de alta prioridad
curl "http://localhost:3000/api/tareas?estado=pendiente&prioridad=alta"

# Empleados de cocina
curl "http://localhost:3000/api/empleados/area/cocina"

# Insumos con stock bajo
curl "http://localhost:3000/api/insumos/bajo-stock"

# Obtener roles disponibles
curl "http://localhost:3000/api/empleados/roles"
```

---

## Casos de Uso Reales

### Flujo de Pedido Completo
1. Crear cliente → POST /api/clientes  
2. Cliente hace pedido → POST /api/pedidos  
3. Se crea tarea → POST /api/tareas (área: gestion_pedidos)  
4. Se asigna cocinero → PUT /api/tareas/:id (empleadoAsignado)  
5. Se descuentan insumos → PUT /api/insumos/:id/descontar  
6. Se finaliza tarea → PATCH /api/tareas/:id/finalizar  

### Control de Inventario
1. Revisar alertas → GET /api/insumos/alertas  
2. Stock bajo detectado → GET /api/insumos/bajo-stock  
3. Crear tarea de reposición → POST /api/tareas (área: control_inventario)  
4. Actualizar stock → PUT /api/insumos/:id/stock  

### Gestión de Personal
1. Ver empleados → GET /api/empleados  
2. Filtrar por área → GET /api/empleados/area/cocina  
3. Asignar a tarea → PUT /api/tareas/:id  
4. Roles disponibles → GET /api/empleados/roles  

---

## Configuración Avanzada

### Variables de Entorno (opcional)
```bash
# .env (crear si es necesario)
PORT=3000
NODE_ENV=development
```

### Scripts Adicionales
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

### Solución de Problemas

**Error: Puerto ocupado**
```bash
# Cambiar puerto en app.js
const PORT = process.env.PORT || 3001;
```

**Error: Módulo no encontrado**
```bash
npm install
# o específicamente
npm install express pug method-override
```

**Datos no cargan**
```bash
# Verificar archivos JSON en /data/
ls -la data/
```

---

## Contribución

### Para Desarrolladores
1. Fork del repositorio  
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`  
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`  
4. Push: `git push origin feature/nueva-funcionalidad`  
5. Pull Request  

### Estándares de Código
- ESLint para formato  
- Comentarios en español  
- Nombres descriptivos para variables y métodos  

---

## Equipo de Desarrollo
- Juan Dualibe  
- Nicolás Weibel  
- Rocío Gómez  
- Juan Manuel Gasbarro  
- Germán Rodríguez  