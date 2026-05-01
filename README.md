# hl7.fhir.r4.ig.medicalalertinformation — server och demo

Detta repo innehåller **HAPI-demoserver**, **exempeldata** och **demoportal**
(`demo/`). **IG-källkoden (FSH)** ligger i syskon-repot
**`hl7.fhir.r4.ig.medicalalertinformation`** (samma överordnade katalog som
detta repo), inte under denna katalog.

1. **Syskon: `../hl7.fhir.r4.ig.medicalalertinformation/`** — FHIR
  Implementation Guide för *uppmärksamhetsinformation*, baserad på
   Socialstyrelsens informationsspecifikation
   [https://www.socialstyrelsen.se/kunskapsstod-och-regler/omraden/e-halsa/tillampning/uppmarksamhetsinformation/](https://www.socialstyrelsen.se/kunskapsstod-och-regler/omraden/e-halsa/tillampning/uppmarksamhetsinformation/).
   Publiceras av HL7 Sverige.
2. **`HAPI-server/`** — en förkonfigurerad HAPI FHIR-server (R4) med
  exempeldata enligt profilerna i guiden, framtagen för hackathonet
   under **Vitalis 2026**.

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

- [LICENSE](LICENSE) — MIT-licens för källkod och demoportal i detta repo
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

Källkod, skript och demoportal i detta repo omfattas av **MIT-licensen**, se
[LICENSE](LICENSE). *Det byggda FHIR Implementation Guide-paketet* (NPM/tgz
från syskon-repot) kan ha **egna** licensvillkor — följ det som anges i det
paketet när du återanvänder det.
