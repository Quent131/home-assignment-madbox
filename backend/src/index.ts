import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Translator } from "deepl-node";
import express, { Request, Response, Express } from "express";
import { Leaderboard, Word } from "@madbox-assignment/types";
import cors from "cors";

const prisma = new PrismaClient();
const app: Express = express();

app.use(cors());
app.use(express.json());

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

app.get(
  "/api/word/:id",
  async (req: Request, res: Response<Word | { message: string }>) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).send({ message: "Invalid id" });
      return;
    }
    const { verb } = await prisma.verb.findFirst({
      where: { id },
      select: { verb: true },
    });

    const { text } = await translator.translateText(verb, null, "en-GB");
    res.send({
      id,
      french: verb,
      english: text,
      length: text.length,
      firstLetter: text[0],
    });
  }
);

app.post(
  "/api/leaderboard",
  async (req: Request, res: Response<Leaderboard[]>) => {
    const { name, score } = req.body;
    await prisma.leaderboard.create({
      data: { player: name, score },
    });
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: { score: "asc" },
      take: 10,
      select: { id: true, player: true, score: true, createdAt: true },
    });
    res.send(
      leaderboard.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
      }))
    );
  }
);

app.get(
  "/api/leaderboard",
  async (req: Request, res: Response<Leaderboard[]>) => {
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: { score: "asc" },
      take: 10,
      select: { id: true, player: true, score: true, createdAt: true },
    });
    res.send(
      leaderboard.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
      }))
    );
  }
);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
