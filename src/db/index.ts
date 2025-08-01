import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DB_URL!;
console.log("DB Connection String:", connectionString);

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
export type Db = typeof db;
