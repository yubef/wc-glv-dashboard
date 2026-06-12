import { participants, type Participant } from "./participants";

export type NormalizedFixture = {
  id: number | string;
  round: string;
  status: string;
  home: string;
  away: string;
  goalsHome: number | null;
  goalsAway: number | null;
};

export type TeamCardEvents = Record<string, { yellow: number; red: number }>;

export type GroupStanding = {
  team: string;
  rank: number;
  group?: string;
};

export type TeamScore = {
  team: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheet: number;
  yellow: number;
  red: number;
  resultPoints: number;
  goalPoints: number;
  cleanSheetPoints: number;
  concededPenalty: number;
  cardPenalty: number;
  groupBonus: number;
  stageBonus: number;
  total: number;
  lastRound: string;
};

export type ParticipantScore = {
  rank: number;
  name: string;
  teams: string[];
  total: number;
  teamScores: TeamScore[];
};

const TEAM_ALIASES: Record<string, string> = {
  usa: "United States",
  "united states": "United States",
  "united states of america": "United States",
  "czech republic": "Czechia",
  czechia: "Czechia",
  "congo dr": "DR Congo",
  "dr congo": "DR Congo",
  "d.r. congo": "DR Congo",
  "côte d’ivoire": "Ivory Coast",
  "cote d'ivoire": "Ivory Coast",
  "côte d'ivoire": "Ivory Coast",
  "ivory coast": "Ivory Coast",
  "korea republic": "South Korea",
  "south korea": "South Korea",
  "bosnia-herzegovina": "Bosnia and Herzegovina",
  "bosnia & herzegovina": "Bosnia and Herzegovina",
  "bosnia and herzegovina": "Bosnia and Herzegovina",
  turkiye: "Türkiye",
  turkey: "Türkiye",
  türkiye: "Türkiye",
  curacao: "Curaçao",
  curaçao: "Curaçao",
  "saudi arabia": "Saudi Arabia",
  "south africa": "South Africa",
  "new zealand": "New Zealand",
  "cape verde": "Cape Verde"
};

export function normalizeTeamName(input: string): string {
  const raw = input.trim();
  const key = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/’/g, "'");
  return TEAM_ALIASES[key] ?? raw;
}

function isFinished(status: string): boolean {
  return ["FT", "AET", "PEN", "AWD", "WO"].includes(status.toUpperCase());
}

function emptyTeamScore(team: string): TeamScore {
  return {
    team,
    played: 0,
    win: 0,
    draw: 0,
    loss: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheet: 0,
    yellow: 0,
    red: 0,
    resultPoints: 0,
    goalPoints: 0,
    cleanSheetPoints: 0,
    concededPenalty: 0,
    cardPenalty: 0,
    groupBonus: 0,
    stageBonus: 0,
    total: 0,
    lastRound: "Belum main"
  };
}

function getOrCreate(map: Map<string, TeamScore>, team: string): TeamScore {
  const normalized = normalizeTeamName(team);
  const existing = map.get(normalized);
  if (existing) return existing;
  const created = emptyTeamScore(normalized);
  map.set(normalized, created);
  return created;
}

function stageWeight(round: string): number {
  const r = round.toLowerCase();
  if (r.includes("final") && !r.includes("semi") && !r.includes("third")) return 6;
  if (r.includes("semi")) return 5;
  if (r.includes("quarter")) return 4;
  if (r.includes("round of 16") || r.includes("last 16")) return 3;
  if (r.includes("round of 32") || r.includes("last 32")) return 2;
  return 1;
}

function stageBonusFromWeight(weight: number): number {
  if (weight >= 6) return 35;
  if (weight === 5) return 24;
  if (weight === 4) return 16;
  if (weight === 3) return 10;
  if (weight === 2) return 5;
  return 0;
}

function groupBonus(rank: number): number {
  if (rank === 1) return 10;
  if (rank === 2) return 7;
  if (rank === 3) return 4;
  return 0;
}

export function buildLeaderboard(params: {
  fixtures: NormalizedFixture[];
  standings: GroupStanding[];
  cardEvents?: TeamCardEvents;
  customParticipants?: Participant[];
}): ParticipantScore[] {
  const { fixtures, standings, cardEvents = {}, customParticipants = participants } = params;
  const scores = new Map<string, TeamScore>();
  const maxStage = new Map<string, { weight: number; round: string }>();

  for (const participant of customParticipants) {
    for (const team of participant.teams) {
      getOrCreate(scores, team);
    }
  }

  for (const fixture of fixtures) {
    if (!isFinished(fixture.status)) continue;
    if (fixture.goalsHome === null || fixture.goalsAway === null) continue;

    const homeName = normalizeTeamName(fixture.home);
    const awayName = normalizeTeamName(fixture.away);
    const home = getOrCreate(scores, homeName);
    const away = getOrCreate(scores, awayName);

    const homeGoals = fixture.goalsHome;
    const awayGoals = fixture.goalsAway;

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;
    home.goalPoints += homeGoals * 2;
    away.goalPoints += awayGoals * 2;
    home.concededPenalty -= Math.min(awayGoals, 4);
    away.concededPenalty -= Math.min(homeGoals, 4);

    if (awayGoals === 0) {
      home.cleanSheet += 1;
      home.cleanSheetPoints += 3;
    }
    if (homeGoals === 0) {
      away.cleanSheet += 1;
      away.cleanSheetPoints += 3;
    }

    if (homeGoals > awayGoals) {
      home.win += 1;
      away.loss += 1;
      home.resultPoints += 6;
    } else if (homeGoals < awayGoals) {
      away.win += 1;
      home.loss += 1;
      away.resultPoints += 6;
    } else {
      home.draw += 1;
      away.draw += 1;
      home.resultPoints += 3;
      away.resultPoints += 3;
    }

    const weight = stageWeight(fixture.round);
    for (const team of [homeName, awayName]) {
      const current = maxStage.get(team);
      if (!current || weight > current.weight) {
        maxStage.set(team, { weight, round: fixture.round });
      }
    }
  }

  for (const [team, events] of Object.entries(cardEvents)) {
    const score = getOrCreate(scores, team);
    score.yellow += events.yellow;
    score.red += events.red;
    score.cardPenalty -= events.yellow + events.red * 3;
  }

  for (const standing of standings) {
    const score = getOrCreate(scores, standing.team);
    score.groupBonus = Math.max(score.groupBonus, groupBonus(standing.rank));
  }

  let finalFixture: NormalizedFixture | undefined;
  for (const fixture of fixtures) {
    if (!isFinished(fixture.status)) continue;
    if (stageWeight(fixture.round) === 6) finalFixture = fixture;
  }

  for (const [team, stage] of maxStage.entries()) {
    const score = getOrCreate(scores, team);
    score.stageBonus = Math.max(score.stageBonus, stageBonusFromWeight(stage.weight));
    score.lastRound = stage.round;
  }

  if (finalFixture && finalFixture.goalsHome !== null && finalFixture.goalsAway !== null) {
    const home = normalizeTeamName(finalFixture.home);
    const away = normalizeTeamName(finalFixture.away);
    if (finalFixture.goalsHome !== finalFixture.goalsAway) {
      const champion = finalFixture.goalsHome > finalFixture.goalsAway ? home : away;
      getOrCreate(scores, champion).stageBonus = 50;
    }
  }

  for (const score of scores.values()) {
    score.total =
      score.resultPoints +
      score.goalPoints +
      score.cleanSheetPoints +
      score.concededPenalty +
      score.cardPenalty +
      score.groupBonus +
      score.stageBonus;
  }

  const participantScores = customParticipants.map((participant) => {
    const teamScores = participant.teams.map((team) => getOrCreate(scores, team));
    return {
      rank: 0,
      name: participant.name,
      teams: [...participant.teams],
      total: teamScores.reduce((sum, team) => sum + team.total, 0),
      teamScores
    };
  });

  participantScores.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  participantScores.forEach((row, index) => {
    row.rank = index + 1;
  });

  return participantScores;
}
