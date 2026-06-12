"use client";

import { useEffect, useMemo, useState } from "react";

type TeamScore = {
  team: string;
  total: number;
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
  lastRound: string;
};

type ParticipantScore = {
  rank: number;
  name: string;
  teams: string[];
  total: number;
  teamScores: TeamScore[];
};

type LeaderboardResponse = {
  ok: boolean;
  source: string;
  updatedAt: string;
  completedMatches?: number;
  leaderboard?: ParticipantScore[];
  message?: string;
};

const AUTO_REFRESH_MS = Number(process.env.NEXT_PUBLIC_AUTO_REFRESH_MS || 180000);

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
}

export default function Home() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/leaderboard?t=${Date.now()}`, { cache: "no-store" });
    const json = (await res.json()) as LeaderboardResponse;
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = window.setInterval(load, AUTO_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  const topThree = useMemo(() => data?.leaderboard?.slice(0, 3) ?? [], [data]);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Piala Dunia 2026</p>
          <h1>Dashboard Poin</h1>
          <p className="subtitle">
            Juara ditentukan dari total poin 2 negara.
          </p>
        </div>
      </section>

      {data && !data.ok ? (
        <section className="error-card">
          <strong>Data gagal dibaca.</strong>
          <span>{data.message}</span>
        </section>
      ) : null}

      {data?.ok ? (
        <section className="meta-grid">
          <div className="meta-card">
            <span>Sumber data</span>
            <strong>{data.source}</strong>
          </div>
          <div className="meta-card">
            <span>Last update</span>
            <strong>{formatDate(data.updatedAt)}</strong>
          </div>
          <div className="meta-card">
            <span>Match selesai</span>
            <strong>{data.completedMatches ?? 0}</strong>
          </div>
        </section>
      ) : null}

      <section className="podium">
        {topThree.map((row) => (
          <article key={row.name} className={`podium-card rank-${row.rank}`}>
            <div className="rank">{medal(row.rank)}</div>
            <h2>{row.name}</h2>
            <p>{row.teams.join(" + ")}</p>
            <strong>{row.total} poin</strong>
          </article>
        ))}
      </section>

      <section className="board">
        <div className="board-header">
          <h2>Klasemen</h2>
          <p>Klik nama untuk lihat detail poin tiap negara.</p>
        </div>

        <div className="table">
          <div className="table-row table-head">
            <span>Rank</span>
            <span>Nama</span>
            <span>Negara</span>
            <span>Poin</span>
          </div>

          {(data?.leaderboard ?? []).map((row) => (
            <div key={row.name} className="row-block">
              <button
                className="table-row table-button"
                onClick={() => setExpanded(expanded === row.name ? null : row.name)}
              >
                <span>{medal(row.rank)}</span>
                <strong>{row.name}</strong>
                <span>{row.teams.join(" + ")}</span>
                <strong>{row.total}</strong>
              </button>

              {expanded === row.name ? (
                <div className="details">
                  {row.teamScores.map((team) => (
                    <div key={team.team} className="team-card">
                      <div className="team-title">
                        <strong>{team.team}</strong>
                        <span>{team.total} poin</span>
                      </div>
                      <div className="stats-grid">
                        <span>Main: {team.played}</span>
                        <span>W-D-L: {team.win}-{team.draw}-{team.loss}</span>
                        <span>Gol: {team.goalsFor}</span>
                        <span>Kebobolan: {team.goalsAgainst}</span>
                        <span>Clean sheet: {team.cleanSheet}</span>
                        <span>Kuning/Merah: {team.yellow}/{team.red}</span>
                      </div>
                      <div className="points-breakdown">
                        <span>Hasil {team.resultPoints}</span>
                        <span>Gol {team.goalPoints}</span>
                        <span>CS {team.cleanSheetPoints}</span>
                        <span>Kebobolan {team.concededPenalty}</span>
                        <span>Kartu {team.cardPenalty}</span>
                        <span>Grup {team.groupBonus}</span>
                        <span>Babak {team.stageBonus}</span>
                      </div>
                      <small>Babak terakhir: {team.lastRound}</small>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rules">
        <h2>Aturan Poin</h2>
        <div className="rules-grid">
          <span>Menang +6</span>
          <span>Seri +3</span>
          <span>Gol +2</span>
          <span>Clean sheet +3</span>
          <span>Kebobolan -1, max -4/match</span>
          <span>Kuning -1</span>
          <span>Merah -3</span>
          <span>Juara grup +10</span>
          <span>Runner-up grup +7</span>
          <span>Peringkat 3 +4</span>
          <span>32 besar +5</span>
          <span>16 besar +10</span>
          <span>8 besar +16</span>
          <span>Semifinal +24</span>
          <span>Runner-up +35</span>
          <span>Juara +50</span>
        </div>
      </section>
    </main>
  );
}
