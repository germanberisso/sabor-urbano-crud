// server.js
const express = require('express');
const app = express();
const actividadRoutes = require('./routes/actividadRoutes');

// Middleware para leer JSON en requests
app.use(express.json());

// Conectar rutas
app.use('/actividades', actividadRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.send('¡Hola Mundo! Servidor funcionando.');
});

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});