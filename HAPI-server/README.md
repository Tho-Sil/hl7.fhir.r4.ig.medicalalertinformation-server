# HAPI FHIR-server för uppmärksamhetsinformation

En förkonfigurerad HAPI FHIR JPA-server (R4) med exempeldata enligt
profilerna i IG-repot `hl7.fhir.r4.ig.medicalalertinformation` (syskon till detta repo). Avsedd för
hackathonet under Vitalis 2026.

- Bas-URL: `http://localhost:8080/fhir`
- FHIR-version: R4 (4.0.1)
- Persistens: H2 in-memory — datat finns kvar så länge containern lever, men nollställs vid restart. Återladda med `scripts/load-data.sh`.
- Validering: **warn** — servern accepterar resurser som inte uppfyller
  profil­erna, men returnerar varningar i `OperationOutcome`

## Snabbstart

```bash
cd HAPI-server
cp .env.example .env                    # valfritt, ändra port vid behov
docker compose up -d
./scripts/load-data.sh                  # POSTar alla bundles i data/
```

Verifiera:

```bash
curl -s http://localhost:8080/fhir/metadata | head
curl -s 'http://localhost:8080/fhir/Patient?_count=20' | jq '.entry[].resource.name[0].text'
curl -s 'http://localhost:8080/fhir/Flag?subject=Patient/pat-johnbob'
```

Stäng av:

```bash
docker compose down            # stoppar containern (in-memory-datat försvinner)
```

### Elasticsearch / `Connection refused` i loggen

Om du ser **`ElasticsearchNodesSniffer`** / **`Connection refused`** mot port **9200** beror det på att Spring Boot annars auto-konfigurerar Elasticsearch-klienten trots att denna demo **inte** kör OpenSearch/Elasticsearch. I `config/application.yaml` är därför Elasticsearch-relaterad auto-konfiguration **avstängd** (samma idé som i [hapi-fhir-jpaserver-starter](https://github.com/hapifhir/hapi-fhir-jpaserver-starter)).

Efter ändring i YAML: **`docker compose restart hapi`** (eller `down` + `up`) så den nya konfigurationen laddas.

Återställ till nyladdat tillstånd utan omstart:

```bash
./scripts/reset.sh             # delete-expunge alla resurser och ladda om
# eller bara:
docker compose restart hapi && ./scripts/load-data.sh
```

## Innehåll

| Sökväg | Syfte |
|---|---|
| `docker-compose.yml` | Kör `hapiproject/hapi:v8.8.0-1` med monterad konfiguration |
| `config/application.yaml` | HAPI-konfiguration (R4, H2, validering=warn, IG-laddning förberedd) |
| `ig/` | Plats för det byggda IG-paketet (`*.tgz`) |
| `data/` | Transaction-bundles med exempeldata (`02-patients.json`, `10-flags-medical.json`, …) |
| `scripts/build-ig.sh` | Bygger IG-paketet med SUSHI (+ valfritt IG Publisher) |
| `scripts/load-data.sh` | Laddar alla bundles till en körande server |
| `scripts/sync-demo-flags-with-ig.py` | Uppdaterar flagg-bundles med `SEAlertLabelExtension`, E1 ICD-10-SE-kod m.m. i linje med IG (kör vid behov före commit/laddning) |
| `scripts/load-ig.sh` | PUTar profiler/value sets/code systems från IG-tgz:en |
| `scripts/reset.sh` | Rensar Flag/Observation/Patient och laddar om |
| `docs/test-patients.md` | Vilka testpersoner som finns och deras uppmärksamhetsinformation |
| `docs/api-examples.md` | Klippa-och-klistra-exempel för demo |
| `docs/architecture.md` | Designval och kända begränsningar |

## Profilvalidering (frivilligt)

Servern startar och fungerar utan IG-paketet. Vill ni aktivera
profil­validering — bygg paketet och ladda upp profilerna via REST:

```bash
./scripts/build-ig.sh --sushi      # bygger HAPI-server/ig/*.tgz med SUSHI
./scripts/load-ig.sh               # PUTar profiler/value sets/code systems
```

`load-ig.sh` packar upp tgz:en och PUTar varje canonical-resurs till
servern. Profilerna går sedan att använda i `$validate`-anrop. Det
här flödet undviker HAPI:s `implementationguides:`-block som är
opålitligt med lokala `file://`-URL:er.

`build-ig.sh --sushi` kräver SUSHI (`npm install -g fsh-sushi`) och
nät­access till `packages.fhir.org` för core-paketen. Resultatet
hamnar som `ig/hl7se.fhir.r4.ig.medicalalertinformation-0.1.0.tgz`.

## Testpatienter — kort översikt

Tio patienter, varje uppmärksamhetstyp (1–10) representerad. Detaljer
i [`docs/test-patients.md`](docs/test-patients.md).

| Patient-id | Personnummer | Namn | Antal flaggor |
|---|---|---|---|
| `pat-tolvan` | 19121212-1212 | Tolvan Tolvansson | 2 |
| `pat-johnbob` | 19500907-2553 | John Bob Goode Johansson | 3 |
| `pat-berit` | 19540123-2380 | Berit Fri Andersson | 4 |
| `pat-karlerik` | 19710919-9289 | Karl-Erik Sjöberg | 3 |
| `pat-fatima` | 19840515-2364 | Fatima Al-Hassan | 2 + 1 obs |
| `pat-astrid` | 19920304-9809 | Astrid Berg | 2 |
| `pat-liam` | 20010101-2393 | Liam Nordström | 2 |
| `pat-lova` | 20120101-3035 | Lova Karlsson | 2 |
| `pat-gunnar` | 19450612-1518 | Gunnar Lind | 5 |
| `pat-sara` | 19880825-4736 | Sara Lindgren | 2 |

## Felsök

- **`docker compose up` slutar med exit-kod**: kontrollera att port 8080
  är ledig (`lsof -i :8080`) eller sätt `HAPI_PORT` i `.env`.
- **`load-data.sh` får HTTP 500**: bilden behöver typiskt 30–60 s till
  databas-init. Skriptet pollar `metadata`-endpointen i upp till 120 s.
- **Starta om från noll**: `docker compose restart hapi && ./scripts/load-data.sh`.
