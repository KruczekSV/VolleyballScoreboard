import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const teams = await prisma.team.findMany();
  return NextResponse.json(teams);
}

export async function POST(req: NextRequest) {
  const teamData = await req.json();

  try {
    const team = await prisma.team.create({
      data: teamData,
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
