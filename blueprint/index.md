---
title: Develop a mobile app chat feature that uses Genesys Cloud open messaging, AWS services, and the Ionic framework
author: shane.garner
indextype: blueprint
icon: blueprint
image: 
category: 6
summary: |
  This Genesys Cloud Developer Blueprint explains how to develop a simple bidirectional chat feature within a mobile app by using the Genesys Cloud open messaging integration, AWS services, and the Ionic framework. Add or extend this chat functionality to an existing mobile app. The chat feature enables your contact center agents to communicate directly with your customers.
---
This Genesys Cloud Developer Blueprint explains how to develop a simple bidirectional chat feature within a mobile app by using the Genesys Cloud open messaging integration, AWS services, and the Ionic framework. 

![Open messaging implementation](images/ionic-mobile-open-messaging-blueprint-architecture.png "Open messaging implementation")

## Scenario

A customer wants to allow contact center agents to chat directly with customers via an existing mobile application. 

## Solution

The chat feature includes the back-end and front-end interface development. For the front-end interface, the Ionic mobile app development platform that is integrated with Angular ecosystem is used. For more information about the Ionic framework, see [https://ionicframework.com/](https://ionicframework.com/ "Opens the Ionic toolkit page").

Node.js is used for back-end development. Node.js is executed within an AWS Lambda function and exposed via the Amazon API Gateway.

## Solution components

* **Genesys Cloud CX** - A suite of Genesys Cloud services for enterprise-grade communications, collaboration, and contact center management. In this solution, you use the open messaging integration, Architect inbound message flow, queues, and message routing in Genesys Cloud.
* **Amazon API Gateway** - An AWS service for using APIs in a secure and scalable environment. In this solution, the API Gateway exposes a REST endpoint that is protected by an API key. Requests that come to the API Gateway are forwarded to an AWS Lambda.
* **AWS Lambda** - A serverless computing service for running code without creating or maintaining the underlying infrastructure. In this solution, AWS Lambda processes the requests that come through the Amazon API Gateway and forwards them to Genesys Cloud.
* **Amazon DynamoDB** - A highly available, highly scalable NoSQL database that provides fast and predictable performance in a multi-region environment.
  
## Prerequisites

### Specialized knowledge

* Administrator-level knowledge of Genesys Cloud
* AWS Cloud Practitioner-level knowledge of Amazon API Gateway, AWS Lambda, and Amazon DynamoDB
* Experience creating tables in Amazon DynamoDB
  
### Genesys Cloud account

* A Genesys Cloud license. For more information, see [Genesys Cloud Pricing](https://www.genesys.com/pricing "Opens the Genesys Cloud pricing page") in the Genesys website.
* Master Admin role. For more information, see [Roles and permissions overview](https://help.mypurecloud.com/?p=24360 "Opens the Roles and permissions overview article") in the Genesys Cloud Resource Center.

### AWS account

* An administrator account with permissions to access the following services:
  * AWS Identity and Access Management (IAM)
  * Amazon API Gateway
  * Amazon DynamoDB
  * AWS Lambda

## Implementation steps

### Clone the GitHub repository

Clone the GitHub repository [ionic-mobile-open-messaging-blueprint](https://github.com/GenesysCloudBlueprints/ionic-mobile-open-messaging-blueprint "Opens the ionic-mobile-open-messaging-blueprint repository"). The repository folder includes the sample configuration settings and folder structure for the front-end and back-end of the application. 

### Create an OAuth client in Genesys Cloud

1. Log in to your Genesys Cloud organization.
2. Navigate to **Admin** > **OAuth** and click **Add Client**.
3. Enter a name for the client.
4. Under **Grant Types**, select **Client Credentials**.
5. Click the **Roles** tab and select a role. Ensure that the selected role has the following permissions:
      * Analytics > conversationDetail > View
      * Conversation > message > All Permissions
6. Click **Save**.
7. Note the **Client ID** and **Client Secret** values to use in the AWS Lambda setup.

### Create the Amazon DynamoDB tables

1. Create a [table](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-1.html "Opens the Create a table page in Amazon DynamoDB documentation") to provide persistent storage of the chat transcript that the Genesys Cloud creates when an agent replies to a customer. Add the following columns to the table:
   * id
      * type - String
      * Partition Key
   * channelTime
      * type - String
      * Sort Key
2. Optionally create a table used for notifications that are pushed with the API. If you want Genesys Cloud to write to this table, then you must incorporate a data action to call the API. This table is needed only if you have the Notifications tab in the app. Add the following columns to the table:
   * id
      * type - String
      * Partition Key
   * channelTime
      * type - String
      * Sort Key

### Create an AWS S3 bucket

To store any media sent from the Ionic front-end app, create an S3 bucket in AWS. The S3 bucket must have public read access for the objects. Ensure that you implement the security measures that your company requires.

### Create a NodeJs Lambda function 

1. Create a Node.js Lambda function in your AWS account.
2. Configure the Environment variables of the function using the following keys:
   * GC_CLIENT_ID and GC_CLIENT_SECRET - Genesys Cloud OAuth client
   * TRANSCRIPT_TABLE_NAME - The name of the table created in DynamoDB
   * NOTIFICATION_TABLE_NAME - The name of the table created for notifications in DynamoDB
   * S3_URL_BUCKET - URL of the S3 bucket that stores the media files
3. Grant access to the Lambda function so that it allows the following services via an IAM role:
   * PutObject - Adds an object to the S3 bucket
   * Scan, Query, GetItem, and PutItem - For the Amazon DynamoDB tables that you created previously
4.  Package and deploy the Lambda function:
    1.  To install the function, in the ./lambda-backend folder, run `npm install`.
    2.  To package the function, create a zip file of the node_module folder and the index.js file.
    3.  To deploy the function, use the AWS console to upload the zip file to the Lambda function.
5. Deploy the Lambda function.


### Add an Amazon API Gateway to the Lambda function

1. Create a REST API.
2. You can use the OpenAPI Definition to import the API resources and methods.
3. Associate each method with the Lambda function.
4. Set up a mock Lambda integration.
5. For the mock integration, enable CORS by creating an OPTIONS method that returns the required Method Response headers:
   * `Access-Control-Allow-Headers`
   * `Access-Control-Allow-Methods`
   * `Access-Control-Allow-Origin`
   
   :::primary
   **Note**: The responses can contain wildcards that allow you to bypass the CORS issues on browser-based applications.
   :::
   
6. Deploy the API and make a note of the API endpoint URL for later use.

### Create the Open messaging integration in Genesys Cloud

For complete information about setting up an open messaging integration, see [Configuring an open messaging integration](https://help.mypurecloud.com/?p=242772 "Opens the Configuring an open messaging integration article") in the Genesys Cloud Resource Center. 

Use the following information to configure the integration:
* Provide the Amazon API Gateway URL for Outbound Notification Webhook URL followed by `/demoopenmessagewebhook`.
* We recommend using the secret token to validate the message.

When you set up the integration, you must get the GUID of the integration. To use the Genesys Cloud API Explorer to get the GUID:
1. Open the [Genesys Cloud API Explorer](https://developer.genesys.cloud/developer-tools/#/api-explorer "Opens the API Explorer in the Genesys Cloud Developer Tools").
2. Navigate to **Conversations** > **Messaging**.
3. Select **GET Get a list of Open messaging integrations**.
4. Click **Send Request**.
5. In the **Response** section, search for the `name` field.
6. Note the GUID of the integration, which is in the `id` field of your integration. 

   :::primary
   **Note**: You need the GUID of the integration to configure the Ionic front-end framework.
   :::

### Set up Genesys Cloud routing

Set up routing for the integration to route the messages to your agents or bot.

1. In Genesys Cloud, navigate to **Admin** > **Architect**.
2. In Architect, create an Inbound Message flow. For more information, see [Add an inbound message flow](https://help.mypurecloud.com/?p=150191 "Opens the Inbound message flows overview") in the Genesys Cloud Resource Center.
3. Navigate to **Admin** > **Routing** > **Message Routing**.
4. Associate the inbound message flow with a message route. To enter the inbound message flow, select the open messaging integration as the inbound address. For more information, see [Message routing](https://help.mypurecloud.com/?p=152351 "Opens the Message routing overview article.") in the Genesys Cloud Resource Center.

### Configure and run the Ionic framework

Install the Ionic toolkit from the instructions [here](https://ionicframework.com/ "Opens the Ionic framework website").
1. After installation, populate the environment file ` ./ionic-frontend/src/environments/environment.ts` with the following information:
   * Enter the Amazon API Gateway URL for trancriptAPIBaseURL followed by `/transcript/integration/`.
   * Enter the Amazon API Gateway URL for notificationAPIBaseURL followed by `/notification/integration/`.
   * Specify the GUID of the Genesys Cloud open messaging integration in the `integrations` array. Replace the existing value with the GUID that is already present for `chat` and `offers` objects.
   * Provide the `userId` in the format of the email address of the user. 
For more information about installing and running the project using the Ionic toolkit, see [here](https://github.com/shansrini/ionic-mobile-open-messaging-blueprint/blob/main/ionic-frontend/README.md)
2. Navigate to the ionic-frontend folder and execute `ionic serve` in the command prompt.

### Test how it works

Once you have set up everything, send a message from the chat widget of the Ionic front-end interface. The chat message is routed to Genesys Cloud Inbound Message flow. The agent responds from the Genesys Cloud agent desktop and Genesys Cloud sends the message to the webhook URL defined in the open messaging integration.

**Agentless setup**

If you want to send an agentless message, invoke the Genesys Cloud API. For more information, see [Conversations](https://developer.genesys.cloud/api/rest/v2/conversations/#post-api-v2-conversations-messages-agentless "Opens the Conversations page") in Genesys Cloud Developer Center.

**Offers**

You can use the **Offers** tab in the Ionic front-end interface to push any information or coupons to your customers. Replies are not allowed for such messages. To use the **Offers** option, post a message to your Amazon API Gateway using the Amazon API gateway endpoint that you have created.
```
POST <Amazon API Gateway URL>/notification/integration/{integrationId}/user/{userId}
```

From the Ionic configuration file, get the following details:
* `integrationId` - The ID from the integrations section for the `Offers` type.
* `userId` - The email address of the user.

Use the following format for the POST request body text:
```
{
    "type": "text",
    "content": "SuperCoupon",
    "fromId": "agentId"
}
```
**QR code support**

The application can render QR codes in both the **Connect** and the **Offers** tab of the Ionic front-end interface. Use the following format from the Genesys Cloud Agent desktop or the Agentless API in the body text:
```
    "gcDecoratedMessage": {
        "gcMessageType": "qrCode",
        "gcMessageText": "SuperSpecialCoupon!"
    }
}
```
In the **Offers** tab, you can POST this message body to the Amazon API Gateway URL `<Amazon API Gateway URL>/notification/integration/{integrationId}/user/{userId}`:
```
{
    "type": "qrcode",
    "content": "SuperCoupon",
    "fromId": "agentId"
}
```
## Additional resources

* [Amazon API Gateway](https://aws.amazon.com/api-gateway/ "Opens the Amazon API Gateway page") in the Amazon featured services
* [AWS Lambda](https://aws.amazon.com/lambda/ "Opens the Amazon AWS Lambda page") in the Amazon featured services
* [Ionic Docs](https://ionicframework.com/docs/ "Opens the Introduction to Ionic page") in the Ionic framework site
* [Open messaging integration](https://help.mypurecloud.com/?p=237926 "Opens the About open messaging page") in the Genesys Cloud Resource Center
* The [ionic-mobile-open-messaging-blueprint](https://github.com/GenesysCloudBlueprints/ionic-mobile-open-messaging-blueprint "Opens the ionic-mobile-open-messaging-blueprint repository in GitHub") repository in GitHub
