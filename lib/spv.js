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
var domains = require('./domains');


var headings = {
  allergies: require('./allergies'),
  problems: require('./problems'),
  medications: require('./medications'),
  contacts: require('./contacts'),
  laborders: require('./laborders'),
  transfers: {
    textFieldName: ''
  }
};


function getPatientSummary(nhsNo, sessions, callback) {

  var q = this;

  var ready = {
    allergies: false,
    medications: false,
    problems: false,
    contacts: false
  };

  domains.getAllergies(nhsNo, sessions, function() {
    q.emit('domainReady', 'allergies', ready, callback);
  });

  domains.getProblems(nhsNo, sessions, function() {
    q.emit('domainReady', 'problems', ready, callback);
  });

  domains.getMedications(nhsNo, sessions, function() {
    q.emit('domainReady', 'medications', ready, callback);
  });

  domains.getContacts(nhsNo, sessions, function() {
    q.emit('domainReady', 'contacts', ready, callback);
  });

}

function formatSummary(nhsNo) {
  var patient = new this.documentStore.DocumentNode('ripplePatients', [nhsNo]);
  var patientDomains = patient.$('domains');
  var results = {
    allergies: [],
    problems: [],
    medications: [],
    contacts: [],
    transfers: []
  };

  /*
  var textFieldNames = {
    allergies: allergies.textFieldName,
    problems: 'problem',
    medications: 'name',
    contacts: 'name',
    transfers: ''
  };

  headings[domain].textFieldName
  */

  var domain;
  var summary;

  for (domain in results) {
    for (var host in openEHR.servers) {      
      patientDomains.$(domain).$(host).forEachChild(function(index, childNode) {
        var text = childNode.$(headings[domain].textFieldName).value;
        if (text !== null && text !== '') {
          summary = {
            sourceId: childNode.$('uid').value.split('::')[0],
            source: openEHR.servers[host].sourceName,
            text: text
          }
          results[domain].push(summary);
        }
      });
    }
  }
  results.id = nhsNo;
  results.name = patient.$('name').value;
  results.gender = patient.$('gender').value;
  results.dateOfBirth = patient.$('dateOfBirth').value;
  results.nhsNumber = nhsNo;
  results.address = patient.$('address').value;
  results.pasNumber = patient.$('pasNo').value;
  results.gpDetails = patient.$('gpDetails').value;
  results.telephone = patient.$('phone').value;
  return results;
}

function getDomainTable(nhsNo, domain, callback) {
  var patientDomain = new this.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domains', domain]);
  if (!patientDomain.exists) {
    // fetch it!
    var q = this;
    console.log('*** domain ' + domain + ' needs to be fetched!')
    openEHR.startSessions(function(sessions) {
      console.log('*** sessions: ' + JSON.stringify(sessions));
      openEHR.mapNHSNo(nhsNo, sessions, function() {
        console.log('*** NHS no mapped');
        domains.getDomain(nhsNo, domain, sessions, function() {
          // now try again!
          console.log('**** trying again!');
          getDomainTable.call(q, nhsNo, domain, callback);
        });
      });
    });
    return;
  }

  console.log('patientDomain exists for ' + nhsNo + ': domain ' + domain);
  var results = [];
  patientDomain.forEachChild(function(host, hostNode) {
    //console.log('**** forEachChild: host = ' + host);
    hostNode.forEachChild(function(index, domainNode) {
      //console.log('**** forEachChild index = ' + index);
      var record = domainNode.getDocument();
      var result = {
        sourceId: record.uid.split('::')[0],
        source: host
      }
      var emptyValues = 0;
      
      headings[domain].domainTableFields.forEach(function(fieldName) {
        //console.log('***fieldName: ' + fieldName);
        var name = headings[domain].fieldMap[fieldName];
        //console.log('*** mapped name: ' + name);
        var value = record[name];
        //console.log('*** value: ' + value);
        if (value === '') emptyValues++;
        result[fieldName] = value;
      });
      if (emptyValues !== headings[domain].domainTableFields.length) results.push(result);
    });
  });
  if (callback) callback(results);
}

function patientSummary(nhsNo, callback) {
  var patient = new this.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domains']);
  if (patient.exists) {
    // we've already cached the domain data for this patient so just output from cache
    var summary = formatSummary.call(this, nhsNo);
    if (callback) callback(summary);
    return;
  }

  var q = this;

  openEHR.startSessions(function(sessions) {
    openEHR.mapNHSNo(nhsNo, sessions, function() {
      getPatientSummary.call(q, nhsNo, sessions, function() {
        var summary = formatSummary.call(q, nhsNo);
        if (callback) callback(summary);
        
      });
    });
  });

}

function patientDomainDetail(nhsNo, domain, sourceId) {

  console.log('*** patientDomainDetail - domain = ' + domain);

  var patientDomainIndex = new this.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domainIndex', domain]);
  if (!patientDomainIndex.exists) {
    
    // go and fetch it!

    var q = this;
    console.log('*** domain ' + domain + ' needs to be fetched!')
    openEHR.startSessions(function(sessions) {
      console.log('*** sessions: ' + JSON.stringify(sessions));
      openEHR.mapNHSNo(nhsNo, sessions, function() {
        console.log('*** NHS no mapped');
        getSelectedDomain(nhsNo, domain, sessions, function() {
          // now try again!
          console.log('**** trying again!');
          patientDomainDetail.call(q, nhsNo, domain, sourceId);
        });
      });
    });
    return;
  }
  console.log('**** sourceId: ' + sourceId);
  var indexSource = patientDomainIndex.$(sourceId);
  if (!indexSource.exists) {
    return {error: 'Invalid sourceId ' + sourceId + ' for patient ' + nhsNo + ' / domain ' + domain};
  }
  var index = indexSource.getDocument();

  var patientDomain = new this.documentStore.DocumentNode('ripplePatients', [nhsNo, 'domains', domain, index.host, index.recNo]);
  var record = patientDomain.getDocument();
  console.log('*** record: ' + JSON.stringify(record));
  var result = {
    sourceId: sourceId,
    source: openEHR.servers[index.host].sourceName
  };
  for (var name in headings[domain].fieldMap) {
    result[name] = record[headings[domain].fieldMap[name]];
  }
  return result;
}


module.exports = {

  init: function() {
    openEHR.init.call(this);
    domains.init.call(this);

    var q = this;

    this.on('domainReady', function(domain, ready, callback) {
      console.log(domain + ' ready!');
      ready[domain] = true;
      if (ready.allergies && ready.medications && ready.problems && ready.contacts) {
        callback.call(q);
        return;
      }
    });

  },

  patientSummary: patientSummary,
  getDomainTable: getDomainTable,
  patientDomainDetail: patientDomainDetail
};
