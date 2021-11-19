/*import { Injectable } from '@angular/core';
import {from, Observable, Observer, Subject} from 'rxjs';


@Injectable()
export class WebsocketOpenMessageService {
  private subject: Subject<MessageEvent>;
  constructor() {}

  public connect(url): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log('Successfully connected: ' + url);
    }
    return this.subject;
  }

  private create(url): Subject<MessageEvent> {
    const ws = new WebSocket(url);

    const observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    const observer = {
      next: (data: any) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    const subject = new Subject<MessageEvent>();
    subject.subscribe(observer);

  }
}
*/
