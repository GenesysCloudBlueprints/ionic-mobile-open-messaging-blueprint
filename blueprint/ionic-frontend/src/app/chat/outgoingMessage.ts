/* eslint-disable @typescript-eslint/member-ordering */
export interface IOutgoingMessage {
    from: {
      nickname: string;
      id: string;
      idType: string;
      firstName: string;
      lastName: string;
    };
    text: string;
    fileString: string;
  }
  export class OutgoingMessage implements IOutgoingMessage{


    constructor(from?: { nickname: string; id: string; idType: string; firstName: string; lastName: string },
                text?: string, fileString?: string) {
      this.from = from;
      this.text = text;
      this.fileString = fileString;
    }

    from: {
      nickname: string;
      id: string;
      idType: string;
      firstName: string;
      lastName: string;
    };
    text: string;
    fileString: string;
  }
