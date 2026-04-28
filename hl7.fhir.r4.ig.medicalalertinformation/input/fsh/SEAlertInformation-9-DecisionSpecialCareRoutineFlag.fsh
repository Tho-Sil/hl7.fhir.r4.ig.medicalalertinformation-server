Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10

Profile: SEAlertInformation-9-DecisionSpecialCareRoutineFlag
Parent: SEAlertInformationFlag
// Title: "Beslut som kan leda till särskild vårdrutin"
Title: "Decision that may require special care routine"
// Description: "Profil för att hantera uppmärksamhetssignalen Beslut som kan leda till särskild vårdrutin."
Description: "Indicates a decision that may lead to special care routines for the patient, such as specific interventions or treatments based on the patient’s condition or needs.

[Mapping to UMI](StructureDefinition-SEAlertInformation-9-DecisionSpecialCareRoutineFlag-mappings.html)"
* code from SEAlertInformationDecisionSpecialCareRoutineSnomedCT (required)
* subject only Reference(SEAlertInformationPatient)
* category = #D2 "Decision that can lead to special care routine"
// * category = #D2 "Beslut som kan leda till sarskild vardrutin"
* extension[flag-detail] 0..0
* extension[criticalityLevel] 0..0

ValueSet: SEAlertInformationDecisionSpecialCareRoutineICD10SE
// Title: "ICD-10-SE koder för beslut om särskild vårdrutin"
Title: "ICD-10-SE codes for decision about special care routine"
// Description: "Urval av ICD-10-SE koder relaterade till beslut om särskild vårdrutin."
Description: "Selection of ICD-10-SE codes related to decision about special care routine."
* include $ICD#Z22.3 "Bärare av Staphylococcus aureus"
* include $ICD#Z22.1 "Bärare av vancomycinresistenta enterokocker"
* include $ICD#Z22.2 "Bärare av ESBL-producerande bakterier"
* include $ICD#Z22.4 "Bärare av multiresistenta bakterier"

ValueSet: SEAlertInformationDecisionSpecialCareRoutineSnomedCT
// Title: "Snomed CT koder för beslut om särskild vårdrutin"
Title: "Snomed CT codes for decision about special care routine"
// Description: "Urval av Snomed CT koder relaterade till beslut om särskild vårdrutin."
Description: "Selection of Snomed CT codes related to decision about special care routine."
* include $SCT#432415000 "barare av meticillinresistent Staphylococcus aureus"
* include $SCT#431109006 "barare av vankomycinresistenta enterokocker"
* include $SCT#762988003 "barare av ESBL-producerande bakterier"
* include $SCT#61751000052107 "barare av ESBL- och karbapenemasproducerande bakterier"

Mapping:  SEAlertInformation-9-DecisionSpecialCareRoutineFlagToUMI
Source:   SEAlertInformation-9-DecisionSpecialCareRoutineFlag
Target:   "UMI"
Id:       UMI
Title:    "UMI"
Description: "Description..."
* code -> "Urval särskilda vårdrutiner utifrån fattade beslut, uppmärksamhetsinformation (103491000052103)"
* status -> "Beslut som kan leda till särskild vårdrutin(Beslut).bifall. Om bifall = true → active, om bifall = false → inactive."
* period.start -> "Beslut som kan leda till särskild vårdrutin(Beslut).tidpunkt" 
* subject -> "Patient"
* category -> "Typ av uppmärksamhetsinformation (huvudgrupp)"