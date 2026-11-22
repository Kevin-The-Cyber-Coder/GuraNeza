import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import runMigrations from './utils/migrate.js';

const PORT = env.PORT;

connectDB().then(async (connection) => {
  if (connection) {
    try {
      await runMigrations();
    } catch (error) {
      console.error(`[Migrations] Failed: ${error.message}`);
      if (env.NODE_ENV === 'production') process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`\n  GuraNeza API is running`);
    console.log(`  Kigali, Rwanda`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/api/health\n`);
  });
});
