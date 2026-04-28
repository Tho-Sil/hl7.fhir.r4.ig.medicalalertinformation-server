Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10

Profile: SEAlertInformation-5-PresenceOfInfectiousAgentFlag
Parent: SEAlertInformationFlag
Title: "SE AlertInformation 5 Presence Of Infectious Agent Flag Profile"
Description: "Indicates the presence of an infectious agent in the patient, such as bacteria, viruses, or other microorganisms that can cause infection. Attention information regarding an infectious agent is considered current if there is a documented occurrence of the agent in the patient, and no later record indicating that the agent is no longer present. 

[Mapping to UMI](StructureDefinition-SEAlertInformation-5-PresenceOfInfectiousAgentFlag-mappings.html)"
* code from SEAlertInformationPresenceOfInfectiousAgentVS (required)
* subject only Reference(SEAlertInformationPatient)
* category = #B1 "Presence of infectious agent"
// * category = #B1 "Forekomst av smittamne"
* extension[flag-detail] 0..0
* extension[criticalityLevel] 0..0

ValueSet: SEAlertInformationPresenceOfInfectiousAgentVS
Id: 1.2.752.116.3.1.16.1.5
// Title: "Uppmärksamhetsinformation Förekomst av smittämne"
Title: "Alert Information Presence of Infectious Agent"
// Description: "Koder för uppmärksamhetsinformation om förekomst av smittämne."
Description: "Codes for alert information about presence of infectious agent."
* include codes from valueset SEICDPresenceOfInfectiousAgentVS
* include codes from valueset SESCTInfectiousAgentAlertInformationVS

ValueSet: SEICDPresenceOfInfectiousAgentVS
Id: 1.2.752.116.3.1.16.1.5.1
// Title: "Förekomst av smittämne ICD-10-SE"
Title: "Presence of Infectious Agent ICD-10-SE"
// Description: "Koder i ICD-10 för förekomst av smittämne."
Description: "ICD-10 codes for presence of infectious agent."
* include $ICD#Z22.3 "Barare av andra specificerade bakteriella sjukdomar"
* include $ICD#Z22.1 "Barare av andra specificerade tarminfektioner"
* include $ICD#Z22.2 "Barare av difteri"
* include $ICD#Z22.8 "Barare av andra infektionssjukdomar"

ValueSet: SESCTInfectiousAgentAlertInformationVS
Id: 59851000052108
// Title: "Urval smittämnen, uppmärksamhetsinformation"
Title: "Selection of Infectious Agents, Alert Information"
// Description: "Snomed CT-koder för smittämnen som används för uppmärksamhetsinformation."
Description: "Snomed CT codes for infectious agents used for alert information."
* include $SCT#432415000 "bärare av meticillinresistent Staphylococcus aureus"
* include $SCT#431109006 "bärare av vankomycinresistenta enterokocker"
* include $SCT#762988003 "bärare av ESBL-producerande bakterier"
* include $SCT#61751000052107 "bärare av ESBL- och karbapenemasproducerande bakterier"

Mapping:  SEAlertInformation-5-PresenceOfInfectiousAgentFlagToUMI
Source:   SEAlertInformation-5-PresenceOfInfectiousAgentFlag
Target:   "UMI"
Id:       UMI
Title:    "UMI"
Description: "Description..."
* code -> "Uppmärksamhetsinformation Förekomst av smittämne (1.2.752.116.3.1.16.1.5)"
* status -> "Förekomst av smittämne(Observation).negation. Om negation = true → inactive, om negation = false → active."
* period.start -> "Förekomst av smittämne(Observation).tid" 
* subject -> "Patient"
* category -> "Typ av uppmärksamhetsinformation (huvudgrupp)"
