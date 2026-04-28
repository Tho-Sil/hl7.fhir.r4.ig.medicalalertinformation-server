// This is a simple example of a FSH file.
// This file can be renamed, and additional FSH files can be added.
// SUSHI will look for definitions in any file using the .fsh ending.
Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10

Profile: SEAlertInformation-3-PresenceOfGraftsConditionFlag
Parent: SEAlertInformationFlag
Title: "SE AlertInformation 3 Presence Of Grafts Condition Flag Profile"
Description: "Indicates the presence of grafts in the patient, such as transplanted organs or tissues. Attention information regarding grafts is considered current if there is a documented occurrence of the graft in the patient, and no later record indicating that the graft is no longer present.

[Mapping to UMI](StructureDefinition-SEAlertInformation-3-PresenceOfGraftsConditionFlag-mappings.html)"
* code from SEAlertInformationPresenceOfGraftsConditionVS (required)
* subject only Reference(SEAlertInformationPatient)
* category = #A3 "Presence of transplant"
// * category = #A3 "Förekomst av transplantat"
* extension[flag-detail] 0..0
* extension[criticalityLevel] 0..0

// Instance: SEAlertInformationPresenceOfGraftsConditionFlagExample
// InstanceOf: SEAlertInformationFlag
// Description: "An example of the Swedish profile of the Flag resource."
// * status = #active
// * code = $SCT#64301000052105 "blodsmitta hos gravid"
// * extension[flag-detail].valueReference = Reference(SEAlertInformationIncidenceOfInfectiousDiseaseObservationExample) "blodsmitta hos gravid"
// * subject = Reference(SEAlertInformationPatientExample)

ValueSet: SEAlertInformationPresenceOfGraftsConditionVS
Id: a1.2.752.116.3.1.16.1.3
Title: "Attention information - Presence of grafts"
Description: "Attention information - Presence of grafts."
* include codes from valueset SEAlertInformationMedicalConditionSnomedVS
* include codes from valueset SEAlertInformationPresenceOfGraftsConditionSnomedVS

ValueSet: SEAlertInformationPresenceOfGraftsConditionSnomedICDVS
Id: 1.2.752.116.3.1.16.1.4.1
Title: "Presence of grafts ICD-10-SE"
* include $ICD#Z94.8 "Andra specificerade transplantationstillstand"

ValueSet: SEAlertInformationPresenceOfGraftsConditionSnomedVS
Id: 59861000052106
Title: "Selection of grafts, attention information"
* include $SCT#739024006 "transplanterat hjarta foreligger"

Mapping:  SEAlertInformation-3-PresenceOfGraftsConditionFlagToUMI
Source:   SEAlertInformation-3-PresenceOfGraftsConditionFlag
Target:   "UMI"
Id:       UMI
Title:    "UMI"
Description: "Description..."
// * code -> "Implantation(Aktivitet).kod Förekomst av implantat(Observation).värde" 
* code -> "Uppmarksamhetsinformation Forekomst av transplantat (1.2.752.116.3.1.16.1.4)"
// TODO: Lägg till mappning till aktiviteterna för att sätta status
* status -> "Transplantation(Aktivitet) Avlagsnande av transplantat(Aktivitet) Forekomst av transplantat(Observation)" "Flag.status ska sattas enligt foljande: observerad forekomst & negation = falskt -> active observerad forekomst & negation = sant -> inactive. entered-in-error anvands inte."
* period.start -> "Transplantation(Aktivitet).tid Forekomst av transplantat(Observation).tid" 
* period.end -> "Avlagsnande av transplantat(Aktivitet).tid.sluttid Forekomst av transplantat(Observation).tid" 
* subject -> "Patient"
* category -> "Typ av uppmärksamhetsinformation (huvudgrupp)"

// * note -> "Förekomst av implantat(Observation).anmärkning Flag.note" "Fritextanteckningar/meddelanden"
// * meta.lastUpdated -> "Implantation(Aktivitet).meta.lastUpdated Förekomst av implantat(Observation).meta.lastUpdated" "Tidpunkt för senaste uppdatering"
// * author -> "Implantation(Aktivitet).utförare Förekomst av implantat(Observation).utfördAv" "Mappar vem som dokumenterat/utfört"
// * qualifier -> "Förekomst av implantat(Observation).kvalificering Flag.extension[kvalifiering]" "Eventuella kvalifikationer/attribut"

// ValueSet: SEAlertInformationMedicalConditionSnomedVS
// Id: 59821000052101
// Title: "Urval medicinska tillstånd, uppmärksamhetsinformation"
// * include $SCT#41291007 "angioödem"
// * include $SCT#9651007 "långt QT-syndrom"
// * include $SCT#70995007 "pulmonell hypertoni"
// * include $SCT#373662000 "primär binjurebarksinsufficiens"
// * include $SCT#405501007 "malign hypertermi"
// * include $SCT#64779008 "blodkoagulationssjukdom"
// * include $SCT#53891000052101 "trombocytrelaterad sjukdom med ökad blödningstendens"
// * include $SCT#126729006 "trombotisk mikroangiopati"
// * include $SCT#234467004 "trombofili"
// * include $SCT#91637004 "myasthenia gravis"
// * include $SCT#234422006 "akut intermittent porfyri"
// * include $SCT#58275005 "porphyria variegata"
// * include $SCT#7425008 "hereditär koproporfyri"
// * include $SCT#64081000 "brist på porfobilinogensyntetas"
// * include $SCT#360631004 "brist på kolinesteras 2, ospecifik"
// * include $SCT#33211000 "komplikation till anestesi"
// * include $SCT#718447001 "svår intubation"
// * include $SCT#707147002 "aspleni"
// * include $SCT#31323000 "svår kombinerad immunbrist"
// * include $SCT#17182001 "agranulocytos"
// * include $SCT#770942003 "Kostmanns syndrom"
// * include $SCT#89454001 "Shwachmans syndrom"
// * include $SCT#203551000052109 "störning av neutrofilfunktion"
// * include $SCT#439784005 "kirurgiskt anlagd arteriovenös fistel"
// * include $SCT#27718001 "Maple syrup urine disease"
// * include $SCT#116020001 "rubbning i omsättningen av förgrenade aminosyror"
// * include $SCT#39929009 "rubbning i fettsyraomsättningen"
// * include $SCT#7046009 "hyperleucin-isoleucinemi"
// * include $SCT#87827003 "brist på isovaleryl-CoA-dehydrogenas"
// * include $SCT#42393006 "metylmalonisk acidemi"
// * include $SCT#69080001 "brist på propionyl-CoA-karboxylas"
// * include $SCT#1156591005 "fettsyreoxidationsdefekt"
// * include $SCT#82319005 "brist på acyl-CoA-dehydrogenas"
// * include $SCT#36444000 "rubbning i ureaomsättningscykeln"
// * include $SCT#237929000 "rubbning i lysin- och hydroxilysinomsättningen"
// * include $SCT#41013004 "brist på argininosuccinatlyas"
// * include $SCT#398680004 "citrullinemi"
// * include $SCT#29633007 "glykogeninlagringssjukdom"
// * include $SCT#39452003 "rubbning i fruktosomsättningen"
// * include $SCT#190760009 "rubbningar i pyruvatomsättningen och glukoneogenesen"
// * include $SCT#75934005 "ämnesomsättningssjukdom"
// * include $SCT#238006008 "rubbning i purin- och pyrimidinomsättningen"
// * include $SCT#16851005 "mitokondriell myopati"
// * include $SCT#237751000 "kongenital adrenal hyperplasi"
// * include $SCT#737315000 "enterokolit utlöst av födoämnesprotein"
// * include $SCT#439218000 "kirurgiskt anlagt arteriovenöst graft"

// ValueSet: SEAlertInformationOtherMedicalConditionICDVS
// Id: 1.2.752.116.3.1.16.1.1.1
// Title: "Annat medicinskt tillstånd ICD-10-SE"
// * include $ICD#T78.3 "Angioneurotiskt ödem"
// * include $ICD#I49.8E "Långt QT-syndrom"
// * include $ICD#I27.0 "Primär pulmonell hypertoni"
// * include $ICD#I27.2 "Annan sekundär pulmonell hypertoni"
// * include $ICD#E27.1 "Primär binjurebarksinsufficiens"
// * include $ICD#T88.3 "Malign hypertermi orsakad av anestesi"
// * include $ICD#D66.9 "Ärftlig brist på faktor VIII"
// * include $ICD#D67.9 "Ärftlig brist på faktor IX"
// * include $ICD#D68.0 "von Willebrands sjukdom"
// * include $ICD#D68.1 "Hereditär brist på faktor XI"
// * include $ICD#D68.2 "Hereditär brist på andra koagulationsfaktorer"
// * include $ICD#D68.3 "Hemorragisk sjukdom orsakad av cirkulerande antikoagulantia"
// * include $ICD#D68.4 "Förvärvad brist på koagulationsfaktor"
// * include $ICD#D68.5 "Primär trombofili"
// * include $ICD#D68.6 "Annan trombofili"
// * include $ICD#D68.8 "Andra specificerade koagulationsrubbningar"
// * include $ICD#D68.9 "Koagulationsrubbning, ospecificerad"
// * include $ICD#D69.0 "Allergisk purpura"
// * include $ICD#D69.1 "Kvalitativa trombocytdefekter"
// * include $ICD#D69.3 "Idiopatisk trombocytopen purpura"
// * include $ICD#D69.4 "Annan primär trombocytopeni"
// * include $ICD#D69.5 "Sekundär trombocytopeni"
// * include $ICD#D69.6 "Trombocytopeni, ospecificerad"
// * include $ICD#M31.1 "Trombotisk mikroangiopati"
// * include $ICD#G70.0 "Myasthenia gravis"
// * include $ICD#E80.2A "Akut intermittent porfyri (hepatisk)"
// * include $ICD#E80.2D "Porphyria variegata"
// * include $ICD#E80.2B "Hereditär koproporfyri"
// * include $ICD#E80.2W "Annan specificerad porfyri"
// * include $ICD#E88.0 "Rubbningar i plasmaproteinomsättningen som ej klassificeras på annan plats"
// * include $ICD#E88.0W "Annan specificerad rubbning i plasmaproteinomsättningen som ej klassificeras på annan plats"
// * include $ICD#T88.2 "Chock orsakad av anestesi"
// * include $ICD#T88.5 "Andra komplikationer till anestesi"
// * include $ICD#T88.4 "Misslyckad eller försvårad intubation"
// * include $ICD#D73.0 "Hyposplenism"
// * include $ICD#Q89.0 "Medfödda missbildningar av mjälten"
// * include $ICD#D81 "Kombinerade immunbristtillstånd"
// * include $ICD#D70.9A "Agranulocytos"
// * include $ICD#D70.9B "Kostmanns sjukdom"
// * include $ICD#D70.9D "Shwachmans syndrom"
// * include $ICD#D71.9 "Funktionella rubbningar hos polymorfkärniga neutrofila celler (vissa vita blodkroppar)"
// * include $ICD#I77.0 "Arteriovenös fistel, förvärvad"
// * include $ICD#E71.0 ""
// * include $ICD#E71.2 ""
// * include $ICD#E71.3 ""
// * include $ICD#E71.1A ""
// * include $ICD#E71.1B ""
// * include $ICD#E71.1C ""
// * include $ICD#E71.1D ""
// * include $ICD#E71.3A ""
// * include $ICD#E71.3B ""
// * include $ICD#E71.3C ""
// * include $ICD#E72.2 ""
// * include $ICD#E72.3 ""
// * include $ICD#E72.2B ""
// * include $ICD#E72.2C ""
// * include $ICD#E74.0 ""
// * include $ICD#E74.1 ""
// * include $ICD#E74.4 ""
// * include $ICD#E88.9 ""
// * include $ICD#E79.8 ""
// * include $ICD#G71.3 ""
// * include $ICD#E25.0 ""
// * include $ICD#K52.2 ""

// ValueSet: SEAlertInformationOtherMedicalConditionVS
// Id: 1.2.752.116.3.1.16.1.1
// Title: "Uppmärksamhetsinformation Annat medicinskt tillstånd"
// Description: "Uppmärksamhetsinformation för annat medicinskt tillstånd."
// * include codes from valueset SEAlertInformationOtherMedicalConditionICDVS
// * include codes from valueset SEAlertInformationMedicalConditionSnomedVS