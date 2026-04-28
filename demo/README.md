# Demoportal — uppmärksamhetsinformation

En självstående webbsida som visualiserar uppmärksamhets­information
från den lokala HAPI-servern. Bygger på samma profiler som finns i
`hl7.fhir.r4.ig.medicalalertinformation/` och visar datat ungefär som
det skulle presenteras i ett journal­system eller i NPÖ.

## Snabbstart

Servern måste köra och vara laddad med data:

```bash
cd ../HAPI-server
docker compose up -d
./scripts/load-data.sh
```

Sen, från `demo/`:

```bash
python3 -m http.server 8000
# öppna http://localhost:8000
```

(eller vilken statisk filserver som helst — det är bara HTML/CSS/JS).

Justera FHIR-bas i fältet uppe till höger om servern inte ligger på
`http://localhost:8080/fhir`.

## Innehåll

- **Patienter**: lista över patienter med antal aktiva flaggor.
  Klick visar NPÖ-stilad detaljsida med:
  - Patient­huvud (namn, personnummer, kön, ålder)
  - Varningsbanner vid aktiva signaler
  - Grupperad uppmärksamhets­information (medicinska tillstånd,
    smitta, överkänslighet, vårdrutiner, ostrukturerat)
  - Allvarlighetsgrad markerad med färg där den finns
  - Inaktiva flaggor visas dämpat
- **Testpersoner**: tabellförklaring av alla 10 profiler plus
  detaljerad lista per patient med koder, status och period —
  hämtas live från servern.
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
| `README.md` | Detta dokument |

Inga byggsteg, inga npm-paket — öppna en statisk filserver så funkar
det.
