/*

 ----------------------------------------------------------------------------
 | ewd-xpress.js: Express and ewd-qoper8 based application container        |
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

  16 May 2016

  Example ewd-xpress Startup file for Ripple OSI Middle Tier

*/


var config = {
  managementPassword: 'keepThisSecret!',
  serverName: 'New EWD Server',
  port: 3000,
  poolSize: 2,
  webServerRootPath: '/opt/tomcat/ripple',
  database: {
    type: 'gtm'
  },
  moduleMap: {
    api: 'ewd-ripple'
  }
};

var ewdXpress = require('ewd-xpress').master;
var xp = ewdXpress.intercept();
xp.app.use('/api', xp.qx.router());

ewdXpress.start(config);
