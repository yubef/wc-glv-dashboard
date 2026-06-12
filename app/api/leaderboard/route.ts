import { NextResponse } from "next/server";
import { fetchCardEvents, fetchFixtures, fetchStandings } from "../../../lib/apiFootball";
import { mockFixtures, mockStandings } from "../../../lib/mockData";
import { buildLeaderboard } from "../../../lib/scoring";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = new Date();
  const hasApiKey = Boolean(process.env.APIFOOTBALL_KEY);

  try {
    const fixtures = hasApiKey ? await fetchFixtures() : mockFixtures;
    let standings = hasApiKey ? await fetchStandings() : mockStandings;
    let cardEvents = {};

    if (hasApiKey && process.env.ENABLE_EVENT_POINTS === "true") {
      cardEvents = await fetchCardEvents(fixtures);
    }

    const leaderboard = buildLeaderboard({ fixtures, standings, cardEvents });
    const completedMatches = fixtures.filter((fixture) =>
      ["FT", "AET", "PEN", "AWD", "WO"].includes(fixture.status.toUpperCase())
    ).length;

    return NextResponse.json({
      ok: true,
      source: hasApiKey ? "API-Football" : "Demo data - isi APIFOOTBALL_KEY agar live",
      updatedAt: startedAt.toISOString(),
      completedMatches,
      rules: {
        win: 6,
        draw: 3,
        goal: 2,
        cleanSheet: 3,
        conceded: -1,
        concededCap: -4,
        yellow: -1,
        red: -3,
        groupWinner: 10,
        groupRunnerUp: 7,
        groupRank3: 4,
        roundOf32: 5,
        roundOf16: 10,
        quarterFinal: 16,
        semiFinal: 24,
        runnerUp: 35,
        champion: 50
      },
      leaderboard
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "error",
        updatedAt: startedAt.toISOString(),
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
