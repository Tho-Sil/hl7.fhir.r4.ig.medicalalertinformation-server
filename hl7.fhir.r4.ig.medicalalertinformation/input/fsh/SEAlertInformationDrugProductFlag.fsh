// This is a simple example of a FSH file.
// This file can be renamed, and additional FSH files can be added.
// SUSHI will look for definitions in any file using the .fsh ending.
Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10
Alias: $ATC = https://nzhts.digital.health.nz/fhir/ValueSet/atc-code

Profile: SEAlertInformationDrugProductFlag
Parent: SEAlertInformationFlag
Title: "SE AlertInformation Drug Product Flag Profile"
Description: "Swedish profile of the Flag resource used for alert information about drug products."
* code from SEAlertInformationDrugProductVS (required)
* subject only Reference(SEAlertInformationPatient)
* category = #C4 "Medicinal product"
// * category = #C4 "Läkemedelsprodukt"
// * extension[flag-detail].valueReference only Reference(MedicationRequest)

Instance: SEAlertInformationDrugProductFlagExample
InstanceOf: SEAlertInformationDrugProductFlag
// Description: "Exempel på svensk profil för läkemedelsuppmärksamhetssignal."
Description: "An example of the Swedish profile of the drug product Flag resource."
* status = #active
* code = $ICD#Z79.89 "Langtidsanvandning av andra specificerade lakemedel"
* subject = Reference(SEAlertInformationPatientExample)

ValueSet: SEAlertInformationDrugProductATCVS
Id: 1.2.752.116.3.1.16.1.3.1
Title: "Drug Product ATC"
//Title: "Läkemedel ATC"
* include $ATC#A01AA "Andra hjärtatonsilliner"
* include $ATC#B01AA "Vitamin K-antagonister"
* include $ATC#C09BA "Antibiotika kombinationer"
* include $ATC#N06BA "Insuliner, humana"

ValueSet: SEAlertInformationDrugProductICDVS
Id: 1.2.752.116.3.1.16.1.3.2
Title: "Drug Product ICD-10-SE"
//Title: "Läkemedel ICD-10-SE"
* include $ICD#Z79.89 "Långtidsanvändning av andra specificerade läkemedel"

ValueSet: SEAlertInformationDrugProductSnomedVS
//Title: "Urval läkemedel, uppmärksamhetsinformation"
Title: "Subset of drug products (attention information)"
* ^identifier.system = "http://snomed.info/sct"
* ^identifier.value = "59841000052103"
* include $SCT#76300000052101 "opioidbehandling"
* include $SCT#41980000052107 "antikoagulantia"

ValueSet: SEAlertInformationDrugProductVS
Id: 1.2.752.116.3.1.16.1.3
// Title: "Uppmärksamhetsinformation Läkemedel"
Title: "Alert Information Drug Product"
* include codes from valueset SEAlertInformationDrugProductATCVS
* include codes from valueset SEAlertInformationDrugProductICDVS
* include codes from valueset SEAlertInformationDrugProductSnomedVS
