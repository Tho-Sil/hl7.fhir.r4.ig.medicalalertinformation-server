// This is a simple example of a FSH file.
// This file can be renamed, and additional FSH files can be added.
// SUSHI will look for definitions in any file using the .fsh ending.
Alias: $SCT = http://snomed.info/sct
Alias: $ICD = http://hl7.org/fhir/sid/icd-10

Profile: SEAlertInformationPatient
Parent: http://hl7.se/fhir/ig/base/StructureDefinition/SEBasePatient //http://hl7.se/fhir/ig/base/StructureDefinition/SEBasePatient //http://hl7.org/fhir/StructureDefinition/Patient
Title: "SE AlertInformation Patient Profile"
Description: "SE AlertInformation Patient Profile based on Swedish profile of the Patient resource 
    http://hl7.org/fhir/StructureDefinition/Patient."

/*
    Example instances of the patient profile representing some typical
    person informations sets. The example data is based on test persons 
    available in the Inera PU Test environment.
*/
Instance: SEAlertInformationPatientExample
InstanceOf: SEAlertInformationPatient
// Description: "Patientexempel"
Description: "Patient example"
* meta.security[0] = #DEMO
* meta.security[1] = SecurityLabelCS#sekretessmarkering
* id = "PatientExample1"
* identifier[personnummer].value = "195009072553"
* name[0].use = #official
* name[0].family = "Goode Johansson"
* name[0].given[0] = "John"
* name[0].given[1] = "Bob"
* name[0].given[0].extension[nameQualifier].valueCode = #CL
* name[0].extension[middleName].valueString = "Johansson"
* name[0].extension[ownFamily].valueString = "Goode"
* name[0].text = "John Bob Goode Johansson"
* gender = #male
* maritalStatus = SEBaseMaritalStatusCS#RP "Registrerad partner"
* birthDate = "1950-09-07"
* address.line = "2120 S Michigan Ave"
* address.city = "Chicago"
* address.postalCode = "60616"
* address.country = "US"
* address.extension[officialAddressType].valueCodeableConcept = $SCT#63401000052101 "utlandsadress"