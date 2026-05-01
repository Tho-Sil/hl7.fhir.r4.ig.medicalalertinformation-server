# Testpatienter och uppmärksamhetsinformation

Tio testpatienter har laddats med exempeldata enligt profilerna i
IG-repot `hl7.fhir.r4.ig.medicalalertinformation`. Varje uppmärksamhetstyp
(profil 1 till 10) finns representerad minst en gång.

Profilförkortningar i tabellen nedan:

| Kod | Profil |
|---|---|
| **A1** | `SEAlertInformation-1-OtherMedicalConditionFlag` — Annat medicinskt tillstånd |
| **A2** | `SEAlertInformation-2-TreatmentFlag` — Behandling |
| **A3** | `SEAlertInformation-3-PresenceOfGraftsConditionFlag` — Förekomst av transplantat |
| **A4** | `SEAlertInformation-4-PresenceOfImplantFlag` — Förekomst av implantat |
| **B1** | `SEAlertInformation-5-PresenceOfInfectiousAgentFlag` — Förekomst av smittämne |
| **B2** | `SEAlertInformation-6-PresenceOfContagiousDiseaseFlag` — Förekomst av smittsam sjukdom |
| **C1** | `SEAlertInformation-7-AllergyIntoleranceFlag` — Överkänslighet |
| **D1** | `SEAlertInformation-8-SpecialCareRoutineFlag` — Information som kan leda till särskild vårdrutin |
| **D2** | `SEAlertInformation-9-DecisionSpecialCareRoutineFlag` — Beslut om särskild vårdrutin |
| **E1** | `SEAlertInformation-10-UnstructuredFlag` — Ej strukturanpassad uppmärksamhetsinformation |

Patient-id används som referens (`Patient/<id>`) och som URL-parameter
(`?subject=Patient/<id>`).

## Profiltäckning

| Profil | Aktiv flagga finns hos |
|---|---|
| A1 | Tolvan, John Bob, Karl-Erik, Astrid, Liam |
| A2 | John Bob, Karl-Erik *(Gunnar har en **inactive** A2)* |
| A3 | Karl-Erik, Gunnar |
| A4 | John Bob, Astrid, Lova |
| B1 | Berit, Gunnar |
| B2 | Fatima *(Sara har en **inactive** B2)* |
| C1 | Tolvan, Fatima, Liam |
| D1 | Berit, Gunnar |
| D2 | Berit, Gunnar |
| E1 | Berit, Lova, Sara |

## Patientdetaljer

### `pat-tolvan` — Tolvan Tolvansson (19121212-1212)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-tolvan-1` | A1 | active | SCT 9651007 *Långt QT-syndrom* | Hereditärt tillstånd, dokumenterat 2018 |
| `flag-tolvan-7` | C1 | active | SCT 111088007 *latex* | Allvarlighetsgrad: livshotande (`442452003`) |

### `pat-johnbob` — John Bob Goode Johansson (19500907-2553)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-johnbob-1` | A1 | active | SCT 70995007 *pulmonell hypertoni* | |
| `flag-johnbob-2` | A2 | active | SCT 243142003 *BiPAP-behandling* | Pågående |
| `flag-johnbob-4` | A4 | active | SCT 72506001 *implanterbar defibrillator* | ICD inopererad 2019 |

### `pat-berit` — Berit Fri Andersson (19540123-2380)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-berit-5` | B1 | active | SCT 432415000 *MRSA-bärare* | |
| `flag-berit-8` | D1 | active | SCT 699128009 *Blood transfusion declined* | Kod från IG VS; demoportalen visar alert label + `code.coding` |
| `flag-berit-9` | D2 | active | SCT 306103005 *Referral to department* | Kod från IG VS; demoportalen visar alert label + `code.coding` |
| `flag-berit-10` | E1 | active | ICD-10-SE A49.9 | Alert label enligt `SEAlertLabelCS`; demodata utan fri `code.text` |

### `pat-karlerik` — Karl-Erik Sjöberg (19710919-9289)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-karlerik-1` | A1 | active | SCT 234467004 *trombofili* | |
| `flag-karlerik-2` | A2 | active | ATC L04 *Immunsuppressiva medel* | Pågående efter transplantation |
| `flag-karlerik-3` | A3 | active | SCT 739024006 *transplanterat hjärta föreligger* | Hjärttransplantation 2017 |

### `pat-fatima` — Fatima Al-Hassan (19840515-2364)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-fatima-6` | B2 | active | Nationellt SNOMED 64301000052105 *blodsmitta hos gravid* | `SEAlertInformationNationalSnomedCS` |
| `flag-fatima-7` | C1 | active | SCT 373568007 *Chlorhexidine* | Allvarlighetsgrad: besvärande (`59031000052109`) |
| `obs-fatima-blodsmitta` | (Observation) | final | Nationellt SNOMED 64301000052105 | `SEAlertInformationIncidenceOfInfectiousDiseaseObservation` |

### `pat-astrid` — Astrid Berg (19920304-9809)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-astrid-1` | A1 | active | SCT 405501007 *malign hypertermi* | Risk vid anestesi |
| `flag-astrid-4` | A4 | active | SCT 69805005 *insulinpump* | |

> **D1/D2:** Koderna följer IG:s value sets (`SEAlertInformationSpecialCareRoutineSnomedCT` / `…DecisionSpecialCareRoutineSnomedCT`). Demobundles har ingen fri `code.text`; demoportalen visar **alert label** och **terminologi** (`code.coding`) enligt samma princip som för övriga profiler.

### `pat-liam` — Liam Nordström (20010101-2393)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-liam-1` | A1 | active | ICD-10-SE D67.9 *Ärftlig brist på faktor IX* | Hemofili B |
| `flag-liam-7` | C1 | active | SCT 281000220103 *taurolidin* | |

### `pat-lova` — Lova Karlsson (20120101-3035)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-lova-4` | A4 | active | SCT 43252007 *kokleaimplantat* | |
| `flag-lova-10` | E1 | active | ICD-10-SE A49.9 | Alert label + kod enligt ovan (ingen `code.text` i demodata) |

### `pat-gunnar` — Gunnar Lind (19450612-1518)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-gunnar-2` | A2 | **inactive** | ATC B01AA03 *Warfarin* | Avslutad 2024 efter byte till DOAK |
| `flag-gunnar-3` | A3 | active | SCT 737297006 *transplanterad lever föreligger* | Levertransplantation 2010 |
| `flag-gunnar-5` | B1 | active | SCT 762988003 *ESBL-bärare* | |
| `flag-gunnar-8` | D1 | active | SCT 713670002 *deltar i klinisk läkemedelsprövning* | Kod från IG VS; demoportalen visar alert label + `code.coding` |
| `flag-gunnar-9` | D2 | active | SCT 306103005 *Referral to department* | Kod från IG VS; demoportalen visar alert label + `code.coding` |

### `pat-sara` — Sara Lindgren (19880825-4736)

| Flagga | Profil | Status | Kod | Kommentar |
|---|---|---|---|---|
| `flag-sara-6` | B2 | **inactive** | ICD-10-SE A49.9 *Bakteriell infektion, ospecificerad* | Utläkt; `period.end = 2024-04-03` |
| `flag-sara-10` | E1 | active | ICD-10-SE A49.9 | Alert label + kod enligt ovan (ingen `code.text` i demodata) |

## Demoscenarier

- **Aktiv lista per patient**: `GET /Flag?subject=Patient/pat-johnbob&status=active`
- **Allergier över hela populationen**: `GET /Flag?category=C1`
- **Pågående och avslutade behandlingar**: `GET /Flag?_profile=http://hl7.se/fhir/r4/ig/medicalalertinformation/StructureDefinition/SEAlertInformation-2-TreatmentFlag`
- **Smittor (smittämne + sjukdom)**: `GET /Flag?category=B1,B2&status=active`
- **Hela patientens uppmärksamhetsinformation som bundle**: `GET /Patient/pat-gunnar/$everything`
