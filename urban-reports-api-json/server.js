require('dotenv').config();
const app = require('./app');
const db  = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const iniciar = async () => {
  await db.connectDatabase();

  app.listen(PORT, () => {
    console.log('');
    console.log('🏙️  Urban Reports API  [modo JSON — sem banco de dados]');
    console.log('─────────────────────────────────────────────────────');
    console.log(`🚀 Servidor em http://localhost:${PORT}`);
    console.log(`📁 Dados em    ./database/json/`);
    console.log('─────────────────────────────────────────────────────');
    console.log('');
  });
};

iniciar().catch(err => { console.error('❌', err.message); process.exit(1); });
