import { Component } from '@angular/core';
import {NotificationService} from './notification.service';
import {AccountSettingsService} from './account-settings.service';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  styleUrls: ['account.page.scss']
})
export class AccountPage {

  constructor(public notificationService: NotificationService, private accountSettings: AccountSettingsService) {}

  isQRCode(notification): boolean {
    return notification && notification.type && notification.type.toLowerCase() === 'qrcode';
  }
  dismissNotification(notification): void {
    notification.acknowledged = true;
    this.notificationService.updateNotification(notification).subscribe(
      () => console.log(`Dismissing notification: ${notification.id}`),
      error => console.error('something wrong occurred while getting notifications: ', error),
      () => console.log('done getting notifications.')
    );
  }
}
