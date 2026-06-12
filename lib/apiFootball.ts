import type { GroupStanding, NormalizedFixture, TeamCardEvents } from "./scoring";
import { normalizeTeamName } from "./scoring";

type ApiFootballFixture = {
  fixture: {
    id: number;
    status: { short: string };
  };
  league: { round: string };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

type ApiFootballStandingRow = {
  rank: number;
  group?: string;
  team: { name: string };
};

function env(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

async function apiFootballGet<T>(path: string, params: Record<string, string | number>) {
  const key = env("APIFOOTBALL_KEY");
  if (!key) throw new Error("APIFOOTBALL_KEY belum diisi");

  const base = env("APIFOOTBALL_BASE", "https://v3.football.api-sports.io");
  const url = new URL(path, base);
  for (const [paramKey, paramValue] of Object.entries(params)) {
    url.searchParams.set(paramKey, String(paramValue));
  }

  const res = await fetch(url, {
    headers: { "x-apisports-key": key },
    next: { revalidate: 180 }
  });

  if (!res.ok) {
    throw new Error(`API-Football error ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as { response: T };
}

export async function fetchFixtures(): Promise<NormalizedFixture[]> {
  const league = Number(env("APIFOOTBALL_LEAGUE", "1"));
  const season = Number(env("APIFOOTBALL_SEASON", "2026"));
  const data = await apiFootballGet<ApiFootballFixture[]>("/fixtures", { league, season });

  return data.response.map((item) => ({
    id: item.fixture.id,
    round: item.league.round,
    status: item.fixture.status.short,
    home: normalizeTeamName(item.teams.home.name),
    away: normalizeTeamName(item.teams.away.name),
    goalsHome: item.goals.home,
    goalsAway: item.goals.away
  }));
}

export async function fetchStandings(): Promise<GroupStanding[]> {
  const league = Number(env("APIFOOTBALL_LEAGUE", "1"));
  const season = Number(env("APIFOOTBALL_SEASON", "2026"));
  const data = await apiFootballGet<
    Array<{ league: { standings: ApiFootballStandingRow[][] } }>
  >("/standings", { league, season });

  const rows = data.response?.[0]?.league?.standings ?? [];
  return rows.flat().map((row) => ({
    team: normalizeTeamName(row.team.name),
    rank: row.rank,
    group: row.group
  }));
}

export async function fetchCardEvents(fixtures: NormalizedFixture[]): Promise<TeamCardEvents> {
  const finished = fixtures.filter((fixture) =>
    ["FT", "AET", "PEN", "AWD", "WO"].includes(fixture.status.toUpperCase())
  );
  const eventsByTeam: TeamCardEvents = {};

  // Batasi agar quota API tidak habis. Untuk full 104 match, naikkan limit ini sesuai plan API.
  const limit = Number(process.env.EVENT_FIXTURE_LIMIT || "40");
  for (const fixture of finished.slice(0, limit)) {
    const data = await apiFootballGet<
      Array<{
        team: { name: string };
        type: string;
        detail: string;
      }>
    >("/fixtures/events", { fixture: fixture.id });

    for (const event of data.response) {
      if (event.type !== "Card") continue;
      const team = normalizeTeamName(event.team.name);
      if (!eventsByTeam[team]) eventsByTeam[team] = { yellow: 0, red: 0 };
      const detail = event.detail.toLowerCase();
      if (detail.includes("red")) eventsByTeam[team].red += 1;
      else if (detail.includes("yellow")) eventsByTeam[team].yellow += 1;
    }
  }

  return eventsByTeam;
}
