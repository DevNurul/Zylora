const { MongoClient } = require('mongoose').mongo;
require('dotenv').config();

// Get URIs from arguments or environment variables
const SOURCE_URI = process.argv[2] || process.env.OLD_MONGODB_URI;
const DEST_URI = process.argv[3] || process.env.MONGODB_URI;

if (!SOURCE_URI || !DEST_URI) {
  console.error('\x1b[31mError: Please provide both source and destination URIs.\x1b[0m');
  console.log('\nUsage:');
  console.log('  \x1b[36mnode migrate-db.js <OLD_MONGODB_URI> <NEW_MONGODB_URI>\x1b[0m');
  console.log('\nOr, add \x1b[33mOLD_MONGODB_URI\x1b[0m to your server \x1b[33m.env\x1b[0m file and run:');
  console.log('  \x1b[36mnode migrate-db.js\x1b[0m');
  process.exit(1);
}

async function run() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const destClient = new MongoClient(DEST_URI);

  try {
    console.log('\x1b[35m[1/4] Connecting to Source (Old) Database...\x1b[0m');
    await sourceClient.connect();
    console.log('\x1b[32m✔ Connected to Source Database.\x1b[0m');

    console.log('\x1b[35m[2/4] Connecting to Destination (New) Database...\x1b[0m');
    await destClient.connect();
    console.log('\x1b[32m✔ Connected to Destination Database.\x1b[0m');

    const sourceDb = sourceClient.db();
    const destDb = destClient.db();

    // Get list of all collections in the source database
    console.log('\x1b[35m[3/4] Listing collections...\x1b[0m');
    const collections = await sourceDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections in source database.`);

    console.log('\x1b[35m[4/4] Starting data migration...\x1b[0m');
    for (const collInfo of collections) {
      const collName = collInfo.name;
      // Skip system collections
      if (collName.startsWith('system.')) continue;

      console.log(`\nMigrating collection: \x1b[33m${collName}\x1b[0m...`);
      const documents = await sourceDb.collection(collName).find({}).toArray();

      if (documents.length === 0) {
        console.log(`  Collection is empty. Skipping.`);
        continue;
      }

      console.log(`  Found ${documents.length} documents. Copying...`);

      // Empty the target collection first to avoid duplicates/conflicts
      await destDb.collection(collName).deleteMany({});
      
      // Insert all documents
      await destDb.collection(collName).insertMany(documents);
      console.log(`  \x1b[32m✔ Successfully migrated ${documents.length} documents.\x1b[0m`);
    }

    console.log('\n\x1b[42m\x1b[30m MIGRATION COMPLETED SUCCESSFULLY! 🎉 \x1b[0m\n');
  } catch (error) {
    console.error('\n\x1b[31mMigration failed with error:\x1b[0m', error);
  } finally {
    await sourceClient.close();
    await destClient.close();
  }
}

run();
