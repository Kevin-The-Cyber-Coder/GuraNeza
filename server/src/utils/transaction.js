import mongoose from 'mongoose';

let cachedSupport;

/**
 * Detects whether the connected MongoDB deployment supports multi-document
 * transactions (replica set or sharded cluster).
 */
export const supportsTransactions = async () => {
  if (cachedSupport !== undefined) return cachedSupport;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    cachedSupport = Boolean(hello.setName || hello.msg === 'isdbgrid');
  } catch {
    cachedSupport = false;
  }
  return cachedSupport;
};

/**
 * Runs a unit of work inside a transaction when the deployment supports it.
 * Standalone MongoDB falls back to a direct run so local development remains
 * usable; production and tests use a replica set.
 *
 * The callback must only perform database work.
 */
export const withTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    if (await supportsTransactions()) {
      await session.withTransaction(async () => {
        result = await work(session);
      });
    } else {
      console.warn(
        '[db] Transactions are unavailable on this MongoDB deployment. Running without one.'
      );
      result = await work(null);
    }
    return result;
  } finally {
    await session.endSession();
  }
};

export default withTransaction;
