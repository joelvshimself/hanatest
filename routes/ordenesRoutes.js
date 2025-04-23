const express = require('express');
const {
  getOrdenes,
  getOrdenById,
  createOrden,
  updateOrden,
  deleteOrden
} = require('../controllers/ordenesController');
const { authenticateToken } = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/ordenes:
 *   get:
 *     summary: Obtener todas las órdenes
 *     description: Lista todas las órdenes desde la base de datos.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Órdenes listadas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', authenticateToken, getOrdenes);

/**
 * @swagger
 * /api/ordenes/{id}:
 *   get:
 *     summary: Obtener una orden por ID
 *     description: Retorna una orden específica.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Orden encontrada.
 *       404:
 *         description: Orden no encontrada.
 */
router.get('/:id', authenticateToken, getOrdenById);

/**
 * @swagger
 * /api/ordenes:
 *   post:
 *     summary: Crear una nueva orden
 *     description: Crea una orden en la base de datos.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *               fecha:
 *                 type: string
 *               id_usuario:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Orden creada exitosamente.
 */
router.post('/', authenticateToken, createOrden);

/**
 * @swagger
 * /api/ordenes/{id}:
 *   put:
 *     summary: Actualizar una orden existente
 *     description: Modifica una orden por ID.
 *     security:
 *       - BearerAuth: []
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
 *               estado:
 *                 type: string
 *               fecha:
 *                 type: string
 *               id_usuario:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Orden actualizada.
 */
router.put('/:id', authenticateToken, updateOrden);

/**
 * @swagger
 * /api/ordenes/{id}:
 *   delete:
 *     summary: Eliminar una orden
 *     description: Elimina una orden existente.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden eliminada.
 */
router.delete('/:id', authenticateToken, deleteOrden);

module.exports = router;
