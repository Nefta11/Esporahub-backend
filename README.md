# Esporahub Backend

Backend para Esporahub - Sistema de compartir presentaciones similar a Canva.

## Stack Tecnologico

- **NestJS** - Framework Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Cloudinary** - Almacenamiento de imagenes
- **JWT** - Autenticacion
- **TypeScript** - Tipado estatico

## Requisitos Previos

1. **Node.js** v18 o superior
2. **MongoDB** (local o MongoDB Atlas)
3. **Cuenta en Cloudinary** (gratis): https://cloudinary.com/

## Configuracion

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura los valores:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# Servidor
PORT=3001
NODE_ENV=development

# MongoDB
# Local: mongodb://localhost:27017/esporahub
# Atlas: mongodb+srv://<usuario>:<password>@cluster.mongodb.net/esporahub
MONGODB_URI=mongodb://localhost:27017/esporahub

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_32_caracteres_minimo
JWT_EXPIRES_IN=7d

# Cloudinary (obtener de tu dashboard en cloudinary.com)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar Cloudinary

1. Crea una cuenta en https://cloudinary.com/ (gratis)
2. Ve a tu Dashboard
3. Copia los valores de:
   - Cloud Name
   - API Key
   - API Secret
4. Pegalos en el archivo `.env`

### 4. Configurar MongoDB

**Opcion A: MongoDB Local**
```bash
# Instalar MongoDB en tu sistema y ejecutar
mongod
```

**Opcion B: MongoDB Atlas (Cloud - Gratis)**
1. Crea una cuenta en https://www.mongodb.com/atlas
2. Crea un cluster gratuito
3. Crea un usuario de base de datos
4. Obtiene la cadena de conexion y agregala al `.env`

## Ejecutar el Proyecto

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Produccion
npm run build
npm run start:prod
```

El servidor estara disponible en: http://localhost:3001

## API Endpoints

### Autenticacion

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesion | No |
| GET | `/api/auth/profile` | Obtener perfil | Si |
| GET | `/api/auth/verify` | Verificar token | Si |

### Presentaciones

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/api/presentations` | Crear presentacion | Si |
| GET | `/api/presentations/my` | Mis presentaciones | Si |
| GET | `/api/presentations/:id` | Detalle presentacion | Si |
| PUT | `/api/presentations/:id` | Actualizar | Si |
| DELETE | `/api/presentations/:id` | Eliminar | Si |
| POST | `/api/presentations/:id/filminas` | Agregar filminas | Si |
| POST | `/api/presentations/:id/regenerate-link` | Nuevo link | Si |

### Acceso Publico (Compartir)

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/api/presentations/access/:shareId` | Verificar acceso | No |
| POST | `/api/presentations/view/:shareId` | Ver presentacion | No |

### Upload

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload/base64` | Subir imagen Base64 | Si |
| POST | `/api/upload/base64/multiple` | Subir multiples | Si |
| POST | `/api/upload/file` | Subir archivo | Si |

## Ejemplo de Uso

### Registrar Usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tu Nombre",
    "email": "tu@email.com",
    "password": "tu_password"
  }'
```

### Crear Presentacion

```bash
curl -X POST http://localhost:3001/api/presentations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "title": "Mi Presentacion",
    "filminas": [
      {
        "order": 1,
        "title": "Filmina 1",
        "imageData": "data:image/png;base64,..."
      }
    ]
  }'
```

### Ver Presentacion Compartida

```bash
# 1. Verificar si requiere password
curl http://localhost:3001/api/presentations/access/abc123

# 2. Obtener presentacion
curl -X POST http://localhost:3001/api/presentations/view/abc123 \
  -H "Content-Type: application/json" \
  -d '{"password": "opcional"}'
```

## Estructura del Proyecto

```
src/
├── auth/                 # Modulo de autenticacion
│   ├── dto/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/                # Modulo de usuarios
│   ├── dto/
│   ├── schemas/
│   ├── users.module.ts
│   └── users.service.ts
├── presentations/        # Modulo de presentaciones
│   ├── dto/
│   ├── schemas/
│   ├── presentations.controller.ts
│   ├── presentations.module.ts
│   └── presentations.service.ts
├── upload/               # Modulo de subida de archivos
│   ├── upload.controller.ts
│   ├── upload.module.ts
│   └── upload.service.ts
├── common/               # Utilidades compartidas
│   ├── decorators/
│   └── guards/
├── app.module.ts
└── main.ts
```

## Flujo de Compartir Presentacion

```
1. Usuario crea presentacion en el Frontend
   ↓
2. Frontend envia filminas (Base64) al Backend
   ↓
3. Backend sube imagenes a Cloudinary
   ↓
4. Backend guarda URLs en MongoDB
   ↓
5. Backend retorna shareId: "abc123"
   ↓
6. Frontend genera URL: https://tuapp.com/p/abc123
   ↓
7. Cualquier persona con el link puede ver la presentacion
```

## Integracion con Frontend

En tu frontend (Esporahub), actualiza la configuracion de API:

```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://localhost:3001/api';
```

## Deploy

### Railway (Recomendado)

1. Conecta tu repositorio a Railway
2. Configura las variables de entorno
3. Railway detectara NestJS automaticamente

### Render

1. Crea un nuevo Web Service
2. Conecta tu repositorio
3. Build command: `npm run build`
4. Start command: `npm run start:prod`

## Licencia

MIT
# Esporahub-backend
