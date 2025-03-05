// controllers/usercontroller.js

const hana = require('@sap/hana-client');
const dotenv = require('dotenv');
dotenv.config();

// Configuración de SAP HANA
const connectionParams = {
  host: process.env.HANA_HOST,
  port: process.env.HANA_PORT,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
  encrypt: true,
  validateCertificate: true
};

// Crear conexión única al iniciar
const conn = hana.createConnection();
conn.connect(connectionParams, (err) => {
  if (err) {
    console.error('❌ Error al conectar a SAP HANA:', err.message);
  } else {
    console.log('✅ Conexión inicial a SAP HANA establecida.');
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna una lista de todos los usuarios registrados en la base de datos.
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
 */
exports.getUsers = (req, res) => {
  console.log('🔍 Ejecutando consulta en SAP HANA...');
  conn.exec('SELECT * FROM USERS', [], (err, result) => {
    if (err) {
      console.error('❌ Error al obtener usuarios:', err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log('📊 Resultado de la consulta:', result);
    if (!result || !Array.isArray(result)) {
      console.log('❌ Objeto inválido recibido:', result);
      return res.status(500).json({ error: 'Invalid Object', data: result });
    }

    res.json(result);
  });
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     description: Agrega un nuevo usuario a la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               passwordhash:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 */
exports.createUser = (req, res) => {
  const { name, email, passwordhash } = req.body;
  conn.exec(
    'INSERT INTO USERS (NAME, EMAIL, PASSWORDHASH) VALUES (?, ?, ?)',
    [name, email, passwordhash],
    (err) => {
      if (err) {
        console.error('❌ Error al crear usuario:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: '✅ Usuario creado' });
    }
  );
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     description: Modifica la información de un usuario existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               passwordhash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 */
exports.updateUser = (req, res) => {
  const { name, email, passwordhash } = req.body;
  conn.exec(
    'UPDATE USERS SET NAME = ?, EMAIL = ?, PASSWORDHASH = ? WHERE ID = ?',
    [name, email, passwordhash, req.params.id],
    (err) => {
      if (err) {
        console.error('❌ Error al actualizar usuario:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: '✅ Usuario actualizado' });
    }
  );
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Borra un usuario de la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 */
exports.deleteUser = (req, res) => {
  conn.exec('DELETE FROM USERS WHERE ID = ?', [req.params.id], (err) => {
    if (err) {
      console.error('❌ Error al eliminar usuario:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: '✅ Usuario eliminado' });
  });
};
