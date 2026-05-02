# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-05-01

### Added

- Demo: motivering för `SEAlertLabelCS` från Socialstyrelsens kodverkslista som `demo/data/alert-label-definitions.json`, byggd med `demo/scripts/build_alert_label_definitions.py` (xlsx + FSH-matchning); dokumenterat i `demo/README.md`.
- Demo: flytande tooltip (~60 ms) över hela signalraden (patientvyn) och hela tabellraden (översikt) när motivering finns.

### Changed

- Demo: kategori- och symbolkortikoner som linje-SVG (`currentColor`) i stället för emoji; särskiljande ikoner för smitta (B1) vs smittsam sjukdom (B2); C1 som varningstriangel.
- Demo: topbar-logotyp som full UMI-symbol med officiella kilfärger (`index.html`).
- Demo: fliken Om — kontakt för demoportalen; källkod med länkar till IG-repot (`develop`), CI-byggd IG och server-repot.
- README: länk till syskon-IG på GitHub (`HL7Sweden/hl7.fhir.r4.ig.medicalalertinformation`, branch `develop`).

## [1.0.0] - 2026-05-01

### Added

- First tagged release: HAPI FHIR demo stack (`HAPI-server/`), sample bundles (`HAPI-server/data/`), and static demo portal (`demo/`).
