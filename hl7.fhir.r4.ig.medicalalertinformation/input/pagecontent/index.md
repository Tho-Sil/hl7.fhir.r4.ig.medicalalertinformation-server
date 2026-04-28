# HL7 FHIR R4 Medical alert information implementation guide for Sweden

This FHIR implementation guide is published by HL7 Sweden and expresses the profiles used for medical alert information based on the
Swedish National Board of Health and Welfare (Socialstyrelsen) specification
<https://www.socialstyrelsen.se/kunskapsstod-och-regler/omraden/e-halsa/tillampning/uppmarksamhetsinformation/>.

<!---
Denna implementationsguide publiceras av HL7 Sverige och uttrycker de profiler som används för uppmärksamhetsinformation baserad på Socialstyrelsens informationsspecifikation för
uppmärksamhetsinformation <https://www.socialstyrelsen.se/kunskapsstod-och-regler/omraden/e-halsa/tillampning/uppmarksamhetsinformation/>.
-->

<!-- # Användningsbeskrivning -->
# Usage Description

This implementation guide describes how medical alert information can be structured and exchanged using the resources of the HL7 FHIR standard. The guide is based on the National Board of Health and Welfare’s (Socialstyrelsen’s) information specification for medical alert information and aims to enable uniform and secure information exchange between healthcare systems, regardless of vendor. Medical alert information includes data on patients’ special needs, risks, or other circumstances that are important to consider in healthcare and social care situations. The information is intended to raise awareness among healthcare professionals and other relevant stakeholders, with the purpose of contributing to safe, person-centered, and secure care.

The implementation guide defines specialized FHIR profiles, value sets, code systems, and examples that comply with the National Board of Health and Welfare’s national guidelines and conceptual models. It is intended to support technical integrations and interoperability between information systems in healthcare and social care. The target audience for the guide includes information managers, system administrators, developers, and others working with the implementation of FHIR-based information exchange in health and social care.

⸻

This implementation guide describes the exchange of medical alert information using FHIR.

## Use cases

The guide is designed to support common Swedish healthcare exchange scenarios, such as cross-organisational access (e.g., NPÖ) and regional synchronisation across systems. See [Use cases](use-cases.html) for detailed flows and recommended interactions (search, lifecycle, and optional provenance/source context).

## Terminology

To ensure consistent wording across the guide, use the preferred English terms listed in [Terminology and translations](translations.html).

Here we can describe how the profile SEAlerInformationFlag should be used in combination with other referenced profiles. What we need to describe includes, among other things:
 - Activation and deactivation
 - Handling of non-structured attention information

So far, I have only created profiles for the observations that deal with infections. The information in the National Board of Health and Welfare’s information model can be managed in different ways in FHIR. For example, infection-related information can be represented using the Condition resource but may also be described as an Observation. At this stage, I am considering initially testing whether the use of the resources Observation, Procedure, and AllergyIntolerance can cover the needs we have.

<!-- Denna implementationsguide beskriver hur uppmärksamhetsinformation kan struktureras och utbytas med hjälp av HL7 FHIR-standardens resurser. Guiden är baserad på Socialstyrelsens informationsspecifikation för uppmärksamhetsinformation och syftar till att möjliggöra ett enhetligt och säkert informationsutbyte mellan vårdsystem, oberoende av leverantör.
Uppmärksamhetsinformation innefattar uppgifter om patienters särskilda behov, risker eller andra förhållanden som är viktiga att beakta i vård- och omsorgssituationer. Informationen är avsedd att höja medvetenheten hos vårdpersonal och andra berörda aktörer, i syfte att bidra till en trygg, personcentrerad och säker vård.
Implementationsguiden definierar specialiserade FHIR-profiler, värdemängder (ValueSets), koder och exempel som överensstämmer med Socialstyrelsens nationella riktlinjer och begreppsmodeller. Den är avsedd att stödja tekniska integrationer och interoperabilitet mellan informationssystem inom vård och omsorg.
Målgruppen för guiden är informationsförvaltare, systemförvaltare, utvecklare och andra som arbetar med införande av FHIR-baserat informationsutbyte inom hälso- och sjukvård samt socialtjänst.


Den här implementationsguiden beskriver utbyte av uppmärksamhetsinformation med FHIR

Här kan vi beskriva hur profilen SEAlerInformationFlag ska användas i kombination med övriga profiler som refereras till. Det vi behöver beskriva är bl.a.
 - Tändning och släckning
 - Hantering av Ej strukturanpassad uppmärksamhetsinformation
 - ...

Jag har än så länge bara skapat profiler för de observationer som hanterar smitta. Informationen i Socialstyrelsens informationsmodell går att hantera på olika sätt i FHIR. Exempelvis kan information om smitta hanteras med resursen Condition men kan också beskrivas som en Observation. Jag är inne på att initialt testa om användningen av resurserna Observation, Procedure och AllergyIntolerance kan täcka de behov vi har. -->

# The working group
The development of this implementation guide is carried out by a work group under the management of HL7 Sweden <http://hl7.se>. The group is composed of representatives from regions, state authorities, system vendors and other experts within the FHIR standard, informatics, architecture and terminology.

<!---
Framtagandet av dessa basprofiler och utökningar genomförs av en arbetsgrupp under HL7 Sverige <http://hl7.se>. Gruppen består av representanter från regioner, myndigheter, systemleverantörer samt andra experter inom FHIR, informatik, arkitektur, terminologi etc.
-->

# Contact information
To reach the working group for the alert information Implementation Guide contact  
[Claudia Ehrentraut](mailto:claudia.ehrentraut@regionstockholm.se) - Project manager for the alert information working group.

<!---
För att komma i kontakt med gruppen som arbetar med uppmärksamhetsinformation:
[Claudia Ehrentraut](mailto:claudia.ehrentraut@regionstockholm.se) - Projektledare för arbetsgruppen för uppmärksamhetsinformation.
-->