const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const teamA = await prisma.team.create({
    data: {
      name: "Team A",
      players: JSON.stringify([{ name: "Player A1" }, { name: "Player A2" }]),
    },
  });

  const teamB = await prisma.team.create({
    data: {
      name: "Team B",
      players: JSON.stringify([{ name: "Player B1" }, { name: "Player B2" }]),
    },
  });

  const teamC = await prisma.team.create({
    data: {
      name: "Team C",
      players: JSON.stringify([{ name: "Player C1" }, { name: "Player C2" }]),
    },
  });

  const teamD = await prisma.team.create({
    data: {
      name: "Team D",
      players: JSON.stringify([{ name: "Player D1" }, { name: "Player D2" }]),
    },
  });

  await prisma.match.createMany({
    data: [
      {
        data: new Date("2024-01-01"),
        teamAId: teamA.id,
        teamBId: teamB.id,
        result: "3:1",
        resultDetailed: JSON.stringify({
          sets: ["25:20", "20:25", "25:22", "25:21"],
        }),
        status: "FINISHED",
      },
      {
        data: new Date("2024-01-02"),
        teamAId: teamC.id,
        teamBId: teamD.id,
        result: "0:3",
        resultDetailed: JSON.stringify({ sets: ["15:25", "18:25", "20:25"] }),
        status: "FINISHED",
      },
      {
        data: new Date("2024-02-01"),
        teamAId: teamA.id,
        teamBId: teamC.id,
        result: "",
        resultDetailed: JSON.stringify({ sets: [] }),
        status: "PLANNED",
      },
      {
        data: new Date("2024-02-02"),
        teamAId: teamB.id,
        teamBId: teamD.id,
        result: "",
        resultDetailed: JSON.stringify({ sets: [] }),
        status: "IN_PROGRESS",
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        login: "referee1",
        password: "password1",
        role: "REFEREE",
      },
      {
        login: "observer1",
        password: "password2",
        role: "OBSERVATOR",
      },
    ],
  });

  console.log("Database has been seeded. 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
