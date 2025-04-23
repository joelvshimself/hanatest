const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/dbConfig');

dotenv.config();

const secretKey = process.env.JWT_SECRET || "ClaveSuperSecreta123!@#$";

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: '⛔ Acceso denegado, token no proporcionado' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: '⛔ Token inválido' });

    req.user = user;
    next();
  });
};

const getUsers = [authenticateToken, async (req, res) => {
  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare('SELECT * FROM USERS');
    const result = await stmt.exec();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}];

const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const conn = await poolPromise;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const stmt = await conn.prepare(`
      INSERT INTO USERS (NAME, EMAIL, PASSWORDHASH, CREATEDAT)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    await stmt.exec([name, email, hashedPassword]);

    res.status(201).json({ message: '✅ Usuario creado' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateUser = [authenticateToken, async (req, res) => {
  const { name, email, passwordhash } = req.body;
  const { id } = req.params;

  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare(`
      UPDATE USERS
      SET NAME = ?, EMAIL = ?, PASSWORDHASH = ?
      WHERE ID = ?
    `);
    await stmt.exec([name, email, passwordhash, id]);
    res.json({ message: '✅ Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}];

const deleteUser = [authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare('DELETE FROM USERS WHERE ID = ?');
    await stmt.exec([id]);
    res.json({ message: '✅ Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}];

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '⚠️ Faltan datos obligatorios' });
  }

  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare('SELECT * FROM USERS WHERE EMAIL = ?');
    const result = await stmt.exec([email]);

    if (!result || result.length === 0) {
      return res.status(401).json({ error: '⛔ Credenciales inválidas' });
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.PASSWORDHASH);

    if (!passwordMatch) {
      return res.status(401).json({ error: '⛔ Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.ID, email: user.EMAIL },
      secretKey,
      { expiresIn: '2h' }
    );

    res.json({ message: '✅ Inicio de sesión exitoso', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  login,
  authenticateToken
};
