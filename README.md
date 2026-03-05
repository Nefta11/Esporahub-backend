# Esporahub Backend

API REST del backend de **Esporahub** — plataforma de creación y compartición de presentaciones orientada a campañas políticas. Permite gestionar clientes/candidatos, crear presentaciones con filminas (slides), subirlas a Cloudinary y compartirlas mediante links únicos con o sin contraseña.

---

## Stack Tecnológico

| Tecnología | Rol |
|---|---|
| **NestJS 11** | Framework Node.js (estructura modular, decoradores, DI) |
| **MongoDB + Mongoose** | Base de datos NoSQL y ODM |
| **Cloudinary** | Almacenamiento y transformación de imágenes (filminas) |
| **JWT (Passport)** | Autenticación stateless con tokens de 2 horas |
| **class-validator** | Validación de DTOs en tiempo de ejecución |
| **Multer + Sharp** | Procesamiento de archivos de imagen |
| **TypeScript** | Tipado estático end-to-end |
| **Swagger (OpenAPI 3)** | Documentación interactiva de la API |

---

## Requisitos Previos

- **Node.js** v18 o superior
- **MongoDB** (local o MongoDB Atlas)
- **Cuenta en Cloudinary** (plan gratuito disponible en [cloudinary.com](https://cloudinary.com))

---

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
PORT=3001
NODE_ENV=development

# MongoDB
# Local:  mongodb://localhost:27017/esporahub
# Atlas:  mongodb+srv://<usuario>:<password>@cluster.mongodb.net/esporahub
MONGODB_URI=mongodb://localhost:27017/esporahub

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_32_caracteres_minimo
JWT_EXPIRES_IN=2h

# Cloudinary (obtener de tu dashboard en cloudinary.com)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Frontend (para configurar CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar Cloudinary

1. Crear cuenta en [cloudinary.com](https://cloudinary.com) (plan gratuito)
2. Ir al Dashboard → copiar **Cloud Name**, **API Key** y **API Secret**
3. Pegar los valores en el `.env`

### 4. Configurar MongoDB

**Opción A — Local:**
```bash
mongod
```

**Opción B — MongoDB Atlas (Cloud):**
1. Crear cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crear un cluster gratuito y un usuario de base de datos
3. Copiar la cadena de conexión al `.env`

---

## Ejecutar el Proyecto

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor estará disponible en: `http://localhost:3001`

---

## Documentación Interactiva (Swagger)

Una vez iniciado el servidor, acceder a:

```
http://localhost:3001/api/docs
```

Swagger UI muestra todos los endpoints organizados por módulo, con sus parámetros, body schemas y respuestas esperadas. Para probar endpoints protegidos:

1. Ejecutar `POST /api/auth/login` para obtener el token JWT
2. Hacer clic en el botón **Authorize** (candado) en la esquina superior derecha
3. Ingresar el token con el formato: `Bearer <token>`
4. A partir de ese momento todos los requests incluirán la autenticación

---

## Estructura del Proyecto

```
src/
├── controllers/          # Controladores HTTP (rutas y respuestas)
│   ├── auth.controller.ts
│   ├── clients.controller.ts
│   ├── presentations.controller.ts
│   └── upload.controller.ts
│
├── services/             # Lógica de negocio
│   ├── auth.service.ts
│   ├── clients.service.ts
│   ├── presentations.service.ts
│   └── upload.service.ts
│
├── models/               # Schemas de Mongoose (modelos de base de datos)
│   ├── client.schema.ts
│   ├── presentation.schema.ts
│   └── user.schema.ts
│
├── dto/                  # Data Transfer Objects (validación de entrada)
│   ├── auth.dto.ts
│   ├── client.dto.ts
│   ├── presentation.dto.ts
│   └── user.dto.ts
│
├── modules/              # Módulos NestJS (agrupan controller + service + schema)
│   ├── auth.module.ts
│   ├── clients.module.ts
│   ├── presentations.module.ts
│   ├── upload.module.ts
│   └── users.module.ts
│
├── middlewares/          # Guards, estrategias y decoradores
│   ├── jwt.strategy.ts          # Estrategia Passport JWT
│   ├── jwt-auth.guard.ts        # Guard de autenticación
│   ├── current-user.decorator.ts # Decorador @CurrentUser()
│   └── public.decorator.ts      # Decorador @Public() (rutas sin auth)
│
├── config/
│   └── database.ts       # Configuración de conexión a MongoDB
│
├── seeds/
│   └── users.seed.ts     # Script para poblar usuarios iniciales
│
├── app.module.ts         # Módulo raíz de la aplicación
└── main.ts               # Bootstrap: Swagger, CORS, ValidationPipe, servidor
```

---

## API Endpoints

> Todos los endpoints tienen el prefijo `/api`. Los endpoints marcados con 🔒 requieren token JWT.

### Autenticación — `/api/auth`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/api/auth/login` | Iniciar sesión → retorna JWT | ❌ |
| `GET` | `/api/auth/profile` | Perfil del usuario autenticado | 🔒 |
| `GET` | `/api/auth/verify` | Verificar validez del token | 🔒 |

### Clientes — `/api/clients`

> Gestión de clientes/candidatos políticos. Todos los endpoints requieren autenticación.

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/clients` | Listar clientes (paginado, con filtros) | 🔒 |
| `GET` | `/api/clients/search?q=` | Búsqueda rápida para autocompletado | 🔒 |
| `GET` | `/api/clients/stats` | Estadísticas del módulo | 🔒 |
| `GET` | `/api/clients/:id` | Detalle de un cliente | 🔒 |
| `POST` | `/api/clients` | Crear nuevo cliente | 🔒 |
| `PUT` | `/api/clients/:id` | Actualizar cliente | 🔒 |
| `DELETE` | `/api/clients/:id` | Eliminar cliente | 🔒 |

**Query params de listado:** `page`, `limit`, `sortBy`, `sortOrder` (`asc`|`desc`), `search`

### Presentaciones — `/api/presentations`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/presentations` | Crear presentación con filminas | 🔒 |
| `GET` | `/api/presentations/my` | Mis presentaciones | 🔒 |
| `GET` | `/api/presentations/:id` | Detalle (solo propietario) | 🔒 |
| `PUT` | `/api/presentations/:id` | Actualizar metadatos | 🔒 |
| `DELETE` | `/api/presentations/:id` | Eliminar presentación | 🔒 |
| `POST` | `/api/presentations/:id/filminas` | Agregar filminas | 🔒 |
| `POST` | `/api/presentations/:id/regenerate-link` | Generar nuevo shareId | 🔒 |
| `GET` | `/api/presentations/access/:shareId` | Verificar acceso público | ❌ |
| `POST` | `/api/presentations/view/:shareId` | Ver presentación compartida | ❌ |

### Upload — `/api/upload`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/upload/base64` | Subir imagen en Base64 | 🔒 |
| `POST` | `/api/upload/base64/multiple` | Subir múltiples imágenes en Base64 | 🔒 |
| `POST` | `/api/upload/file` | Subir archivo (multipart/form-data) | 🔒 |

---

## Flujo Principal — Compartir una Presentación

```
1. Usuario autenticado crea presentación
   POST /api/presentations
   → Envía filminas en Base64

2. Backend sube las imágenes a Cloudinary
   → Obtiene imageUrl + thumbnailUrl por filmina

3. Backend guarda la presentación en MongoDB
   → Genera shareId único (nanoid)

4. Frontend recibe el shareId
   → Construye la URL: https://tuapp.com/p/{shareId}

5. Cualquier persona con el link accede sin login
   GET  /api/presentations/access/{shareId}   ← verifica si tiene contraseña
   POST /api/presentations/view/{shareId}     ← obtiene el contenido
```

---

## Ejemplos de Uso

### Registrar usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "password": "miPassword123"
  }'
```

### Iniciar sesión

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@email.com",
    "password": "miPassword123"
  }'
# Respuesta: { "access_token": "eyJhbGciOi..." }
```

### Crear presentación

```bash
curl -X POST http://localhost:3001/api/presentations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title": "Campaña Municipal 2025",
    "description": "Propuestas principales",
    "clientName": "María García",
    "filminas": [
      {
        "order": 1,
        "title": "Introducción",
        "imageData": "data:image/png;base64,..."
      }
    ]
  }'
```

### Ver presentación compartida

```bash
# 1. Verificar si requiere contraseña
curl http://localhost:3001/api/presentations/access/abc123xyz

# 2. Obtener contenido (sin contraseña)
curl -X POST http://localhost:3001/api/presentations/view/abc123xyz \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. Obtener contenido (con contraseña)
curl -X POST http://localhost:3001/api/presentations/view/abc123xyz \
  -H "Content-Type: application/json" \
  -d '{"password": "miPassword"}'
```

### Listar clientes con filtros

```bash
curl "http://localhost:3001/api/clients?page=1&limit=10&search=García&sortBy=name&sortOrder=asc" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Deploy

### Railway (recomendado)

1. Conectar el repositorio a [Railway](https://railway.app)
2. Configurar las variables de entorno en el panel
3. Railway detecta NestJS automáticamente y despliega

### Render

1. Crear un nuevo **Web Service**
2. Conectar el repositorio
3. **Build command:** `npm run build`
4. **Start command:** `npm run start:prod`
5. Agregar las variables de entorno en el panel

---

## Licencia

MIT
