import postgres from "postgres";

export const sql = postgres("postgresql://docker:docker@postgres:5432/shortlinks");