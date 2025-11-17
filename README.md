# Control de Asistencia Bachillerato

Sistema web para la gestión de asistencia estudiantil en instituciones de bachillerato (1er a 5to año), con secciones A, B y C.

## 📋 Descripción

Aplicación web responsive para controlar la asistencia diaria de estudiantes, permitiendo a los profesores registrar faltas, salidas tempranas y gestionar justificaciones. El sistema incluye reportes detallados y cumple con la regla de 3 días para justificar inasistencias.

## 🚀 Tecnologías Utilizadas

- **Frontend:**
  - React 18.3
  - TypeScript
  - Vite
  - TailwindCSS
  - shadcn/ui components
  - React Router DOM
  - React Query (TanStack Query)
  - React Hook Form + Zod

- **Backend:**
  - Supabase (PostgreSQL + Auth + RLS)
  - Edge Functions (opcional)

## 📦 Requisitos Previos

- Node.js 18+ y npm (recomendado: instalar con [nvm](https://github.com/nvm-sh/nvm))
- Docker y Docker Compose
- Git
- Sistema operativo: Linux (recomendado), macOS o Windows con WSL2

## 🗄️ Estructura de Base de Datos

### Enums
- `app_role`: admin, profesor
- `attendance_status`: presente, falta, salida_temprana
- `justification_status`: justificada, no_justificada, pendiente

### Tablas Principales
- **user_roles**: Roles de usuarios (separado por seguridad)
- **profiles**: Perfiles de usuario (nombre, email)
- **years**: Años escolares (1er a 5to Año)
- **sections**: Secciones por año (A, B, C)
- **teacher_assignments**: Asignación de profesores a secciones
- **students**: Estudiantes (código, nombres, apellidos, cédula)
- **attendance_records**: Registros de asistencia diaria

## ⚙️ Configuración Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd control-asistencia-bachillerato
```

### 2. Instalar Dependencias del Frontend

```bash
npm install
```

### 3. Instalar Supabase con Docker (Self-Hosted)

#### 3.1. Descargar Supabase

```bash
# Clonar el repositorio de Supabase
git clone --depth 1 https://github.com/supabase/supabase

# Navegar a la carpeta de Docker
cd supabase/docker
```

#### 3.2. Configurar Variables de Entorno de Supabase

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

**Importante:** Edita el archivo `.env` y configura las siguientes variables:

```env
# Contraseñas y secretos (CÁMBIALOS POR SEGURIDAD)
POSTGRES_PASSWORD=tu-password-seguro-aqui
JWT_SECRET=tu-jwt-secret-super-seguro-de-al-menos-32-caracteres
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# URLs (para desarrollo local, mantén estos valores)
SITE_URL=http://localhost:5173
ADDITIONAL_REDIRECT_URLS=http://localhost:5173/**
```

**Notas de Seguridad:**
- Genera un JWT_SECRET único con: `openssl rand -base64 32`
- Para producción, genera nuevos ANON_KEY y SERVICE_ROLE_KEY en https://supabase.com/docs/guides/hosting/overview#api-keys

#### 3.3. Iniciar Supabase

```bash
# Iniciar todos los servicios de Supabase
docker compose up -d

# Verificar que todos los contenedores están corriendo
docker compose ps
```

Deberías ver servicios como:
- `supabase-db` (PostgreSQL)
- `supabase-auth` (GoTrue)
- `supabase-rest` (PostgREST)
- `supabase-studio` (Dashboard)
- Y otros servicios de Supabase

#### 3.4. Acceder al Dashboard de Supabase

Una vez iniciado, accede a:
- **Supabase Studio**: http://localhost:8000
- **Credenciales por defecto**:
  - Email: `admin@supabase.io`
  - Password: `admin`

### 4. Configurar la Base de Datos

#### 4.1. Ejecutar Migraciones

Desde Supabase Studio (http://localhost:8000):

1. Ve a `SQL Editor` en el menú lateral
2. Crea una nueva consulta
3. Copia y pega el contenido completo del archivo: `supabase/migrations/20251117131842_756eb123-347e-4c1b-ab43-e846c04fcc18.sql`
4. Ejecuta la consulta (botón "Run" o `Ctrl+Enter`)

**Este archivo SQL crea:**
- Todos los tipos ENUM necesarios
- Todas las tablas con sus relaciones
- Políticas RLS (Row Level Security) para seguridad
- Funciones auxiliares (`has_role`, `update_updated_at_column`, `handle_new_user`)
- Triggers automáticos
- Datos iniciales (años 1-5 con secciones A, B, C)

#### 4.2. Verificar la Instalación

Desde Supabase Studio:
1. Ve a `Table Editor`
2. Deberías ver todas las tablas creadas: `years`, `sections`, `students`, `attendance_records`, etc.
3. Ve a `Authentication` → `Users` (vacío al inicio)

### 5. Configurar Variables de Entorno del Frontend

Vuelve a la carpeta raíz de tu proyecto:

```bash
cd ../../control-asistencia-bachillerato
```

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de Supabase Local
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_SUPABASE_PROJECT_ID=localhost
```

**Importante:** 
- Si cambiaste `ANON_KEY` en el paso 3.2, usa ese mismo valor aquí para `VITE_SUPABASE_PUBLISHABLE_KEY`
- La URL debe ser `http://localhost:8000` (puerto 8000 es el API Gateway de Supabase)

### 6. Iniciar el Sistema

#### 6.1. Iniciar Supabase (si no está corriendo)

```bash
cd supabase/docker
docker compose up -d
```

#### 6.2. Iniciar el Frontend

En otra terminal, desde la raíz del proyecto:

```bash
npm run dev
```

El sistema estará disponible en: http://localhost:5173

## 👤 Primer Uso: Crear Usuario Admin

El sistema requiere que asignes manualmente el rol de administrador al primer usuario:

### Paso 1: Registrar el primer usuario
1. Abre la aplicación en `http://localhost:5173`
2. Ve a la página de registro
3. Crea una cuenta con email y contraseña

### Paso 2: Asignar rol de admin
1. Ve al dashboard de Supabase en `http://localhost:8000`
2. Navega a `Table Editor` → `profiles`
3. Busca tu usuario por email y copia su `user_id`
4. Ve a `Table Editor` → `user_roles`
5. Inserta un nuevo registro:
   ```
   user_id: [pega el UUID copiado]
   role: admin
   ```

### Paso 3: Reiniciar sesión
1. Cierra sesión en la aplicación
2. Vuelve a iniciar sesión
3. Ahora tendrás acceso al dashboard de administrador

## 📱 Funcionalidades por Rol

### Administrador
- ✅ Gestionar estructura académica (años y secciones)
- ✅ Crear y gestionar usuarios profesores
- ✅ Asignar profesores a secciones
- ✅ Importar/exportar estudiantes vía Excel
- ✅ Ver reportes globales de asistencia
- ✅ Exportar reportes a Excel
- ✅ Editar cualquier registro sin restricción de tiempo

### Profesor
- ✅ Tomar asistencia diaria (máximo 3 días retroactivos)
- ✅ Registrar faltas y salidas tempranas
- ✅ Gestionar justificaciones (solo dentro de 3 días)
- ✅ Ver historial de asistencia de sus secciones
- ✅ Generar reportes de sus grupos asignados
- ✅ Exportar datos a Excel

## 📊 Reglas de Negocio

### Justificaciones
- Las inasistencias deben justificarse dentro de **3 días calendario**
- Después de 3 días:
  - Las justificaciones pendientes se marcan automáticamente como "No justificada"
  - Los profesores no pueden editar el registro
  - Solo los admins pueden modificar registros antiguos

### Estados de Asistencia
- **Presente** (verde): Asistencia normal
- **Falta** (rojo): Inasistencia sin justificar
- **Salida temprana** (naranja): Retiro antes de finalizar la jornada
- **Falta justificada** (azul): Inasistencia con justificación aprobada

## 🚀 Despliegue a Producción (Servidor Propio)

### Requisitos del Servidor

- Ubuntu Server 20.04+ (u otra distribución Linux)
- Docker y Docker Compose instalados
- Nginx (para proxy reverso)
- Dominio con DNS configurado (opcional pero recomendado)
- Certificado SSL (Let's Encrypt recomendado)

### Pasos de Despliegue

#### 1. Configurar Supabase en Producción

```bash
# En tu servidor, clonar Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Copiar y editar variables de entorno
cp .env.example .env
nano .env
```

**Configuración importante para producción:**
```env
# Genera contraseñas seguras únicas
POSTGRES_PASSWORD=password-super-seguro-aqui
JWT_SECRET=tu-jwt-secret-de-al-menos-64-caracteres

# Configura tu dominio
SITE_URL=https://tu-dominio.com
ADDITIONAL_REDIRECT_URLS=https://tu-dominio.com/**

# API Keys (genera nuevos con https://supabase.com/docs/guides/hosting/overview#api-keys)
ANON_KEY=tu-anon-key-generado
SERVICE_ROLE_KEY=tu-service-role-key-generado
```

```bash
# Iniciar Supabase
docker compose up -d

# Verificar que está corriendo
docker compose ps
```

#### 2. Ejecutar Migraciones

Accede a Supabase Studio en `http://tu-servidor-ip:8000` y ejecuta el archivo de migración SQL como se explicó anteriormente.

#### 3. Configurar Nginx como Proxy Reverso

```nginx
# /etc/nginx/sites-available/asistencia

# API de Supabase
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    root /var/www/asistencia/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/asistencia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com -d api.tu-dominio.com
```

#### 5. Build y Deploy del Frontend

```bash
# En tu máquina local, edita .env para producción
cat > .env << EOF
VITE_SUPABASE_URL=https://api.tu-dominio.com
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-de-produccion
VITE_SUPABASE_PROJECT_ID=production
EOF

# Build
npm run build

# Transferir al servidor
scp -r dist/* usuario@tu-servidor:/var/www/asistencia/dist/
```

#### 6. Configuración de Firewall

```bash
# Permitir puertos necesarios
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Despliegue Alternativo: Usar servicios cloud

Si prefieres no gestionar tu propio servidor, puedes:

#### Frontend en Vercel/Netlify
```bash
# Build
npm run build

# Deploy a Vercel
npm i -g vercel
vercel --prod

# O deploy a Netlify
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Backend (Supabase)
Despliega Supabase en:
- DigitalOcean App Platform
- AWS EC2 con Docker
- Google Cloud Run
- O cualquier VPS con Docker

### Mantenimiento

```bash
# Ver logs de Supabase
cd supabase/docker
docker compose logs -f

# Backup de base de datos
docker exec supabase-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Actualizar Supabase
docker compose pull
docker compose up -d
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🐳 Comandos Útiles de Docker

```bash
# Iniciar Supabase
cd supabase/docker
docker compose up -d

# Detener Supabase
docker compose down

# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f supabase-db
docker compose logs -f supabase-auth

# Reiniciar un servicio específico
docker compose restart supabase-db

# Backup de la base de datos
docker exec supabase-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Restaurar base de datos desde backup
cat backup_20250117.sql | docker exec -i supabase-db psql -U postgres postgres

# Limpiar volúmenes (CUIDADO: borra todos los datos)
docker compose down -v

# Ver uso de recursos
docker stats

# Actualizar Supabase a última versión
docker compose pull
docker compose up -d

# Acceder a la base de datos directamente
docker exec -it supabase-db psql -U postgres
```

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── layout/        # Layouts (MainLayout)
│   ├── ui/            # Componentes shadcn/ui
│   └── ProtectedRoute.tsx
├── contexts/          # Contextos de React (AuthContext)
├── hooks/             # Custom hooks
├── integrations/      # Integraciones externas
│   └── supabase/     # Cliente y tipos de Supabase
├── lib/              # Utilidades
├── pages/            # Páginas/Rutas
│   ├── admin/        # Páginas de administrador
│   ├── profesor/     # Páginas de profesor
│   ├── Auth.tsx      # Login/Registro
│   └── Index.tsx     # Página de inicio
└── App.tsx           # Configuración de rutas

supabase/
└── migrations/       # Migraciones de base de datos
```

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Roles separados en tabla dedicada (previene escalación de privilegios)
- ✅ Políticas RLS basadas en funciones SECURITY DEFINER
- ✅ Autenticación mediante Supabase Auth
- ✅ Validación de formularios con Zod
- ✅ Tokens JWT gestionados automáticamente
- ✅ Protección de rutas por rol

## 🆘 Solución de Problemas

### Los contenedores de Docker no inician
```bash
# Ver logs de los contenedores
cd supabase/docker
docker compose logs

# Reiniciar servicios
docker compose down
docker compose up -d
```

### No puedo acceder a Supabase Studio (localhost:8000)
- Verifica que todos los contenedores estén corriendo: `docker compose ps`
- Verifica que el puerto 8000 no esté en uso: `lsof -i :8000`
- Revisa los logs: `docker compose logs supabase-kong`

### Error de conexión del frontend a Supabase
- Verifica que `VITE_SUPABASE_URL` sea `http://localhost:8000` (no 54321)
- Asegúrate de que el `ANON_KEY` en `.env` coincida con el de `supabase/docker/.env`
- Reinicia el servidor de desarrollo: `npm run dev`

### "Session expired" o problemas de autenticación
- Verifica que `SITE_URL` en `supabase/docker/.env` sea `http://localhost:5173`
- Asegúrate de que `ADDITIONAL_REDIRECT_URLS` incluya `http://localhost:5173/**`
- Limpia las cookies del navegador y vuelve a iniciar sesión

### No puedo ver el dashboard después de crear cuenta
- Verifica que el rol de admin esté asignado en `user_roles` (tabla en Supabase Studio)
- Cierra sesión y vuelve a iniciar sesión
- Revisa la consola del navegador para errores (F12)

### Error "violates row-level security policy"
- Verifica que el usuario tenga el rol correcto en `user_roles`
- Confirma que las políticas RLS se ejecutaron correctamente en la migración
- Revisa que las funciones `has_role` existan: ve a Database → Functions en Supabase Studio

### Las migraciones SQL fallan al ejecutarse
- Ejecuta las queries línea por línea para identificar el error específico
- Verifica que no existan objetos duplicados (tablas, funciones, etc.)
- Asegúrate de ejecutar todo el archivo de migración completo
- Revisa los logs de PostgreSQL: `docker compose logs supabase-db`

### Error "port already in use"
Algún puerto requerido ya está en uso:
```bash
# Ver qué está usando el puerto
sudo lsof -i :8000  # o el puerto que falle
sudo lsof -i :5432
sudo lsof -i :5173

# Cambiar el puerto en docker-compose.yml si es necesario
```

### Problemas de rendimiento o lentitud
- Aumenta recursos de Docker Desktop (si estás en Mac/Windows)
- Verifica uso de disco: `docker system df`
- Limpia recursos no usados: `docker system prune`

## 📖 Documentación Adicional

- [Documentación de Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)
- [Nginx Configuration](https://nginx.org/en/docs/)

## 🤝 Contribuir

Este proyecto fue desarrollado para gestionar asistencia en bachilleratos venezolanos. Las contribuciones son bienvenidas.

## 📄 Licencia

Este proyecto está disponible como código abierto.

## 🌟 Características Futuras (Roadmap)

- [ ] Importación masiva de estudiantes vía Excel
- [ ] Exportación de reportes a PDF
- [ ] Notificaciones automáticas por email/SMS
- [ ] Dashboard con gráficas y estadísticas
- [ ] Gestión de justificaciones con documentos adjuntos
- [ ] API para integración con otros sistemas
- [ ] Modo offline con sincronización
- [ ] App móvil nativa

---

**Desarrollado con ❤️ para instituciones educativas venezolanas**
