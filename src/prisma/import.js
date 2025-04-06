const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://mrtweaker:%40Aniket.98@reactblog.dhelk.mongodb.net/ECommerce'; // Replace with your MongoDB URI
const dbName = 'ECommerce'; // Replace with your database name
const jsonDir = '/home/aniket/AWS Deployed Projects/ECommerce/ecommerce DB'; // Directory containing JSON files

async function refreshCollections() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const files = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const collectionName = path.basename(file, '.json'); // Use file name as collection name
      const filePath = path.join(jsonDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log(`Skipped empty file: ${file}`);
        continue; // Skip empty files
      }

      // Drop the collection if it exists
      const collection = db.collection(collectionName);
      await collection.drop().catch(err => {
        if (err.codeName !== 'NamespaceNotFound') {
          throw err; // Ignore error if collection doesn't exist
        }
      });
      console.log(`Dropped collection: ${collectionName}`);

      // Insert fresh data
      await collection.insertMany(Array.isArray(data) ? data : [data]);
      console.log(`Imported data into collection: ${collectionName}`);
    }

    console.log('All collections refreshed successfully!');
  } catch (err) {
    console.error('Error refreshing collections:', err);
  } finally {
    await client.close();
  }
}

refreshCollections();