/* Demoportal — uppmärksamhetsinformation
 * Hämtar Patient/Flag/Observation från en lokalt körande HAPI FHIR-server
 * och visualiserar uppmärksamhetsinformationen i NPÖ-stil.
 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PROFILE_BASE = "http://hl7.se/fhir/r4/ig/medicalalertinformation/StructureDefinition/";
const CATEGORY_CS = "http://hl7.se/fhir/r4/ig/medicalalertinformation/CodeSystem/SEAlertInformationCategoryCS";
const PNR_SYSTEM = "urn:oid:1.2.752.129.2.1.3.1";
const CRIT_LEVEL_EXT = PROFILE_BASE + "CriticalityLevelExtension";

const CATEGORIES = {
  A1: { group: "A", title: "Annat medicinskt tillstånd", icon: "🩺" },
  A2: { group: "A", title: "Behandling", icon: "💊" },
  A3: { group: "A", title: "Förekomst av transplantat", icon: "🫀" },
  A4: { group: "A", title: "Förekomst av implantat", icon: "🔧" },
  B1: { group: "B", title: "Förekomst av smittämne", icon: "🦠" },
  B2: { group: "B", title: "Förekomst av smittsam sjukdom", icon: "⚠️" },
  C1: { group: "C", title: "Överkänslighet", icon: "🚫" },
  D1: { group: "D", title: "Information om särskild vårdrutin", icon: "📋" },
  D2: { group: "D", title: "Beslut om särskild vårdrutin", icon: "✅" },
  E1: { group: "E", title: "Ostrukturerad uppmärksamhetsinformation", icon: "📝" },
};

const PROFILE_GROUPS = [
  ["Medicinska tillstånd och behandlingar", ["A1", "A2", "A3", "A4"]],
  ["Smitta", ["B1", "B2"]],
  ["Överkänslighet", ["C1"]],
  ["Särskild vårdrutin", ["D1", "D2"]],
  ["Ostrukturerad", ["E1"]],
];

const CRITICALITY = {
  "442452003": { label: "Livshotande", cls: "life-threatening" },
  "59021000052107": { label: "Skadlig", cls: "harmful" },
  "59031000052109": { label: "Besvärande", cls: "discomforting" },
  "high": { label: "Hög", cls: "life-threatening" },
  "low": { label: "Låg", cls: "discomforting" },
};

let state = {
  base: localStorage.getItem("fhirBase") || "http://localhost:8080/fhir",
  patients: [],
  flagsByPatient: new Map(),
  selectedPatientId: null,
};

/* ── Tab routing ──────────────────────────────────────────── */
function initTabs() {
  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      $$(".tab").forEach(b => b.classList.toggle("active", b === btn));
      $$(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + target));
      if (target === "testpatients") renderTestPatientDocs();
      if (target === "api") renderApiExamples();
    });
  });
}

/* ── FHIR-bas + status ────────────────────────────────────── */
function initServer() {
  const inp = $("#fhirBase");
  inp.value = state.base;
  inp.addEventListener("change", () => {
    state.base = inp.value.replace(/\/$/, "");
    localStorage.setItem("fhirBase", state.base);
    bootstrap();
  });
  pingServer();
  setInterval(pingServer, 5000);
}

async function pingServer() {
  const dot = $("#serverStatus");
  try {
    const r = await fetch(state.base + "/metadata", { headers: { Accept: "application/fhir+json" } });
    if (!r.ok) throw new Error(r.status);
    dot.classList.add("ok"); dot.classList.remove("err");
    dot.title = "Servern svarar";
  } catch (e) {
    dot.classList.add("err"); dot.classList.remove("ok");
    dot.title = "Servern svarar inte (" + (e.message || e) + ")";
  }
}

/* ── Data ─────────────────────────────────────────────────── */
async function fhirGet(path) {
  const url = state.base + path;
  const r = await fetch(url, { headers: { Accept: "application/fhir+json" } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} from ${url}`);
  return r.json();
}

async function loadAllResources(resourceType, params = "_count=200") {
  const out = [];
  let next = `/${resourceType}?${params}`;
  while (next) {
    const bundle = await fhirGet(next);
    for (const e of bundle.entry || []) out.push(e.resource);
    const link = (bundle.link || []).find(l => l.relation === "next");
    if (!link) break;
    next = link.url.replace(state.base, "");
  }
  return out;
}

async function bootstrap() {
  $("#patientList").innerHTML = `<div class="loading"><span class="spinner"></span>Hämtar patienter…</div>`;
  $("#footerStats").textContent = "";
  try {
    const [patients, flags] = await Promise.all([
      loadAllResources("Patient"),
      loadAllResources("Flag"),
    ]);
    state.patients = patients.sort((a, b) => (a.name?.[0]?.family || "").localeCompare(b.name?.[0]?.family || ""));
    state.flagsByPatient = new Map();
    for (const f of flags) {
      const ref = f.subject?.reference || "";
      const pid = ref.replace(/^Patient\//, "");
      if (!state.flagsByPatient.has(pid)) state.flagsByPatient.set(pid, []);
      state.flagsByPatient.get(pid).push(f);
    }
    renderPatientList();
    $("#footerStats").textContent = `${patients.length} patienter · ${flags.length} flaggor`;
    if (state.patients.length && !state.selectedPatientId) {
      selectPatient(state.patients[0].id);
    } else if (state.selectedPatientId) {
      selectPatient(state.selectedPatientId);
    }
  } catch (e) {
    $("#patientList").innerHTML = `<div class="loading" style="color:var(--critical)">Fel: ${escapeHtml(e.message)}</div>`;
    $("#patientDetail").innerHTML = `<div class="empty-state">
      <p>Kunde inte ansluta till FHIR-servern på <code>${escapeHtml(state.base)}</code>.</p>
      <p>Säkerställ att servern är uppe (<code>docker compose up -d</code>) och att data är laddat
      (<code>./scripts/load-data.sh</code>).</p></div>`;
  }
}

/* ── Patient list ─────────────────────────────────────────── */
function renderPatientList() {
  const list = $("#patientList");
  if (!state.patients.length) {
    list.innerHTML = `<div class="loading">Inga patienter inlästa.</div>`;
    return;
  }
  list.innerHTML = state.patients.map(p => {
    const id = p.id;
    const name = p.name?.[0]?.text || `${p.name?.[0]?.given?.join(" ") || ""} ${p.name?.[0]?.family || ""}`.trim();
    const pnr = p.identifier?.find(i => i.system === PNR_SYSTEM)?.value || "";
    const gender = p.gender || "unknown";
    const flags = state.flagsByPatient.get(id) || [];
    const activeCount = flags.filter(f => f.status === "active").length;
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
    const sel = id === state.selectedPatientId ? " selected" : "";
    const mini = renderAlertSymbolMini(flags);
    return `<div class="patient-card${sel}" data-id="${id}">
      <div class="patient-avatar ${gender[0] || ""}">${escapeHtml(initials)}</div>
      <div class="patient-card-info">
        <div class="patient-card-name">${escapeHtml(name)}</div>
        <div class="patient-card-meta">${formatPnr(pnr)}</div>
      </div>
      ${mini}
      <span class="patient-card-flagcount${activeCount === 0 ? " zero" : ""}">${activeCount}</span>
    </div>`;
  }).join("");
  $$(".patient-card", list).forEach(c => {
    c.addEventListener("click", () => selectPatient(c.dataset.id));
  });
}

function selectPatient(id) {
  state.selectedPatientId = id;
  $$(".patient-card").forEach(c => c.classList.toggle("selected", c.dataset.id === id));
  renderPatientDetail(id);
}

/* ── Patient detail ───────────────────────────────────────── */
function renderPatientDetail(id) {
  const detail = $("#patientDetail");
  const patient = state.patients.find(p => p.id === id);
  if (!patient) {
    detail.innerHTML = `<div class="empty-state"><p>Patient hittades inte.</p></div>`;
    return;
  }
  const name = patient.name?.[0]?.text || `${patient.name?.[0]?.given?.join(" ") || ""} ${patient.name?.[0]?.family || ""}`.trim();
  const pnr = patient.identifier?.find(i => i.system === PNR_SYSTEM)?.value || "";
  const gender = patient.gender || "unknown";
  const birthDate = patient.birthDate || "";
  const age = birthDate ? computeAge(birthDate) : "";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const flags = (state.flagsByPatient.get(id) || []).slice().sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return (a.category?.[0]?.coding?.[0]?.code || "").localeCompare(b.category?.[0]?.coding?.[0]?.code || "");
  });
  const activeCount = flags.filter(f => f.status === "active").length;
  const symbol = renderAlertSymbol(flags);

  const header = `
    <div class="patient-header">
      <div class="patient-header-avatar ${gender[0] || ""}">${escapeHtml(initials)}</div>
      <div class="patient-header-info">
        <div class="patient-header-name">${escapeHtml(name)}</div>
        <div class="patient-header-meta">
          <span class="pnr">${formatPnr(pnr)}</span>
          <span>${formatGender(gender)}</span>
          <span>${age ? age + " år" : ""}</span>
          <span>${birthDate ? "född " + birthDate : ""}</span>
        </div>
      </div>
      ${symbol}
    </div>`;

  const banner = activeCount > 0
    ? `<div class="alert-banner">
        <span class="alert-banner-icon">⚠️</span>
        <span>Patienten har <strong>${activeCount} aktiv${activeCount === 1 ? "" : "a"} uppmärksamhetssignal${activeCount === 1 ? "" : "er"}</strong>. Beakta dessa innan vård och behandling.</span>
      </div>`
    : `<div class="alert-banner empty">
        <span class="alert-banner-icon">✓</span>
        <span>Ingen aktiv uppmärksamhetsinformation registrerad för denna patient.</span>
      </div>`;

  // group flags by category code
  const byCat = new Map();
  for (const f of flags) {
    const code = f.category?.[0]?.coding?.find(c => c.system === CATEGORY_CS)?.code
              || f.category?.[0]?.coding?.[0]?.code || "?";
    if (!byCat.has(code)) byCat.set(code, []);
    byCat.get(code).push(f);
  }

  const groups = PROFILE_GROUPS.map(([groupTitle, codes]) => {
    const groupFlags = codes.flatMap(c => byCat.get(c) || []);
    if (!groupFlags.length) return "";
    const groupLetter = CATEGORIES[codes[0]].group;
    return `
      <div class="category-group category-${groupLetter}">
        <div class="category-header">
          <div class="category-icon">${CATEGORIES[codes[0]].icon}</div>
          <div class="category-title">${escapeHtml(groupTitle)}</div>
          <div class="category-count">${groupFlags.length}</div>
        </div>
        <div class="flag-list">
          ${groupFlags.map(renderFlag).join("")}
        </div>
      </div>`;
  }).filter(Boolean).join("");

  detail.innerHTML = header + banner + (groups || `
    <div class="empty-state"><p>Inga uppmärksamhetssignaler för denna patient.</p></div>`);
}

/* ── NPÖ-style alert symbol ──────────────────────────────── */
function renderAlertSymbol(flags) {
  const active = flags.filter(f => f.status === "active");
  const cats = new Set();
  let allergySeverity = null; // "life-threatening" | "harmful" | "discomforting"

  const SEVERITY_RANK = { "life-threatening": 3, "harmful": 2, "discomforting": 1 };

  for (const f of active) {
    const code = f.category?.[0]?.coding?.find(c => c.system === CATEGORY_CS)?.code
              || f.category?.[0]?.coding?.[0]?.code;
    if (code) cats.add(code);
    if (code === "C1") {
      const ext = (f.extension || []).find(e => e.url === CRIT_LEVEL_EXT);
      const cc = ext?.valueCodeableConcept?.coding?.[0]?.code;
      const sev = CRITICALITY[cc]?.cls;
      if (sev && (!allergySeverity || SEVERITY_RANK[sev] > SEVERITY_RANK[allergySeverity])) {
        allergySeverity = sev;
      }
    }
  }

  // C1 with no severity extension → assume discomforting (still gives bottom dot)
  if (cats.has("C1") && !allergySeverity) allergySeverity = "discomforting";

  const has = group => [...cats].some(c => c.startsWith(group));
  const C_RED = "#c11616";
  const A_BLUE = "#1f5f9e";
  const B_YELLOW = "#f5b800";
  const D_BLUE = "#2563b3";
  const E_ORANGE = "#c14516";
  const OFF = "#e5e7eb";

  // Allergy severity → which of the 3 stacked dots are red
  const sev = SEVERITY_RANK[allergySeverity] || 0;
  const aTop = sev >= 3 ? C_RED : OFF;
  const aMid = sev >= 2 ? C_RED : OFF;
  const aBot = sev >= 1 ? C_RED : OFF;

  const cMedical = has("A") ? A_BLUE : OFF;
  const cInfection = has("B") ? B_YELLOW : OFF;
  const cCare = has("D") ? D_BLUE : OFF;
  const cUnstr = has("E") ? E_ORANGE : OFF;

  const tooltip = activeAreas(cats, allergySeverity);

  return `<div class="alert-symbol-wrap" title="${escapeHtml(tooltip)}">
    <svg viewBox="0 0 90 110" class="alert-symbol" aria-label="Uppmärksamhetssymbol">
      <!-- Top column: allergy severity (3 stacked dots) -->
      <rect x="38" y="3"  width="14" height="10" rx="3" fill="${aTop}" stroke="#374151" stroke-width="1.2"/>
      <rect x="38" y="15" width="14" height="10" rx="3" fill="${aMid}" stroke="#374151" stroke-width="1.2"/>
      <rect x="38" y="27" width="14" height="10" rx="3" fill="${aBot}" stroke="#374151" stroke-width="1.2"/>

      <!-- Upper-left: ej strukturanpassad -->
      <polygon points="6,46 26,40 30,52 22,58 6,58" fill="${cUnstr}" stroke="#374151" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- Upper-right: medicinskt tillstånd och behandling -->
      <polygon points="84,46 64,40 60,52 68,58 84,58" fill="${cMedical}" stroke="#374151" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- Lower-left: smitta -->
      <polygon points="6,77 26,83 30,71 22,65 6,65" fill="${cInfection}" stroke="#374151" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- Lower-right: vårdrutinavvikelse -->
      <polygon points="84,77 64,83 60,71 68,65 84,65" fill="${cCare}" stroke="#374151" stroke-width="1.2" stroke-linejoin="round"/>

      <!-- Bottom: pedestal/foot -->
      <rect x="35" y="92" width="20" height="10" rx="3" fill="white" stroke="#374151" stroke-width="1.2"/>

      <!-- Central body -->
      <circle cx="45" cy="61" r="14" fill="white" stroke="#374151" stroke-width="1.4"/>

      <!-- Lightning + period (uppmärksamhetssignal-glyph) -->
      <rect x="42.5" y="50" width="5" height="13" rx="1.5" fill="#1f2937"/>
      <circle cx="45" cy="69" r="2.4" fill="#1f2937"/>
    </svg>
    ${activeAreasLabel(cats, allergySeverity)}
  </div>`;
}

function renderAlertSymbolMini(flags) {
  // Same symbol logic, smaller size and no caption.
  const active = flags.filter(f => f.status === "active");
  const cats = new Set();
  let allergySeverity = null;
  const SR = { "life-threatening": 3, "harmful": 2, "discomforting": 1 };
  for (const f of active) {
    const code = f.category?.[0]?.coding?.find(c => c.system === CATEGORY_CS)?.code
              || f.category?.[0]?.coding?.[0]?.code;
    if (code) cats.add(code);
    if (code === "C1") {
      const ext = (f.extension || []).find(e => e.url === CRIT_LEVEL_EXT);
      const cc = ext?.valueCodeableConcept?.coding?.[0]?.code;
      const sev = CRITICALITY[cc]?.cls;
      if (sev && (!allergySeverity || SR[sev] > SR[allergySeverity])) allergySeverity = sev;
    }
  }
  if (cats.has("C1") && !allergySeverity) allergySeverity = "discomforting";

  const has = group => [...cats].some(c => c.startsWith(group));
  const OFF = "#e5e7eb";
  const sev = SR[allergySeverity] || 0;

  return `<svg class="alert-symbol-mini" viewBox="0 0 90 110" aria-hidden="true">
    <rect x="38" y="3"  width="14" height="10" rx="3" fill="${sev>=3 ? "#c11616" : OFF}" stroke="#374151" stroke-width="1.2"/>
    <rect x="38" y="15" width="14" height="10" rx="3" fill="${sev>=2 ? "#c11616" : OFF}" stroke="#374151" stroke-width="1.2"/>
    <rect x="38" y="27" width="14" height="10" rx="3" fill="${sev>=1 ? "#c11616" : OFF}" stroke="#374151" stroke-width="1.2"/>
    <polygon points="6,46 26,40 30,52 22,58 6,58" fill="${has("E") ? "#c14516" : OFF}" stroke="#374151" stroke-width="1.2" stroke-linejoin="round"/>
    <polygon points="84,46 64,40 60,52 68,58 84,58" fill="${has("A") ? "#1f5f9e" : OFF}" stroke="#374151" stroke-width="1.2" stroke-linejoin="round"/>
    <polygon points="6,77 26,83 30,71 22,65 6,65" fill="${has("B") ? "#f5b800" : OFF}" stroke="#374151" stroke-width="1.2" stroke-linejoin="round"/>
    <polygon points="84,77 64,83 60,71 68,65 84,65" fill="${has("D") ? "#2563b3" : OFF}" stroke="#374151" stroke-width="1.2" stroke-linejoin="round"/>
    <rect x="35" y="92" width="20" height="10" rx="3" fill="white" stroke="#374151" stroke-width="1.2"/>
    <circle cx="45" cy="61" r="14" fill="white" stroke="#374151" stroke-width="1.4"/>
    <rect x="42.5" y="50" width="5" height="13" rx="1.5" fill="#1f2937"/>
    <circle cx="45" cy="69" r="2.4" fill="#1f2937"/>
  </svg>`;
}

function activeAreas(cats, allergySeverity) {
  const parts = [];
  if (cats.has("C1")) {
    const sev = ({ "life-threatening": "livshotande", "harmful": "skadlig", "discomforting": "besvärande" })[allergySeverity] || "";
    parts.push(`Överkänslighet${sev ? " (" + sev + ")" : ""}`);
  }
  if ([...cats].some(c => c.startsWith("A"))) parts.push("Medicinskt tillstånd och behandling");
  if ([...cats].some(c => c.startsWith("B"))) parts.push("Smitta");
  if ([...cats].some(c => c.startsWith("D"))) parts.push("Vårdrutinavvikelse");
  if ([...cats].some(c => c.startsWith("E"))) parts.push("Ej strukturanpassad uppmärksamhetsinformation");
  return parts.length
    ? "Aktiva signaler: " + parts.join(" · ")
    : "Ingen aktuell uppmärksamhetsinformation";
}

function activeAreasLabel(cats, allergySeverity) {
  if (cats.size === 0) return `<div class="alert-symbol-cap">Ingen UMI</div>`;
  const sev = allergySeverity
    ? ({ "life-threatening": "Livshotande", "harmful": "Skadlig", "discomforting": "Besvärande" })[allergySeverity]
    : null;
  return sev ? `<div class="alert-symbol-cap">${sev} överkänslighet</div>` : "";
}

function renderFlag(flag) {
  const status = flag.status || "active";
  const text = flag.code?.text || flag.code?.coding?.[0]?.display || "(ingen kodbeskrivning)";
  const codings = flag.code?.coding || [];
  const inactiveCls = status !== "active" ? " inactive" : "";

  const crit = (flag.extension || []).find(e => e.url === CRIT_LEVEL_EXT);
  const critCode = crit?.valueCodeableConcept?.coding?.[0]?.code;
  const critInfo = critCode ? CRITICALITY[critCode] : null;
  const critPill = critInfo
    ? `<div class="criticality-pill ${critInfo.cls}">${critInfo.label}</div>`
    : "";

  const period = formatPeriod(flag.period);
  const codeChips = codings.map(c =>
    `<span class="flag-code-chip">${shortSystem(c.system)} · ${escapeHtml(c.code)}</span>`).join("");
  const display = codings[0]?.display && codings[0].display !== text
    ? `<div class="flag-display">${escapeHtml(codings[0].display)}</div>`
    : "";

  return `<div class="flag-item${inactiveCls}">
    <div class="flag-status-pill ${status}">${status === "active" ? "Aktiv" : "Inaktiv"}</div>
    <div class="flag-body">
      <div class="flag-text">${escapeHtml(text)}</div>
      ${display}
      <div class="flag-meta">
        ${codeChips}
        ${period ? `<span>${escapeHtml(period)}</span>` : ""}
      </div>
    </div>
    ${critPill}
  </div>`;
}

/* ── Test-patient docs ────────────────────────────────────── */
function renderTestPatientDocs() {
  const root = $("#patientDocs");
  if (!state.patients.length) {
    root.innerHTML = `<p class="loading"><span class="spinner"></span>Hämtar data…</p>`;
    return;
  }
  root.innerHTML = state.patients.map(p => {
    const name = p.name?.[0]?.text || "";
    const pnr = p.identifier?.find(i => i.system === PNR_SYSTEM)?.value || "";
    const flags = state.flagsByPatient.get(p.id) || [];
    return `
      <div class="patient-doc">
        <div class="patient-doc-header">
          <h3>${escapeHtml(name)}</h3>
          <span class="patient-doc-pnr">${formatPnr(pnr)}</span>
        </div>
        <table>
          <thead><tr><th>Status</th><th>Kategori</th><th>Kod</th><th>Beskrivning</th><th>Period</th></tr></thead>
          <tbody>
            ${flags.length === 0 ? `<tr><td colspan="5" style="color:var(--text-subtle)">Inga flaggor.</td></tr>` :
              flags.map(f => {
                const cat = f.category?.[0]?.coding?.find(c => c.system === CATEGORY_CS)?.code || "?";
                const catLetter = (cat[0] || "").toUpperCase();
                const c = f.code?.coding?.[0];
                const codeStr = c ? `${shortSystem(c.system)} ${c.code}` : "(fritext)";
                return `<tr>
                  <td><span class="flag-status-pill ${f.status}">${f.status === "active" ? "Aktiv" : "Inaktiv"}</span></td>
                  <td><span class="badge cat-${catLetter}">${cat}</span></td>
                  <td><code>${escapeHtml(codeStr)}</code></td>
                  <td>${escapeHtml(f.code?.text || c?.display || "")}</td>
                  <td>${escapeHtml(formatPeriod(f.period))}</td>
                </tr>`;
              }).join("")}
          </tbody>
        </table>
      </div>`;
  }).join("");
}

/* ── API examples ─────────────────────────────────────────── */
const API_EXAMPLES = [
  {
    title: "Servermetadata",
    desc: "CapabilityStatement från servern.",
    method: "GET",
    path: "/metadata",
  },
  {
    title: "Alla patienter",
    desc: "Hämta de första 20 patienterna.",
    method: "GET",
    path: "/Patient?_count=20",
  },
  {
    title: "Sök patient på personnummer",
    desc: "Identifierare med Inera-OID 1.2.752.129.2.1.3.1.",
    method: "GET",
    path: "/Patient?identifier=urn:oid:1.2.752.129.2.1.3.1%7C194506121518",
  },
  {
    title: "Aktiva flaggor för en patient",
    desc: "Filtrera på subject och status.",
    method: "GET",
    path: "/Flag?subject=Patient/pat-johnbob&status=active",
  },
  {
    title: "Alla allergier (kategori C1)",
    desc: "Filtrera på category.",
    method: "GET",
    path: "/Flag?category=C1",
  },
  {
    title: "Smitta (B1 + B2)",
    desc: "Sammanfattning av alla smittor i populationen.",
    method: "GET",
    path: "/Flag?category=B1,B2&status=active",
  },
  {
    title: "Flaggor med tillhörande patient",
    desc: "Använd _include för att få med Patient-resursen i samma svar.",
    method: "GET",
    path: "/Flag?category=C1&_include=Flag:subject",
  },
  {
    title: "Sök på SNOMED-kod",
    desc: "Hitta alla flaggor med en specifik SCT-kod.",
    method: "GET",
    path: "/Flag?code=http://snomed.info/sct%7C111088007",
  },
  {
    title: "Allt om en patient ($everything)",
    desc: "Patient + alla relaterade resurser i en bundle.",
    method: "GET",
    path: "/Patient/pat-gunnar/$everything",
  },
  {
    title: "Alla profiler",
    desc: "StructureDefinitions som finns på servern.",
    method: "GET",
    path: "/StructureDefinition?_count=50",
  },
  {
    title: "Tillgängliga value sets",
    desc: "Lista alla värdemängder.",
    method: "GET",
    path: "/ValueSet?_count=50",
  },
  {
    title: "Sökparametrar för Flag",
    desc: "Vilka sökparametrar stöds av servern för Flag-resursen?",
    method: "GET",
    path: "/SearchParameter?base=Flag",
  },
];

function renderApiExamples() {
  const root = $("#apiExamples");
  root.innerHTML = API_EXAMPLES.map((ex, i) => `
    <div class="api-card" data-i="${i}">
      <div class="api-card-header">
        <div class="api-card-title">${escapeHtml(ex.title)}</div>
        <div class="api-card-desc">${escapeHtml(ex.desc)}</div>
      </div>
      <div class="api-card-body">
        <div class="api-method-line">
          <span class="method-pill ${ex.method}">${ex.method}</span>
          <code class="api-url">${escapeHtml(ex.path)}</code>
          <button class="api-run">Kör</button>
        </div>
        <pre class="api-response"></pre>
      </div>
    </div>`).join("");

  $$(".api-card", root).forEach(card => {
    const i = +card.dataset.i;
    const ex = API_EXAMPLES[i];
    const btn = $(".api-run", card);
    const out = $(".api-response", card);
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Kör…";
      out.classList.remove("error");
      out.classList.add("show");
      out.textContent = "";
      try {
        const r = await fetch(state.base + ex.path, { headers: { Accept: "application/fhir+json" } });
        const text = await r.text();
        let pretty = text;
        try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
        out.textContent = `HTTP ${r.status} ${r.statusText}\n\n${pretty.slice(0, 8000)}`
          + (pretty.length > 8000 ? "\n\n… [trunkerat]" : "");
        if (!r.ok) out.classList.add("error");
      } catch (e) {
        out.textContent = "Fel: " + e.message;
        out.classList.add("error");
      } finally {
        btn.disabled = false;
        btn.textContent = "Kör";
      }
    });
  });
}

/* ── Helpers ──────────────────────────────────────────────── */
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function formatPnr(pnr) {
  if (!pnr || pnr.length !== 12) return pnr;
  return `${pnr.slice(0, 8)}-${pnr.slice(8)}`;
}

function formatGender(g) {
  return ({ male: "Man", female: "Kvinna", other: "Annat", unknown: "—" })[g] || g;
}

function computeAge(birthDate) {
  const dob = new Date(birthDate);
  if (isNaN(dob)) return "";
  const today = new Date("2026-04-28");  // demo "today"
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function formatPeriod(period) {
  if (!period) return "";
  if (period.start && period.end) return `${period.start} – ${period.end}`;
  if (period.start) return `Från ${period.start}`;
  if (period.end) return `Till ${period.end}`;
  return "";
}

function shortSystem(sys) {
  if (!sys) return "?";
  if (sys.includes("snomed.info/sct")) return "SCT";
  if (sys.includes("icd-10")) return "ICD-10";
  if (sys.includes("whocc.no/atc")) return "ATC";
  if (sys.includes("medicalalertinformation")) return "SE";
  return sys.split("/").pop() || sys;
}

/* ── Boot ─────────────────────────────────────────────────── */
initTabs();
initServer();
bootstrap();
