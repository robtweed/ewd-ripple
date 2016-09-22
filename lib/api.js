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

var mpv = require('./mpv'); // Multiple Patient View
var spv = require('./spv'); // Single Patient View

module.exports = {

  init: function() {
    var q = this;

    if (this.isFirst) {
      console.log('************');
      console.log('**** clearing down ripple cache Globals ********');
      console.log('************');
      new this.documentStore.DocumentNode('ripplePatients').delete();
      new this.documentStore.DocumentNode('rippleGPs').delete();
      new this.documentStore.DocumentNode('rippleMedicalDepts').delete();
      new this.documentStore.DocumentNode('rippleNHSNoMap').delete();
    }

    mpv.init.call(this);
    spv.init.call(this);

    console.log('*** domainReady handler loaded');
  },

  restModule: true,

  handlers: {

    patients: function(messageObj, finished) {

      if (messageObj.params && messageObj.params['0']) {
        var path = messageObj.params['0'];
        if (path !== '') {
          var pathArr = path.split('/');
          var nhsNo = pathArr[0];
          var domain = pathArr[1];
          var sourceId = pathArr[2];
          var results;
          if (!domain) {
            spv.patientSummary.call(this, nhsNo, function(results) {
              finished(results);
              return;
            });
            return;
          }
          if (domain === 'diagnoses') domain = 'problems';
          if (!sourceId) {
            spv.getDomainTable.call(this, nhsNo, domain, function(results) {
              finished(results);
              return;
            });
            return;
          }
          results = spv.patientDomainDetail.call(this, nhsNo, domain, sourceId);
          finished(results);
          return;
        }
        finished({error: 'Missing patient Id in path: ' + JSON.stringify(messageObj)});
        return;
      }
      // no patient Id specified, so fetch entire list
      mpv.getPatients.call(this, finished);
    }
  }
};

