const express = require('express');
const {
  generate2FA,
  verify2FA,
  check2FAStatus
} = require('../controllers/twoFAController');

const router = express.Router();

/**
 * @swagger
 * /api/auth/generate-2fa:
 *   post:
 *     summary: Generar código 2FA y devolver QR
 *     description: Genera un secreto TOTP para el usuario y retorna un código QR para escanear con Google Authenticator.
 *     tags:
 *       - Two Factor Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@correo.com
 *     responses:
 *       200:
 *         description: QR generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qr:
 *                   type: string
 */
router.post('/generate-2fa', generate2FA);

/**
 * @swagger
 * /api/auth/verify-2fa:
 *   post:
 *     summary: Verificar código 2FA
 *     description: Verifica el token 2FA proporcionado por el usuario con su secreto TOTP almacenado.
 *     tags:
 *       - Two Factor Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verificación exitosa.
 *       401:
 *         description: Código incorrecto.
 */
router.post('/verify-2fa', verify2FA);

/**
 * @swagger
 * /api/auth/check-2fa:
 *   post:
 *     summary: Consultar si el usuario tiene 2FA activado
 *     description: Retorna el estado del 2FA (activo o no) para el usuario proporcionado.
 *     tags:
 *       - Two Factor Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado del 2FA retornado.
 */
router.post('/check-2fa', check2FAStatus);

module.exports = router;
