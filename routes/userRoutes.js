const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  login
} = require('../controllers/userController');

const router = express.Router();

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
router.get('/users', getUsers);

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
router.post('/users', createUser);

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
router.put('/users/:id', updateUser);

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
router.delete('/users/:id', deleteUser);

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
router.post('/login', login);

module.exports = router;
