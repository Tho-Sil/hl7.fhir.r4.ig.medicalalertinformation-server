<style>
    table {
    table-layout: fixed;
    width: 100%;
    }
    th:nth-child(1), td:nth-child(1) {
    width: 18%;
    }
    th:nth-child(2), td:nth-child(2) {
    width: 32%;
    }
    th:nth-child(3), td:nth-child(3) {
    width: 50%;
    }
</style>

Medical alert signals are used to quickly and clearly highlight important conditions, treatments, or risks in a patient that may affect care and management. Below, the different types of medical alert signals used within Swedish healthcare are presented, together with their associated profiles and descriptions. Each signal has a specific meaning and may be linked to particular care routines, infection control, hypersensitivity, or other important information that needs to be considered in the patient’s care.

The different types of medical alert signals are defined in the National Board of Health and Welfare’s national specification for medical alert information.

<!-- Medicinska uppmärksamhetssignaler används för att snabbt och tydligt uppmärksamma viktiga tillstånd, behandlingar eller risker hos en patient som kan påverka vård och omhändertagande. Nedan presenteras de olika typerna av uppmärksamhetssignaler som används inom svensk hälso- och sjukvård, tillsammans med tillhörande profiler och beskrivningar. Varje signal har en specifik betydelse och kan kopplas till särskilda vårdrutiner, smittskydd, överkänslighet eller annan viktig information som behöver beaktas i patientens vård.

De olika typerna av uppmärksamhetssignaler är definierade i Socialstyrelsens nationella specifikation för medicinsk uppmärksamhetsinformation. -->



# Medical condition and treatments

| Attention Signal | Profile | Description |
| -------- | ------- | ------- |
| 1 Other medical condition | [SEAlertInformation-1-OtherMedicalConditionFlag](StructureDefinition-SEAlertInformation-1-OtherMedicalConditionFlag.html) | A medical condition that is not an allergy, presence of infectious disease, presence of infectious agent, presence of implant, or presence of graft that the patient has or does not have. This is documented using the **Observation** class in the reference model. Attention information regarding another medical condition is considered current if there is a documented occurrence of the condition in the patient, and no later record indicating that the patient no longer has this condition. The medical conditions that need to be highlighted are listed in the value set [Attention information – Other medical condition](ValueSet-1.2.752.116.3.1.16.1.1.html). |
| 2 Treatment | [SEAlertInformation-2-TreatmentFlag](StructureDefinition-SEAlertInformation-2-TreatmentFlag.html) | Interventions aimed at preventing illness, or preserving or improving the individual’s state of health. This is documented using the **Activity** class in the reference model. Attention information regarding treatment is considered current if there is a documented treatment with status *ongoing*, and no later record indicating that the treatment is no longer ongoing. The treatments that need to be highlighted are defined in the code system *Attention information – Treatment*, and include both pharmacological treatments and other treatments. Pharmacological treatments are listed in the code system as a selection of ATC codes (1.2.752.116.3.1.16.1.2.2). If documentation is made with SNOMED CT, code **416608005** (*drug therapy*) is recorded in the *Treatment* class, while information about which medicinal product is used in the treatment is recorded in the attribute *type* in the class *Active substance* or in the attribute *product-id* in the class *Medicinal product*. |
| 3 Presence of transplants | [SEAlertInformation-3-PresenceOfGraftsConditionFlag](StructureDefinition-SEAlertInformation-3-PresenceOfGraftsConditionFlag.html) | Indicates the presence of transplants in the patient, such as transplanted organs or tissues. Attention information regarding transplants is considered current if there is a documented occurrence of the transplant in the patient, and no later record indicating that the transplant is no longer present. |
| 4 Presence of implants | [SEAlertInformation-4-PresenceOfImplantFlag](StructureDefinition-SEAlertInformation-4-PresenceOfImplantFlag.html) | Indicates the presence of implants in the patient, such as medical devices or prostheses that have been implanted. Attention information regarding implants is considered current if there is a documented occurrence of the implant in the patient, and no later record indicating that the implant is no longer present. |

<!-- # Medicinskt tillstånd och behandlingar

| Uppmärksamhetssignal | Profil | Beskrivning |
| -------- | ------- | ------- |
| 1 Annat medicinskt tillstånd | [SEAlertInformation-1-OtherMedicalConditionFlag](StructureDefinition-SEAlertInformation-1-OtherMedicalConditionFlag.html) | Medicinskt tillstånd som inte är överkänslighet, förekomst av smittsam sjukdom, förekomst av smittämne, förekomst av implantat eller förekomst av transplantat som patienten har eller inte har. Detta dokumenteras med hjälp av klassen observation i referensmodellen. Uppmärksamhetsinformation om annat medicinskt tillstånd anses aktuell om det finns en dokumenterad förekomst av tillståndet hos patienten, och ingen senare uppgift om att patienten inte längre har detta tillstånd. De medicinska tillstånd som behöver uppmärksammas finns i urvalet [Uppmärksamhetsinformation Annat medicinskt tillstånd](ValueSet-1.2.752.116.3.1.16.1.1.html) |
| 2 Behandling | [SEAlertInformation-2-TreatmentFlag](StructureDefinition-SEAlertInformation-2-TreatmentFlag.html) | Åtgärder som syftar till att förebygga ohälsa eller bevara eller förbättra den enskildes hälsotillstånd. Detta dokumenteras med hjälp av klassen aktivitet i referensmodellen. Uppmärksamhetsinformation om behandling anses aktuell om det finns en dokumenterad behandling med status pågående, och ingen senare uppgift om att behandlingen inte längre pågår. De behandlingar som behöver uppmärksammas finns i kodverk Uppmärksamhetsinformation - Behandling, och inkluderar både läkemedelsbehandlingar och andra behandlingar. Läkemedelsbehandlingar anges i kodverket i form av ett urval av ATC-koder (1.2.752.116.3.1.16.1.2.2). Om dokumentationen görs med Snomed CT anges kod 416608005, läkemedelsbehandling i klass behandling, medan information om vilket läkemedel som används i behandlingen anges i attribut ’typ’ i klass aktiv substans eller i attribut ’produkt-id’ i klass läkemedelsprodukt. |
| 3 Förekomst av transplantat | [SEAlertInformation-3-PresenceOfGraftsConditionFlag](StructureDefinition-SEAlertInformation-3-PresenceOfGraftsConditionFlag.html) | Indikerar förekomst av transplantat hos patienten, såsom organ eller vävnad som transplanterats. Uppmärksamhetsinformation om transplantat anses aktuell om det finns en dokumenterad förekomst av transplantatet hos patienten, och ingen senare uppgift om att transplantatet inte längre är närvarande. |
| 4 Förekomst av implantat | [SEAlertInformation-4-PresenceOfImplantFlag](StructureDefinition-SEAlertInformation-4-PresenceOfImplantFlag.html) | Indikerar förekomst av implantat hos patienten, såsom medicinska enheter eller proteser som har implanterats. Uppmärksamhetsinformation om implantat anses aktuell om det finns en dokumenterad förekomst av implantatet hos patienten, och ingen senare uppgift om att implantatet inte längre är närvarande. | -->

# Infection

| Attention Signal | Profile | Description |
| -------- | ------- | ------- |
| 5 Presence of infectious agent | [SEAlertInformation-5-PresenceOfInfectiousAgentFlag](StructureDefinition-SEAlertInformation-5-PresenceOfInfectiousAgentFlag.html) | Indicates the presence of an infectious agent in the patient, such as bacteria, viruses, or other microorganisms that can cause infection. Attention information regarding an infectious agent is considered current if there is a documented occurrence of the agent in the patient, and no later record indicating that the agent is no longer present. |
| 6 Presence of contagious disease | [SEAlertInformation-6-PresenceOfContagiousDiseaseFlag](StructureDefinition-SEAlertInformation-6-PresenceOfContagiousDiseaseFlag.html) | Indicates the presence of a contagious disease in the patient, such as diseases that can be transmitted between individuals. Attention information regarding a contagious disease is considered current if there is a documented occurrence of the disease in the patient, and no later record indicating that the disease is no longer present. |

<!-- # Smitta

| Uppmärksamhetssignal | Profil | Beskrivning |
| -------- | ------- | ------- |
| 5 Förekomst av smittämne | [SEAlertInformation-5-PresenceOfInfectiousAgentFlag](StructureDefinition-SEAlertInformation-5-PresenceOfInfectiousAgentFlag.html) | Indikerar förekomst av smittämne hos patienten, såsom bakterier, virus eller andra mikroorganismer som kan orsaka infektion. Uppmärksamhetsinformation om smittämne anses aktuell om det finns en dokumenterad förekomst av smittämnet hos patienten, och ingen senare uppgift om att smittämnet inte längre är närvarande. |
| 6 Förekomst av smittsam sjukdom | [SEAlertInformation-6-PresenceOfContagiousDiseaseFlag](StructureDefinition-SEAlertInformation-6-PresenceOfContagiousDiseaseFlag.html) | Indikerar förekomst av smittsam sjukdom hos patienten, såsom sjukdomar som kan överföras mellan individer. Uppmärksamhetsinformation om smittsam sjukdom anses aktuell om det finns en dokumenterad förekomst av sjukdomen hos patienten, och ingen senare uppgift om att sjukdomen inte längre är närvarande. | -->

# Allergy and hypersensitivity

| Attention Signal | Profile | Description |
|---|---|---|
| 7 Hypersensitivity condition | [SEAlertInformation-7-AllergyIntoleranceFlag](StructureDefinition-SEAlertInformation-7-AllergyIntoleranceFlag.html) | Indicates a hypersensitivity to a specific chemical, active substance, excipient, or a specific medicinal product. Attention information regarding hypersensitivity is considered current if there is a documented occurrence of the hypersensitivity, and no later record indicating that the patient is no longer hypersensitive. |

<!-- # Överkänslighet

| Uppmärksamhetssignal | Profil | Beskrivning |
|---|---|---|
| 7 Överkänslighetstillstånd | [SEAlertInformation-7-AllergyIntoleranceFlag](StructureDefinition-SEAlertInformation-7-AllergyIntoleranceFlag.html) |  Indikerar en överkänslighet mot en specifik kemikalie, aktiv substans, hjälpämne eller en specifik läkemedelsprodukt. Uppmärksamhetsinformation om överkänslighet anses aktuell om det finns en dokumenterad förekomst av överkänsligheten, och ingen senare uppgift om att patienten inte längre är överkänslig. | -->




<!-- ## Aktiv substans

| Uppmärksamhetssignal | Profil | Beskrivning |
|---|---|---|
| 8 Aktiv substans | [SEAlertInformationActivePharmaceuticalIngredientFlag](StructureDefinition-SEAlertInformationActivePharmaceuticalIngredientFlag.html) | Indikerar en överkänslighet mot en specifik aktiv substans i ett läkemedel. Dokumenteras med hjälp av klassen observation i referensmodellen. Uppmärksamhetsinformation om aktiv substans anses aktuell om det finns en dokumenterad förekomst av överkänsligheten, och ingen senare uppgift om att patienten inte längre är överkänslig mot den specifika aktiva substansen. |
| 9 Hjälpämne läkemedel | [SEAlertInformationExcipientFlag](StructureDefinition-SEAlertInformationExcipientFlag.html) | Indikerar en överkänslighet mot ett hjälpämne i ett läkemedel. Dokumenteras med hjälp av klassen observation i referensmodellen. Uppmärksamhetsinformation om hjälpämne läkemedel anses aktuell om det finns en dokumenterad förekomst av överkänsligheten, och ingen senare uppgift om att patienten inte längre är överkänslig mot det specifika hjälpämnet. |
| 10 Läkemedelsprodukt | [SEAlertInformationDrugProductFlag](StructureDefinition-SEAlertInformationDrugProductFlag.html) | Indikerar en överkänslighet mot en specifik läkemedelsprodukt. Dokumenteras med hjälp av klassen observation i referensmodellen. Uppmärksamhetsinformation om läkemedelsprodukt anses aktuell om det finns en dokumenterad förekomst av överkänsligheten, och ingen senare uppgift om att patienten inte längre är överkänslig mot den specifika läkemedelsprodukten. | -->





# Deviations from standard care routines

| Attention Signal | Profile | Description |
|---|---|---|
| 8 Information that may lead to a special care routine | [SEAlertInformation-8-SpecialCareRoutineFlag](StructureDefinition-SEAlertInformation-8-SpecialCareRoutineFlag.html) | Indicates information that may lead to special care routines for the patient, such as specific interventions or treatments based on the patient’s condition or needs. |
| 9 Decision that may lead to a special care routine | [SEAlertInformation-9-DecisionSpecialCareRoutineFlag](StructureDefinition-SEAlertInformation-9-DecisionSpecialCareRoutineFlag.html) | Indicates a decision that may lead to special care routines for the patient, such as specific interventions or treatments based on the patient’s condition or needs. |

<!-- # Vårdrutinavvikelser

| Uppmärksamhetssignal | Profil | Beskrivning |
|---|---|---|
| 8 Information som kan leda till särskild vårdrutin | [SEAlertInformation-8-SpecialCareRoutineFlag](StructureDefinition-SEAlertInformation-8-SpecialCareRoutineFlag.html) | Indikerar information som kan leda till särskilda vårdrutiner för patienten, såsom specifika åtgärder eller behandlingar baserade på patientens tillstånd eller behov. |
| 9 Beslut som kan leda till särskild vårdrutin | [SEAlertInformation-9-DecisionSpecialCareRoutineFlag](StructureDefinition-SEAlertInformation-9-DecisionSpecialCareRoutineFlag.html) | Indikerar beslut som kan leda till särskilda vårdrutiner för patienten, såsom specifika åtgärder eller behandlingar baserade på patientens tillstånd eller behov. | -->

# Non-structured attention information (Historically recorded attention information)

| Attention Signal | Profile | Description |
|---|---|---|
| 10 Non-structured attention information | [SEAlertInformation-10-UnstructuredFlag](StructureDefinition-SEAlertInformation-10-UnstructuredFlag.html) | Non-structured attention information refers to historically recorded attention information that does not meet current requirements for information structure. |

<!-- # Ej strukturanpassad uppmärksamhetsinformation (Historiskt angiven uppmärksamhetsinformation)

| Uppmärksamhetssignal | Profil | Beskrivning |
|---|---|---|
| 10 Ej strukturanpassad uppmärksamhetsinformation | [SEAlertInformation-10-UnstructuredFlag](StructureDefinition-SEAlertInformation-10-UnstructuredFlag.html) | Ej strukturanpassad uppmärksamhetsinformation avser historiskt angiven uppmärksamhetsinformation som ej uppfyller gällande krav på informationsstruktur | -->