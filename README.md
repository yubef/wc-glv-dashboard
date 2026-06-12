# Dashboard Arisan Piala Dunia 2026

Dashboard ini menghitung juara arisan berdasarkan total poin dari 2 negara per peserta.

## Fitur

- Klasemen arisan otomatis.
- Detail poin per negara.
- Auto refresh browser setiap 3 menit.
- Bisa jalan tanpa database.
- Bisa live memakai API-Football/API-Sports.
- Jika API key belum diisi, dashboard memakai data demo.

## Aturan poin default

| Parameter | Poin |
|---|---:|
| Menang | +6 |
| Seri | +3 |
| Gol dicetak | +2 |
| Clean sheet | +3 |
| Kebobolan | -1 per gol, maksimal -4 per match |
| Kartu kuning | -1 |
| Kartu merah | -3 |
| Juara grup | +10 |
| Runner-up grup | +7 |
| Peringkat 3 grup | +4 |
| Lolos 32 besar | +5 |
| Lolos 16 besar | +10 |
| Lolos 8 besar | +16 |
| Lolos semifinal | +24 |
| Runner-up | +35 |
| Juara dunia | +50 |

## Cara jalan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Cara deploy ke Vercel gratis

1. Upload folder ini ke GitHub.
2. Buka Vercel, pilih **Add New Project**.
3. Import repo GitHub.
4. Isi Environment Variables:

```text
APIFOOTBALL_KEY=isi_api_key_kamu
APIFOOTBALL_BASE=https://v3.football.api-sports.io
APIFOOTBALL_LEAGUE=1
APIFOOTBALL_SEASON=2026
ENABLE_EVENT_POINTS=false
NEXT_PUBLIC_AUTO_REFRESH_MS=180000
```

5. Deploy.

## Catatan update otomatis

Di Vercel Hobby/free, Cron bawaan Vercel hanya cocok untuk update harian. Untuk dashboard ini, update otomatis dibuat dengan cara lebih ringan:

- Browser refresh data ke `/api/leaderboard` setiap beberapa menit.
- API route mengambil data terbaru dari API-Football.
- Jadi setelah pertandingan selesai, begitu data API sudah update, dashboard ikut berubah saat halaman terbuka/refresh.

Jika mau benar-benar sync background tiap 5 menit walaupun dashboard tidak dibuka, gunakan salah satu:

- Vercel Pro; atau
- cron-job.org / GitHub Actions gratis untuk hit endpoint `/api/leaderboard` berkala.

## Catatan kartu kuning/merah

Default `ENABLE_EVENT_POINTS=false`, supaya hemat quota API. Jika mau hitung kartu:

```text
ENABLE_EVENT_POINTS=true
EVENT_FIXTURE_LIMIT=104
```

Tapi ini membuat dashboard memanggil endpoint event per pertandingan, sehingga quota API cepat habis.

## Ubah peserta

Edit file:

```text
lib/participants.ts
```

## Ubah aturan poin

Edit file:

```text
lib/scoring.ts
```
