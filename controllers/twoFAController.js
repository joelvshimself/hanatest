const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { poolPromise } = require('../config/dbConfig');

const generate2FA = async (req, res) => {
  const { email } = req.body;

  try {
    const conn = await poolPromise;
    const secret = speakeasy.generateSecret({ name: `ViBa (${email})` });

    const stmt = await conn.prepare(`
      UPDATE USUARIO SET "TWOFASECRET" = ? WHERE "EMAIL" = ?
    `);
    await stmt.exec([secret.base32, email]);

    const qr = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verify2FA = async (req, res) => {
  const { email, token } = req.body;

  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare(`
      SELECT "TWOFASECRET" FROM USUARIO WHERE "EMAIL" = ?
    `);
    const result = await stmt.exec([email]);

    if (!result || result.length === 0 || !result[0].TWOFASECRET) {
      return res.status(400).json({ success: false, message: '2FA no activado' });
    }

    const verified = speakeasy.totp.verify({
      secret: result[0].TWOFASECRET,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Código incorrecto' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const check2FAStatus = async (req, res) => {
  const { email } = req.body;

  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare(`
      SELECT "TWOFASECRET" FROM USUARIO WHERE "EMAIL" = ?
    `);
    const result = await stmt.exec([email]);

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const isActive = !!result[0].TWOFASECRET;
    res.json({ twoFAEnabled: isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  generate2FA,
  verify2FA,
  check2FAStatus
};
