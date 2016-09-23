module.exports = {
  name: 'procedures',
  query: {
    sql: [
      "SELECT " +
        "ehr.entry.composition_id as uid, " +
        "ehr.event_context.start_time as date_submitted, " +
        "ehr.party_identified.name as author, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''], " +
          "/content[openEHR-EHR-SECTION.procedures_rcp.v1],0, " +
          "/items[openEHR-EHR-ACTION.procedure.v1],0,/description[at0001],/items[at0002 and name/value=''Procedure name''],/value,value" +
        "}' as procedure_name, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''], " +
          "/content[openEHR-EHR-SECTION.procedures_rcp.v1],0, " +
          "/items[openEHR-EHR-ACTION.procedure.v1],0,/description[at0001],/items[at0002 and name/value=''Procedure name''],/value,definingCode,terminologyId,value" +
        "}' as procedure_terminology, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''], " +
          "/content[openEHR-EHR-SECTION.procedures_rcp.v1],0, " +
          "/items[openEHR-EHR-ACTION.procedure.v1],0,/description[at0001],/items[at0002 and name/value=''Procedure name''],/value,definingCode,codeString" +
        "}' as procedure_code, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''], " +
          "/content[openEHR-EHR-SECTION.procedures_rcp.v1],0, " +
          "/items[openEHR-EHR-ACTION.procedure.v1],0,/description[at0001],/items[at0049 and name/value=''Procedure notes''],/value,value" +
        "}' as procedure_notes, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''], " +
          "/content[openEHR-EHR-SECTION.procedures_rcp.v1],0, " +
          "/items[openEHR-EHR-ACTION.procedure.v1],0,/time,/value,value" +
        "}' as procedure_datetime, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.care_summary.v0 and name/value=''Procedures list''], " +
          "/content[openEHR-EHR-SECTION.procedures_rcp.v1],0, " +
          "/items[openEHR-EHR-ACTION.procedure.v1],0,/ism_transition/current_state,/value,value" +
        "}' as procedure_status, " +
        "ehr.event_context.start_time " +
      "FROM ehr.entry " +
        "INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id " +
        "INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id " +
        "INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id " +
      "WHERE (ehr.composition.ehr_id = '"
      ,

      'openEHRNo',

      "') " + 
      "AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.care_summary.v0');"
    ],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_submitted, " +
        "b_a/description[at0001]/items[at0002]/value/value as procedure_name, " +
        "b_a/description[at0001]/items[at0049, 'Procedure notes']/value/value as procedure_notes, " +
        "b_a/other_participations/performer/name as performer, " +
        "b_a/time/value as procedure_date, " +
        "b_a/ism_transition/careflow_step/value as status, " +
        "b_a/ism_transition/careflow_step/defining_code/code_string as procedure_code, " +
        "b_a/ism_transition/careflow_step/defining_code/terminology_id/value as terminology " +
      "from EHR e " +
        "contains COMPOSITION a[openEHR-EHR-COMPOSITION.care_summary.v0] " +
        "contains ACTION b_a[openEHR-EHR-ACTION.procedure.v1] " +
        "where a/name/value='Procedures list' " +
        "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
        "and e/ehr_status/subject/external_ref/id/value = '"
      ,

      'nhsNo',

      "'"
    ]
  },
  textFieldName: 'procedure_name',
  domainTableFields: ['name', 'date', 'time'],
  fieldMap: {
    name: 'procedure_name',
    procedureName: 'procedure_name',
    procedureCode: 'procedure_code',
    date: 'procedure_date',
    time: 'procedure_date',
    procedureTerminology: 'terminology',
    notes: 'procedure_notes',
    performer: 'performer',
    currentStatus: 'status',
    author: 'author',
    dateSubmitted: 'date_submitted'
  }
};
