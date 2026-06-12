import type { NormalizedFixture, GroupStanding } from "./scoring";

export const mockFixtures: NormalizedFixture[] = [
  {
    id: 1,
    round: "Group Stage - 1",
    status: "FT",
    home: "Spain",
    away: "Iraq",
    goalsHome: 3,
    goalsAway: 0
  },
  {
    id: 2,
    round: "Group Stage - 1",
    status: "FT",
    home: "France",
    away: "Ghana",
    goalsHome: 2,
    goalsAway: 1
  },
  {
    id: 3,
    round: "Group Stage - 1",
    status: "FT",
    home: "Norway",
    away: "Australia",
    goalsHome: 1,
    goalsAway: 1
  },
  {
    id: 4,
    round: "Group Stage - 1",
    status: "NS",
    home: "Portugal",
    away: "DR Congo",
    goalsHome: null,
    goalsAway: null
  }
];

export const mockStandings: GroupStanding[] = [
  { team: "Spain", rank: 1, group: "A" },
  { team: "France", rank: 1, group: "B" },
  { team: "Norway", rank: 2, group: "C" },
  { team: "Australia", rank: 3, group: "C" },
  { team: "Iraq", rank: 4, group: "A" },
  { team: "Ghana", rank: 3, group: "B" }
];
