# Dashboard Arisan Piala Dunia 2026 - Manual Update

Dashboard ini menghitung juara arisan berdasarkan total poin dari 2 negara per peserta.
Versi ini **tidak butuh API key**. Semua update dilakukan manual lewat file:

```text
data/manual-data.json
```

Setiap kali file itu diedit di GitHub, Vercel akan otomatis deploy ulang. Setelah deploy selesai, dashboard berubah.

## Cara update skor manual

1. Buka repo GitHub.
2. Buka file:

```text
data/manual-data.json
```

3. Klik ikon pensil / edit.
4. Tambahkan hasil pertandingan ke bagian `matches`.
5. Update `updatedAt`.
6. Klik **Commit changes**.
7. Tunggu Vercel deploy ulang.

## Contoh isi match

```json
{
  "id": "G1-001",
  "round": "Group Stage - 1",
  "status": "FT",
  "home": "Spain",
  "away": "Iraq",
  "goalsHome": 3,
  "goalsAway": 0,
  "yellowHome": 1,
  "redHome": 0,
  "yellowAway": 2,
  "redAway": 0
}
```

## Format status

Gunakan:

```text
FT  = selesai normal
AET = selesai extra time
PEN = selesai penalti
NS  = belum main
```

Untuk match yang belum selesai, jangan dimasukkan dulu. Cara paling aman: masukkan hanya pertandingan yang sudah final.

## Update posisi grup

Setelah klasemen grup sudah jelas, isi bagian `standings`.

Contoh:

```json
{
  "team": "Spain",
  "rank": 1,
  "group": "Group A"
}
```

Poin grup:

| Posisi grup | Poin |
|---|---:|
| Juara grup | +10 |
| Runner-up | +7 |
| Peringkat 3 | +4 |
| Peringkat 4 | 0 |

## Nama negara yang dipakai

Gunakan nama negara seperti ini agar cocok dengan peserta:

```text
Spain, Iraq, France, Ghana, England, Haiti, Portugal, DR Congo,
Argentina, Uzbekistan, Brazil, Paraguay, Netherlands, Jordan,
Germany, Sweden, Belgium, Saudi Arabia, Norway, Australia,
Japan, New Zealand, Uruguay, Egypt, Switzerland, Scotland,
Croatia, Bosnia and Herzegovina, Colombia, Austria, Ecuador,
Czechia, Senegal, Qatar, Türkiye, Tunisia, Morocco, South Africa,
Algeria, Mexico, Ivory Coast, South Korea, United States, Curaçao,
Canada, Cape Verde, Iran, Panama
```

Beberapa alias tetap dikenali, misalnya `Turkey` akan dibaca sebagai `Türkiye`, dan `USA` sebagai `United States`.

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
