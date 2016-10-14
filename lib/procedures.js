var dateTime = require('./dateTime');

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
        "b_a/time/value as procedure_datetime, " +
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
    date: function(data, host) {
      return dateTime.getRippleTime(data.procedure_datetime, host);
    },
    time: function(data, host) {
      return dateTime.msSinceMidnight(data.procedure_datetime, host);
    },
    procedureTerminology: 'terminology',
    notes: 'procedure_notes',
    performer: 'performer',
    currentStatus: 'status',
    author: 'author',
    dateSubmitted: function(data, host) {
      return dateTime.getRippleTime(data.date_submitted, host);
    }
  },
  post: {
    destination: 'marand',
    templateId: 'IDCR Procedures List.v0',
    fieldMap: {
      'ctx/composer_name': {
        field: 'author',
        default: 'Dr Tony Shannon'
      },
      'ctx/health_care_facility|id': {
        field: 'healthcareFacilityId',
        default: '999999-345'
      },
      'ctx/health_care_facility|name':  {
        field: 'healthcareFacilityName',
        default: 'Rippleburgh General Hospital'
      },
      'ctx/id_namespace': {
        default: 'NHS-UK'
      },
      'ctx/id_scheme': {
        default: '2.16.840.1.113883.2.1.4.3'
      },
      'ctx/language': {
        default: 'en'
      },
      'ctx/territory': {
        default: 'GB'
      },
      'ctx/time': {
        field: 'dateTimeRecorded',
        default: function(data) {
          return dateTime.formatDate(new Date());
        }
      },
      'procedures_list/procedures:0/procedure:0/procedure_name': {
        field: 'procedureName'
      },
      'procedures_list/procedures:0/procedure:0/procedure_notes': {
        field: 'notes'
      },
      'procedures_list/procedures:0/procedure:0/ism_transition/careflow_step|code': {
        //field: 'procedureCode'
        default: 'at0047'
      },
      'procedures_list/procedures:0/procedure:0/ism_transition/careflow_step|terminology': {
        //field: 'procedureTerminology'
        default: 'local'
      },
      'procedures_list/procedures:0/procedure:0/_other_participation:0|function': {
        default: 'Performer'
      },
      'procedures_list/procedures:0/procedure:0/_other_participation:0|name': {
        field: 'performer'
      },
      'procedures_list/procedures:0/procedure:0/time': {
        default: function(data) {
          var date = new Date(data.date);
          var time = new Date(data.time);
          var dt = new Date(date.toDateString() + ' ' + time.toTimeString());
          return dateTime.formatDate(dt);
        }
      },
    }
  }
};
