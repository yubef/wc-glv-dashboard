import { NextResponse } from "next/server";
import manualData from "../../../data/manual-data.json";
import { buildLeaderboard, normalizeTeamName, type GroupStanding, type NormalizedFixture, type TeamCardEvents } from "../../../lib/scoring";

export const dynamic = "force-dynamic";

type ManualMatch = NormalizedFixture & {
  yellowHome?: number;
  redHome?: number;
  yellowAway?: number;
  redAway?: number;
};

type ManualData = {
  updatedAt?: string;
  source?: string;
  matches?: ManualMatch[];
  standings?: GroupStanding[];
};

function toCardEvents(matches: ManualMatch[]): TeamCardEvents {
  const events: TeamCardEvents = {};

  for (const match of matches) {
    const home = normalizeTeamName(match.home);
    const away = normalizeTeamName(match.away);

    if (!events[home]) events[home] = { yellow: 0, red: 0 };
    if (!events[away]) events[away] = { yellow: 0, red: 0 };

    events[home].yellow += Number(match.yellowHome || 0);
    events[home].red += Number(match.redHome || 0);
    events[away].yellow += Number(match.yellowAway || 0);
    events[away].red += Number(match.redAway || 0);
  }

  return events;
}

export async function GET() {
  const data = manualData as ManualData;
  const matches = (data.matches ?? []).map((match) => ({
    ...match,
    home: normalizeTeamName(match.home),
    away: normalizeTeamName(match.away)
  }));
  const standings = (data.standings ?? []).map((row) => ({
    ...row,
    team: normalizeTeamName(row.team)
  }));
  const cardEvents = toCardEvents(matches);

  const leaderboard = buildLeaderboard({ fixtures: matches, standings, cardEvents });
  const completedMatches = matches.filter((fixture) =>
    ["FT", "AET", "PEN", "AWD", "WO"].includes(fixture.status.toUpperCase())
  ).length;

  return NextResponse.json({
    ok: true,
    source: data.source || "Manual data - update dari data/manual-data.json",
    updatedAt: data.updatedAt || new Date().toISOString(),
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
}
