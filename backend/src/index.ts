import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Translator } from "deepl-node";
import express, { Request, Response } from "express";
import { Word } from "@madbox-assignment/types";
const prisma = new PrismaClient();
const app = express();

const translator = new Translator(process.env.DEEPL_API_KEY);

app.get("/api", (req, res) => {
  res.send({ message: "Welcome to backend!" });
});

app.get("/api/word", async (req: Request, res: Response<Word>) => {
  const verbTableLength = await prisma.verb.count();
  const randomId = Math.floor(Math.random() * verbTableLength) + 1;
  const { id, verb } = await prisma.verb.findFirst({
    where: { id: randomId },
    select: { id: true, verb: true },
  });

  const { text } = await translator.translateText(verb, null, "en-GB");
  res.send({
    id,
    french: verb,
    english: text,
    length: text.length,
    firstLetter: text[0],
  });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
