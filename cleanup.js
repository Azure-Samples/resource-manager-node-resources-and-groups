﻿/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

var util = require('util');
var msRestAzure = require('ms-rest-azure');
var ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

_validateEnvironmentVariables();
_validateParameters();
var clientId = process.env['CLIENT_ID'];
var domain = process.env['DOMAIN'];
var secret = process.env['APPLICATION_SECRET'];
var subscriptionId = process.env['AZURE_SUBSCRIPTION_ID'];
var resourceGroupName = process.argv[2];
var resourceName = process.argv[3];
var resourceClient;
var resourceProviderNamespace = 'Microsoft.KeyVault';
var parentResourcePath = '';
var resourceType = 'vaults';
var apiVersion = '2015-06-01';

function deleteResource(callback) {
  console.log(util.format('\nDeleting resource:  %s'), resourceName);
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

function _validateParameters() {
  if (!process.argv[2] || !process.argv[3]) {
    throw new Error('Please provide the resource group and the resource name by executing the script as follows: "node cleanup.js <resourceGroupName> <resourceName>".');
  }
}

//Entrypoint of the cleanup script
msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials) {
  if (err) return console.log(err);
  resourceClient = new ResourceManagementClient(credentials, subscriptionId);
  deleteResource(function (err, result) {
    if (err) return console.log('Error occured in deleting the resource: ' + resourceName + '\n' + util.inspect(err, { depth: null }));
    console.log('Successfully deleted the resource: ' + resourceName);
    console.log('\nDeleting the resource group can take few minutes, so please be patient :).');
    deleteResourceGroup(function (err, result) {
      if (err) return console.log('Error occured in deleting the resource group: ' + resourceGroupName + '\n' + util.inspect(err, { depth: null }));
      console.log('Successfully deleted the resourcegroup: ' + resourceGroupName);
    });
  });
});