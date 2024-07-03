import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const matches = await prisma.match.findMany({
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: {
      data: "desc",
    },
  });

  const formattedMatches = matches.map((match) => {
    const resultDetailed = match.resultDetailed
      ? JSON.parse(match.resultDetailed as unknown as string)
      : { sets: [] };

    return {
      ...match,
      resultDetailed: {
        sets: resultDetailed.sets.map((set: string) => {
          const [teamA, teamB] = set.split(":").map(Number);
          return { teamA, teamB };
        }),
      },
    };
  });

  return NextResponse.json(formattedMatches);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  await prisma.match.delete({
    where: { id: Number(id) },
  });
  return NextResponse.json({ message: "Match deleted" });
}

export async function POST(req: NextRequest) {
  const matchData = await req.json();

  try {
    const match = await prisma.match.create({
      data: matchData,
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
