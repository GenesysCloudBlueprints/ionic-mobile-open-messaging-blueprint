import { Injectable } from '@angular/core';
import {ITranscript} from './transcript';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IOutgoingMessage} from './outgoingMessage';
import {AccountSettingsService} from '../account/account-settings.service';

@Injectable({
  providedIn: 'root'
})
export class OpenMessageService {

  constructor(private httpClient: HttpClient, private accountSettingsService: AccountSettingsService) { }

  getTranscript(userId): Observable<ITranscript> {
    return this.httpClient.get<ITranscript>(
      `${this.accountSettingsService.getTranscriptURL()}${this.accountSettingsService.getIntegrationByType(
        this.accountSettingsService.integrationTypeChat).id}/user/${userId}`
    );
  }

  sendMessage(message: IOutgoingMessage, userId): Observable<any> {
    return this.httpClient.post<IOutgoingMessage>(
      `${this.accountSettingsService.getTranscriptURL()}${this.accountSettingsService.getIntegrationByType(
        this.accountSettingsService.integrationTypeChat).id}/user/${userId}`, message);
  }
}

