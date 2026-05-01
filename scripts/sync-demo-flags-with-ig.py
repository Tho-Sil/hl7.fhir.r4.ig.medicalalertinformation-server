#!/usr/bin/env python3
"""
Enrich HAPI demo Flag bundles to align with hl7.fhir.r4.ig.medicalalertinformation:
- SEAlertLabelExtension on every Flag
- Profile 10 (E1): coded ICD-10-SE + ej-strukturanpassad label (no `code.text` in demo bundles)
- Profile 8/9: codes from IG ValueSets (replace invalid ICD / out-of-VS SNOMED)
- ICD-10-SE + national SNOMED where IG uses them; English SNOMED displays for int'l codes where tx expects EN
"""
from __future__ import annotations

import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "HAPI-server" / "data"

LABEL_EXT = "http://hl7.se/fhir/r4/ig/medicalalertinformation/StructureDefinition/SEAlertLabelExtension"
LABEL_CS = "http://hl7.se/fhir/r4/ig/medicalalertinformation/CodeSystem/SEAlertLabelCS"
ICD10SE = "http://hl7.se/fhir/r4/ig/medicalalertinformation/CodeSystem/SEAlertInformationICD10SECS"
NAT_SCT = "http://hl7.se/fhir/r4/ig/medicalalertinformation/CodeSystem/SEAlertInformationNationalSnomedCS"
INT_SCT = "http://snomed.info/sct"

# (label_code, label_display) from SEAlertLabelCS.fsh
ALERT_LABEL_BY_FLAG_ID: dict[str, tuple[str, str]] = {
    "flag-tolvan-1": ("langt-qt-syndrom-lqts", "Långt QT-syndrom (LQTS)"),
    "flag-johnbob-1": ("pulmonell-hypertension", "Pulmonell hypertension"),
    "flag-johnbob-2": ("beroende-av-icke-invasiv-ventilation", "Beroende av icke-invasiv ventilation"),
    "flag-johnbob-4": (
        "implanterbar-defibrillator-icd-implantable-cardioverter-defibrillator",
        "Implanterbar defibrillator (ICD – implantable cardioverter-defibrillator)",
    ),
    "flag-karlerik-1": ("trombofili", "Trombofili"),
    "flag-karlerik-2": ("immunmodulerande-behandling", "Immunmodulerande behandling"),
    "flag-karlerik-3": ("hjarttransplanterad", "Hjärttransplanterad"),
    "flag-astrid-1": ("malign-hypertermikanslighet", "Malign hypertermikänslighet"),
    "flag-astrid-4": ("insulinpump", "Insulinpump"),
    "flag-liam-1": ("koagulationsrubbningar", "Koagulationsrubbningar"),
    "flag-lova-4": ("cochleaimplantat", "Cochleaimplantat"),
    "flag-gunnar-2": ("warfarinbehandling", "Warfarinbehandling"),
    "flag-gunnar-3": ("levertransplanterad", "Levertransplanterad"),
    "flag-berit-5": ("mrsa-meticillinresistenta-staphylococcus-aureus", "MRSA (meticillinresistenta Staphylococcus aureus)"),
    "flag-gunnar-5": (
        "tarmbakterier-som-bildar-esbl-extended-spectrum-beta-lactamase",
        "Tarmbakterier som bildar ESBL (Extended Spectrum Beta-Lactamase)",
    ),
    "flag-fatima-6": ("blodsmitta-hos-gravid", "Blodsmitta hos gravid"),
    "flag-sara-6": ("annat", "Annat"),
    "flag-tolvan-7": ("latex", "Latex"),
    "flag-fatima-7": ("klorhexidin", "Klorhexidin"),
    "flag-liam-7": ("taurolidin", "Taurolidin"),
    # D1/D2: codes fixed to IG VS; labels match narrative
    "flag-berit-8": ("patienten-accepterar-ej-blod-eller-plasmatransfusion", "Patienten accepterar ej blod- eller plasmatransfusion"),
    "flag-gunnar-8": ("deltagare-i-klinisk-lakemedelsprovning", "Deltagare i klinisk läkemedelsprövning"),
    "flag-berit-9": ("hanvisning-finns-till-en-specifik-vardenhet", "Hänvisning finns till en specifik vårdenhet"),
    "flag-gunnar-9": ("hanvisning-finns-till-en-specifik-vardenhet", "Hänvisning finns till en specifik vårdenhet"),
    "flag-berit-10": ("ej-strukturanpassad-uppmarksamhetsinformation", "Ej strukturanpassad uppmärksamhetsinformation"),
    "flag-lova-10": ("ej-strukturanpassad-uppmarksamhetsinformation", "Ej strukturanpassad uppmärksamhetsinformation"),
    "flag-sara-10": ("ej-strukturanpassad-uppmarksamhetsinformation", "Ej strukturanpassad uppmärksamhetsinformation"),
}


def label_extension(code: str, display: str) -> dict:
    return {
        "url": LABEL_EXT,
        "valueCodeableConcept": {
            "coding": [{"system": LABEL_CS, "code": code, "display": display}]
        },
    }


def inject_alert_label(flag: dict) -> None:
    fid = flag.get("id")
    if not fid or fid not in ALERT_LABEL_BY_FLAG_ID:
        raise SystemExit(f"Missing ALERT_LABEL_BY_FLAG_ID mapping for flag id={fid!r}")
    code, display = ALERT_LABEL_BY_FLAG_ID[fid]
    ext = [e for e in (flag.get("extension") or []) if e.get("url") != LABEL_EXT]
    flag["extension"] = [label_extension(code, display)] + ext


def patch_medical(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for ent in data["entry"]:
        res = ent["resource"]
        if res.get("resourceType") != "Flag":
            continue
        fid = res["id"]
        inject_alert_label(res)
        c0 = res["code"]["coding"][0]
        if fid == "flag-tolvan-1":
            c0["display"] = "Long QT syndrome"
        elif fid == "flag-johnbob-1":
            c0["display"] = "Pulmonary hypertension"
        elif fid == "flag-johnbob-2":
            c0["display"] = "Bilevel positive airway pressure treatment"
        elif fid == "flag-johnbob-4":
            c0["display"] = "Implantable cardioverter defibrillator"
        elif fid == "flag-karlerik-1":
            c0["display"] = "Thrombophilia"
        elif fid == "flag-karlerik-3":
            c0["display"] = "Heart transplanted"
        elif fid == "flag-astrid-1":
            c0["display"] = "Malignant hyperthermia susceptibility"
        elif fid == "flag-astrid-4":
            c0["display"] = "Insulin pump device"
        elif fid == "flag-liam-1":
            c0["system"] = ICD10SE
            c0["display"] = "Ärftlig brist på faktor IX"
        elif fid == "flag-lova-4":
            c0["display"] = "Cochlear implant"
        elif fid == "flag-gunnar-2":
            c0["display"] = "Warfarin"
        elif fid == "flag-gunnar-3":
            c0["display"] = "Liver transplanted"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def patch_infection(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for ent in data["entry"]:
        res = ent["resource"]
        rt = res.get("resourceType")
        if rt == "Flag":
            inject_alert_label(res)
            fid = res["id"]
            c0 = res["code"]["coding"][0]
            if fid == "flag-gunnar-5":
                c0["display"] = "Carrier of extended spectrum beta-lactamase producing bacteria"
            if fid == "flag-fatima-6":
                c0["system"] = NAT_SCT
                c0["display"] = "blodsmitta hos gravid"
            if fid == "flag-sara-6":
                c0["system"] = ICD10SE
                c0["display"] = "Bakteriell infektion, ospecificerad"
        elif rt == "Observation" and res.get("id") == "obs-fatima-blodsmitta":
            res["code"]["coding"] = [
                {
                    "system": NAT_SCT,
                    "code": "64301000052105",
                    "display": "blodsmitta hos gravid",
                }
            ]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def patch_allergy(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for ent in data["entry"]:
        res = ent["resource"]
        inject_alert_label(res)
        if res["id"] == "flag-tolvan-7":
            res["code"]["coding"][0]["display"] = "Latex"
        elif res["id"] == "flag-liam-7":
            res["code"]["coding"][0]["display"] = "Taurolidin"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def patch_careroutine(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for ent in data["entry"]:
        res = ent["resource"]
        inject_alert_label(res)
        fid = res["id"]
        c0 = res["code"]["coding"][0]
        if fid == "flag-berit-8":
            c0["system"] = INT_SCT
            c0["code"] = "699128009"
            c0["display"] = "Blood transfusion declined"
        elif fid == "flag-gunnar-8":
            c0["system"] = INT_SCT
            c0["code"] = "713670002"
            # Same preferred term as in IG ValueSet SEAlertInformationSpecialCareRoutineSnomedCT
            c0["display"] = "deltar i klinisk läkemedelsprövning"
        elif fid == "flag-berit-9":
            c0["system"] = INT_SCT
            c0["code"] = "306103005"
            c0["display"] = "Referral to department"
        elif fid == "flag-gunnar-9":
            c0["system"] = INT_SCT
            c0["code"] = "306103005"
            c0["display"] = "Referral to department"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def patch_unstructured(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    for ent in data["entry"]:
        res = ent["resource"]
        inject_alert_label(res)
        res["code"] = {
            "coding": [
                {
                    "system": ICD10SE,
                    "code": "A49.9",
                    "display": "Bakteriell infektion, ospecificerad",
                }
            ],
        }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    patch_medical(DATA / "10-flags-medical.json")
    patch_infection(DATA / "11-flags-infection.json")
    patch_allergy(DATA / "12-flags-allergy.json")
    patch_careroutine(DATA / "13-flags-careroutine.json")
    patch_unstructured(DATA / "14-flags-unstructured.json")
    print("Updated:", "10–14 flag bundles + obs-fatima-blodsmitta")


if __name__ == "__main__":
    main()
