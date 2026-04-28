# API-exempel

Alla exempel använder bas-URL:en `http://localhost:8080/fhir`. Sätt
en miljövariabel om du vill kunna kopiera dem rakt av:

```bash
export FHIR=http://localhost:8080/fhir
```

## Hälsa och kapabiliteter

```bash
curl -s "$FHIR/metadata" | jq '{fhirVersion, software:.software, rest:.rest[0].resource | map(.type)}'
```

## Patient

Lista alla patienter:

```bash
curl -s "$FHIR/Patient?_count=20" \
  | jq '.entry[].resource | {id, name:.name[0].text, pnr:.identifier[0].value}'
```

Sök på personnummer:

```bash
curl -s "$FHIR/Patient?identifier=urn:oid:1.2.752.129.2.1.3.1|194506121518" | jq
```

Hämta en patient:

```bash
curl -s "$FHIR/Patient/pat-gunnar" | jq
```

## Flag-resurser

Alla flaggor:

```bash
curl -s "$FHIR/Flag?_count=50" | jq '.entry[].resource | {id, status, subject:.subject.reference, code:.code.coding[0].display}'
```

Aktiva flaggor för en specifik patient:

```bash
curl -s "$FHIR/Flag?subject=Patient/pat-johnbob&status=active" | jq
```

Filtrera per kategori (uppmärksamhetstyp):

```bash
# Allergier (C1)
curl -s "$FHIR/Flag?category=C1" | jq '.entry[].resource | {id, code:.code.coding[0].display, subject:.subject.reference}'

# Smitta (B1 + B2)
curl -s "$FHIR/Flag?category=B1,B2&status=active" | jq
```

Filtrera per profil:

```bash
PROFILE='http://hl7.se/fhir/r4/ig/medicalalertinformation/StructureDefinition/SEAlertInformation-2-TreatmentFlag'
curl -s --get "$FHIR/Flag" --data-urlencode "_profile=$PROFILE" | jq
```

Inkludera patient i samma svar:

```bash
curl -s "$FHIR/Flag?category=C1&_include=Flag:subject" | jq '.entry[].resource | {type:.resourceType, id, code:.code.coding[0].display, name:.name[0].text}'
```

Hämta en specifik flagga:

```bash
curl -s "$FHIR/Flag/flag-tolvan-7" | jq
```

## $everything (allt om en patient)

```bash
curl -s "$FHIR/Patient/pat-gunnar/\$everything" | jq '.entry[].resource | {type:.resourceType, id}'
```

## Skapa, uppdatera, ta bort

Conditional create — skapas bara om motsvarande resurs inte finns:

```bash
curl -s -X POST "$FHIR/Flag" \
  -H 'Content-Type: application/fhir+json' \
  -H "If-None-Exist: subject=Patient/pat-tolvan&category=C1&code=http://snomed.info/sct|111088007" \
  -d @- <<'JSON'
{
  "resourceType":"Flag",
  "status":"active",
  "category":[{"coding":[{"system":"http://hl7.se/fhir/r4/ig/medicalalertinformation/CodeSystem/SEAlertInformationCategoryCS","code":"C1"}]}],
  "code":{"coding":[{"system":"http://snomed.info/sct","code":"111088007","display":"latex"}]},
  "subject":{"reference":"Patient/pat-tolvan"}
}
JSON
```

Uppdatera (PUT):

```bash
curl -s -X PUT "$FHIR/Flag/flag-johnbob-2" \
  -H 'Content-Type: application/fhir+json' \
  -d '{"resourceType":"Flag","id":"flag-johnbob-2","status":"inactive","category":[{"coding":[{"system":"http://hl7.se/fhir/r4/ig/medicalalertinformation/CodeSystem/SEAlertInformationCategoryCS","code":"A2"}]}],"code":{"coding":[{"system":"http://snomed.info/sct","code":"243142003"}]},"subject":{"reference":"Patient/pat-johnbob"},"period":{"start":"2022-02-15","end":"2026-04-01"}}' | jq
```

Mjuk borttagning (DELETE):

```bash
curl -s -X DELETE "$FHIR/Flag/flag-tolvan-7" -i | head
```

## Validering

Validera ett resursutkast mot FHIR-basen (eller mot inläst IG om
`implementationguides` är aktiverat):

```bash
curl -s -X POST "$FHIR/Flag/\$validate" \
  -H 'Content-Type: application/fhir+json' \
  -d @data/12-flags-allergy.json | jq '.issue'
```

## Bundle-transaktioner

Ladda om en specifik fil:

```bash
curl -s -X POST "$FHIR/" \
  -H 'Content-Type: application/fhir+json' \
  --data-binary @data/02-patients.json | jq '.entry | length'
```

## Söklisting (paging)

```bash
NEXT=$(curl -s "$FHIR/Flag?_count=5" | jq -r '.link[]? | select(.relation=="next") | .url')
curl -s "$NEXT" | jq '.entry | length'
```

## CapabilityStatement med bara stödda Flag-search-parametrar

```bash
curl -s "$FHIR/metadata" \
  | jq '.rest[0].resource[] | select(.type=="Flag") | .searchParam'
```
