// // This is a simple example of a FSH file.
// // This file can be renamed, and additional FSH files can be added.
// // SUSHI will look for definitions in any file using the .fsh ending.

// Alias: $SCT = http://snomed.info/sct
// Alias: $ICD = http://hl7.org/fhir/sid/icd-10

// // Define a Profile for SEAlertInformationExcipientFlag
// Profile: SEAlertInformationExcipientFlag
// Parent: SEAlertInformationFlag  // Inherit from the base AlertInformation Flag profile
// Title: "SE AlertInformation Excipient Flag Profile"
// Description: "Swedish profile of the Flag resource used for alert information about excipients."
// * code from SEAlertInformationExcipientVS (required) // The flag's code must come from our defined ValueSet.
// * subject only Reference(SEAlertInformationPatient)  // Subject should be a reference to a Patient resource.
// * category = #A // Category is set to 'A', which might need adjustment based on your specific use case.

// // Example Instance of the Excipient Flag Profile
// Instance: SEAlertInformationExcipientFlagExample
// InstanceOf: SEAlertInformationFlag
// Description: "An example of the Swedish profile for an excipient alert flag."
// * status = #active  // Set the status to active (or another appropriate value)
// * code = $SCT#709453002 // Example SNOMED CT code - Replace with a relevant code. This is "allergy to lactose" as an example.
// * subject = Reference(SEAlertInformationPatientExample)  // Link the flag to a patient (using the example patient).

// // Define a ValueSet for Excipient-Related Codes
// ValueSet: SEAlertInformationExcipientVS
// Id: 1.2.752.116.3.1.16.1.3 // Unique identifier for the ValueSet - adjust as needed.
// Title: "Uppmärksamhetsinformation Excipient"  // Title of the ValueSet
// Description: "Codes in Snomed CT and ICD-10 representing excipients used for alert information."

// // Include codes from SNOMED CT (example)
// * include $SCT#709453002 "allergy to lactose" // Example - replace with relevant codes.
// * include $SCT#68578001 "allergy to sulfites"  // Another example

// // Include codes from ICD-10 (if applicable) - Add if needed.
// // * include $ICD#...  // Example:  $ICD#Z88.0 "Allergy, hypersensitivity and chronic asthmatic state due to drugs and medicaments"

// // You can add more includes as necessary for other coding systems.
