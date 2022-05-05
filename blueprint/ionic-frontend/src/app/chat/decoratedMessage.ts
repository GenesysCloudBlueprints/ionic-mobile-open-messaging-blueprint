export interface IDecoratedMessageWrapper {
  gcDecoratedMessage: IDecoratedMessage;
}

export interface IDecoratedMessage {
  gcMessageType: string;
  gcMessageText: number;
}
