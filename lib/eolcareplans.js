var dateTime = require('./dateTime');

module.exports = {
  name: 'careplans',
  query: {
    sql: [],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created, " +
        "b_a/items[openEHR-EHR-EVALUATION.care_preference_uk.v1]/data/items[at0003]/value/value as priority_place_of_care, " +
        "b_a/items[openEHR-EHR-EVALUATION.care_preference_uk.v1]/data/items[at0015]/value/value as priority_place_of_death, " +
        "b_a/items[openEHR-EHR-EVALUATION.care_preference_uk.v1]/data/items[at0029]/value/value as priority_comment, " +
        "b_a/items[openEHR-EHR-EVALUATION.advance_decision_refuse_treatment_uk.v1]/data/items[at0003]/value/value as treatment_decision, " +
        "b_a/items[openEHR-EHR-EVALUATION.advance_decision_refuse_treatment_uk.v1]/data/items[at0002]/value/value as treatment_date_of_decision, " +
        "b_a/items[openEHR-EHR-EVALUATION.advance_decision_refuse_treatment_uk.v1]/data/items[at0021]/value/value as treatment_comment, " +
        "b_a/items[openEHR-EHR-EVALUATION.cpr_decision_uk.v1]/data/items[at0003]/value/value as cpr_decision, " +
        "b_a/items[openEHR-EHR-EVALUATION.cpr_decision_uk.v1]/data/items[at0002]/value/value as cpr_date_of_decision, " +
        "b_a/items[openEHR-EHR-EVALUATION.cpr_decision_uk.v1]/data/items[at0021]/value/value as cpr_comment " +
      "from EHR e " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.care_plan.v1] " +
      "contains SECTION b_a[openEHR-EHR-SECTION.legal_information_rcp.v1] " +
      "where a/name/value='End of Life Patient Preferences' " +
      "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
      "and e/ehr_status/subject/external_ref/id/value = '",

      'nhsNo',

      "'"
    ],
  },
  textFieldName: 'name',
  domainTableFields: ['name', 'type', 'dateCreated'],
  fieldMap: {
    name: function(record) {
      return 'End of Life Care';
    },
    type: function(record) {
      return 'Document';
    },
    careDocument: function(record, host) {
      return {
        name: 'End of Life Care',
        type: 'Document',
        author: record.author,
        dateCreated: dateTime.getRippleTime(record.date_created, host)
      };
    },
    cprDecision: function(record, host) {
      return {
        cprDecision: record.cpr_decision,
        dateOfDecision: dateTime.getRippleTime(record.cpr_date_of_decision, host),
        comment: record.cpr_comment
      };
    },
    prioritiesOfCare: function(record) {
      return {
        placeOfCare: record.priority_place_of_care,
        placeOfDeath: record.priority_place_of_death,
        comment: record.priority_comment
      };
    },
    treatmentDecision: function(record, host) {
      return {
        decisionToRefuseTreatment: record.treatment_decision,
        dateOfDecision: dateTime.getRippleTime(record.treatment_date_of_decision, host),
        comment: record.treatment_comment
      };
    },
    author: 'author',
    dateCreated: function(data, host) {
      return dateTime.getRippleTime(data.date_created, host);
    }
  }
};
