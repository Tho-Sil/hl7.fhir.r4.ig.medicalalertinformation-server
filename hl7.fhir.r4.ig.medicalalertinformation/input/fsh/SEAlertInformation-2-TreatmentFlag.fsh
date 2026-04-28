// This is a simple example of a FSH file.
// This file can be renamed, and additional FSH files can be added.
// SUSHI will look for definitions in any file using the .fsh ending.
Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10
Alias: $ATC = https://nzhts.digital.health.nz/fhir/ValueSet/atc-code

Profile: SEAlertInformation-2-TreatmentFlag
Parent: SEAlertInformationFlag
Title: "SE AlertInformation 2 Treatment Flag Profile"
Description: "Interventions aimed at preventing illness, or preserving or improving the individual’s state of health. This is documented using the **Activity** class in the reference model. Attention information regarding treatment is considered current if there is a documented treatment with status *ongoing*, and no later record indicating that the treatment is no longer ongoing. The treatments that need to be highlighted are defined in the code system *Attention information – Treatment*, and include both pharmacological treatments and other treatments. Pharmacological treatments are listed in the code system as a selection of ATC codes (1.2.752.116.3.1.16.1.2.2). If documentation is made with SNOMED CT, code **416608005** (*drug therapy*) is recorded in the *Treatment* class, while information about which medicinal product is used in the treatment is recorded in the attribute *type* in the class *Active substance* or in the attribute *product-id* in the class *Medicinal product*.

[Mapping to UMI](StructureDefinition-SEAlertInformation-2-TreatmentFlag-mappings.html)"
* code from SEAlertInformationTreatmentVS (required)
* subject only Reference(SEAlertInformationPatient)
* category = #A2 "Treatment"
// * category = #A2 "Behandling"
// * extension[flag-detail].valueReference only Reference(Procedure)

Instance: SEAlertInformationTreatmentFlagExample
InstanceOf: SEAlertInformation-2-TreatmentFlag
Description: "An example of the Swedish profile of the treatment Flag resource."
* status = #active
* code = $SCT#243142003 "BiPAP-behandling"
* subject = Reference(SEAlertInformationPatientExample)

ValueSet: SEAlertInformationTreatmentATCVS
Id: 1.2.752.116.3.1.16.1.2.2
Title: "Treatment – ATC"
//Title: "Behandling ATC"
* include $ATC#B01AA "Vitamin K-antagonister"
* include $ATC#B01AB "Heparingruppen"
* include $ATC#B01AE "Direkt trombinhämmande medel"
* include $ATC#B01AF "Direktverkande faktor Xa-hämmare"
* include $ATC#B01AA03 "Warfarin"
* include $ATC#L01 "Antineoplastiska medel"
* include $ATC#L03A "Immunstimulerande medel"
* include $ATC#L04 "Immunsuppressiva medel"

ValueSet: SEAlertInformationTreatmentICDVS
Id: 1.2.752.116.3.1.16.1.2.1
Title: "Treatment - ICD-10-SE"
//Title: "Behandling ICD-10-SE"
* include $ICD#Z92.1 "Långtidsanvändning (och pågående användning) av blodförtunnande medel i den egna sjukhistorien"
* include $ICD#Z99.2 "Beroende av njurdialys"

ValueSet: SEAlertInformationTreatmentSnomedVS
Id: 59831000052104
Title: "Subset of treatments, attention information"
//Title: "Urval behandlingar, uppmärksamhetsinformation"
* include $SCT#243142003 "BiPAP-behandling"
* include $SCT#385971003 "dialysbehandling"

ValueSet: SEAlertInformationTreatmentVS
Id: 1.2.752.116.3.1.16.1.2
Title: "Attention information – Treatment"
//Title: "Uppmärksamhetsinformation Behandling"
* include codes from valueset SEAlertInformationTreatmentATCVS
* include codes from valueset SEAlertInformationTreatmentICDVS
* include codes from valueset SEAlertInformationTreatmentSnomedVS

Mapping:  SEAlertInformation-2-TreatmentFlagToUMI
Source:   SEAlertInformation-2-TreatmentFlag
Target:   "UMI"
Id:       UMI
Title:    "UMI"
Description: "Description..."
// * code -> "Implantation(Aktivitet).kod Förekomst av implantat(Observation).värde" 
* code -> "Uppmärksamhetsinformation Behandling (1.2.752.116.3.1.16.1.2)"
// TODO: Lägg till mappning till aktiviteterna för att sätta status
* status -> "Behandling(Aktivitet).status"
* period.start -> "Behandling(Aktivitet).tid.starttid" 
* period.end -> "Behandling(Aktivitet).tid.sluttid" 
* subject -> "Patient"
* category -> "Typ av uppmärksamhetsinformation (huvudgrupp)"