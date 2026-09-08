import { prisma } from "./server/src/config/prisma";

async function checkIndexes() {
  try {
    console.log("Checking indexes on 'User' table...");
    const result = await prisma.$queryRaw`
      SELECT i.relname AS index_name, a.attname AS column_name
      FROM pg_class t, pg_class i, pg_index ix, pg_attribute a
      WHERE t.oid = ix.indrelid
      AND i.oid = ix.indexrelid
      AND a.attrelid = t.oid
      AND a.attnum = ANY(ix.indkey)
      AND t.relkind = 'r'
      AND t.relname = 'User'
      ORDER BY t.relname, i.relname;
    `;
    console.log("Indexes:", result);
    process.exit(0);
  } catch (error) {
    console.error("Index check failed:", error);
    process.exit(1);
  }
}

checkIndexes();
