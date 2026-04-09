# Mission Community 🚀

MVP de una plataforma web para administrar una comunidad de personas dispuestas a realizar misiones (encuestas, verificaciones de producto, fotos de precios, etc.) a cambio de puntos y recompensas.

## Demo

[Video de demostración] https://drive.google.com/file/d/1C_wYP2WJApmP99JxK8SsHGdGwv1575TA/view?usp=sharing

## Stack Tecnológico

  | Tecnología | Uso |
  |---|---|
  | **Node.js + Express** | Backend / API REST |
  | **Firebase Firestore** | Base de datos NoSQL en la nube |
  | **HTML + CSS + JavaScript** | Frontend (Single Page Application) |
  | **Groq API (Llama 3.3 70B)** | Integración de AI para procesamiento de texto |
  | **Git + GitHub** | Control de versiones |

## Funcionalidades

- **Gestión de Usuarios**: Crear y listar usuarios con nombre, email y ciudad
- **Gestión de Misiones**: Crear y listar misiones con título, descripción, tipo y recompensa en puntos
- **Asignación de Misiones**: Asignar misiones disponibles a usuarios registrados
- **AI Assistant**: Tres funciones potenciadas por inteligencia artificial:
  - **Mejorar descripción**: Reescribe la descripción de una misión para hacerla más clara y atractiva
  - **Clasificar misión**: Identifica automáticamente la categoría de una misión
  - **Generar invitación**: Crea un mensaje motivador para invitar participantes

## Integración con AI

Se utilizó la API de **Groq** con el modelo **Llama 3.3 70B Versatile** para las funcionalidades de inteligencia artificial. La integración se realizó en el endpoint `/api/ai/improve-description` del backend, donde se construyen prompts específicos según la acción solicitada (mejorar, clasificar o invitar) y se envían al modelo para obtener respuestas contextualizadas.

Se eligió Groq por su acceso gratuito y su baja latencia, lo que permite respuestas casi instantáneas. La arquitectura está diseñada para ser intercambiable: cambiar a Claude (Anthropic) o GPT (OpenAI) requeriría modificar únicamente el archivo `server.js` en la sección de configuración de AI.

## Instrucciones de Ejecución

### Prerrequisitos

- Node.js (v18 o superior)
- Cuenta de Firebase con Firestore habilitado
- API Key de Groq (gratuita en https://console.groq.com)

### Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/N7C0LAS/mission-community.git
cd mission-community
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear archivo `.env` en la raíz del proyecto con las siguientes variables:

GROQ_API_KEY=tu_api_key_de_groq
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id

4. Iniciar el servidor:

```bash
node server.js
```

5. Abrir en el navegador:

http://localhost:3000

## Estructura del Proyecto

mission-community/
├── server.js          # Backend: API REST + Firebase + AI
├── public/
│   └── index.html     # Frontend: Interfaz de usuario completa
├── package.json       # Dependencias del proyecto
├── .env               # Variables de entorno (no incluido en repo)
├── .gitignore         # Archivos excluidos de Git
└── README.md          # Documentación


## Qué mejoraría con más tiempo

- **Autenticación**: Implementar login con Firebase Auth para proteger las rutas
- **Base de datos relacional**: Migrar a PostgreSQL o usar BigQuery para analytics avanzados
- **Mapa interactivo**: Mostrar misiones geolocalizadas usando Google Maps o Leaflet
- **Sistema de puntos completo**: Acumulación, historial y canje de recompensas
- **Notificaciones**: Alertas por email o push cuando se asigna una misión
- **Dashboard de métricas**: Panel con estadísticas de misiones completadas, usuarios activos, etc.
- **Testing**: Agregar pruebas unitarias con Jest y pruebas E2E
- **Deploy**: Desplegar en Railway, Render o Firebase Hosting para acceso público
- **React**: Migrar el frontend a React para mejor mantenibilidad y escalabilidad

## Autor

Nicolás Espejo Porras — [LinkedIn] www.linkedin.com/in/nicolas-espejo-porras
