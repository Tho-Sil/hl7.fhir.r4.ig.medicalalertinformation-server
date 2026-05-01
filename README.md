# hl7.fhir.r4.ig.medicalalertinformation — server och demo

Detta repo innehåller **HAPI-demoserver**, **exempeldata** och **demoportal**
(`demo/`). **IG-källkoden (FSH)** ligger i syskon-repot
`**[HL7Sweden/hl7.fhir.r4.ig.medicalalertinformation](https://github.com/HL7Sweden/hl7.fhir.r4.ig.medicalalertinformation/tree/develop)`**

1. **Syskon: `[HL7Sweden/hl7.fhir.r4.ig.medicalalertinformation](https://github.com/HL7Sweden/hl7.fhir.r4.ig.medicalalertinformation/tree/develop)`**
  (lokalt: `../hl7.fhir.r4.ig.medicalalertinformation/`) — FHIR
   Implementation Guide för *uppmärksamhetsinformation*, baserad på
   Socialstyrelsens informationsspecifikation
   [https://www.socialstyrelsen.se/kunskapsstod-och-regler/omraden/e-halsa/tillampning/uppmarksamhetsinformation/](https://www.socialstyrelsen.se/kunskapsstod-och-regler/omraden/e-halsa/tillampning/uppmarksamhetsinformation/).
   Publiceras av HL7 Sverige.
2. `**HAPI-server/*`* — en förkonfigurerad HAPI FHIR-server (R4) med
  exempeldata enligt profilerna i guiden.

## Snabbstart för servern

```bash
cd HAPI-server
docker compose up -d
./scripts/load-data.sh
curl -s http://localhost:8080/fhir/Patient?_count=20 | jq
```

## Demoportal

En liten självstående webbsida i `demo/` visualiserar
uppmärksamhetsinformationen från servern i NPÖ-stil:

```bash
cd demo
python3 -m http.server 8000
# öppna http://localhost:8000
```

Detaljerad dokumentation, testpatienter och API-exempel:

- [LICENSE](LICENSE) — MIT för källkod och demoportal
- [NOTICE](NOTICE) — CC0-symbolgeometri (tredjepart) och avgränsning mot MIT-delen
- [CHANGELOG.md](CHANGELOG.md) — versionshistorik
- [HAPI-server/README.md](HAPI-server/README.md) — snabbstart och översikt
- [HAPI-server/docs/test-patients.md](HAPI-server/docs/test-patients.md) — alla testpersoner och deras uppmärksamhetsinformation
- [HAPI-server/docs/api-examples.md](HAPI-server/docs/api-examples.md) — klippa-och-klistra-anrop
- [HAPI-server/docs/architecture.md](HAPI-server/docs/architecture.md) — designval och kända begränsningar
- [demo/README.md](demo/README.md) — om demoportalen

## Bygga IG:n

Från roten av *detta* repo, gå till syskon-mappen med IG-källkoden:

```bash
cd ../hl7.fhir.r4.ig.medicalalertinformation
sushi .            # FSH → fsh-generated/
./_genonce.sh      # IG Publisher → output/
```

`HAPI-server/scripts/build-ig.sh` gör båda stegen och kopierar in det  
färdiga NPM-paketet i `HAPI-server/ig/` så att HAPI-servern kan  
ladda profilerna och göra profilvalidering.

## Licens

- **Programvara** i detta repo (HAPI-konfiguration, skript, demoportalens
HTML/CSS/JS m.m.) omfattas av **MIT-licensen** — se [LICENSE](LICENSE).
- **Uppmärksamhetssymbolens geometri** i demoportalen hämtas från
[oskthu2/uppmarksamhetssymbol](https://github.com/oskthu2/uppmarksamhetssymbol)
och licensieras där enligt **CC0 1.0 Universell** (public domain dedication).
Se [NOTICE](NOTICE) för avgränsning mot vårt MIT-material och länk till CC0.
- **FHIR Implementation Guide-paketet** (NPM/tgz från syskon-repot) kan ha
**egna** villkor — följ det som anges i det paketet vid återanvändning.

