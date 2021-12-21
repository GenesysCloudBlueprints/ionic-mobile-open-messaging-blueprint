# ionic-mobile-open-messaging-blueprint
This blueprint gives an example of how you can leverage the Genesys Open Messaging API to develop a simple bidirectional 
chat between a customer and a call center agent within a mobile app.  This would allow you to add or extend chat functionality
within your company's mobile app and allow your agent to communicate directly with your customer.

![Open Messaging Implementation](blueprint/images/ionic-mobile-open-messaging-blueprint-architecture.png "Open Messaging Implementation")

This repo has 2 different code bases that are required to demonstrate this functionality.  

First we have the ionic-frontend. Ionic is a cross-platform mobile app development platform.  While you can use React or 
Vue we chose to leverage Angular. This was mainly a personal preference.  Ionic can be used to build mobile apps and 
mobile websites.  It was chosen over direct native development for simplicity.  You can read more about Ionic here: 
https://ionicframework.com/ Click [here](./ionic-frontend/README.md) to get additional details and a list of prerequisites.

Next we have the backend that was written in NodeJS and ran within AWS Lambda and exposed with AWS API Gateway.  While
this is a relatively simple backend application, it would be good to familiarize yourself with the following technologies
from Amazon Web Services (AWS):
* AWS Lambda https://aws.amazon.com/lambda/
* AWS API Gateway https://aws.amazon.com/api-gateway/
* AWS Dynamo DB https://aws.amazon.com/dynamodb/
* AWS IAM https://aws.amazon.com/iam/

Click [here](./lambda-backend/README.md) to learn how to build, configure, and run this project inside your AWS account.

# Installation Instructions
1. Create Genesys Cloud Oauth Client
    View instructions [here](https://help.mypurecloud.com/articles/create-an-oauth-client/) to set up an oauth client.  

    You will need a Client Credentials Grant and a Role that has the minimum following permissions:
    * analytics > conversationDetail > View
    * Conversation > message > All Permissions

    Note the Client ID and the Client Secret.  You will need those to set up the Lambda Backend
2. Create the AWS DynamoDB Tables
   * I am assuming you have a bit of familiarity with the DynamoDB product from AWS.  If you are not familiar
      you may want to go through some tutorials to get familiar.
   * Pick a table name for the Open Messaging Transcript. This is the persistent storage for the chat transcript and 
     this table is what Genesys Cloud writes to when an agent replies.
     * You will want to add the following colums:
       * id
         * type - String
         * Partition Key
       * channelTime
         * type - String
         * Sort Key
     * You are welcome to optimize this table with additional indexes and such but that is beyond the scope of this blueprint.
   * Pick a table name for the Notifications.  This is a separate table for pushing notifications to the app like coupons.
     This table is only used with the API.  Genesys Cloud won't write to this table unless you incorporate a data action 
     to call on the API.  If you don't use the Notifications (Offers) tab in the App then this is not really necessary.
     * You will want to add the following colums:
         * id
             * type - String
             * Partition Key
         * time
             * type - String
             * Sort Key
     * You are welcome to optimize this table with additional indexes and such but that is beyond the scope of this blueprint.
3. Create an AWS S3 bucket
   * This will house any media sent from the Ionic Front End app.
   * It will need to allow publicly accessible reads for all objects.  This isn't a good security posture, so 
     please lock this down in an appropriate way for your organization.
4. Create the AWS Lambda Backend
    * I am assuming you have a bit of familiarity with the Lambda product from AWS.  If you are not familiar
      you may want to go through some tutorials to get familiar.
    * Create a Lambda in your AWS account.
    * Package and deploy the Lambda code.
      * To install run "npm install" inside of the ./lambda-backend folder
      * To package zip up the node_module folder and the index.js file.
      * To deploy upload the zip to the Lambda using the AWS console.
    * Configure the Environment variables in the Configuration tab of the Lambda using the following keys:
      * GC_CLIENT_ID
      * GC_CLIENT_SECRET
        * The GC_CLIENT_ID and GC_CLIENT_SECRET are from Genesys Cloud Oauth Client
      * TRANSCRIPT_TABLE_NAME
        * This is the name of the table you created DynamoDB above
      * NOTIFICATION_TABLE_NAME
        * This is the name of the second table you created DynamoDB above
      * S3_URL_BUCKET
        * This is the URL for an S3 bucket you want to use for media like pictures.
      * Grant access to the Lambda to allow the following via IAM 
        * Puts to your S3 bucket created in Step 2
        * Scan, Query, GetItem, and PutItem for the AWS DynamoDB tables created in step 2
    * Deploy the Lambda
5. Create the AWS API Gateway
   * I am assuming you have a bit of familiarity with the API Gateway product from AWS.  If you are not familiar
     you may want to go through some tutorials to get familiar.
   * This is a REST API and you can import the [Open API Definition](./lambda-backend/DemoOpenMessaging.yaml) to get the 
     methods and resources defined.  
     * Associate each method with the above Lambda.
     * For the Options calls you will need to create a mock lambda integration. The Method Response in this case
       should contain the appropriate CORS headers: Access-Control-Allow-Headers, Access-Control-Allow-Methods,
       Access-Control-Allow-Origin.  Typically, you can generate these from API Gateway but since you are
       Importing you will need to do that yourself.  The lambda responses will contain wild cards to allow
       you to bypass the CORS issues on browser based applications.  Feel free to lock that down if you need
       to.
     * Deploy the API Gateway and note the URL it displays.
6. Create the Genesys Cloud Open Messaging integration
   * View instructions [here](https://help.mypurecloud.com/articles/configure-an-open-messaging-integration/) to set up
     the Open Messaging integration
   * The "Outbound Notification Webhook URL" is your AWS API Gateway URL (from step 5) followed by "/demoopenmessagewebhook" 
   * We don't leverage the "Outbound Notification Webhook Signature Secret Token" but you will need to put a value in it 
     because it's required.  Again this isn't a good security posture and you should adjust the Lambda to leverage an 
     appropriate secret token.
   * You will need to get the GUID for this integration.  Unfortunately it is not accessible from the Genesys Cloud UI at
     this point, so you will need to leverage the API to get that.
     * The easiest way is to use the [Genesys Cloud API Explorer](https://developer.genesys.cloud/developer-tools/#/api-explorer)
       * Navigate to Conversations -> Messaging
       * Click on "GET Get a List of Open messaging integrations"
       * Click "Send Request"
       * Find your integration using the "name" field
       * The GUID of the integration is located in the "id" field of the object that you located with the "name" field
       * Take note of the GUID as you will need this to configure the Ionic Frontend.
7. Setting up a Genesys Cloud Route
   * While explaining Genesys Cloud Routing goes well beyond the scope of this blueprint, it is worth mentioning that if
     you don't have a route set up for this integration, the messages will never get to an agent, bot flow, etc.
   * You will want to create an "Inbound Message Flow" in the Architect tool that is available from the Admin screen of 
     Genesys Cloud.  This will dictate what happens with your messages as the come into Genesys. For more details, click
     [here](https://help.mypurecloud.com/articles/inbound-message-flows/)
   * You will then need to associate that "Inbound Message Flow" you created with a "Message Route" using the "Message Routing"
     Admin menu option.  From there you can associate your "Inbound Message Flow" with your "Inbound Address" and in this 
     case your "Inbound Address" is the Open Messaging integration that your created in step 6. For more details, click
     [here](https://help.mypurecloud.com/articles/about-message-routing/)
8. Configure and run the Ionic Frontend locally
   * If you are not familiar with Ionic please read up on it and get it installed before proceeding.  You can find information
     on the Ionic plaform [here](https://ionicframework.com/)
   * Open the environment file: ./ionic-frontend/src/environments/environment.ts
     * transcriptAPIBaseURL needs to be populated with your AWS API Gateway URL from Step 5 followed by `/transcript/integration/`
     * notificationAPIBaseURL needs to be populated with your AWS API Gateway URL from Step 5 followed by `/notification/integration/`
     * In the "integrations" array you will need to specify the GUID of the Genesys Cloud Open Messaging integration you 
       created in step 6 in both the "chat" and "offers" object using the id value.  You will replace the value that is 
       already in there
     * The userId is arbitrary but should remain in the format of an email address.  This just identifies the customer
       that is using the app.  Ideally this would be provided as part of a login process but that is beyond the scope of
       this demo.  The userId is what ties the conversation together and is used to pull the transcript.  If you need
     * The
   * Additional details on how to install and run the project are located [here](./ionic-frontend/README.md)
   * Assuming you have everything set up with NPM and Ionic you should be able to navigate to the ionic-frontend folder and
     type `ionic serve` and you should be up and running.

### Usage
Once you have everything set up, you can send a message from the chat part of the Ionic Frontend and it should get routed
to your Genesys Cloud Inbound Message Flow.  To respond the agent just replies from the Genesys Cloud Agent Desktop and 
Genesys Cloud will send that message to the webhook URL that you defined as part of the Genesys Cloud Open Messaging Integration.

#### Agentless
To send an agentless message you can follow documentation here to invoke the Genesys Cloud API: 
https://developer.genesys.cloud/api/rest/v2/conversations/#post-api-v2-conversations-messages-agentless 

Agentless messages can be helpful to proactively reach out to customers.

#### Offers
The "Offers" tab is used to push content to the customer but it is push only.  There is no reply allowed.  The use case 
here is that we detected you doing something in an architect flow or predictive engagement and want to push information
or a coupon or something to the customer.

To use the "Offers" tab in the Ionic Frontend, you can post a message to your AWS API Gateway using the AWS API Gateway 
endpoint you created.  You will POST to this URL: `<AWS API Gateway URL>/integration/{integrationId}/user/{userId}`
* The integrationId is the id from the integrations section for the "offers" type in the 
  [Ionic Config File](./ionic-frontend/src/environments/environment.ts)
* The userId is the userId from the [Ionic Config File](./ionic-frontend/src/environments/environment.ts)
* The body should be formatted like this:
```
{
    "type": "text",
    "content": "SuperCoupon",
    "fromId": "agentId"
}
```
#### QR Code support
The application can render QR codes in both the "Connect" and the "Offers" tab.  

Use this format from the Genesys Cloud Agent desktop or the Agentless API in the textBody.

```
{
    "gcDecoratedMessage": {
        "gcMessageType": "qrCode",
        "gcMessageText": "SuperSpecialCoupon!"
    }
}
```

For the Offers tab you can POST this message body to the `<AWS API Gateway URL>/integration/{integrationId}/user/{userId}` URL:
```
{
    "type": "qrcode",
    "content": "SuperCoupon",
    "fromId": "agentId"
}
```

### Disclaimer
This project is meant to demonstrate the capabilities of the Open Messaging Integration.  This is not intended to be a 
production application.  In addition to numerous security concerns listed in the installation instructions, no real 
hardening has been done.  Error handling is at a minimum, no code scans have been done, etc.  Scaling has not been a 
consideration in building this application.  While the components used to build this are each very capable and scalable,
care needs to be taken to optimize this for a production deployment.  Also, no automated testing has been done with any 
of these components. 
