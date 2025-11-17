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
- Cuenta de Supabase (para base de datos y autenticación)
- Git

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

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu `Project URL` y `anon/public key`

#### 3.2. Ejecutar Migraciones

Copia el contenido del archivo `supabase/migrations/20251117131842_756eb123-347e-4c1b-ab43-e846c04fcc18.sql` y ejecútalo en el SQL Editor de Supabase:

1. Ve a tu proyecto de Supabase
2. Navega a `SQL Editor`
3. Crea una nueva consulta
4. Pega todo el contenido del archivo de migración
5. Ejecuta la consulta

**Importante:** Este archivo SQL crea:
- Todos los tipos ENUM necesarios
- Todas las tablas con sus relaciones
- Políticas RLS (Row Level Security) para seguridad
- Funciones auxiliares (`has_role`, `update_updated_at_column`, `handle_new_user`)
- Triggers automáticos
- Datos iniciales (años 1-5 con secciones A, B, C)

#### 3.3. Configurar Autenticación

En tu proyecto de Supabase:

1. Ve a `Authentication` → `Settings`
2. En **Email Auth**:
   - Activa `Enable email confirmations` (o desactívalo para desarrollo)
   - Configura `Site URL`: Tu URL de producción o `http://localhost:5173` para desarrollo
3. En **Auth Providers**:
   - Asegúrate de que `Email` esté habilitado
4. En **URL Configuration**:
   - Añade URLs de redirección permitidas:
     - `http://localhost:5173/**` (desarrollo)
     - Tu URL de producción (cuando despliegues)

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-aqui
VITE_SUPABASE_PROJECT_ID=tu-project-id
```

**Dónde encontrar estos valores:**
- `VITE_SUPABASE_URL`: En Supabase → Settings → API → Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: En Supabase → Settings → API → Project API keys → anon public
- `VITE_SUPABASE_PROJECT_ID`: En la URL de tu proyecto (últimos caracteres)

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 👤 Primer Uso: Crear Usuario Admin

El sistema requiere que asignes manualmente el rol de administrador al primer usuario:

### Paso 1: Registrar el primer usuario
1. Abre la aplicación en `http://localhost:5173`
2. Ve a la página de registro
3. Crea una cuenta con email y contraseña

### Paso 2: Asignar rol de admin
1. Ve al dashboard de Supabase
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

## 🚀 Despliegue a Producción

### Opción 1: Lovable (Recomendado si fue creado en Lovable)
1. Abre tu proyecto en [Lovable](https://lovable.dev)
2. Click en `Share` → `Publish`
3. Sigue las instrucciones

### Opción 2: Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Opción 3: Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Configuración Post-Despliegue
1. Añade tu URL de producción en las variables de entorno del servicio de hosting
2. Actualiza las URLs de redirección en Supabase:
   - `Authentication` → `URL Configuration`
   - Añade tu dominio de producción

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

### "Session expired" o redirige a localhost
- Verifica que las URLs de redirección estén configuradas en Supabase
- Asegúrate de que `Site URL` sea correcta en configuración de Auth

### No puedo ver el dashboard después de crear cuenta
- Verifica que el rol de admin esté asignado en `user_roles`
- Cierra sesión y vuelve a iniciar sesión
- Revisa la consola del navegador para errores

### Error "violates row-level security policy"
- Verifica que el usuario tenga el rol correcto en `user_roles`
- Confirma que las políticas RLS se ejecutaron correctamente
- Revisa que las funciones `has_role` existan en Supabase

### Las migraciones fallan al ejecutarse
- Ejecuta las queries línea por línea para identificar el error
- Verifica que no existan objetos duplicados
- Asegúrate de que la extensión UUID esté habilitada

## 📖 Documentación Adicional

- [Documentación de Lovable](https://docs.lovable.dev)
- [Documentación de Supabase](https://supabase.com/docs)
- [Self-hosting con Lovable](https://docs.lovable.dev/tips-tricks/self-hosting)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)

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
