// // This FSH defines a profile for an Active Pharmaceutical Ingredient (API) Flag, 
// // used as part of Swedish Alert Information. It extends SEAlertInformationFlag.

// Alias: $SCT = http://snomed.info/sct
// Alias: $ICD = http://hl7.org/fhir/sid/icd-10
// Alias: $ATC = https://nzhts.digital.health.nz/fhir/ValueSet/atc-code

// Profile: SEAlertInformationActivePharmaceuticalIngredientFlag
// Parent: SEAlertInformationFlag  // Inherits properties from the base Alert Information Flag profile
// Title: "SE AlertInformation Active Pharmaceutical Ingredient Flag Profile"
// Description: "Swedish profile of the Flag resource used for alert information about active pharmaceutical ingredients."
// * code from SEAlertInformationActivePharmaceuticalIngredientVS (required) // The flag's code MUST come from this valueset.
// * subject only Reference(SEAlertInformationPatient)  // Subject must be a reference to a patient record.
// * category = #A // Category is set to 'Alert'. This can be adjusted if needed.
// * extension[flag-detail].valueReference only Reference(Observation) // The flag detail should be an observation (e.g., medication administration, prescription).

// Instance: SEAlertInformationActivePharmaceuticalIngredientFlagExample
// InstanceOf: SEAlertInformationFlag
// Description: "An example of the Swedish profile for the Active Pharmaceutical Ingredient Flag resource."
// * status = #active  // Example instance is active.
// * code = $ATC#N06BA01 "Omeprazol" // Example API - Omeprazole (using ATC code)
// * extension[flag-detail].valueReference = Reference(SEAlertInformationMedicationAdministrationExample) "Medicinadministrering med Omeprazol"  // Link to a medication administration observation.
// * subject = Reference(SEAlertInformationPatientExample) // Example patient reference

// ValueSet: SEAlertInformationActivePharmaceuticalIngredientVS
// Id: 1.2.752.116.3.1.16.1.4 // Unique identifier for the valueset.  Adjust as needed within your system.
// Title: "Uppmärksamhetsinformation Aktiv Farmaceutisk Ingrediens"
// Description: "Codes in Snomed CT and ATC representing active pharmaceutical ingredients used for alert information."

// // Include codes from various sources.  Expand this list significantly based on requirements.
// * include $ATC#N06BA01 "Omeprazol" // Example - Add more ATC codes here
// * include $SCT#437985002 "Pantoprazol" //Example Snomed CT code

// //Consider adding ICD-10 codes if relevant to the alert context.  For example, for adverse drug reactions or related conditions.
