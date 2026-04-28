Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10

Profile: SEAlertInformation-6-PresenceOfContagiousDiseaseFlag
Parent: SEAlertInformationFlag
// Title: "SE AlertInformation 6 Förekomst av smittsam sjukdom"
Title: "SE AlertInformation 6 Presence of Contagious Disease"
// Description: "Profil för att hantera uppmärksamhetssignalen Förekomst av smittsam sjukdom."
Description: "Indicates the presence of a contagious disease in the patient, such as diseases that can be transmitted between individuals. Attention information regarding a contagious disease is considered current if there is a documented occurrence of the disease in the patient, and no later record indicating that the disease is no longer present.

[Mapping to UMI](StructureDefinition-SEAlertInformation-6-PresenceOfContagiousDiseaseFlag-mappings.html)"
* code from SEAlertInformationInfectiousDiseaseVS (required)
* subject only Reference(SEAlertInformationPatient)
* category = #B2 "Presence of infectious disease"
// * category = #B2 "Forekomst av smittsam sjukdom"
* extension[flag-detail] 0..0
* extension[criticalityLevel] 0..0

Instance: SEAlertInformation-6-PresenceOfContagiousDiseaseFlagExample
InstanceOf: SEAlertInformation-6-PresenceOfContagiousDiseaseFlag
// Description: "Exempel på uppmärksamhetssignal för förekomst av smittsam sjukdom"
Description: "Example of alert signal for presence of contagious disease"
* status = #active
* code = $ICD#A49.9 "Bakteriell infektion, ospecificerad"
* subject = Reference(SEAlertInformationPatientExample)

ValueSet: SEAlertInformationPresenceOfContagiousDiseaseSnomedCT
Id: 60661000052106
// Title: "Urval smittsamma sjukdomar, uppmärksamhetsinformation"
Title: "Selection of contagious diseases, alert information"
// Description: "Urval av Snomed CT koder relaterade till smittsamma sjukdomar."
Description: "Selection of Snomed CT codes related to contagious diseases."
* include $SCT#64301000052105 "blodsmitta hos gravid"

Mapping:  SEAlertInformation-6-PresenceOfContagiousDiseaseFlagToUMI
Source:   SEAlertInformation-6-PresenceOfContagiousDiseaseFlag
Target:   "UMI"
Id:       UMI
Title:    "UMI"
Description: "Description..."
* code -> "Uppmärksamhetsinformation Förekomst av smittsam sjukdom (1.2.752.116.3.1.16.1.6)"
* status -> "Förekomst av smittsam sjukdom(Observation).negation. Om negation = true → inactive, om negation = false → active."
* period.start -> "Förekomst av smittsam sjukdom(Observation).tid" 
* subject -> "Patient"
* category -> "Typ av uppmärksamhetsinformation (huvudgrupp)"