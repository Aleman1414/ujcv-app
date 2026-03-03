# UJCV Academic Control System

Sistema de Control Académico de Aulas y Docentes para la Universidad José Cecilio del Valle (UJCV), construido con React, Vite, Tailwind CSS y Firebase.

## Características

- Dashboard en tiempo real mostrando el estado de las aulas.
- Gestión de Aulas (Crear, Editar, Eliminar).
- Gestión de Docentes.
- Asignación de Horarios (Clases).
- Tres roles de acceso (Coordinador, Docente, Alumno), protegidos mediante Auth y Firestore Security Rules.
- Diseño responsivo, elegante e institucional utilizando el branding azul.

## Requisitos Previos

- Node.js (v18+)
- Proyecto en Firebase con Authentication y Firestore habilitados.

## Instalación

1. Clona este repositorio o abre la carpeta del proyecto.
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Configuración de Firebase

1. Renombra el archivo `.env.example` a `.env` (ya creado si usaste el agente).
2. Llena las variables con los datos de configuración de tu proyecto Firebase:
   ```
   VITE_FIREBASE_API_KEY="tu-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="tu-auth-domain"
   VITE_FIREBASE_PROJECT_ID="tu-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="tu-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="tu-sender-id"
   VITE_FIREBASE_APP_ID="tu-app-id"
   ```
3. En la consola de Firebase, asegúrate de habilitar:
   - **Authentication**: Proveedores "Correo/Contraseña" y "Google".
   - **Firestore Database**.
4. Despliega las reglas de seguridad copiando el contenido de `firestore.rules` al panel de reglas de tu Firestore, o usa Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Roles Iniciales

Cuando un usuario inicia sesión por primera vez, el sistema lo registra automáticamente en la colección de `users` en Firestore con el rol por defecto de `alumno`.
Para otorgar permisos de administrador (Coordinador):
1. Ve a la consola de Firestore.
2. Busca la colección `users` y el documento de tu usuario recién registrado.
3. Cambia el campo `role` de `"alumno"` a `"admin"`.
4. Refresca la página en tu navegador local para ver las herramientas de administración (Sidebar).

*NOTA*: Para que los docentes puedan ver su horario (`/teacher/schedule`), asegúrate de crear al docente en "Docentes" usando *el mismo correo electrónico* con el que inicia sesión.

## Levantar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173/`.

## Deploy en Vercel

1. Sube tu código a un repositorio en GitHub.
2. Ingresa a [Vercel](https://vercel.com/) e importa tu repositorio.
3. El Framework Preset *Vite* será detectado automáticamente.
4. **IMPORTANTE**: En la sección de configuración de *Environment Variables* en Vercel, asegúrate de agregar todas las variables `VITE_FIREBASE_*` que tienes en tu `.env`.
5. Haz clic en **Deploy**.
