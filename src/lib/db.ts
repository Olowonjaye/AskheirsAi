import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI or MONGO_URI environment variable");
}

const client = new MongoClient(uri);
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
