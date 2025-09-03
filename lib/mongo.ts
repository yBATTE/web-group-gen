import { MongoClient, Db } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI!
if (!uri) throw new Error("Falta MONGODB_URI")
const dbName = process.env.MONGODB_DB
if (!dbName) throw new Error("Falta MONGODB_DB")

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getDb(): Promise<Db> {
  const c = await clientPromise
  return c.db(dbName)
}
