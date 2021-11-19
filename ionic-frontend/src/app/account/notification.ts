/* eslint-disable @typescript-eslint/member-ordering */

export interface INotifications {
  notifications: INotification[];
  count: number;
}

export class Notifications implements INotifications{

  constructor() {
    this.notifications = [];
  }
  notifications: INotification[];
  count: number;
}

export interface INotification {
  content: string;
  toId: string;
  fromId: string;
  integrationId: string;
  time: string;
  id: string;
  type: string;
  acknowledged: boolean;
}
