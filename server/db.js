const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in server/.env');
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    if (mongoose.connection && mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
    }
    console.log('MongoDB connected:', uri);
    return;
  } catch (err) {
    console.warn('\n⚠️  Could not reach MongoDB at', uri);
    try {
      await mongoose.disconnect();
    } catch (discErr) {
      // ignore
    }
    console.warn('   Falling back to an in-memory MongoDB (data is not persisted).');
    console.warn('   For persistence, start local MongoDB or set MONGODB_URI to an Atlas string.\n');
  }

  // Dev fallback: spin up an ephemeral in-memory MongoDB so the app runs out of the box.
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri('prospecto_db'));
    console.log('In-memory MongoDB started and connected.');
  } catch (err) {
    console.error('\n❌ Failed to start in-memory MongoDB fallback.');
    throw err;
  }
}

module.exports = { connectDB, mongoose };
