module.exports = {
  name: 'appointments',
  query: {
    sql: [],
    aql: [
      "select " +
        "a/uid/value as uid, " +
        "a/composer/name as author, " +
        "a/context/start_time/value as date_created, " +
        "b_a/description/items[at0011]/value/value as service_team, " +
        "b_a/description/items[at0026]/value/lower/value as appointment_date, " +
        "b_a/protocol/items/items/items[at0002]/value/value as location, " +
        "b_a/ism_transition/current_state/value as status " +
      "from EHR e " +
      "contains COMPOSITION a[openEHR-EHR-COMPOSITION.encounter.v1] " +
      "contains ACTION b_a[openEHR-EHR-ACTION.referral_uk.v1] " +
      "where a/name/value='Referral' " +
      "and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' " +
      "and e/ehr_status/subject/external_ref/id/value = '",

      'nhsNo',

      "'"
    ],
  },
  textFieldName: 'serviceTeam',
  domainTableFields: ['serviceTeam', 'dateOfAppointment', 'timeOfAppointment'],
  fieldMap: {
    serviceTeam: 'service_team',
    dateOfAppointment: 'appointment_date',
    timeOfAppointment: 'appointment_date',
    location: 'location',
    status: 'status',
    author: 'author',
    dateCreated: 'date_created'
  }
};
