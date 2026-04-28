Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10

Profile: SEAlertInformation-4-PresenceOfImplantFlag
Parent: SEAlertInformationFlag
Title: "SE AlertInformation 4 Presence Of Implant Flag Profile"
Description: "Indicates the presence of implants in the patient, such as medical devices or prostheses that have been implanted. Attention information regarding implants is considered current if there is a documented occurrence of the implant in the patient, and no later record indicating that the implant is no longer present.

[](StructureDefinition-SEAlertInformation-4-PresenceOfImplantFlag-mappings.html)"
* code from SEAlertInformationPresenceOfImplantVS (required)
* subject only Reference(SEAlertInformationPatient)
// * status from flag-status where code in { "active", "inactive" }
* category = #A4 "Presence of implant"
// * category = #A4 "Forekomst av implantat"
* extension[flag-detail] 0..0
* extension[criticalityLevel] 0..0

ValueSet: SEAlertInformationPresenceOfImplantVS
Id: a1.2.752.116.3.1.16.1.3.1
// Title: "Uppmärksamhetsinformation Förekomst av implantat"
Title: "Alert Information Presence of Implant"
// Description: "Uppmärksamhetsinformation Förekomst av implantat."
Description: "Alert information about presence of implant."
* include codes from valueset SEAlertInformationPresenceOfImplantICD10SEVS
* include codes from valueset SEAlertInformationPresenceOfImplantSnomedCTVS

ValueSet: SEAlertInformationPresenceOfImplantICD10SEVS
Id: SEImplantatICD10SEVS
// Title: "Förekomst av implantat ICD-10-SE"
Title: "Presence of Implant ICD-10-SE"
// Description: "Valuesets för förekomsten av implantat enligt ICD-10-SE."
Description: "Value set for presence of implant according to ICD-10-SE."
* include $ICD#Z95.0 "Förekomst av elektronisk kardiell anordning"
* include $ICD#Z95.2 "Förekomst av hjärtklaffprotes av icke-biologiskt material"
* include $ICD#Z95.4 "Förekomst av annan typ av hjärtklaffsersättning"
* include $ICD#Z98.2 "Tillstånd med förekomst av hjälpmedel för dränage av cerebrospinalvätska"
* include $ICD#Z96.0
* include $ICD#Z96.2
* include $ICD#Z96.8
* include $ICD#Z99.4

ValueSet: SEAlertInformationPresenceOfImplantSnomedCTVS
Id: SEImplantatSnomedCTVS
// Title: "Uppmärksamhetsinformation Implantat Snomed CT"
Title: "Alert Information Implant Snomed CT"
// Description: "Valuesets för uppmärksamhetsinformation om implantat enligt Snomed CT."
Description: "Value set for alert information about implant according to Snomed CT."
* include $SCT#72506001 "implanterbar defibrillator"
* include $SCT#14106009 "pacemaker"
* include $SCT#705991002 "mekanisk hjärtklaffprotes"
* include $SCT#72821000052105 "mikrospiral, magnetisk metall"
* include $SCT#72811000052102 "kärlklämma, magnetisk metall"
* include $SCT#263805004 "magnetisk metall"
* include $SCT#258593008 "ventrikelshunt"
* include $SCT#360100007 "trakeal stent"
* include $SCT#69805005 "insulinpump"
* include $SCT#261680000 "artificiell uretrasfinkter"
* include $SCT#43252007 "kokleaimplantat"
* include $SCT#1351253007 "Central nervous system neurostimulator"
* include $SCT#447033006 "vagal nervstimulator"
* include $SCT#705545001 "Diaphragm/phrenic nerve electrical stimulation system"
* include $SCT#360066001 "vänsterkammarassist"
* include $SCT#360125003 "pacemakerelektrod"

// Mapping:  SEAlertInformation-4-PresenceOfImplantFlagToRIVTA
// Source:   SEAlertInformation-4-PresenceOfImplantFlag
// Target:   "RIVTA-GetAlertInformation"
// Id:       RIVTA-GetAlertInformation
// Title:    "RIVTA-GetAlertInformation"
// Description: "Description..."
// * code -> "GetAlertInformationResponse.alertInformation.body.activity.code GetAlertInformationResponse.alertInformation.body.condition.value" 

Mapping:  SEAlertInformation-4-PresenceOfImplantFlagToUMI
Source:   SEAlertInformation-4-PresenceOfImplantFlag
Target:   "UMI"
Id:       UMI
Title:    "UMI"
Description: "Description..."
// * code -> "Implantation(Aktivitet).kod Förekomst av implantat(Observation).värde" 
* code -> "Uppmarksamhetsinformation Forekomst av implantat (1.2.752.116.3.1.16.1.3)"
// TODO: Lägg till mappning till aktiviteterna för att sätta status
* status -> "Implantation(Aktivitet) Avlagsnande av implantat(Aktivitet) Forekomst av implantat(Observation)" "Flag.status ska sattas enligt foljande: observerad forekomst & negation = falskt -> active observerad forekomst & negation = sant -> inactive. entered-in-error anvands inte."
* period.start -> "Implantation(Aktivitet).tid Forekomst av implantat(Observation).tid" 
* subject -> "Patient"
* category -> "Typ av uppmärksamhetsinformation (huvudgrupp)"