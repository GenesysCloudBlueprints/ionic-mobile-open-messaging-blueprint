/* eslint-disable @typescript-eslint/member-ordering */
import {Message} from './message';

export interface ITranscript {
  messages: Message[];
  count: number;
}

export class Transcript implements ITranscript{

  constructor() {
    this.messages = [];
  }

  messages: Message[];
  count: number;
}

