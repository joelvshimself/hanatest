const express = require('express');
const hana = require('@sap/hana-client');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const userController = require('./controllers/usercontroller');
const statusMonitor = require('express-status-monitor');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Habilitar Morgan para logs HTTP
app.use(statusMonitor()); // Habilitar Status Monitor

app.use(cors({
  origin: 'http://localhost:5030',  // O el dominio de tu front-end
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Conexión a SAP HANA
const conn = hana.createConnection();

// Configuración de SAP HANA
const connectionParams = {
  host: process.env.HANA_HOST,
  port: process.env.HANA_PORT,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
  encrypt: true,
  validateCertificate: true
};

// Conectar a SAP HANA
conn.connect(connectionParams, (err) => {
  if (err) {
    console.error('❌ Error al conectar a SAP HANA:', err);
    process.exit(1);
  } else {
    console.log('✅ Conexión exitosa a SAP HANA Cloud');
  }
});

// 📌 Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API CRUD con SAP HANA',
      version: '1.0.0',
      description: 'API con operaciones CRUD para la gestión de usuarios',
    },
    servers: [{ url: 'http://localhost:5030' }],
  },
  apis: ['./controllers/usercontroller.js'], // 📌 Aquí se definen los comentarios de Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Rutas de documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta raíz
app.get('/', (req, res) => {
  res.send('✅ API CRUD con SAP HANA funcionando correctamente!');
});

// Rutas de usuarios (CRUD)
app.get('/users', userController.getUsers);
app.post('/users', userController.createUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);
// Ruta de login
app.post('/login', userController.login);



// Iniciar servidor
const PORT = 5030;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📄 Documentación Swagger en: http://localhost:${PORT}/api-docs`);
});
