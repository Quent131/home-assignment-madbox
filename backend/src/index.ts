import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.get("/api", (req, res) => {
  res.send({ message: "Welcome to backend!" });
});

app.get("/api/db-test", async (req, res) => {
  const data = await prisma.verb.findFirst({ where: { id: 1 } });
  res.send({ data });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
