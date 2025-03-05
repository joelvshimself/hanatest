const hana = require('@sap/hana-client');
const dotenv = require('dotenv');

dotenv.config();

const connectionParams = {
  host: process.env.HANA_HOST,
  port: process.env.HANA_PORT,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
  encrypt: true,
  validateCertificate: true
};

const conn = hana.createConnection();

conn.connect(connectionParams, (err) => {
  if (err) {
    console.error('❌ Error al conectar a SAP HANA:', err);
    return;
  }
  console.log('✅ Conexión exitosa a SAP HANA');

  conn.exec('SELECT * FROM USERS', [], (err, result) => {
    if (err) {
      console.error('❌ Error en consulta:', err.message);
    } else {
      console.log('📊 Datos obtenidos:', result);
    }
    conn.disconnect();
  });
});
