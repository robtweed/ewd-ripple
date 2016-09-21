/*

 ----------------------------------------------------------------------------
 | ewd-ripple: ewd-xpress Middle Tier for Ripple OSI                        |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

 21 September 2016

*/

var openEHR = require('./openEHR');

var q;

function getDomain(nhsNo, domain, sessions, callback) {

  /*
    domain should define

   domain = {
     name: 'allergies',
     query: {
       aql: [part 1, 'nhsNo', part 2],
       sql: [part 1, 'openEHRNo', part 2]
     }
     fieldName: 'cause'
     
   }

  */

  var params = {
    callback: callback,
    url: '/rest/v1/query',
    method: 'GET'
  };

  var queryType;
  var query;
  var server;
  var patientId;
  params.dontAsk = domain.dontAsk;
  params.hostSpecific = {};
  for (var host in openEHR.servers) {
    if (domain.dontAsk && domain.dontAsk[host]) {
      continue;
    }
    params.hostSpecific[host] = {
      qs: {}
    };
    server = openEHR.servers[host];
    queryType = server.queryType;
    query = domain.query[queryType];
    patientId = nhsNo;
    if (query[1] === 'openEHRNo') patientId = openEHR.getEhrId(nhsNo, host);

    params.hostSpecific[host]['qs'][queryType] = query[0] + patientId + query[2];

  }
  params.sessions = sessions;

  params.processBody = function(body, host) { 
    var results = [];
    if (body && body.resultSet) {
      var patientDomain = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "domains", domain.name, host]);
      patientDomain.setDocument(body.resultSet);
      var patientDomainIndex = new q.documentStore.DocumentNode('ripplePatients', [nhsNo, "domainIndex", domain.name]);

      var count = 0;
      body.resultSet.forEach(function(result) {
        var index = {
          host: host,
          recNo: count
        };
        patientDomainIndex.$(result.uid.split('::')[0]).setDocument(index);
        count++;
      });
    }
  };

  openEHR.requests(params);

}

function getAllergies(nhsNo, sessions, callback) {
  var domain = {
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
      ]
    },
    fieldName: 'cause'
  };
  getDomain(nhsNo, domain, sessions, callback);
}


function getProblemsSummary(nhsNo, sessions, callback) {
  var domain = {
    name: 'problems',
    query: {
      sql: [
        "SELECT ehr.entry.composition_id as uid, ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.problem_list.v1 and name/value=''Problem list''], /content[openEHR-EHR-SECTION.problems_issues_rcp.v1],0, /items[openEHR-EHR-EVALUATION.problem_diagnosis.v1],0,/data[at0001],/items[at0002 and name/value=''Problem/Diagnosis name''],/value,value}' as problem, ehr.event_context.start_time FROM ehr.entry INNER JOIN ehr.composition ON ehr.composition.id = ehr.entry.composition_id INNER JOIN ehr.event_context ON ehr.event_context.composition_id = ehr.entry.composition_id WHERE ehr.composition.ehr_id = '",
        'openEHRNo',
        "' AND ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.problem_list.v1' ORDER BY ehr.event_context.start_time DESC;"
      ],
      aql: [
        "select a/uid/value as uid, a_a/items/data[at0001]/items[at0002]/value/value as problem from EHR e contains COMPOSITION a[openEHR-EHR-COMPOSITION.care_summary.v0] contains SECTION a_a[openEHR-EHR-SECTION.problems_issues_rcp.v1] where a/name/value='Problem list' and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' and e/ehr_status/subject/external_ref/id/value ='",
        'nhsNo',
        "'"
      ]
    },
    fieldName: 'problem'  
  };
  getDomain(nhsNo, domain, sessions, callback);

} 

function getMedicationsSummary(nhsNo, sessions, callback) {
  var domain = {
    name: 'medications',
    query: {
      sql: [
        "SELECT ehr.entry.composition_id as uid, ehr.party_identified.name as author, ehr.entry.entry #>> '{/composition[openEHR-EHR-COMPOSITION.medication_list.v0 and name/value=''Current medication list''], /content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1],0, /items[openEHR-EHR-SECTION.current_medication_rcp.v1],0,/items[openEHR-EHR-INSTRUCTION.medication_order.v0],0,/activities[at0001 and name/value=''Order''], /description[at0002],/items[at0070 and name/value=''Medication item''],/value,value }' as name FROM ehr.entry INNER JOIN ehr.composition ON ehr.composition.id=ehr.entry.composition_id INNER JOIN ehr.party_identified ON ehr.composition.composer=ehr.party_identified.id WHERE (ehr.composition.ehr_id = '",
        'openEHRNo',
        "') AND (ehr.entry.archetype_Id = 'openEHR-EHR-COMPOSITION.medication_list.v0');"
      ],
      aql: [
        "select a/uid/value as uid, a_a/items/items/data[at0001]/items/items[at0001]/value/value as name from EHR e contains COMPOSITION a[openEHR-EHR-COMPOSITION.care_summary.v0] contains SECTION a_a[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1] where a/name/value='Current medication list' and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' and e/ehr_status/subject/external_ref/id/value = '",
        'nhsNo',
        "'"
      ]
    },
    fieldName: 'name'
  };
  getDomain(nhsNo, domain, sessions, callback);
}



function getContactsSummary(nhsNo, sessions, callback) {
  var domain = {
    name: 'contacts',
    dontAsk: {
      'ethercis': true 
    },
    query: {
      aql: [
        "select a/uid/value as uid, a_a/items/data[at0001]/items/items[openEHR-EHR-CLUSTER.person_name.v1]/items/value/value as name from EHR e contains COMPOSITION a[openEHR-EHR-COMPOSITION.care_summary.v0] contains SECTION a_a[openEHR-EHR-SECTION.relevant_contacts_rcp.v1] where a/name/value='Relevant contacts' and e/ehr_status/subject/external_ref/namespace = 'uk.nhs.nhs_number' and e/ehr_status/subject/external_ref/id/value = '",
        'nhsNo',
        "'"
      ]
    },
    fieldName: 'name'
  };
  getDomain(nhsNo, domain, sessions, callback);
}

module.exports = {
  init: function() {
    q = this;
    openEHR.init.call(this);
  },
  getAllergies: getAllergies,
  getProblemsSummary: getProblemsSummary,
  getContactsSummary: getContactsSummary,
  getMedicationsSummary: getMedicationsSummary
};
