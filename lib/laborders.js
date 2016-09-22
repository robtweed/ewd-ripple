module.exports = {
  name: 'laborders',
  query: {
    sql: [
      "SELECT " +
        "ehr.entry.composition_id as uid, " +
        "ehr.event_context.start_time as date_created, " +
        "ehr.party_identified.name as author, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.referral.v0 and name/value=''Laboratory order''], " +
          "/content[openEHR-EHR-INSTRUCTION.request-lab_test.v1],0, " +
          "/activities[at0001 and name/value=''Lab Request''], /description[at0009], /items[at0121 and name/value=''Service requested''],/value,value" +
        "}' as name, " +
        "ehr.entry.entry #>> '{" +
          "/composition[openEHR-EHR-COMPOSITION.referral.v0 and name/value=''Laboratory order''], " +
          "/content[openEHR-EHR-ACTION.laboratory_test.v1],0, /time,/value,value" +
        "}' as order_date " +
      "FROM ehr.entry " +
        "INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id " +
        "INNER JOIN ehr.event_context ON ehr.event_context.composition_id=ehr.entry.composition_id " +
        "INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id " +
      "WHERE (ehr.composition.ehr_id = '"
      ,

      'openEHRNo',

      "') " + 
      "AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.referral.v0');"
    ],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created," +
        "a_a/activities[at0001]/description/items[at0121]/value/value as name, " +
        "a_a/activities[at0001]/description/items[at0121]/value/defining_code/code_string as code, " +
        "a_a/activities[at0001]/description/items[at0121]/value/defining_code/terminology_id/value as terminology, " +
        "a_a/activities[at0001]/timing/value as order_date " +
      "from EHR e " +
        "contains COMPOSITION a[openEHR-EHR-COMPOSITION.referral.v0] " +
        "contains INSTRUCTION a_a[openEHR-EHR-INSTRUCTION.request-lab_test.v1] " +
        "where a/name/value='Laboratory order' " +
        "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
        "and e/ehr_status/subject/external_ref/id/value = '"
      ,

      'nhsNo',

      "'"
    ]
  },
  textFieldName: 'name',
  domainTableFields: ['name', 'orderDate'],
  fieldMap: {
    name: 'name',
    code: 'code',
    terminology: 'terminology',
    orderDate: 'order_date',
    author: 'author',
    dateCreated: 'date_created'
  }
};
