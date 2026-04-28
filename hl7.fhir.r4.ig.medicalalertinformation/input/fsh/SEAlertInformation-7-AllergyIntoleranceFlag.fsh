Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10

Profile: SEAlertInformation-7-AllergyIntoleranceFlag
Parent: SEAlertInformationFlag
Title: "SE AlertInformation 7 Allergy Intolerance Flag Profile"
Description: "Indicates a hypersensitivity to a specific chemical, active substance, excipient, or a specific medicinal product. Attention information regarding hypersensitivity is considered current if there is a documented occurrence of the hypersensitivity, and no later record indicating that the patient is no longer hypersensitive.

[Mapping to UMI](StructureDefinition-SEAlertInformation-7-AllergyIntoleranceFlag-mappings.html)"
* code from SEAlertInformationChemicalAllergySnomedVS (required)
* subject only Reference(SEAlertInformationPatient)
* category = #C1 "Hypersensitivity condition"
// * category = #C1 "Overkanslighetstillstand"
* extension[flag-detail] 0..0
* extension[criticalityLevel] 0..0

ValueSet: SEAlertInformationChemicalAllergySnomedVS
Id: 59871000052102
// Title: "Urval kemikalieöverkänsligheter, uppmärksamhetsinformation"
Title: "Selection of chemical allergies, alert information"
* include $SCT#373568007 "klorhexidin"
* include $SCT#111088007 "latex"
* include $SCT#281000220103 "taurolidin"

Mapping:  SEAlertInformation-7-AllergyIntoleranceFlagToUMI
Source:   SEAlertInformation-7-AllergyIntoleranceFlag
Target:   "UMI"
Id:       UMI
Title:    "UMI"
Description: "Description..."
* code -> "Aktiv substans(Resurs).typ, Hjälpämne läkemedel(Resurs).typ, Uppmärksamhetsinformation Överkänslighet kemikalier (OID saknas)"
* status -> "Överkänslighetstillstånd(Observation).negation. Om negation = true → inactive, om negation = false → active."
* period.start -> "Överkänslighetstillstånd(Observation).tid" 
* subject -> "Patient"
* category -> "Typ av uppmärksamhetsinformation (huvudgrupp)"
