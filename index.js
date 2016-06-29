/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

var util = require('util');
var async = require('async');
var msRestAzure = require('ms-rest-azure');
var ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

_validateEnvironmentVariables();
var clientId = process.env['CLIENT_ID'];
var domain = process.env['DOMAIN'];
var secret = process.env['APPLICATION_SECRET'];
var subscriptionId = process.env['AZURE_SUBSCRIPTION_ID'];
var resourceClient;
//Sample Config
var randomIds = {};
var location = 'westus';
var resourceGroupName = _generateRandomId('testrg', randomIds);
var resourceName = _generateRandomId('testresource', randomIds);

var resourceProviderNamespace = 'Microsoft.KeyVault';
var parentResourcePath = '';
var resourceType = 'vaults';
var apiVersion = '2015-06-01';

///////////////////////////////////////
//Entrypoint for the sample script   //
///////////////////////////////////////

msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials) {
  if (err) return console.log(err);
  resourceClient = new ResourceManagementClient(credentials, subscriptionId);
  // Work flow of this sample:
  // 1. create a resource group 
  // 2. list resource groups
  // 3. update a resource group
  // 4. create a key vault resource in the resource group
  // 5. get details for a given resource
  // 6. export the resource group template
  // 7. delete a resource(optional)
  // 8. delete a resource group(optional)
  
  async.series([
    function (callback) {
      //Task 1
      createResourceGroup(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        callback(null, result);
      });
    },
    function (callback) {
      //Task 2
      listResourceGroups(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log(util.format('\nResource Groups in subscription %s : \n%s',
            subscriptionId, util.inspect(result, { depth: null })));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 3
      updateResourceGroup(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log(util.format('\nUpdated Resource Groups %s : \n%s',
            resourceGroupName, util.inspect(result, { depth: null })));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 4
      createResource(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log(util.format('\nCreated a Key Vault resource in Resource Groups %s : \n%s',
        resourceGroupName, util.inspect(result, { depth: null })));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 5
      getResource(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log(util.format('\nResource details: \n%s', util.inspect(result, { depth: null })));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 6
      exportResourceGroupTemplate(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log(util.format('\nResource group template: \n%s',
            util.inspect(result, { depth: null })));
        callback(null, result);
      });
    }
  ], 
  // Once above operations finish, cleanup and exit.
  function (err, results) {
    if (err) {
      console.log(util.format('\n??????Error occurred in one of the operations.\n%s', 
          util.inspect(err, { depth: null })));
    } else {
      //console.log(util.format('\n######You can browse the website at: https://%s.', results[4].enabledHostNames[0]));
    }
    console.log('\n###### Exit ######');
    console.log(util.format('Please execute the following script for cleanup:\nnode cleanup.js %s %s', resourceGroupName, resourceName));
    process.exit();
  });
});


// Helper functions
function createResourceGroup(callback) {
  var groupParameters = { location: location, tags: { sampletag: 'sampleValue' } };
  console.log('\nCreating resource group: ' + resourceGroupName);
  return resourceClient.resourceGroups.createOrUpdate(resourceGroupName, groupParameters, callback);
}

function listResourceGroups(callback) {
  console.log('\nListing all resource groups: ');
  return resourceClient.resourceGroups.list(callback);
}

function updateResourceGroup(callback) {
  var groupParameters = { location: location, tags: { sampletag: 'helloworld' } };
  console.log('\nUpdating resource group: ' + resourceGroupName);
  return resourceClient.resourceGroups.createOrUpdate(resourceGroupName, groupParameters, callback);
}

function createResource(callback) {
  var keyvaultParameter = {
    location : "West US",
    properties : {
      sku : {
        family : 'A',
        name : 'standard'
      },
      accessPolicies : [],
      enabledForDeployment: true,
      enabledForTemplateDeployment: true,
      tenantId : domain
    },
    tags : {}
  };
  console.log(util.format('\nCreating Key Vault resource %s in resource group %s'), 
    resourceName, resourceGroupName);
  return resourceClient.resources.createOrUpdate(resourceGroupName, 
                                                 resourceProviderNamespace, 
                                                 parentResourcePath, 
                                                 resourceType, 
                                                 resourceName, 
                                                 apiVersion, 
                                                 keyvaultParameter, 
                                                 callback);
}

function getResource(callback) {
  console.log(util.format('\nGetting resource %s details in resource group %s'), 
    resourceName, resourceGroupName);
  return resourceClient.resources.get(resourceGroupName, 
                                      resourceProviderNamespace, 
                                      parentResourcePath, 
                                      resourceType, 
                                      resourceName, 
                                      apiVersion, 
                                      callback);
}

function exportResourceGroupTemplate(callback) {
  var rgParameter = {
    resources: ['*']
  };
  console.log(util.format('\nExporting resource group template: %s'), resourceGroupName);
  return resourceClient.resourceGroups.exportTemplate(resourceGroupName, rgParameter, callback);
}

function deleteResource(callback) {
  console.log(util.format('\nDeleting resource %s in resource group %s'), 
    resourceName, resourceGroupName);
  return resourceClient.resources.deleteMethod(resourceGroupName, 
                                               resourceProviderNamespace, 
                                               parentResourcePath, 
                                               resourceType, 
                                               resourceName, 
                                               apiVersion, 
                                               callback);
}

function deleteResourceGroup(callback) {
  console.log('\nDeleting resource group: ' + resourceGroupName);
  return resourceClient.resourceGroups.deleteMethod(resourceGroupName, callback);
}

function _validateEnvironmentVariables() {
  var envs = [];
  if (!process.env['CLIENT_ID']) envs.push('CLIENT_ID');
  if (!process.env['DOMAIN']) envs.push('DOMAIN');
  if (!process.env['APPLICATION_SECRET']) envs.push('APPLICATION_SECRET');
  if (!process.env['AZURE_SUBSCRIPTION_ID']) envs.push('AZURE_SUBSCRIPTION_ID');
  if (envs.length > 0) {
    throw new Error(util.format('please set/export the following environment variables: %s', envs.toString()));
  }
}

function _generateRandomId(prefix, exsitIds) {
  var newNumber;
  while (true) {
    newNumber = prefix + Math.floor(Math.random() * 10000);
    if (!exsitIds || !(newNumber in exsitIds)) {
      break;
    }
  }
  return newNumber;
}
