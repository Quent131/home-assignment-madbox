import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const VERB_FILE = "prisma/data/verbs.txt";
const prisma = new PrismaClient();

const main = async () => {
  const fileContent = readFileSync(VERB_FILE).toString();
  const verbList = fileContent.split("\n");
  await prisma.verb.createMany({
    data: verbList.map((verb) => ({ verb })),
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
