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
  A1: { group: "A", icon: "🩺" },
  A2: { group: "A", icon: "💊" },
  A3: { group: "A", icon: "🫀" },
  A4: { group: "A", icon: "🔧" },
  B1: { group: "B", icon: "🦠" },
  B2: { group: "B", icon: "⚠️" },
  C1: { group: "C", icon: "🚫" },
  D1: { group: "D", icon: "📋" },
  D2: { group: "D", icon: "✅" },
  E1: { group: "E", icon: "📝" },
};

const PROFILE_GROUPS = [
  ["cat_group_medical",      ["A1", "A2", "A3", "A4"]],
  ["cat_group_infection",    ["B1", "B2"]],
  ["cat_group_allergy",      ["C1"]],
  ["cat_group_careroutine",  ["D1", "D2"]],
  ["cat_group_unstructured", ["E1"]],
];

const CRITICALITY = {
  "442452003":     { key: "crit_life_threatening", cls: "life-threatening" },
  "59021000052107":{ key: "crit_harmful",          cls: "harmful" },
  "59031000052109":{ key: "crit_discomforting",    cls: "discomforting" },
  "high":          { key: "crit_high",             cls: "life-threatening" },
  "low":           { key: "crit_low",              cls: "discomforting" },
};

const DEFAULT_BASE = "https://umi.infopeak.se/fhir";

/* ── i18n ─────────────────────────────────────────────────── */
const TRANSLATIONS = {
  sv: {
    page_title: "Uppmärksamhetsinformation — demoportal",
    banner: "<strong>Demo</strong> — påhittad uppmärksamhetsinformation för testpersoner. Får inte användas för klinisk bedömning. Felaktigheter kan förekomma i såväl data, profiler som visualisering.",
    brand_title: "Uppmärksamhetsinformation",
    brand_sub: "Demoportal · HL7 Sverige FHIR-IG",

    tab_patients: "Patienter",
    tab_overview: "Översikt",
    tab_api: "API-exempel",
    tab_about: "Om",

    fhir_base_label: "FHIR-bas",
    server_status_ok: "Servern svarar",
    server_status_err: "Servern svarar inte",

    patients_heading: "Patienter",
    empty_select_patient: "Välj en patient i listan för att se uppmärksamhetsinformationen.",
    patient_not_found: "Patient hittades inte.",
    no_alerts: "Inga uppmärksamhetssignaler för denna patient.",

    gender_male: "Man", gender_female: "Kvinna", gender_other: "Annat", gender_unknown: "—",
    age_suffix: "år",
    born_prefix: "född",

    alert_banner_active_one: "Patienten har <strong>{count} aktiv uppmärksamhetssignal</strong>. Beakta denna innan vård och behandling.",
    alert_banner_active_many: "Patienten har <strong>{count} aktiva uppmärksamhetssignaler</strong>. Beakta dessa innan vård och behandling.",
    alert_banner_empty: "Ingen aktiv uppmärksamhetsinformation registrerad för denna patient.",

    cat_group_medical: "Medicinska tillstånd och behandlingar",
    cat_group_infection: "Smitta",
    cat_group_allergy: "Överkänslighet",
    cat_group_careroutine: "Särskild vårdrutin",
    cat_group_unstructured: "Ostrukturerad",

    flag_status_active: "Aktiv",
    flag_status_inactive: "Inaktiv",

    period_range: "{start} – {end}",
    period_from: "Från {date}",
    period_to: "Till {date}",

    loading_patients: "Hämtar patienter…",
    loading_data: "Hämtar data…",
    no_patients_loaded: "Inga patienter inlästa.",
    error_prefix: "Fel: {msg}",
    connection_error: "Kunde inte ansluta till FHIR-servern på <code>{base}</code>. Säkerställ att servern är uppe (<code>docker compose up -d</code>) och att data är laddat (<code>./scripts/load-data.sh</code>).",

    no_code_description: "(ingen kodbeskrivning)",
    free_text: "(fritext)",

    footer_brand: "HL7 Sverige · Vitalis 2026",
    footer_stats_one: "{patients} patient · {flags} flagga",
    footer_stats_many: "{patients} patienter · {flags} flaggor",

    run_button: "Kör",
    run_button_running: "Kör…",

    crit_life_threatening: "Livshotande",
    crit_harmful: "Skadlig",
    crit_discomforting: "Besvärande",
    crit_high: "Hög",
    crit_low: "Låg",

    crit_life_threatening_lc: "livshotande",
    crit_harmful_lc: "skadlig",
    crit_discomforting_lc: "besvärande",
    tooltip_active: "Aktiva signaler: {parts}",
    tooltip_none: "Ingen aktuell uppmärksamhetsinformation",
    tooltip_allergy_with_sev: "Överkänslighet ({sev})",
    tooltip_medical: "Medicinskt tillstånd och behandling",
    tooltip_infection: "Smitta",
    tooltip_careroutine: "Vårdrutinavvikelse",
    tooltip_unstructured: "Ej strukturanpassad uppmärksamhetsinformation",

    overview_h1: "Översikt",
    overview_intro: "Sammanställning av profilkoder och en tabellvy av samtliga laddade flaggor per testperson. Tio fiktiva patienter täcker alla tio uppmärksamhetsprofiler. Demodatat finns i <code>HAPI-server/data/</code> och laddas via <code>./scripts/load-data.sh</code>.",

    profilecodes_h2: "Profilkoder",
    th_code: "Kod",
    th_profile: "Profil",
    th_status: "Status",
    th_category: "Kategori",
    th_description: "Beskrivning",
    th_period: "Period",
    no_flags: "Inga flaggor.",

    profile_A1: "SEAlertInformation-1-OtherMedicalConditionFlag — Annat medicinskt tillstånd",
    profile_A2: "SEAlertInformation-2-TreatmentFlag — Behandling",
    profile_A3: "SEAlertInformation-3-PresenceOfGraftsConditionFlag — Förekomst av transplantat",
    profile_A4: "SEAlertInformation-4-PresenceOfImplantFlag — Förekomst av implantat",
    profile_B1: "SEAlertInformation-5-PresenceOfInfectiousAgentFlag — Förekomst av smittämne",
    profile_B2: "SEAlertInformation-6-PresenceOfContagiousDiseaseFlag — Förekomst av smittsam sjukdom",
    profile_C1: "SEAlertInformation-7-AllergyIntoleranceFlag — Överkänslighet",
    profile_D1: "SEAlertInformation-8-SpecialCareRoutineFlag — Information om särskild vårdrutin",
    profile_D2: "SEAlertInformation-9-DecisionSpecialCareRoutineFlag — Beslut om särskild vårdrutin",
    profile_E1: "SEAlertInformation-10-UnstructuredFlag — Ostrukturerad uppmärksamhetsinformation",

    api_h1: "API-exempel",
    api_intro: "HAPI-servern svarar på <code>GET</code>, <code>POST</code>, <code>PUT</code> och <code>DELETE</code> enligt FHIR R4. Klicka <strong>Kör</strong> för att utföra anropet mot servern och se svaret nedan.",

    api_metadata_t: "Servermetadata",
    api_metadata_d: "CapabilityStatement från servern.",
    api_patients_t: "Alla patienter",
    api_patients_d: "Hämta de första 20 patienterna.",
    api_patient_pnr_t: "Sök patient på personnummer",
    api_patient_pnr_d: "Identifierare med Inera-OID 1.2.752.129.2.1.3.1.",
    api_active_flags_t: "Aktiva flaggor för en patient",
    api_active_flags_d: "Filtrera på subject och status.",
    api_allergies_t: "Alla allergier (kategori C1)",
    api_allergies_d: "Filtrera på category.",
    api_infection_t: "Smitta (B1 + B2)",
    api_infection_d: "Sammanfattning av alla smittor i populationen.",
    api_include_t: "Flaggor med tillhörande patient",
    api_include_d: "Använd _include för att få med Patient-resursen i samma svar.",
    api_snomed_t: "Sök på SNOMED-kod",
    api_snomed_d: "Hitta alla flaggor med en specifik SCT-kod.",
    api_everything_t: "Allt om en patient ($everything)",
    api_everything_d: "Patient + alla relaterade resurser i en bundle.",
    api_profiles_t: "Alla profiler",
    api_profiles_d: "StructureDefinitions som finns på servern.",
    api_valuesets_t: "Tillgängliga value sets",
    api_valuesets_d: "Lista alla värdemängder.",
    api_searchparams_t: "Sökparametrar för Flag",
    api_searchparams_d: "Vilka sökparametrar stöds av servern för Flag-resursen?",

    about_h1: "Om demoportalen",
    about_intro: "Den här portalen är en del av <code>hl7.fhir.r4.ig.medicalalertinformation-server</code> — en demonstrationsmiljö för den svenska FHIR Implementation Guide:n för uppmärksamhetsinformation. Den visualiserar data från en lokalt körande HAPI FHIR-server.",

    disclaimer_h2: "Friskrivning",
    disclaimer_li1: "<strong>Demomiljö, inte produktion.</strong> All patientdata är fiktiv och påhittad för demosyften. Personnummer och namn motsvarar inte verkliga personer.",
    disclaimer_li2: "<strong>Får inte användas för klinisk bedömning</strong> eller som beslutsstöd i vården. Det här är en hackathon-prototyp.",
    disclaimer_li3: "<strong>Felaktigheter kan förekomma</strong> — i exempeldatat, i profilerna, i kodverk och värdemängder, i FHIR-anropen samt i visualiseringen. IG:n är under aktiv utveckling och inte publicerad i normativ form.",
    disclaimer_li4: "<strong>Symbolen</strong> bygger på <a href=\"https://github.com/oskthu2/uppmarksamhetssymbol\" target=\"_blank\" rel=\"noopener\">oskthu2/uppmarksamhetssymbol</a> (CC0). Hur fält tänds utifrån FHIR-data är vår tolkning och kan skilja sig från hur Inera/NPÖ visar motsvarande information.",

    about_alert_h2: "Uppmärksamhetsinformation",
    about_alert_p: "Uppmärksamhetsinformation är data om patientens särskilda behov, risker eller förhållanden som vården behöver känna till. Den gör vården säkrare genom att lyfta fram information som annars riskerar att missas — överkänslighet, smitta, implantat, transplantat, sällsynta diagnoser, pågående behandlingar med särskilda hänsyn, och beslut om särskilda vårdrutiner.",
    about_profile_h2: "Profilstruktur",
    about_profile_p: "FHIR-resursen <code>Flag</code> bär uppmärksamhetssignalen. Tio specialiserade profiler representerar de tio typerna i Socialstyrelsens informationsspecifikation. Vissa har tillhörande <code>Observation</code>-resurser med detaljerad klinisk information.",
    about_source_h2: "Källkod",
    about_source_p: "Repot finns på <a href=\"https://github.com/Tho-Sil/hl7.fhir.r4.ig.medicalalertinformation-server\" target=\"_blank\" rel=\"noopener\">GitHub</a>.",
    about_contact_h2: "Kontakt",
    about_contact_p: "Frågor om IG:n: <a href=\"mailto:claudia.ehrentraut@regionstockholm.se\">Claudia Ehrentraut</a>, projektledare för arbetsgruppen för uppmärksamhetsinformation.",
  },

  en: {
    page_title: "Alert information — demo portal",
    banner: "<strong>Demo</strong> — fictional alert information for test persons. Must not be used for clinical assessment. Errors may occur in data, profiles, and the visualisation.",
    brand_title: "Alert Information",
    brand_sub: "Demo portal · HL7 Sweden FHIR IG",

    tab_patients: "Patients",
    tab_overview: "Overview",
    tab_api: "API examples",
    tab_about: "About",

    fhir_base_label: "FHIR base",
    server_status_ok: "Server is responding",
    server_status_err: "Server is not responding",

    patients_heading: "Patients",
    empty_select_patient: "Select a patient from the list to view their alert information.",
    patient_not_found: "Patient not found.",
    no_alerts: "No alert signals for this patient.",

    gender_male: "Male", gender_female: "Female", gender_other: "Other", gender_unknown: "—",
    age_suffix: "yrs",
    born_prefix: "born",

    alert_banner_active_one: "The patient has <strong>{count} active alert signal</strong>. Take this into account before care and treatment.",
    alert_banner_active_many: "The patient has <strong>{count} active alert signals</strong>. Take these into account before care and treatment.",
    alert_banner_empty: "No active alert information registered for this patient.",

    cat_group_medical: "Medical conditions and treatments",
    cat_group_infection: "Infection",
    cat_group_allergy: "Hypersensitivity",
    cat_group_careroutine: "Special care routine",
    cat_group_unstructured: "Unstructured",

    flag_status_active: "Active",
    flag_status_inactive: "Inactive",

    period_range: "{start} – {end}",
    period_from: "From {date}",
    period_to: "Until {date}",

    loading_patients: "Loading patients…",
    loading_data: "Loading data…",
    no_patients_loaded: "No patients loaded.",
    error_prefix: "Error: {msg}",
    connection_error: "Could not connect to the FHIR server at <code>{base}</code>. Make sure the server is running (<code>docker compose up -d</code>) and that data has been loaded (<code>./scripts/load-data.sh</code>).",

    no_code_description: "(no code description)",
    free_text: "(free text)",

    footer_brand: "HL7 Sweden · Vitalis 2026",
    footer_stats_one: "{patients} patient · {flags} flag",
    footer_stats_many: "{patients} patients · {flags} flags",

    run_button: "Run",
    run_button_running: "Running…",

    crit_life_threatening: "Life-threatening",
    crit_harmful: "Harmful",
    crit_discomforting: "Discomforting",
    crit_high: "High",
    crit_low: "Low",

    crit_life_threatening_lc: "life-threatening",
    crit_harmful_lc: "harmful",
    crit_discomforting_lc: "discomforting",
    tooltip_active: "Active signals: {parts}",
    tooltip_none: "No current alert information",
    tooltip_allergy_with_sev: "Hypersensitivity ({sev})",
    tooltip_medical: "Medical condition and treatment",
    tooltip_infection: "Infection",
    tooltip_careroutine: "Care-routine deviation",
    tooltip_unstructured: "Unstructured alert information",

    overview_h1: "Overview",
    overview_intro: "Profile-code reference and a tabular view of every loaded flag per test person. Ten fictional patients cover all ten alert-information profiles. The demo data lives in <code>HAPI-server/data/</code> and is loaded via <code>./scripts/load-data.sh</code>.",

    profilecodes_h2: "Profile codes",
    th_code: "Code",
    th_profile: "Profile",
    th_status: "Status",
    th_category: "Category",
    th_description: "Description",
    th_period: "Period",
    no_flags: "No flags.",

    profile_A1: "SEAlertInformation-1-OtherMedicalConditionFlag — Other medical condition",
    profile_A2: "SEAlertInformation-2-TreatmentFlag — Treatment",
    profile_A3: "SEAlertInformation-3-PresenceOfGraftsConditionFlag — Presence of transplant",
    profile_A4: "SEAlertInformation-4-PresenceOfImplantFlag — Presence of implant",
    profile_B1: "SEAlertInformation-5-PresenceOfInfectiousAgentFlag — Presence of infectious agent",
    profile_B2: "SEAlertInformation-6-PresenceOfContagiousDiseaseFlag — Presence of contagious disease",
    profile_C1: "SEAlertInformation-7-AllergyIntoleranceFlag — Hypersensitivity",
    profile_D1: "SEAlertInformation-8-SpecialCareRoutineFlag — Information that may lead to a special care routine",
    profile_D2: "SEAlertInformation-9-DecisionSpecialCareRoutineFlag — Decision that may lead to a special care routine",
    profile_E1: "SEAlertInformation-10-UnstructuredFlag — Unstructured alert information",

    api_h1: "API examples",
    api_intro: "The HAPI server responds to <code>GET</code>, <code>POST</code>, <code>PUT</code> and <code>DELETE</code> per FHIR R4. Click <strong>Run</strong> to execute the request and see the response below.",

    api_metadata_t: "Server metadata",
    api_metadata_d: "CapabilityStatement from the server.",
    api_patients_t: "All patients",
    api_patients_d: "Fetch the first 20 patients.",
    api_patient_pnr_t: "Search patient by personal-identity number",
    api_patient_pnr_d: "Identifier with the Inera OID 1.2.752.129.2.1.3.1.",
    api_active_flags_t: "Active flags for a patient",
    api_active_flags_d: "Filter by subject and status.",
    api_allergies_t: "All allergies (category C1)",
    api_allergies_d: "Filter by category.",
    api_infection_t: "Infection (B1 + B2)",
    api_infection_d: "Summary of all infections in the population.",
    api_include_t: "Flags with their patient included",
    api_include_d: "Use _include to bring back the Patient resource in the same response.",
    api_snomed_t: "Search on a SNOMED code",
    api_snomed_d: "Find every flag with a specific SCT code.",
    api_everything_t: "Everything about a patient ($everything)",
    api_everything_d: "Patient + all related resources in one bundle.",
    api_profiles_t: "All profiles",
    api_profiles_d: "StructureDefinitions present on the server.",
    api_valuesets_t: "Available value sets",
    api_valuesets_d: "List all value sets.",
    api_searchparams_t: "Search parameters for Flag",
    api_searchparams_d: "Which search parameters does the server support for the Flag resource?",

    about_h1: "About the demo portal",
    about_intro: "This portal is part of <code>hl7.fhir.r4.ig.medicalalertinformation-server</code> — a demonstration environment for the Swedish FHIR Implementation Guide for alert information (uppmärksamhetsinformation). It visualises data from a locally running HAPI FHIR server.",

    disclaimer_h2: "Disclaimer",
    disclaimer_li1: "<strong>Demo environment, not production.</strong> All patient data is fictional, fabricated for demonstration. The identity numbers and names do not correspond to real persons.",
    disclaimer_li2: "<strong>Must not be used for clinical assessment</strong> or as decision support in care. This is a hackathon prototype.",
    disclaimer_li3: "<strong>Errors may occur</strong> — in the example data, the profiles, code systems and value sets, the FHIR calls, and in the visualisation. The IG is under active development and not published in a normative form.",
    disclaimer_li4: "<strong>The symbol</strong> is built on <a href=\"https://github.com/oskthu2/uppmarksamhetssymbol\" target=\"_blank\" rel=\"noopener\">oskthu2/uppmarksamhetssymbol</a> (CC0). How fields are lit based on the FHIR data is our interpretation and may differ from how Inera / NPÖ shows the corresponding information.",

    about_alert_h2: "Alert information",
    about_alert_p: "Alert information represents data about a patient's special needs, risks, or circumstances that healthcare needs to be aware of. It makes care safer by surfacing information that would otherwise risk being missed — hypersensitivity, infection, implants, transplants, rare diagnoses, ongoing treatments requiring special precautions, and decisions about special care routines.",
    about_profile_h2: "Profile structure",
    about_profile_p: "The FHIR <code>Flag</code> resource carries the alert signal. Ten specialised profiles represent the ten types in the Swedish National Board of Health and Welfare's information specification. Some have associated <code>Observation</code> resources with detailed clinical content.",
    about_source_h2: "Source code",
    about_source_p: "The repository is on <a href=\"https://github.com/Tho-Sil/hl7.fhir.r4.ig.medicalalertinformation-server\" target=\"_blank\" rel=\"noopener\">GitHub</a>.",
    about_contact_h2: "Contact",
    about_contact_p: "Questions about the IG: <a href=\"mailto:claudia.ehrentraut@regionstockholm.se\">Claudia Ehrentraut</a>, project manager for the alert information working group.",
  },
};

function detectLang() {
  const stored = localStorage.getItem("lang");
  if (stored === "sv" || stored === "en") return stored;
  return (navigator.language || "sv").toLowerCase().startsWith("en") ? "en" : "sv";
}

function t(key, vars = {}) {
  const dict = TRANSLATIONS[state.lang] || TRANSLATIONS.sv;
  let s = dict[key] ?? TRANSLATIONS.sv[key] ?? `[${key}]`;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(v);
  }
  return s;
}

function applyTranslations() {
  document.documentElement.lang = state.lang;
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of document.querySelectorAll("[data-i18n-html]")) {
    el.innerHTML = t(el.dataset.i18nHtml);
  }
  document.title = t("page_title");
  for (const btn of document.querySelectorAll(".lang-btn")) {
    btn.classList.toggle("active", btn.dataset.lang === state.lang);
  }
}

let state = {
  base: localStorage.getItem("fhirBase") || DEFAULT_BASE,
  lang: detectLang(),
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

function initLang() {
  $$(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      localStorage.setItem("lang", state.lang);
      applyTranslations();
      // Re-render any dynamic content so translated strings reach it
      if (state.patients.length) renderPatientList();
      if (state.selectedPatientId) renderPatientDetail(state.selectedPatientId);
      if (state.patients.length) renderTestPatientDocs();
      renderApiExamples();
      updateFooterStats();
    });
  });
}

function updateFooterStats() {
  const pats = state.patients.length;
  const flags = [...state.flagsByPatient.values()].reduce((n, a) => n + a.length, 0);
  if (pats === 0) { $("#footerStats").textContent = ""; return; }
  const key = (pats === 1 && flags === 1) ? "footer_stats_one" : "footer_stats_many";
  $("#footerStats").textContent = t(key, { patients: pats, flags });
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
    dot.title = t("server_status_ok");
  } catch (e) {
    dot.classList.add("err"); dot.classList.remove("ok");
    dot.title = t("server_status_err") + " (" + (e.message || e) + ")";
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
  $("#patientList").innerHTML = `<div class="loading"><span class="spinner"></span>${escapeHtml(t("loading_patients"))}</div>`;
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
    updateFooterStats();
    if (state.patients.length && !state.selectedPatientId) {
      selectPatient(state.patients[0].id);
    } else if (state.selectedPatientId) {
      selectPatient(state.selectedPatientId);
    }
  } catch (e) {
    $("#patientList").innerHTML = `<div class="loading" style="color:var(--critical)">${escapeHtml(t("error_prefix", { msg: e.message }))}</div>`;
    $("#patientDetail").innerHTML = `<div class="empty-state"><p>${t("connection_error", { base: escapeHtml(state.base) })}</p></div>`;
  }
}

/* ── Patient list ─────────────────────────────────────────── */
function renderPatientList() {
  const list = $("#patientList");
  if (!state.patients.length) {
    list.innerHTML = `<div class="loading">${escapeHtml(t("no_patients_loaded"))}</div>`;
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
    detail.innerHTML = `<div class="empty-state"><p>${escapeHtml(t("patient_not_found"))}</p></div>`;
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
          <span>${escapeHtml(formatGender(gender))}</span>
          <span>${age ? escapeHtml(age + " " + t("age_suffix")) : ""}</span>
          <span>${birthDate ? escapeHtml(t("born_prefix") + " " + birthDate) : ""}</span>
        </div>
      </div>
      ${symbol}
    </div>`;

  const banner = activeCount > 0
    ? `<div class="alert-banner">
        <span class="alert-banner-icon">⚠️</span>
        <span>${t(activeCount === 1 ? "alert_banner_active_one" : "alert_banner_active_many", { count: activeCount })}</span>
      </div>`
    : `<div class="alert-banner empty">
        <span class="alert-banner-icon">✓</span>
        <span>${escapeHtml(t("alert_banner_empty"))}</span>
      </div>`;

  // group flags by category code
  const byCat = new Map();
  for (const f of flags) {
    const code = f.category?.[0]?.coding?.find(c => c.system === CATEGORY_CS)?.code
              || f.category?.[0]?.coding?.[0]?.code || "?";
    if (!byCat.has(code)) byCat.set(code, []);
    byCat.get(code).push(f);
  }

  const groups = PROFILE_GROUPS.map(([groupKey, codes]) => {
    const groupFlags = codes.flatMap(c => byCat.get(c) || []);
    if (!groupFlags.length) return "";
    const groupLetter = CATEGORIES[codes[0]].group;
    return `
      <div class="category-group category-${groupLetter}">
        <div class="category-header">
          <div class="category-icon">${CATEGORIES[codes[0]].icon}</div>
          <div class="category-title">${escapeHtml(t(groupKey))}</div>
          <div class="category-count">${groupFlags.length}</div>
        </div>
        <div class="flag-list">
          ${groupFlags.map(renderFlag).join("")}
        </div>
      </div>`;
  }).filter(Boolean).join("");

  detail.innerHTML = header + banner + (groups || `
    <div class="empty-state"><p>${escapeHtml(t("no_alerts"))}</p></div>`);
}

/* ── Uppmärksamhetssymbol ─────────────────────────────────
 * Geometry from oskthu2/uppmarksamhetssymbol (CC0).
 * Field codes:
 *   1 = top bar   |  0 = horizontal stripes  |  4 = bottom dot
 *   2 = NE wedge  |  3 = SE wedge
 *   5 = SW wedge  |  6 = NW wedge
 * Mapping to alert categories:
 *   C1 allergy   → 1 (livshotande) | 0 (skadlig) | 4 (besvärande)
 *   A* medical   → 2 (NE)
 *   B* infection → 5 (SW)
 *   D* careroute → 3 (SE)
 *   E* unstrukt. → 6 (NW)
 * ────────────────────────────────────────────────────────── */
const UMI_SVG = {
  outlineOuter: "M 1627 991 L 2010 1204 L 1718 1733 L 1333 1519 L 1333 1983 L 677 1983 L 677 1519 L 292 1733 L 0 1204 L 383 991 L 0 778 L 292 248 L 677 463 L 677 0 L 1333 0 L 1333 463 L 1718 249 L 2010 778 Z",
  outlineInner: "M 1556 991 L 1964 764 L 1704 295 L 1299 520 L 1299 34 L 711 34 L 711 520 L 305 295 L 46 764 L 453 991 L 46 1218 L 305 1687 L 711 1461 L 711 1949 L 1299 1949 L 1299 1461 L 1704 1687 L 1964 1217 Z",
  fields: {
    "1": "M 736 60 L 1274 60 L 1274 740 L 736 740 Z",
    "0": "M 736 820 L 1274 820 L 1274 890 L 736 890 Z M 736 950 L 1274 950 L 1274 1020 L 736 1020 Z M 736 1080 L 1274 1080 L 1274 1150 L 736 1150 Z M 736 1210 L 1274 1210 L 1274 1280 L 736 1280 Z",
    "4": "M 740 1640 a 265 265 0 1 0 530 0 a 265 265 0 1 0 -530 0 Z",
    "2": "M 1310 545 L 1680 340 L 1920 770 L 1530 970 L 1310 880 Z",
    "3": "M 1530 1012 L 1920 1212 L 1680 1642 L 1310 1437 L 1310 1102 Z",
    "5": "M 480 1012 L 90 1212 L 330 1642 L 700 1437 L 700 1102 Z",
    "6": "M 700 545 L 330 340 L 90 770 L 480 970 L 700 880 Z",
  },
  colors: {
    "0": "#B60606", "1": "#B60606", "4": "#FA7070",
    "2": "#B60606", "3": "#05598A", "5": "#E1A100", "6": "#B60606",
  },
  off: "#ffffff",
  outline: "#1a1a1a",
};

function umiActiveFields(flags) {
  const active = flags.filter(f => f.status === "active");
  const fields = new Set();
  let allergySev = null;
  const SR = { "life-threatening": 3, "harmful": 2, "discomforting": 1 };

  for (const f of active) {
    const code = f.category?.[0]?.coding?.find(c => c.system === CATEGORY_CS)?.code
              || f.category?.[0]?.coding?.[0]?.code;
    if (!code) continue;
    if (code.startsWith("A")) fields.add("2");
    else if (code.startsWith("B")) fields.add("5");
    else if (code.startsWith("D")) fields.add("3");
    else if (code.startsWith("E")) fields.add("6");
    else if (code === "C1") {
      const ext = (f.extension || []).find(e => e.url === CRIT_LEVEL_EXT);
      const cc = ext?.valueCodeableConcept?.coding?.[0]?.code;
      const sev = CRITICALITY[cc]?.cls;
      if (sev && (!allergySev || SR[sev] > SR[allergySev])) allergySev = sev;
    }
  }
  if ([...active].some(f => (f.category?.[0]?.coding?.find(c => c.system === CATEGORY_CS)?.code) === "C1") && !allergySev) {
    allergySev = "discomforting";
  }
  // Allergy severity is cumulative (matches oskthu2 convention: Signal.014 = livshotande)
  if (allergySev === "life-threatening") { fields.add("1"); fields.add("0"); fields.add("4"); }
  else if (allergySev === "harmful")     { fields.add("0"); fields.add("4"); }
  else if (allergySev === "discomforting") fields.add("4");

  return { fields, allergySev };
}

function umiSvg(activeFields, opts = {}) {
  const cls = opts.className || "alert-symbol";
  const aria = opts.ariaLabel || "Uppmärksamhetssignal";
  const off = opts.off || UMI_SVG.off;
  const fieldsHtml = Object.keys(UMI_SVG.fields).map(code => {
    const fill = activeFields.has(code) ? UMI_SVG.colors[code] : off;
    return `<path d="${UMI_SVG.fields[code]}" fill="${fill}" data-field="${code}"/>`;
  }).join("");
  // Outline: outer minus inner via evenodd
  return `<svg class="${cls}" viewBox="0 0 2010 1983" xmlns="http://www.w3.org/2000/svg" aria-label="${aria}">
    <path d="${UMI_SVG.outlineInner}" fill="#ffffff"/>
    ${fieldsHtml}
    <path d="${UMI_SVG.outlineOuter} ${UMI_SVG.outlineInner}" fill="${UMI_SVG.outline}" fill-rule="evenodd"/>
  </svg>`;
}

function renderAlertSymbol(flags) {
  const { fields, allergySev } = umiActiveFields(flags);
  const tooltip = umiTooltip(fields, allergySev);
  return `<div class="alert-symbol-wrap" title="${escapeHtml(tooltip)}">
    ${umiSvg(fields)}
  </div>`;
}

function renderAlertSymbolMini(flags) {
  const { fields } = umiActiveFields(flags);
  return umiSvg(fields, { className: "alert-symbol-mini", ariaLabel: "" });
}

function umiTooltip(fields, allergySev) {
  const parts = [];
  if (allergySev) {
    const sevKey = ({ "life-threatening": "crit_life_threatening_lc",
                      "harmful": "crit_harmful_lc",
                      "discomforting": "crit_discomforting_lc" })[allergySev];
    parts.push(t("tooltip_allergy_with_sev", { sev: t(sevKey) }));
  }
  if (fields.has("2")) parts.push(t("tooltip_medical"));
  if (fields.has("5")) parts.push(t("tooltip_infection"));
  if (fields.has("3")) parts.push(t("tooltip_careroutine"));
  if (fields.has("6")) parts.push(t("tooltip_unstructured"));
  return parts.length
    ? t("tooltip_active", { parts: parts.join(" · ") })
    : t("tooltip_none");
}

function renderFlag(flag) {
  const status = flag.status || "active";
  const text = flag.code?.text || flag.code?.coding?.[0]?.display || t("no_code_description");
  const codings = flag.code?.coding || [];
  const inactiveCls = status !== "active" ? " inactive" : "";

  const crit = (flag.extension || []).find(e => e.url === CRIT_LEVEL_EXT);
  const critCode = crit?.valueCodeableConcept?.coding?.[0]?.code;
  const critInfo = critCode ? CRITICALITY[critCode] : null;
  const critPill = critInfo
    ? `<div class="criticality-pill ${critInfo.cls}">${escapeHtml(t(critInfo.key))}</div>`
    : "";

  const period = formatPeriod(flag.period);
  const codeChips = codings.map(c =>
    `<span class="flag-code-chip">${escapeHtml(shortSystem(c.system))} · ${escapeHtml(c.code)}</span>`).join("");
  const display = codings[0]?.display && codings[0].display !== text
    ? `<div class="flag-display">${escapeHtml(codings[0].display)}</div>`
    : "";

  const statusLabel = status === "active" ? t("flag_status_active") : t("flag_status_inactive");
  return `<div class="flag-item${inactiveCls}">
    <div class="flag-status-pill ${status}">${escapeHtml(statusLabel)}</div>
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
    root.innerHTML = `<p class="loading"><span class="spinner"></span>${escapeHtml(t("loading_data"))}</p>`;
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
          <thead><tr><th>${escapeHtml(t("th_status"))}</th><th>${escapeHtml(t("th_category"))}</th><th>${escapeHtml(t("th_code"))}</th><th>${escapeHtml(t("th_description"))}</th><th>${escapeHtml(t("th_period"))}</th></tr></thead>
          <tbody>
            ${flags.length === 0 ? `<tr><td colspan="5" style="color:var(--text-subtle)">${escapeHtml(t("no_flags"))}</td></tr>` :
              flags.map(f => {
                const cat = f.category?.[0]?.coding?.find(c => c.system === CATEGORY_CS)?.code || "?";
                const catLetter = (cat[0] || "").toUpperCase();
                const c = f.code?.coding?.[0];
                const codeStr = c ? `${shortSystem(c.system)} ${c.code}` : t("free_text");
                const statusLabel = f.status === "active" ? t("flag_status_active") : t("flag_status_inactive");
                return `<tr>
                  <td><span class="flag-status-pill ${f.status}">${escapeHtml(statusLabel)}</span></td>
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
  { titleKey: "api_metadata_t",     descKey: "api_metadata_d",     method: "GET", path: "/metadata" },
  { titleKey: "api_patients_t",     descKey: "api_patients_d",     method: "GET", path: "/Patient?_count=20" },
  { titleKey: "api_patient_pnr_t",  descKey: "api_patient_pnr_d",  method: "GET", path: "/Patient?identifier=urn:oid:1.2.752.129.2.1.3.1%7C194506121518" },
  { titleKey: "api_active_flags_t", descKey: "api_active_flags_d", method: "GET", path: "/Flag?subject=Patient/pat-johnbob&status=active" },
  { titleKey: "api_allergies_t",    descKey: "api_allergies_d",    method: "GET", path: "/Flag?category=C1" },
  { titleKey: "api_infection_t",    descKey: "api_infection_d",    method: "GET", path: "/Flag?category=B1,B2&status=active" },
  { titleKey: "api_include_t",      descKey: "api_include_d",      method: "GET", path: "/Flag?category=C1&_include=Flag:subject" },
  { titleKey: "api_snomed_t",       descKey: "api_snomed_d",       method: "GET", path: "/Flag?code=http://snomed.info/sct%7C111088007" },
  { titleKey: "api_everything_t",   descKey: "api_everything_d",   method: "GET", path: "/Patient/pat-gunnar/$everything" },
  { titleKey: "api_profiles_t",     descKey: "api_profiles_d",     method: "GET", path: "/StructureDefinition?_count=50" },
  { titleKey: "api_valuesets_t",    descKey: "api_valuesets_d",    method: "GET", path: "/ValueSet?_count=50" },
  { titleKey: "api_searchparams_t", descKey: "api_searchparams_d", method: "GET", path: "/SearchParameter?base=Flag" },
];

function renderApiExamples() {
  const root = $("#apiExamples");
  root.innerHTML = API_EXAMPLES.map((ex, i) => `
    <div class="api-card" data-i="${i}">
      <div class="api-card-header">
        <div class="api-card-title">${escapeHtml(t(ex.titleKey))}</div>
        <div class="api-card-desc">${escapeHtml(t(ex.descKey))}</div>
      </div>
      <div class="api-card-body">
        <div class="api-method-line">
          <span class="method-pill ${ex.method}">${ex.method}</span>
          <code class="api-url">${escapeHtml(ex.path)}</code>
          <button class="api-run">${escapeHtml(t("run_button"))}</button>
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
      btn.textContent = t("run_button_running");
      out.classList.remove("error");
      out.classList.add("show");
      out.textContent = "";
      try {
        const r = await fetch(state.base + ex.path, { headers: { Accept: "application/fhir+json" } });
        const text = await r.text();
        let pretty = text;
        try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
        const truncSuffix = state.lang === "en" ? "[truncated]" : "[trunkerat]";
        out.textContent = `HTTP ${r.status} ${r.statusText}\n\n${pretty.slice(0, 8000)}`
          + (pretty.length > 8000 ? `\n\n… ${truncSuffix}` : "");
        if (!r.ok) out.classList.add("error");
      } catch (e) {
        out.textContent = t("error_prefix", { msg: e.message });
        out.classList.add("error");
      } finally {
        btn.disabled = false;
        btn.textContent = t("run_button");
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
  const key = ({ male: "gender_male", female: "gender_female", other: "gender_other", unknown: "gender_unknown" })[g];
  return key ? t(key) : g;
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
  if (period.start && period.end) return t("period_range", { start: period.start, end: period.end });
  if (period.start) return t("period_from", { date: period.start });
  if (period.end) return t("period_to", { date: period.end });
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
applyTranslations();
initTabs();
initLang();
initServer();
bootstrap();
