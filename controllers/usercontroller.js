// controllers/usercontroller.js

const hana = require('@sap/hana-client');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

// Clave secreta para JWT (puedes cambiarla en el .env)
const secretKey = process.env.JWT_SECRET || "ClaveSuperSecreta123!@#$";

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
    console.error('Error al conectar a SAP HANA:', err.message);
  } else {
    console.log('Conexión inicial a SAP HANA establecida.');
  }
});


// Middleware para autenticar con JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: '⛔ Acceso denegado, token no proporcionado' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: '⛔ Token inválido' });

    req.user = user;
    next();
  });
};



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
exports.getUsers = [authenticateToken, (req, res) => {
  console.log('🔍 Ejecutando consulta en SAP HANA...');
  conn.exec('SELECT * FROM USERS', [], (err, result) => {
    if (err) {
      console.error('❌ Error al obtener usuarios:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!result || !Array.isArray(result)) {
      return res.status(500).json({ error: 'Objeto inválido', data: result });
    }

    res.json(result);
  });
}];

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
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 */
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Generar un salt y hashear la contraseña
    const saltRounds = 10; // Aumenta el número de rondas a un valor seguro
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar usuario en la base de datos con la contraseña hasheada
    conn.exec(
      'INSERT INTO USERS (NAME, EMAIL, PASSWORDHASH, CREATEDAT) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [name, email, hashedPassword],
      (err) => {
        if (err) {
          console.error('❌ Error al crear usuario:', err.message);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: '✅ Usuario creado' });
      }
    );
  } catch (error) {
    console.error('❌ Error al hashear la contraseña:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 */
exports.updateUser = [authenticateToken, (req, res) => {
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
}];

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
exports.deleteUser = [authenticateToken, (req, res) => {
  const userId = req.params.id;

  conn.exec('DELETE FROM USERS WHERE ID = ?', [userId], (err) => {
    if (err) {
      console.error('❌ Error al eliminar usuario:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: '✅ Usuario eliminado' });
  });
}];



/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Verifica las credenciales del usuario (email y passwordhash) en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       401:
 *         description: Credenciales inválidas.
 */

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '⚠️ Faltan datos obligatorios' });
  }

  conn.exec(
    'SELECT * FROM USERS WHERE EMAIL = ?',
    [email],
    async (err, result) => {
      if (err) {
        console.error('❌ Error en la consulta de login:', err.message);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (!result || result.length === 0) {
        return res.status(401).json({ error: '⛔ Credenciales inválidas' });
      }

      const user = result[0];
      const passwordMatch = await bcrypt.compare(password, user.PASSWORDHASH);

      if (!passwordMatch) {
        return res.status(401).json({ error: '⛔ Credenciales inválidas' });
      }

      // Generar token JWT con clave súper secreta
      const token = jwt.sign(
        { id: user.ID, email: user.EMAIL },
        secretKey,
        { expiresIn: '2h' }
      );

      res.json({ message: '✅ Inicio de sesión exitoso', token });
    }
  );
};
