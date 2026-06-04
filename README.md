# Premier League Visualization

Interaktivna vizualizacija podataka Premier League sezona izrađena u D3.js.

## Opis

Aplikacija omogućuje analizu Premier League sezona kroz pet povezanih grafičkih prikaza. Korisnik može pratiti tijek sezone po kolima, uspoređivati klubove, analizirati napadačku i obrambenu učinkovitost te pregledavati višedimenzionalne profile klubova.

## Tehnologije

- HTML5
- CSS3
- JavaScript
- D3.js v7

## Postavljanje

Projekt zahtijeva lokalni web poslužitelj.

### Opcija 1 – VS Code Live Server
Otvoriti projekt u VS Codeu i pokrenuti Live Server ekstenziju.

### Opcija 2 – npx serve
```bash
npx serve .
```
Otvoriti `http://localhost:3000` u pregledniku.

## Podaci

Podaci su preuzeti s [Football-Data.co.uk](https://www.football-data.co.uk) i spojeni u jedinstveni dataset `combined.csv`. Dataset pokriva sezone od 2016/17 do 2025/26.

## Grafovi

- **Bar chart** – poredak klubova prema bodovima po kolima, s Auto Play animacijom
- **Line chart** – kretanje pozicije klubova kroz sezonu s multi-select usporedbom
- **Scatter plot** – odnos zabijenih i primljenih golova (GF vs GA)
- **Donut chart** – omjer pobjeda, remija i poraza odabranog kluba
- **Spider chart** – višedimenzionalni profil kluba (GF, GA, W, D, L)