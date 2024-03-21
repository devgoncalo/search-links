import fastify from "fastify";

import { z } from "zod";
import { sql } from "./lib/postgres";

const app = fastify();

app.get("/:code", async (request, reply) => {
  const getLinkSchema = z.object({
    code: z.string().min(3),
  });

  const { code } = getLinkSchema.parse(request.params);

  const result = await sql/*sql*/ `
    SELECT id, original_url
    FROM short_links
    WHERE short_links.code = ${code}
  `;

  if (result.length === 0) {
    return reply.status(400).send({ message: "Link Not Found!" });
  }

  const link = result[0];

  return reply.redirect(301, link.original_url);
});

app.get("/api/links", async () => {
  const result = await sql/*sql*/ `
    SELECT * 
    FROM short_links
    ORDER BY created_at DESC
  `;

  return result;
});

app.post("/api/links", async (request, reply) => {
  const createLinkSchema = z.object({
    code: z.string().min(3),
    url: z.string().url(),
  });

  const { code, url } = createLinkSchema.parse(request.body);

  const codeAlreadyExists = await sql/*sql*/ `
    SELECT *
    FROM short_links
    WHERE code = ${code}
  `;

  if (codeAlreadyExists.length > 0) {
    return reply.status(400).send({ message: "Code Already in Use!" });
  }

  try {
    const result = await sql/*sql*/ `
  INSERT INTO short_links (code, original_url) 
  VALUES (${code}, ${url})
  RETURNING id
  `;

    const link = result[0];

    return reply.status(201).send({ shortLinkId: link.id });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({ message: "Internal Server Error!" });
  }
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });
