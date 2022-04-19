/* eslint-disable @typescript-eslint/member-ordering */
export interface IMessage {
    id: string;
    channelTime: string;
    channelFromId: string;
    channelId: string;
    channelMessageId: string;
    channelPlatform: string;
    channelToId: string;
    channelType: string;
    direction: string;
    text: string;
    type: string;
    content: Content[];
  }
  export class Message implements IMessage{

    constructor(id?: string, channelTime?: string, channelFromId?: string, channelId?: string, channelMessageId?: string,
                channelPlatform?: string, channelToId?: string, channelType?: string, direction?: string, text?: string,
                type?: string, content?: Content[]) {
      this.id = id;
      this.channelTime = channelTime;
      this.channelFromId = channelFromId;
      this.channelId = channelId;
      this.channelMessageId = channelMessageId;
      this.channelPlatform = channelPlatform;
      this.channelToId = channelToId;
      this.channelType = channelType;
      this.direction = direction;
      this.text = text;
      this.type = type;
      this.content = content;
    }

    id: string;
    channelTime: string;
    channelFromId: string;
    channelId: string;
    channelMessageId: string;
    channelPlatform: string;
    channelToId: string;
    channelType: string;
    direction: string;
    text: string;
    type: string;
    content: Content[];
  }

export interface IContent {
  contentType: string;
  attachmentFilename: string;
  attachmentMediaType: string;
  attachmentMime: string;
  attachmentUrl: string;
}

export class Content implements IContent{
  constructor(contentType?: string, attachmentFilename?: string, attachmentMediaType?: string, attachmentMime?: string,
              attachmentUrl?: string) {
    this.contentType = contentType;
    this.attachmentFilename = attachmentFilename;
    this.attachmentMediaType = attachmentMediaType;
    this.attachmentMime = attachmentMime;
    this.attachmentUrl = attachmentUrl;
  }

  contentType: string;
  attachmentFilename: string;
  attachmentMediaType: string;
  attachmentMime: string;
  attachmentUrl: string;
}
