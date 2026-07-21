# 🚀 Antigravity Remote Companion

Aplicación moderna, minimalista y autónoma para **notificar, monitorear y controlar Antigravity** de forma remota desde tu celular o cualquier otro dispositivo.

---

## ✨ Características Principales

1. **Alerta & Confirmación Remota en Tiempo Real**:
   - Notificación visual animada en tu móvil cuando Antigravity requiera confirmación ("Aceptar", "Permitir", "Proceder").
   - Botón gigante con respuesta hápitca para enfocar la ventana y enviar `ENTER` al instante.
2. **Modo Autónomo (Auto-Aceptar)**:
   - Permite activar la confirmación automática para que las peticiones se respondan solas en milisegundos.
3. **Acciones Rápidas Autónomas**:
   - 📦 **Git Commit & Push**: Ejecuta `git add .`, `git commit` y `git push` en tu proyecto de forma remota.
   - 🖥️ **Enfocar Ventana**: Trae Antigravity al frente en tu pantalla de PC (`SetForegroundWindow`).
4. **Telemetría de Contexto & Tokens**:
   - Indicador de porcentaje de Contexto Restante.
   - Conteo de Tokens consumidos en la sesión activa.
   - Temporizador para el reinicio diario de la cuota.
5. **Autenticación & Seguridad**:
   - Pantalla de inicio de sesión con el usuario `Estebanico10` y contraseña protegida.
6. **Arquitectura Bidireccional Supabase Realtime + Local Fallback**:
   - Funciona sin latencia mediante WebSockets con Supabase o directamente en red local.

---

## 🛠️ Estructura del Proyecto

```
Control Antigravity/
├── backend-antigravity/    # Servidor Daemon Node.js para Windows (PowerShell Automation & Telemetry)
├── frontend-remote/       # App Web Móvil (React 18 + Vite + TypeScript + Tailwind CSS)
├── supabase_schema.sql    # Script SQL para base de datos Supabase
└── README.md              # Documentación del proyecto
```

---

## ⚡ Inicio Rápido

### 1. Iniciar el Servidor Daemon Local (PC)
```bash
cd backend-antigravity
npm install
npm start
```

### 2. Iniciar la App Frontend Móvil (Desarrollo)
```bash
cd frontend-remote
npm install
npm run dev
```

### 3. Configuración de Base de Datos (Supabase - Opcional para Cloud Realtime)
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al SQL Editor y ejecuta las consultas contenidas en [`supabase_schema.sql`](file:///g:/CODE/Control%20Antigravity/supabase_schema.sql).
3. En la app web, presiona el icono de **Configuración** e ingresa la URL y Anon Key de tu proyecto Supabase.

---

## 🔒 Credenciales de Acceso
- **Usuario:** `Estebanico10`
- **Contraseña:** `JesusesVida.10`

---

## 📄 Licencia
MIT - Desarrollado para Estebanico10.
