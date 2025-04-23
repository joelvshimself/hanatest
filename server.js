require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const userRoutes = require('./routes/userRoutes');
const ordenesRoutes = require('./routes/ordenesRoutes');
const setupSwagger = require('./config/swaggerConfig');
const twoFARoutes = require('./routes/twoFARoutes');
const { poolPromise } = require('./config/dbConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', twoFARoutes);
app.use('/api', userRoutes);
app.use('/api/ordenes', ordenesRoutes);

// Swagger
setupSwagger(app);

// Servidor con control de errores
const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación de API disponible en http://localhost:${PORT}/api-docs`);

  // Prueba temprana de conexión a SAP HANA
  try {
    const conn = await poolPromise;
    console.log('✅ Conectado a SAP HANA Cloud');
  } catch (err) {
    console.error('❌ Error conectando a SAP HANA:', err.message);
  }
});

// Manejo de errores en tiempo real
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está en uso. Usa otro o mata el proceso conflictivo.`);
    console.error(`💡 Tip: ejecuta 'lsof -i :${PORT}' y luego 'kill -9 <PID>'`);
  } else {
    console.error('❌ Error inesperado en el servidor:', err);
  }
});

// Captura global de errores
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});
