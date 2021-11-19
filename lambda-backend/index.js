const AWS = require('aws-sdk');
const pc = require('purecloud-platform-client-v2');
const axios = require('axios');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const {v4: uuidv4} = require('uuid');
const gCclient = pc.ApiClient.instance;
const HTTP_RESPONSE = {
    OK: 200,
    NOT_FOUND: 404,
    CONFLICT: 409,
    NOT_IMPLEMENTED: 501
};
const CORS_HEADERS = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
}

const USER_ID_PATH_POSITION = 5;
const INTEGRATION_ID_PATH_POSITION = 3;

exports.handler = async (event) => {
    try {
        console.log("Event:", JSON.stringify(event));
        const path = event.path;
        if(!path){
            return {
                statusCode: HTTP_RESPONSE.NOT_IMPLEMENTED
            };
        }
        const userId = getParamFromPath(path, USER_ID_PATH_POSITION);
        const integrationId = getParamFromPath(path, INTEGRATION_ID_PATH_POSITION);
        if (path.toLowerCase().includes("demoopenmessagewebhook")) {
            await writeMessageToDynamo(JSON.parse(event.body));
        }else if (userId && integrationId && path.toLowerCase().includes("transcript")) {
            if (event.httpMethod == "POST") {
                let message = formatGCMessage(event, integrationId, userId);
                await uploadToS3(message);
                let gcResult = await sendMessageToGC(message);
                await writeMessageToDynamo(gcResult);
            } else if (event.httpMethod == "GET") {
                let transcript = await getTranscript(integrationId, userId);
                return {
                    statusCode: HTTP_RESPONSE.OK,
                    headers: CORS_HEADERS,
                    body: JSON.stringify(transcript)
                }
            } else {
                return {
                    statusCode: HTTP_RESPONSE.NOT_FOUND,
                    headers: CORS_HEADERS
                };
            }
        } else if (path.toLowerCase().includes("notification")) {
            if (event.httpMethod == "POST") {
                await handleNotificationUpsert(event, false, integrationId, userId);
            } else if (event.httpMethod == "PUT") {
                await handleNotificationUpsert(event, true, integrationId, userId);
            } else if (event.httpMethod == "GET") {
                let notifications = await getNotifications(integrationId, userId);
                return {
                    statusCode: HTTP_RESPONSE.OK,
                    headers: CORS_HEADERS,
                    body: JSON.stringify(notifications)
                }
            }
        } else {
            return  {
                statusCode: HTTP_RESPONSE.NOT_IMPLEMENTED,
                headers: CORS_HEADERS,
                body: JSON.stringify('Not implemented')
            };
        }
        return  {
            statusCode: HTTP_RESPONSE.OK,
            headers: CORS_HEADERS,
            body: JSON.stringify('OK')
        };
    } catch (error){
        console.log("there was an issue", error);
        return {
            statusCode: error.statusCode,
            headers: CORS_HEADERS,
            body: JSON.stringify(error.message)
        };
    }

};
async function handleNotificationUpsert(event, isUpdate, integrationId, userId){
    const passedInNotification = JSON.parse(event.body);
    const existingNotification = await getNotificationById(passedInNotification.id);
    await validateNotification(passedInNotification, existingNotification, isUpdate, integrationId, userId);
    const notification = formatNotificationForDynamo(passedInNotification, existingNotification, isUpdate, integrationId, userId);
    await writeNotificationToDynamo(notification);
}
async function initializeGCClient(){
    gCclient.setReturnExtendedResponses(true);
    return await gCclient.loginClientCredentialsGrant(process.env.GC_CLIENT_ID, process.env.GC_CLIENT_SECRET);
}
async function writeMessageToDynamo(body){
    let dbParams = {
        "TableName": process.env.TRANSCRIPT_TABLE_NAME,
        "Item" : {
            "id": body.id,
            "type": body.type,
            "text": body.text,
            "direction": body.direction,
            "channelId": body.channel.id,
            "channelPlatform": body.channel.platform,
            "channelType": body.channel.type,
            "channelToId": body.channel.to.id,
            "channelFromId": body.channel.from.id,
            "channelTime": body.channel.time,
            "channelMessageId": body.channel.messageId,
        }
    };
    if(body.content && body.content.length > 0){
        const contentArray = [];
        body.content.forEach(content => {
            const contentDBItem = {
                "contentType": body.content[0]?.contentType,
                "attachmentMediaType": body.content[0]?.attachment?.mediaType,
                "attachmentUrl": body.content[0]?.attachment?.url,
                "attachmentMime": body.content[0]?.attachment?.mime,
                "attachmentFilename": body.content[0]?.attachment?.filename
            }
            contentArray.push(contentDBItem);
        });
        dbParams.Item.content = contentArray;
    }
    return await dynamodb.put(dbParams).promise();
}
async function writeNotificationToDynamo(body){
    let dbParams = {
        "TableName": process.env.NOTIFICATION_TABLE_NAME,
        "Item" : {
            "id": body.id,
            "time": body.time,
            "type": body.type,
            "content": body.content,
            "integrationId": body.integrationId,
            "toId": body.toId,
            "fromId": body.fromId,
            "acknowledged": body.acknowledged,
            "updateTime": body.updateTime
        }
    };
    return await dynamodb.put(dbParams).promise();
}
async function getTranscript(integrationId, fromId){
    let dbParams = {
        "TableName": process.env.TRANSCRIPT_TABLE_NAME,
        FilterExpression: "#channelId = :channelId and (#channelToId = :fromId or #channelFromId = :fromId)" ,
        ExpressionAttributeNames:{
            "#channelToId": "channelToId",
            "#channelFromId": "channelFromId",
            "#channelId": "channelId"
        },
        ExpressionAttributeValues: {
            ":fromId": fromId,
            ":channelId": integrationId
        }
    };
    const dynamoResult = await dynamodb.scan(dbParams).promise();
    let transcript = {
        'messages': dynamoResult.Items,
        'count': dynamoResult.Count
    };

    return transcript;
}
async function getNotifications(integrationId, userId){
    let dbParams = {
        "TableName": process.env.NOTIFICATION_TABLE_NAME,
        FilterExpression: "#toId = :toId and #integrationId = :integrationId",
        ExpressionAttributeNames:{
            "#toId": "toId",
            "#integrationId": "integrationId"
        },
        ExpressionAttributeValues: {
            ":toId": userId,
            ":integrationId": integrationId
        }
    };
    const dynamoResult = await dynamodb.scan(dbParams).promise();
    let notifications = {
        'notifications': dynamoResult.Items,
        'count': dynamoResult.Count
    };

    return notifications;
}
async function getNotificationById(id){
    let existingResult = null;
    if(id){
        let dbParams = {
            "TableName": process.env.NOTIFICATION_TABLE_NAME,
            KeyConditionExpression: "#id = :id",
            ExpressionAttributeNames:{
                "#id": "id"
            },
            ExpressionAttributeValues: {
                ":id": id
            }
        };
        let dynamoResult = await dynamodb.query(dbParams).promise();
        if(dynamoResult.Count > 0) {
            existingResult = dynamoResult.Items[0];
        }
    }
    return existingResult;
}
async function validateNotification(passedInNotification, existingNotification, isUpdate, integrationId, userId) {
    if(isUpdate) {
        if(!passedInNotification.id){
            throw {
                statusCode: HTTP_RESPONSE.CONFLICT,
                message: 'Updates (PUT) to a notification requires you to specify the ID.'
            };
        }
        if(!existingNotification){
            throw {
                statusCode: HTTP_RESPONSE.NOT_FOUND,
                message: 'You are trying to update (PUT) a notification that doesn\'t exist.'
            };
        }
        if((existingNotification.integrationId && existingNotification.integrationId != integrationId)
            || (existingNotification.userId && existingNotification.userId != userId)) {
            throw {
                statusCode: HTTP_RESPONSE.CONFLICT,
                message: 'Updates (PUT) to a notification do not allow you to change the integrationId or the userId.'
            };
        }
    } else {
        if(existingNotification){
            throw {
                statusCode: HTTP_RESPONSE.CONFLICT,
                message: 'You are trying to create (POST) a notification that already exists with the given id.'
            };
        }
        //Not an update, we are creating a new notification
        if (!integrationId || !userId) {
            throw {
                statusCode: HTTP_RESPONSE.CONFLICT,
                message: 'Creating (POST) a notification requires you to specify the integrationId AND the userId.'
            };
        }
    }
}
function formatNotificationForDynamo(passedInNotification, existingNotification, isUpdate, integrationId, userId) {
    if(isUpdate) {
        passedInNotification.updateTime = new Date().toISOString();
        passedInNotification.time = existingNotification.time;
    } else {
        if(!passedInNotification.id){
            //If the client wants to specify the id of the notification, they can.  If they don't we will.
            passedInNotification.id = uuidv4();
        }
        passedInNotification.time = new Date().toISOString();
    }
    passedInNotification.integrationId = integrationId;
    passedInNotification.toId = userId;
    return passedInNotification;
}
function formatGCMessage(event, integrationId, fromId){
    const eventMessage = JSON.parse(event.body);
    eventMessage.integrationId = integrationId;
    eventMessage.from.id = fromId;
    if(eventMessage.fileString) {
        eventMessage.fileName = `${uuidv4()}.jpeg`;
    }
    return eventMessage;
}
async function sendMessageToGC(data){
    if ( (!data.text || data.text === '') && (!data.fileString || data.fileString === '')) {
        console.log("No message to send");
        return;
    }

    const d = new Date();

    const body = {
        "id": uuidv4(),
        "channel": {
            "platform": "Open",
            "type": "Private",
            "messageId": uuidv4(),
            "to": {
                "id": data.integrationId
            },
            "from": {
                "nickname": data.from.nickname,
                "id": data.from.id,
                "idType": data.from.idType,
                "firstName": data.from.firstName,
                "lastName": data.from.lastName
            },
            "time": d.toISOString()
        },
        "type": "Text",
        "direction": "Inbound"
    };
    if(data.text && data.text.length > 0){
        body.text = data.text;
    }
    if(data.fileName){
        body.content = [{
            "contentType": "Attachment",
            "attachment": {
                "mediaType": "Image",
                "url": `${process.env.S3_URL_BUCKET}/${data.fileName}`,
                "mime": "image/jpeg",
                "direction": "Inbound",
                "filename": data.fileName
            }
        }];
    }
    const gcClientData = await initializeGCClient();
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length,
            'Authorization': 'bearer ' + gcClientData.accessToken
        }
    };

    const response = await axios.post("https://api.mypurecloud.com/api/v2/conversations/messages/inbound/open", JSON.stringify(body), options);
    return response.data;
}

function getParamFromPath(path, position) {
    let pathElements = path.split('/');
    if(pathElements.length > position) {
        return pathElements[position];
    }
    return null;
}

async function uploadToS3(message) {
    if(message.fileString){
        let buff = new Buffer(message.fileString, 'base64');
        //do upload to S3
        let params = {
            Bucket: 'open-messaging-uploads',
            Key: message.fileName,
            Body: buff};
        await s3.putObject(params).promise();
    }
}
