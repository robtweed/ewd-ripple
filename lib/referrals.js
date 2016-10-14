var dateTime = require('./dateTime');

module.exports = {
  name: 'referrals',
  query: {
    sql: [],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_submitted," +
        "a_a/items/activities/timing/value as referral_date, " +
        "a_a/items/protocol/items/items/value/value as referral_from, " +
        "a_a/items/activities/description/items[at0121]/value/value as referral_to, " +
        "a_a/items/activities/description/items[at0062]/value/value as referral_reason, " +
        "a_a/items/activities/description/items[at0064]/value/value as clinical_summary " +
      "from EHR e " +
        "contains COMPOSITION a[openEHR-EHR-COMPOSITION.encounter.v1] " +
        "contains SECTION a_a[openEHR-EHR-SECTION.referral_details_rcp.v1] " +
        "where a/name/value='Referral' " +
        "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
        "and e/ehr_status/subject/external_ref/id/value = '"
      ,

      'nhsNo',

      "'"
    ]
  },
  textFieldName: 'referral_from',
  domainTableFields: ['dateOfReferral', 'referralFrom', 'referralTo'],
  fieldMap: {
    dateOfReferral: function(data, host) {
      return dateTime.getRippleTime(data.referral_date, host);
    },
    referralFrom: 'referral_from',
    referralTo: 'referral_to'
  }
};
