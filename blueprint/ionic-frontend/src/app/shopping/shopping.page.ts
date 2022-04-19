import { Component } from '@angular/core';
import {AccountSettingsService} from '../account/account-settings.service';

@Component({
  selector: 'app-shopping',
  templateUrl: 'shopping.page.html',
  styleUrls: ['shopping.page.scss']
})
export class ShoppingPage {

  constructor(private accountSettings: AccountSettingsService) {}

}
