import {IIntegration} from './integration';
import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {ITabBranding} from '../tabs/tab.branding';

@Injectable({
  providedIn: 'root'
})

export class AccountSettingsService {
  public integrationTypeOffers = 'offers';
  public integrationTypeChat = 'chat';

  private integrationSelection: IIntegration[];
  constructor() {
    this.loadAvailableIntegrations();
  }

  getIntegrationByType(integrationType): IIntegration {
    return this.integrationSelection.find(integration => integration.type === integrationType);
  }
  getUserId(): string {
    return environment.userId;
  }
  getUserFirstName(): string {
    return environment.firstName;
  }
  getUserLastName(): string {
    return environment.lastName;
  }
  getNotificationURL(): string {
    return environment.notificationAPIBaseURL;
  }
  getTranscriptURL(): string {
    return environment.transcriptAPIBaseURL;
  }
  getHomeBranding(): ITabBranding {
    return environment.homeBranding;
  }
  getChatBranding(): ITabBranding {
    return environment.chatBranding;
  }
  getNotificationBranding(): ITabBranding {
    return environment.notificationBranding;
  }
  getHeaderIconUrl(): string {
    return environment.headerIconUrl;
  }
  getHomePageTitle(): string {
    return environment.homePageTitle;
  }
  getHomePageSubTitle(): string {
    return environment.homePageSubTitle;
  }
  getHomePageDetails(): string[] {
    return environment.homePageDetails;
  }
  getHomePageProductImageUrl(): string {
    return environment.homePageProductImageUrl;
  }
  getHomePageProductLink(): string {
    return environment.homePageProductLink;
  }
  private loadAvailableIntegrations(): void {
    this.integrationSelection = environment.integrations;
  }
}
