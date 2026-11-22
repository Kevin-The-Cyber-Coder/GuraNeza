/**
 * Idempotent data migrations.
 *
 * Every migration runs once and is recorded in the `_migrations` collection.
 * Migrations must be safe to re-run and must never delete production data.
 */
export const migrations = [
  {
    id: '20261122-001-normalize-user-roles',
    description: 'Rename the legacy "user" role to "customer"',
    async up({ db }) {
      await db.collection('users').updateMany({ role: 'user' }, { $set: { role: 'customer' } });
      await db
        .collection('users')
        .updateMany({ role: { $exists: false } }, { $set: { role: 'customer' } });
    },
  },
  {
    id: '20261122-002-default-user-flags',
    description: 'Ensure every user has an explicit isActive flag',
    async up({ db }) {
      await db
        .collection('users')
        .updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });
    },
  },
];

export default migrations;
