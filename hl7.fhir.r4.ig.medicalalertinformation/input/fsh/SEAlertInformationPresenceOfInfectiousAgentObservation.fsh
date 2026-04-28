// This is a simple example of a FSH file.
// This file can be renamed, and additional FSH files can be added.
// SUSHI will look for definitions in any file using the .fsh ending.
Profile: SEAlertInformationPresenceOfInfectiousAgentObservation
Parent: Observation
// Title: "SE AlertInformation Förekomst av smittämne Profil"
Title: "SE AlertInformation Presence Of Infectious Agent Profile"
// Description: "Svensk profil för observation av förekomst av smittämne som används som flag-detail till profilen SEAlertInformationFlag."
Description: "Swedish profile for the observation of presence of infectious 
                agent used as flag-detail to the profile SEAlertInformationFlag."
* code from SEAlertInformationPresenceOfInfectiousAgentVS (required)

Instance: SEAlertInformationPresenceOfInfectiousAgentObservationExample
InstanceOf: SEAlertInformationPresenceOfInfectiousAgentObservation
// Description: "Exempel på svensk profil för observation av förekomst av smittämne som används som referens till profilen SEBaseFlag."
Description: "An example of the Swedish profile for the observation of incidence 
                of infectious disease used as reference to the profile SEBaseFlag."
* status = #final
* code = http://hl7.org/fhir/sid/icd-10#Z22.3 "Barare av andra specificerade bakteriella sjukdomar"
* subject = Reference(SEAlertInformationPatientExample) "Patient example"

