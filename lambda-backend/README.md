#OpenMessaging Backend

This is an AWS lambda based project.  This is the middleware that allows Genesys Cloud to send 
webhook notifications.  It also allows for the client to pull the transcript and post new messages.

## DynamoDB
You will need to create a table called "OpenMessagingChat" with an id column as the "Primary partition
key" and channelTime as the "Primary sort key".  The application does require a scan with this set up
since we are querying based on the channelToId and the channelFromId.  Some thought needs to go into 
the structure of this data, but that is beyond the scope of the low volume POC.

## API Gateway
This does require an API Gateway frontend as well. The DemoOpenMessaging.yaml is and OpenAPI 3.0 spec
and can be imported to generate your API Gateway.  You will need to associate the Lambda with the 
endpoints using a lambda proxy.  

#### Note on CORS and Options calls
The options calls can be set up with a Mock integration.  The Method Response in this case 
should contain the appropriate CORS headers: Access-Control-Allow-Headers, Access-Control-Allow-Methods,
Access-Control-Allow-Origin.  Typically, you can generate these from API Gateway but since you are 
Importing you may need to do that yourself.  The lambda responses will contain wild cards to allow 
you to bypass the CORS issues on browser based applications.  Feel free to lock that down if you need
to.


## Deploy to Lambda
Just run npm install, zip up the node_modules and the index.js
and upload that to the lambda.
