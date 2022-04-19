import { Component } from '@angular/core';
import {NotificationService} from '../../app/account/notification.service';
import {AccountSettingsService} from '../account/account-settings.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(private notificationService: NotificationService, private accountSettingsService: AccountSettingsService) {}
}
