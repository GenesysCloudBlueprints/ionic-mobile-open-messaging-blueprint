import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {interval, Observable} from 'rxjs';
import {AccountSettingsService} from '../account/account-settings.service';
import {INotification, INotifications, Notifications} from './notification';
import {IIntegration} from './integration';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notifications: INotifications;
  public offerCount = 0;
  private integrationConfig: IIntegration;

  constructor(private httpClient: HttpClient, private accountSettingsService: AccountSettingsService) {
    this.integrationConfig = this.accountSettingsService.getIntegrationByType(this.accountSettingsService.integrationTypeOffers);
    this.reloadNotifications();
    interval(5000).subscribe(() => this.reloadNotifications());
  }

  public updateNotification(notification: INotification): Observable<any> {
    return this.httpClient.put<INotification>(
      `${this.accountSettingsService.getNotificationURL()}${this.integrationConfig.id}/user/${this.accountSettingsService.getUserId()}`,
      notification
    );
  }

  private getNotifications(): Observable<INotifications> {
    return this.httpClient.get<INotifications>(
      `${this.accountSettingsService.getNotificationURL()}${this.integrationConfig.id}/user/${this.accountSettingsService.getUserId()}`
    );
  }

  private reloadNotifications(): void {
    if (this.accountSettingsService.getUserId()) {
      this.getNotifications().subscribe(
        value => {
          if(value && value.notifications) {
            value.notifications = value.notifications.sort((a, b) => a.time < b.time ? -1 : a.time > b.time ? 1 : 0);
            this.notifications = value;
          } else {
            this.notifications = new Notifications();
          }
          if(this.notifications && this.notifications.notifications) {
            let currentCount = 0;
            this.notifications.notifications.forEach(notification => {
              if (!notification.acknowledged) {
                currentCount++;
              }
            });
            this.offerCount = currentCount;
          }
        },
        error => console.error('something wrong occurred while getting notifications: ', error),
        () => console.log('done getting notifications.')
      );
    } else {
      this.notifications = new Notifications();
      console.warn('No user id was specified.');
    }
  }
}

