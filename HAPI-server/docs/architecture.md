# Arkitektur och designval

## Komponentbild

```
┌──────────────────────────────┐
│  HAPI FHIR JPA Server (R4)   │  hapiproject/hapi:v8.4.1
│  port 8080                   │  + config/application.yaml (volume)
│  H2-databas i fil-volym      │  + ig/*.tgz (volume, valfritt)
└──────────────────────────────┘
              ▲
              │  HTTP/JSON, FHIR R4
              ▼
┌──────────────────────────────┐
│  scripts/load-data.sh        │  POSTar transaction-bundles från data/
└──────────────────────────────┘
```

## Designval

### HAPI-version

`hapiproject/hapi:v8.8.0-1` är vald som senaste stabila 8.x-release.
HAPI 8.x stöder R4 och har förbättrad IG-laddning via NPM-paket.
Bytet till nyare patch-version är säkert.

> Taggschemat på Docker Hub är `vX.Y.Z-N` (där `N` är build-nummer).
> Det finns inga `vX.Y.Z`-taggar utan suffix från och med 8.0.

### Persistens

H2 in-memory (`jdbc:h2:mem:hapi;DB_CLOSE_DELAY=-1`) ger:
- Inga externa beroenden, inga filsystemspermissions att hantera.
- Datat lever så länge containern är igång; försvinner vid restart.
- Enkel reset: `docker compose restart hapi && scripts/load-data.sh`,
  alternativt `scripts/reset.sh` mot körande server.

Skälet att inte använda H2 i fil med en namngiven volym: HAPI-bilden
kör som non-root och Docker-volymer skapas som root, vilket ger
`AccessDeniedException` vid skrivning till `/data/hapi`. För det här
demo-bruket ger ändå filpersistens marginellt värde — `load-data.sh`
laddar alla bundles på under en sekund.

Postgres-profil är inte med i compose. Vill ni testa Postgres byter ni
`spring.datasource.*` i `application.yaml` och lägger till en
`postgres`-tjänst.

### Validering = warn

Per önskemål: `hapi.fhir.validation.requests_enabled: false` och
`responses_enabled: false`. Det gör att servern *accepterar* alla
välformade FHIR R4-resurser även om de inte uppfyller
SE-profilerna. Vill ni se bindningsfel skarpt — sätt
`requests_enabled: true`.

`Flag/$validate` fungerar oberoende av flaggorna ovan; man kan
använda den för att validera ett utkast manuellt.

### IG-paket — laddas via REST, inte via HAPI:s package installer

Servern startar utan IG-paketet. Profil-validering (om aktiverad)
behöver paketet. Vi laddar det i två steg:

1. `scripts/build-ig.sh --sushi` kör SUSHI och paketerar resultatet
   som ett NPM-format­paket (`package/package.json` + FHIR-JSON).
2. `scripts/load-ig.sh` packar upp och PUTar varje canonical-resurs
   (StructureDefinition, ValueSet, CodeSystem, NamingSystem,
   ConceptMap) till servern.

Skälet att inte använda HAPI:s `implementationguides:`-block: med
lokala `file://`-URL:er är beteendet vingligt mellan HAPI-versioner
och misslyckas typiskt med `HAPI-1301: Unable to locate package`.
REST-vägen fungerar oberoende av HAPI-version och kräver inget extra
i `application.yaml`.

### Idempotenta bundles

Alla data-bundles använder `request.method = PUT` med stabila id:n,
inte `POST`. Det ger två fördelar:

- Att köra `load-data.sh` flera gånger ger samma sluttillstånd.
- Resurs-ID:n är förutsägbara (`pat-tolvan`, `flag-johnbob-2`, …) —
  skönt vid demo.

### Profilreferenser i meta.profile

Varje resurs anger sin SE-profil i `meta.profile` även när
profil-validering är avstängd. Det gör att samma data blir validerbar
så fort IG-paketet laddas — utan att data behöver återladdas.

## Kända begränsningar

- **Profil 7 (Allergy) tillåter formellt inte `criticalityLevel`**
  (`extension[criticalityLevel] 0..0` i FSH:n) trots att exemplen
  refererar till allvarlighetsgrad. Demodatat lägger med
  extensionen ändå för att illustrera mönstret; det rapporteras som
  varning vid sträng validering.
- **Profil 9 (D2)** har value set begränsat till bärarskaps-koder
  (MRSA, VRE, ESBL). Demo-fall är därför kopplade till patienter med
  bakteriell bärarstatus (Berit, Gunnar).
- **Patientprofilens parent `SEBasePatient`** tillhör
  `hl7se.fhir.base`. Det paketet är beroende vid IG-bygge men inte
  vid serverdrift. `Patient`-resurserna är kompatibla med base R4.
- **Stora terminologier (SNOMED CT, ICD-10-SE) finns inte inläst.**
  HAPI gör därför inte `code in valueset`-kontroller mot dessa.
  Demos fokuserar på resursstruktur, sökning och livscykel — inte
  på terminologi-validering.

## Filer och katalogstruktur

```
HAPI-server/
├── README.md                     # Snabbstart och översikt
├── docker-compose.yml
├── .env.example
├── config/
│   └── application.yaml
├── ig/
│   └── .gitkeep                  # Plats för det byggda IG-paketet
├── data/
│   ├── 02-patients.json
│   ├── 10-flags-medical.json     # Profil 1, 2, 3, 4
│   ├── 11-flags-infection.json   # Profil 5, 6 + Observation
│   ├── 12-flags-allergy.json     # Profil 7
│   ├── 13-flags-careroutine.json # Profil 8, 9
│   └── 14-flags-unstructured.json # Profil 10
├── scripts/
│   ├── build-ig.sh
│   ├── load-data.sh
│   └── reset.sh
└── docs/
    ├── architecture.md           # (det här dokumentet)
    ├── api-examples.md
    └── test-patients.md
```
