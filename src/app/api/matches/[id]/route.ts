import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const match = await prisma.match.findUnique({
    where: { id: Number(id) },
    include: {
      teamA: true,
      teamB: true,
    },
  });

  if (match) {
    const resultDetailed = match.resultDetailed
      ? JSON.parse(match.resultDetailed as unknown as string)
      : { sets: [] };

    const formattedMatch = {
      ...match,
      resultDetailed: {
        sets: resultDetailed.sets.map((set: string) => {
          const [teamA, teamB] = set.split(":").map(Number);
          return { teamA, teamB };
        }),
      },
    };

    return NextResponse.json(formattedMatch);
  } else {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updatedMatch = await request.json();

  // console.log("Received PUT request for match ID:", id);
  // console.log("Updated match data:", updatedMatch);

  const updatedResultDetailed = {
    sets: updatedMatch.resultDetailed.sets.map(
      (set: { teamA: number; teamB: number }) => `${set.teamA}:${set.teamB}`
    ),
  };

  // Usuwamy pole `id` z danych aktualizacji
  const { id: matchId, teamA, teamB, ...matchData } = updatedMatch;
  matchData.resultDetailed = JSON.stringify(updatedResultDetailed);

  try {
    const match = await prisma.match.update({
      where: { id: Number(id) },
      data: matchData,
    });

    // console.log("Match updated successfully:", match);
    return NextResponse.json(match);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
