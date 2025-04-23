const { poolPromise } = require('../config/dbConfig');

const getOrdenes = async (req, res) => {
  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare('SELECT * FROM ORDEN');
    const result = await stmt.exec();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrdenById = async (req, res) => {
  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare('SELECT * FROM ORDEN WHERE ID_ORDEN = ?');
    const result = await stmt.exec([req.params.id]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createOrden = async (req, res) => {
  const { estado, fecha, id_usuario } = req.body;

  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare(`
      INSERT INTO ORDEN (ESTADO, FECHA, ID_USUARIO)
      VALUES (?, ?, ?)
    `);
    await stmt.exec([estado, fecha, id_usuario]);

    res.status(201).json({ message: 'Orden creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrden = async (req, res) => {
  const { estado, fecha, id_usuario } = req.body;

  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare(`
      UPDATE ORDEN
      SET ESTADO = ?, FECHA = ?, ID_USUARIO = ?
      WHERE ID_ORDEN = ?
    `);
    await stmt.exec([estado, fecha, id_usuario, req.params.id]);

    res.json({ message: 'Orden actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOrden = async (req, res) => {
  try {
    const conn = await poolPromise;
    const stmt = await conn.prepare('DELETE FROM ORDEN WHERE ID_ORDEN = ?');
    await stmt.exec([req.params.id]);

    res.json({ message: 'Orden eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOrdenes,
  getOrdenById,
  createOrden,
  updateOrden,
  deleteOrden
};
