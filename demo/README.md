# Demoportal — uppmärksamhetsinformation

En självstående webbsida som visualiserar uppmärksamhets­information
från den lokala HAPI-servern. Bygger på samma profiler som finns i
Implementation Guide-repot `hl7.fhir.r4.ig.medicalalertinformation` och visar datat ungefär som
det skulle presenteras i ett journal­system eller i NPÖ.

## Snabbstart

Default pekar på den publika demoservern `https://umi.infopeak.se/fhir`,
så portalen fungerar direkt utan egen HAPI igång:

```bash
cd demo
python3 -m http.server 8000
# öppna http://localhost:8000
```

Vill du köra mot en lokal HAPI istället: starta servern och ladda data,
ändra sen FHIR-bas-fältet uppe till höger till `http://localhost:8080/fhir`
(värdet sparas i localStorage):

```bash
cd ../HAPI-server
docker compose up -d
./scripts/load-data.sh
```

Demon är ren statisk HTML/CSS/JS — vilken filserver som helst funkar.

## Innehåll

- **Patienter**: lista över patienter med antal aktiva flaggor.
  Klick visar NPÖ-stilad detaljsida med:
  - Patient­huvud (namn, personnummer, kön, ålder)
  - Varningsbanner vid aktiva signaler
  - Grupperad uppmärksamhets­information (medicinska tillstånd,
    smitta, överkänslighet, vårdrutiner, ostrukturerat), där varje rad
    visar **alert label** (`SEAlertLabelExtension`) tydligast och
    **terminologi** från `Flag.code.coding` diskret under — inte `code.text`
  - Allvarlighetsgrad markerad med färg där den finns
  - Inaktiva flaggor visas dämpat
- **Översikt**: tabellförklaring av alla 10 profiler plus
  detaljerad lista per patient med koder, status och period —
  hämtas live från servern.
- **Symbolen**: interaktiv förklaring av den nationella
  uppmärksamhetssymbolen (koppling mellan fält och signaltyper).
- **API-exempel**: tolv klippa-och-klistra-färdiga FHIR-anrop med
  knappen *Kör* som skickar dem mot den körande servern och visar
  svaret.
- **Om**: kort förklaring av syftet med IG:n.

## Filer

| Fil | Beskrivning |
|---|---|
| `index.html` | Sidans struktur |
| `styles.css` | All styling |
| `app.js` | Tab-routing, FHIR-anrop, rendering |
| `data/alert-label-definitions.json` | Motivering per `SEAlertLabelCS`-kod (tooltip); genereras från kodverkslistan |
| `scripts/build_alert_label_definitions.py` | Bygger om JSON från xlsx + `SEAlertInformationAlertLabel.fsh` |
| `README.md` | Detta dokument |

### Motivering (alert label)

Motivering visas i en **egen flytande tooltip** (ca 60 ms efter att musen
stannat) över **hela signalraden** i patientvyn och **hela tabellraden** i
översikten, när `data-motivation` finns. Texten hämtas från
`data/alert-label-definitions.json` (kodverkslistan, matchad mot FSH per kod).

Uppdatera efter ändring i bilagan eller i `SEAlertLabelCS`:

```bash
# från repo-roten hl7.fhir.r4.ig.medicalalertinformation-server
python3 demo/scripts/build_alert_label_definitions.py \
  --xlsx ../hl7.fhir.r4.ig.medicalalertinformation/input/context/2025-12-9984-bilaga-kodverkslista.xlsx \
  --fsh ../hl7.fhir.r4.ig.medicalalertinformation/input/fsh/SEAlertInformationAlertLabel.fsh \
  --out demo/data/alert-label-definitions.json
```

Vissa rader i Excel saknar egen motiveringskolumn (t.ex. vissa
överkänslighetsblad); då blir det ingen tooltip för den koden tills
listan kompletterats. Skriptet skriver ut varningar för FSH-koder som
inte kunde matchas.

Inga byggsteg och inga npm-paket i repot — öppna en statisk filserver så funkar
det. Symbol-fliken laddar [GSAP](https://greensock.com/gsap/) från CDN för animationer.

**Licens:** den här katalogens kod omfattas av MIT (se repo-roten
[`LICENSE`](../LICENSE)). Symbolens SVG-geometri följer
[oskthu2/uppmarksamhetssymbol](https://github.com/oskthu2/uppmarksamhetssymbol)
(CC0 1.0); se [`NOTICE`](../NOTICE) i repo-roten.
