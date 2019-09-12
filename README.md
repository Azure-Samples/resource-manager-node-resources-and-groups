---
page_type: sample
languages:
- javascript
products:
- azure
description: "This sample explains how to manage your resources and resource groups in Azure using the Azure SDK for Node.js."
urlFragment: resource-manager-node-resources-and-groups
---

# Manage Azure resources and resource groups with Node.js

This sample explains how to manage your
[resources and resource groups in Azure](https://azure.microsoft.com/en-us/documentation/articles/resource-group-overview/#resource-groups)
using the Azure SDK for Node.js.

**On this page**

- [Run this sample](#run)
- [What is index.js doing?](#example)
    - [List resource groups](#list-groups)
    - [Create a resource group](#create-group)
    - [Update a resource group](#update-group)
    - [Create a key vault in the resource group](#create-resource)
    - [Get a resource](#get-resources)
    - [Export the resource group template](#export)
    - [Delete a resource](#delete-resource)

## Tasks done in this sample
  1. Create a resource group 
  2. List a resource group
  3. Update a resource group
  4. Create a key vault resource in the resource group
  5. Get details for a given resource
  6. Export the resource group template

<a id="run"/>
## Running this sample

1. If you don't already have it, [get node.js](https://nodejs.org).

2. Clone the repository.

    ```
    git clone git@github.com:Azure-Samples/resource-manager-node-resources-and-groups.git
    ```

3. Install the dependencies.

    ```
    cd resource-manager-node-resources-and-groups
    npm install
    ```

4. Create an Azure service principal either through
    [Azure CLI](https://azure.microsoft.com/documentation/articles/resource-group-authenticate-service-principal-cli/),
    [PowerShell](https://azure.microsoft.com/documentation/articles/resource-group-authenticate-service-principal/)
    or [the portal](https://azure.microsoft.com/documentation/articles/resource-group-create-service-principal-portal/).

5. Set the following environment variables using the information from the service principle that you created.

    ```
    export AZURE_SUBSCRIPTION_ID={your subscription id}
    export CLIENT_ID={your client id}
    export APPLICATION_SECRET={your client secret}
    export DOMAIN={your tenant id as a guid OR the domain name of your org <contosocorp.com>}
    ```

    > [AZURE.NOTE] On Windows, use `set` instead of `export`.

6. Run the sample.

    ```
    node index.js
    ```

7. To clean up after index.js, run the cleanup script.

    ```
    node cleanup.js <resourceGroupName> <resourceName>
    ```

<a id="example"></a>
## What is index.js doing?

The sample creates, lists and updates a website.
It starts by logging in using your service principal.

```
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
```

With that set up, the sample performs these operations.

<a id="create-group"></a>
### Create a resource group

```
var groupParameters = { location: location, tags: { sampletag: 'sampleValue' } };
resourceClient.resourceGroups.createOrUpdate(resourceGroupName, groupParameters, callback);
```

<a id="list-groups"></a>
### List resource groups

List the resource groups in your subscription.

```
resourceClient.resourceGroups.list(callback);
```

<a id="update-group"></a>
### Update a resource group

The sample adds a tag to the resource group.

```
var groupParameters = { location: location, tags: { sampletag: 'helloworld' } };
resourceClient.resourceGroups.createOrUpdate(resourceGroupName, groupParameters, callback);
```

<a id="create-resource"></a>
### Create a key vault in the resource group

```
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
resourceClient.resources.createOrUpdate(resourceGroupName, 
                                        resourceProviderNamespace, 
                                        parentResourcePath, 
                                        resourceType, 
                                        resourceName, 
                                        apiVersion, 
                                        keyvaultParameter, 
                                        callback);
```

<a id="get-resources"></a>
### Get a resource

```
resourceClient.resources.get(resourceGroupName, 
                             resourceProviderNamespace, 
                             parentResourcePath, 
                             resourceType, 
                             resourceName, 
                             apiVersion, 
                             callback);
```

<a id="export"></a>
### Export the resource group template

You can export the resource group as a template and then use that
to [deploy your resources to Azure](https://azure.microsoft.com/documentation/samples/resource-manager-ruby-template-deployment/).

```
var rgParameter = {
  resources: ['*']
};
resourceClient.resourceGroups.exportTemplate(resourceGroupName, rgParameter, callback);
```

<a id="delete-resource"></a>
### Delete a resource

```
resourceClient.resources.deleteMethod(resourceGroupName, 
                                      resourceProviderNamespace, 
                                      parentResourcePath, 
                                      resourceType, 
                                      resourceName, 
                                      apiVersion, 
                                      callback);
```

## More information

Please refer to [Azure SDK for Node](https://github.com/Azure/azure-sdk-for-node) for more information.
