import { setServers } from "dns";
import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

/**
 * Windows / some corporate networks refuse Node's default SRV DNS lookup
 * for mongodb+srv:// (querySrv ECONNREFUSED) even when nslookup works.
 * Prefer public resolvers for that path; standard mongodb:// URIs skip SRV.
 */
function ensureDnsForAtlas(uri: string) {
  if (!uri.startsWith("mongodb+srv://")) return;
  try {
    setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch {
    // ignore if the runtime disallows changing resolvers
  }
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  ensureDnsForAtlas(uri);

  if (process.env.NODE_ENV === "development") {
    if (!globalForMongo._mongoClientPromise) {
      const client = new MongoClient(uri);
      globalForMongo._mongoClientPromise = client.connect();
    }
    return globalForMongo._mongoClientPromise;
  }

  const client = new MongoClient(uri);
  return client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const dbName = process.env.MONGODB_DB || "thambalagama_estate";
  return client.db(dbName);
}
