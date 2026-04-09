// ============================================
// SERVER.JS — Servidor principal de Mission Community
// ============================================
// Stack: Node.js + Express + Firebase Firestore + Groq AI
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where
} = require('firebase/firestore');
const Groq = require('groq-sdk');

// ============================================
// 1. CONFIGURACIÓN DE FIREBASE
// ============================================
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ============================================
// 2. CONFIGURACIÓN DE GROQ (AI)
// ============================================
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ============================================
// 3. CONFIGURACIÓN DE EXPRESS (SERVIDOR WEB)
// ============================================
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// 4. RUTAS DE USUARIOS
// ============================================

// Crear un usuario
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, city } = req.body;

    // Validación básica
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }

    const newUser = {
      name,
      email,
      city: city || '',
      points: 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'users'), newUser);
    res.status(201).json({ id: docRef.id, ...newUser });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// Listar todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

// ============================================
// 5. RUTAS DE MISIONES
// ============================================

// Crear una misión
app.post('/api/missions', async (req, res) => {
  try {
    const { title, description, reward, type } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Título y descripción son obligatorios' });
    }

    const newMission = {
      title,
      description,
      reward: reward || 0,
      type: type || 'encuesta',
      status: 'available',
      assignedTo: null,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'missions'), newMission);
    res.status(201).json({ id: docRef.id, ...newMission });
  } catch (error) {
    console.error('Error creando misión:', error);
    res.status(500).json({ error: 'Error al crear la misión' });
  }
});

// Listar todas las misiones
app.get('/api/missions', async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, 'missions'));
    const missions = [];
    snapshot.forEach((doc) => {
      missions.push({ id: doc.id, ...doc.data() });
    });
    res.json(missions);
  } catch (error) {
    console.error('Error listando misiones:', error);
    res.status(500).json({ error: 'Error al listar misiones' });
  }
});

// ============================================
// 6. ASIGNAR MISIÓN A USUARIO
// ============================================

app.post('/api/missions/:missionId/assign', async (req, res) => {
  try {
    const { missionId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es obligatorio' });
    }

    // Verificar que el usuario existe
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que la misión existe
    const missionRef = doc(db, 'missions', missionId);
    const missionSnap = await getDoc(missionRef);
    if (!missionSnap.exists()) {
      return res.status(404).json({ error: 'Misión no encontrada' });
    }

    // Asignar la misión
    await updateDoc(missionRef, {
      assignedTo: userId,
      assignedName: userSnap.data().name,
      status: 'assigned'
    });

    res.json({
      message: `Misión "${missionSnap.data().title}" asignada a ${userSnap.data().name}`,
      missionId,
      userId
    });
  } catch (error) {
    console.error('Error asignando misión:', error);
    res.status(500).json({ error: 'Error al asignar la misión' });
  }
});

// ============================================
// 7. FUNCIONALIDAD AI — Mejorar descripción de misión
// ============================================

app.post('/api/ai/improve-description', async (req, res) => {
  try {
    const { description, action } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'La descripción es obligatoria' });
    }

    let prompt = '';

    switch (action) {
      case 'improve':
        prompt = `Eres un experto en diseño de misiones para comunidades de crowdsourcing. 
Mejora la siguiente descripción de misión para que sea más clara, motivadora y profesional. 
Mantén el mismo objetivo pero hazla más atractiva para los participantes.
Responde SOLO con la descripción mejorada, sin explicaciones adicionales.
Descripción original: "${description}"`;
        break;

      case 'classify':
        prompt = `Clasifica la siguiente misión en una de estas categorías: 
- Encuesta
- Verificación de producto
- Foto de precios
- Mystery Shopper
- Recolección de datos
- Otra

Responde SOLO con el nombre de la categoría y una breve justificación de máximo 1 línea.
Misión: "${description}"`;
        break;

      case 'invitation':
        prompt = `Genera un mensaje de invitación corto y motivador (máximo 3 líneas) para invitar a un miembro de la comunidad a participar en la siguiente misión. 
El tono debe ser amigable y entusiasta.
Responde SOLO con el mensaje de invitación.
Misión: "${description}"`;
        break;

      default:
        prompt = `Mejora esta descripción de misión: "${description}"`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500
    });

    const result = chatCompletion.choices[0]?.message?.content || 'No se pudo generar respuesta';

    res.json({ original: description, result, action });
  } catch (error) {
    console.error('Error con AI:', error);
    res.status(500).json({ error: 'Error al procesar con AI' });
  }
});

// ============================================
// 8. INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 API lista para recibir peticiones\n`);
});
