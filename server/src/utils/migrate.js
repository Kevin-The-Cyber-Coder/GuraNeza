import mongoose from 'mongoose';
import { migrations } from '../migrations/index.js';

const COLLECTION = '_migrations';

/**
 * Applies pending migrations in order and records each successful run.
 * Safe to call on every boot: already-applied migrations are skipped.
 *
 * @returns {Promise<number>} number of migrations applied in this run
 */
export const runMigrations = async () => {
  const db = mongoose.connection.db;
  if (!db) {
    console.warn('[Migrations] No database connection. Skipping.');
    return 0;
  }

  const collection = db.collection(COLLECTION);
  const applied = new Set((await collection.find({}).toArray()).map((doc) => doc._id));

  let appliedCount = 0;
  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;

    const startedAt = Date.now();
    try {
      await migration.up({ db, mongoose });
      await collection.insertOne({
        _id: migration.id,
        description: migration.description,
        appliedAt: new Date(),
        durationMs: Date.now() - startedAt,
      });
      appliedCount += 1;
      console.log(`[Migrations] Applied ${migration.id} — ${migration.description}`);
    } catch (error) {
      console.error(`[Migrations] Failed ${migration.id}: ${error.message}`);
      throw error;
    }
  }

  if (appliedCount === 0) console.log('[Migrations] Database is up to date');
  return appliedCount;
};

export default runMigrations;
