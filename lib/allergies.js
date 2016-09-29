module.exports = {
  name: 'allergies',
  query: {
    sql: [
      "SELECT " +
      "ehr.entry.composition_id as uid, " +
      "ehr.party_identified.name as author, " +
      "ehr.event_context.start_time as date_created, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0002 and name/value=''Causative agent''],/value,value" +
      "}' as cause, " + 
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0002 and name/value=''Causative agent''],/value,definingCode,codeString" +
      "}' as cause_code, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0002 and name/value=''Causative agent''],/value,definingCode,terminologyId,value" +
      "}' as cause_terminology, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0009 and name/value=''Reaction details''],/items[at0011],0,/value,/value,value" +
      "}' as reaction, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0009 and name/value=''Reaction details''],/items[at0011],0,/value,/value,definingCode,codeString" +
      "}' as reaction_code, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0009 and name/value=''Reaction details''],/items[at0011],0,/value,/value,definingCode,terminologyId,value" +
      "}' as reaction_terminology, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0009 and name/value=''Reaction details''],/items[at0021],0,/value,/value,value" +
      "}' as certainty, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0009 and name/value=''Reaction details''],/items[at0021],0,/value,/value,definingCode,codeString" +
      "}' as certainty_code, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0009 and name/value=''Reaction details''],/items[at0021],0,/value,/value,definingCode,terminologyId,value" +
      "}' as certainty_terminology, " +
      "ehr.entry.entry #>> '{" +
        "/composition[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1 and name/value=''Adverse reaction list''], " +
        "/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1],0, " +
        "/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1],0,/data[at0001],/items[at0009 and name/value=''Reaction details''],/items[at0032],0,/value,/value,value" +
      "}' as comment, " +
      "ehr.event_context.start_time " +
      "FROM ehr.entry " +
      "INNER JOIN ehr.composition ON ehr.composition.id = ehr.entry.composition_id " +
      "INNER JOIN ehr.event_context ON ehr.event_context.composition_id = ehr.entry.composition_id " +
      "INNER JOIN ehr.party_identified ON ehr.composition.composer = ehr.party_identified.id " +
      "WHERE (ehr.composition.ehr_id = '",

      'openEHRNo',

      "') " + 
      "AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.adverse_reaction_list.v1') " +
      "ORDER BY ehr.event_context.start_time DESC;"
    ],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created, " +
        "a_a/items/data[at0001]/items[at0002]/value/value as cause, " +
        "a_a/items/data[at0001]/items[at0002]/value/defining_code/terminology_id/value as cause_terminology, " +
        "a_a/items/data[at0001]/items[at0002]/value/defining_code/code_string as cause_code, " +
        "a_a/items/data[at0001]/items[at0025]/items[at0022]/value/value as reaction " +
      "from EHR e " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.care_summary.v0] " +
      "contains SECTION a_a[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1] " +
      "where a/name/value='Allergies list' " +
      "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
      "and e/ehr_status/subject/external_ref/id/value = '",

      'nhsNo',

      "'"
    ],
  },
  textFieldName: 'cause',
  domainTableFields: ['cause', 'reaction'],
  fieldMap: {
    cause: 'cause',
    causeCode: 'cause_code',
    causeTerminology: 'cause_terminology',
    terminologyCode: 'cause_code',
    reaction: 'reaction',
    author: 'author',
    dateCreated: 'date_created'
  },
  post: {
    templateId: 'IDCR - Adverse Reaction List.v1',
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
        name: 'healthcareFacilityName',
        default: 'Rippleburgh GP Practice'
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
          return new Date().toISOString()
        }
      },
      'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|value': {
        field: 'cause'
      },
      'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|code': {
        field: 'causeCode'
      },
      'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|terminology': {
        field: 'causeTerminology'
      },
      'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/reaction_details/manifestation:0': {
        field: 'reaction'
      }
    }
  }
};
