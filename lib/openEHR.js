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

var request = require('request');

var q;

// **********************************************

var servers = {
  marand: {
    url: 'https://ehrscape.code-4-health.org',
    queryType: 'aql',
    sourceName: 'Marand'
  },
  ethercis: {
    url: 'http://188.166.246.78:8080',
    queryType: 'sql',
    sourceName: 'EtherCIS'
  }
};

var username = 'c4h_ripple_osi';
var password = 'InDeCoMP';

// **********************************************

function openEHRRequests(params, userObj) {
  
  var noOfServers = 0;
  for (var host in servers) {
    noOfServers++;
  }
  var count = 0;
  var options;
  var url;
  for (var host in servers) {
    if (params.dontAsk && params.dontAsk[host]) {
      console.log(' *** openEHRRequests: dontAsk set for ' + host + ' / so not sending request!');
      count++;
      continue; // ignore this host
    }

    url = servers[host].url + params.url;
    options = {
      url: url,
      method: params.method || 'GET',
      json: true
    };
    if (params.useSessionId !== false) {
      if (!params.sessions[host]) {
        // No session available for this server!
        console.log('**** No session available for host ' + host);
        count++;
        continue;  // skip this host
      }
      options.headers = {
        'Ehr-Session': params.sessions[host]
      }
    }
    if (params.queryString) options.qs = params.queryString;
    if (params.hostSpecific) {
      for (var param in params.hostSpecific[host]) {
        options[param] = params.hostSpecific[host][param];
      }
    }
    console.log('request to ' + host + ': ' + JSON.stringify(options));
    (function(host, params, noOfServers) {
      request(options, function(error, response, body) {
        if (error) {
          console.log('error returned from ' + host + ': ' + error);
        }
        else {
          console.log('response from ' + host + ': ' + JSON.stringify(body));
          //if (!body) console.log('***** no body returned from ' + host);
          //if (body && typeof body === 'string') console.log('body returned from ' + host + ' is a string');
          //if (body && typeof body !== 'string' && params.processBody) params.processBody(body, host, userObj);
          if (params.processBody) params.processBody(body, host, userObj);
        }
        count++;
        if (count === noOfServers && params.callback) {
          params.callback(userObj);
        }
      });
    }(host, params, noOfServers));
  }
}

function startSessions(callback) {
  var sessions = {};
  var params = {
    callback: callback,
    url: '/rest/v1/session',
    queryString: {
      username: username,
      password: password
    },
    method: 'POST',
    useSessionId: false
  };
  params.processBody = function(body, host, sessions) {
    if (body && body.sessionId) sessions[host] = body.sessionId;
  };
  openEHRRequests(params, sessions);
}

function stopSessions(sessions, callback) {
  var params = {
    callback: callback,
    url: '/rest/v1/session',
    queryString: {
      username: username,
      password: password
    },
    method: 'DELETE',
    sessions: sessions
  };
  openEHRRequests(params, sessions);
}

function mapNHSNo(nhsNo, sessions, callback) {
  
  var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo]);
  if (nhsNoMap.exists) {
    if (callback) callback();
    return;
  }

  var params = {
    callback: callback,
    url: '/rest/v1/ehr',
    queryString: {
      subjectId: nhsNo,
      subjectNamespace: 'uk.nhs.nhs_number'
    },
    method: 'GET',
    sessions: sessions
  };
  params.processBody = function(body, host) {
    var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo, host]);
    nhsNoMap.value = body.ehrId;
  };
  openEHRRequests(params);
}

function ehrIdAvailable(nhsNo) {
  var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo]);
  return nhsNoMap.exists;
};

function getEhrId(nhsNo, host) {
  var nhsNoMap = new q.documentStore.DocumentNode('rippleNHSNoMap', [nhsNo, host]);
  return nhsNoMap.value;
};

function init() {
  q = this;
}

module.exports = {
  init: init,
  servers: servers,
  username: username,
  password: password,
  requests: openEHRRequests,
  startSessions: startSessions,
  stopSessions: stopSessions,
  mapNHSNo: mapNHSNo,
  idsAvailable: ehrIdAvailable,
  getEhrId: getEhrId
};
