# Use cases

This section describes typical situations where **medical alert information** is recorded, shared, and consumed in the Swedish healthcare context. The Implementation Guide constrains the FHIR `Flag` resource for representing medical alert information, with optional references to underlying source artifacts when needed for context.

<!--
This section describes typical situations where Uppmärksamhetsinformation (UMI) is recorded, shared, and consumed in the Swedish healthcare context.
-->

## UC-1: Access and presentation in cross-organisational services (e.g., NPÖ)

### Goal

Ensure healthcare professionals can see up-to-date, safety-critical medical alert information (e.g., hypersensitivity and warnings) across organisations when treating patients.

### Actors

- Authoring system (local EHR or clinical application)
- Access service / viewer (e.g., NPÖ or a regional portal)

### Preconditions

- Patient identity can be resolved by the access service.
- The authoring system exposes a FHIR API with medical alert information represented as `Flag`.

### Main flow

1. A healthcare professional records medical alert information in the authoring system.
2. The authoring system exposes the medical alert information via FHIR (`Flag`) through an organisational endpoint or proxy service.
3. The access service queries `Flag` for the patient (e.g., `GET /Flag?patient={id}&status=active`).
4. The access service displays flags prominently with clear semantics (category, code, status, period, author).
5. When a flag changes (activated, updated, resolved), the current state is made available to the access service by the authoring system.

### Postconditions

- Medical alert information is visible in access services and understandable at the point of care.
- Deactivated or expired flags are not presented as active alerts; minimal reconciliation can be performed when presenting.

### Alternate / error flows

- Intermediary infrastructure may take on the responsibility for extracting/transforming to `Flag`, but should not affect content.
- If patient identity cannot be resolved, the access service cannot retrieve medical alert information.

### Security and privacy

- Access control and logging must follow Swedish regulations and local policies.
- Only flags created in the scope of representing medical alert information are exchanged.

### Relevant FHIR interactions / artifacts

- `Flag` read/search
- Optional `Provenance` linking back to the authoring system
- Optional `DocumentReference` / `Condition` / `Observation` for source context

## UC-2: Intra-enterprise / regional exchange and synchronisation (incl. central data platform)

### Goal

Keep medical alert information consistent across systems within one enterprise/region (e.g., primary care, emergency department, specialist care), optionally using a central data platform as the distribution hub.

### Actors

- Authoring system (local EHR or app)
- Subscriber/consumer systems (other EHRs, ED systems, clinical portals)
- Optionally a central data platform (hub for storage, governance, distribution)

### Preconditions

- Shared patient identity resolution within the enterprise/region.
- Agreed local conventions for medical alert information lifecycle (create, update, resolve/retire).

### Main flow (direct peer-to-peer or via platform)

1. A healthcare professional records medical alert information in the authoring system.
2. The change is shared to other systems via FHIR:
   - Pull: consumers periodically query all or changed `Flag` (e.g. `/Flag?patient=…&_lastUpdated=…`).
   - Push: information is pushed to a central data platform or notified to other systems through eventing (peer-to-peer).
3. Consumer systems rely on central information or update local state and presentation. Duplicates and stale flags are handled per local conventions, including resolution/retirement of flags.

### Postconditions

- All participating systems present a consistent set of active medical alert information flags for the patient.
- Historical flags remain traceable but are not shown as active alerts.

### Alternate / error flows

- If a system is offline, changes are replayed later (pull on reconnect or queued notifications).
- Conflicts (simultaneous edits) are resolved per governance rules (e.g., last-writer-wins plus audit/provenance).

### Security and privacy

- Access control and logging must follow Swedish regulations and local policies.
- Only flags created in the scope of representing medical alert information are required to conform to this guide.

### Relevant FHIR interactions / artifacts

- `Flag` create/update/read/search
- Optional notification pattern for change signalling
- `Provenance` recommended
- Optional `List` or `Bundle` for grouped distribution

## Common requirements (both use cases)

- **Primary representation**: Medical alert information must be represented as `Flag` and shall conform to the profiles in this IG.
- **Terminology**: Use standardised codes/categories where available; supply display texts suitable for UI.
- **Multilingual display**: Provide `code.display` and, where needed, additional presentation text to support Swedish and English UIs.
- **Lifecycle**: Keep status, period, and deactivation semantics accurate; avoid duplicates; resolve or retire flags when no longer applicable.
- **Link to source context (optional)**: When needed, reference supporting artifacts (e.g., `Condition`, `Observation`, `DocumentReference`) without making them mandatory.
- **Provenance and audit (recommended)**: Record author, time, and source system for traceability and safety.
- **Search and filtering**: FHIR APIs must support filtering of flags by patient and should support filtering by status, category, and `_lastUpdated` to enable efficient retrieval and synchronisation.
- **Profiles and conformance**: Systems that produce or consume medical alert information shall declare conformance in their `CapabilityStatement` and pass the IG’s validation rules and examples.

