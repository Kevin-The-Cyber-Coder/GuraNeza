import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  🛒  GuraNeza API is running`);
    console.log(`  📍  Kigali, Rwanda`);
    console.log(`  🌐  http://localhost:${PORT}`);
    console.log(`  ❤️   Health: http://localhost:${PORT}/api/health\n`);
  });
});
