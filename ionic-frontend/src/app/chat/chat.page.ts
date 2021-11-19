/* eslint-disable @typescript-eslint/member-ordering */
import {Component, Input, ViewChild} from '@angular/core';
import { ITranscript, Transcript } from './transcript';
import { OpenMessageService } from './open-message.service';
import { interval, timer } from 'rxjs';
import { IOutgoingMessage, OutgoingMessage } from './outgoingMessage';
import {IonContent, ToastController} from '@ionic/angular';
import {IDecoratedMessageWrapper} from './decoratedMessage';
import {Message} from './message';
import {AccountSettingsService} from '../account/account-settings.service';
import { Camera, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'app-chat',
  templateUrl: 'chat.page.html',
  styleUrls: ['chat.page.scss']
})
export class ChatPage {
  title = 'mobileMessenger';
  @Input() messageToSend = '';
  transcript: ITranscript = new Transcript();

  @ViewChild(IonContent) chatContent: IonContent;
  lastScrollTop = 0;
  fullScreenContent: string = null;
  fileBase64Str: string = null;
  constructor(private messageService: OpenMessageService, private toastController: ToastController,
              private accountSettings: AccountSettingsService) {
    this.reloadTranscript();
    interval(5000).subscribe(() => this.reloadTranscript());
  }
  sendMessage(): void{
    const message: IOutgoingMessage = new OutgoingMessage(
      {nickname: `${this.accountSettings.getUserFirstName()} ${this.accountSettings.getUserLastName()}`,
        id: this.accountSettings.getUserId(), idType: 'email',
      firstName: this.accountSettings.getUserFirstName(), lastName: this.accountSettings.getUserLastName()}, this.messageToSend);
    if(this.fileBase64Str){
      message.fileString = this.fileBase64Str;
    }
    this.messageService.sendMessage(message, this.accountSettings.getUserId()).subscribe(
      response => console.log('Message Sent, response is: ', response),
      error => console.error('something wrong occurred while sending message: ', error),
      () => this.reloadTranscript()
    );
    this.messageToSend = '';
  }
  reloadTranscript(): void {
    if (this.accountSettings.getUserId()) {
      this.messageService.getTranscript(this.accountSettings.getUserId()).subscribe(
        value => {
            value.messages = value.messages.sort((a, b) => a.channelTime < b.channelTime ? -1 : a.channelTime > b.channelTime ? 1 : 0);
            if(value.messages.length > this.transcript.messages.length){
              //don't load the object and scroll unless we need to.
              this.transcript = value;
              this.scrollToBottom();
            }
          },
        error => console.error('something wrong occurred while getting transcript: ', error),
        () => console.log('done getting transcript.')
      );
    } else {
      this.transcript = new Transcript();
      console.warn('No user id was specified.');
    }
  }
  async scrollToBottom() {
    const scrollElement = await this.chatContent.getScrollElement();
    const currentScrollTop = scrollElement.scrollTop;
    //If the user has scrolled up and we don't want to scroll them down.
    if(currentScrollTop >= this.lastScrollTop) {
      const delayTimer = timer(100);
      // need to wait a small amount of time to let the html catch up before scrolling as the elements aren't there immediately.
      delayTimer.subscribe(() => {
        this.chatContent.scrollToBottom(300).then(() =>{
          this.chatContent.getScrollElement().then(scrollElementAfter => this.lastScrollTop = scrollElementAfter.scrollTop);
        });
      });
    } else {
      //since we didn't scroll them down, let's alert them that there's a new message
      this.toastController.create({
        message: 'New messages.',
        duration: 2000,
        animated: true,
        color: 'secondary'
      }).then(toast => toast.present());
    }
  }

  getQRCodeValue(qrTag: string) {
    const decoratedMessage: IDecoratedMessageWrapper = JSON.parse(qrTag);
    return decoratedMessage.gcDecoratedMessage.gcMessageText;
  }
  isQRCode(qrTag: string) {
    if(qrTag && qrTag.startsWith('{') && qrTag.endsWith('}')) {
      const decoratedMessage: IDecoratedMessageWrapper = JSON.parse(qrTag);
      return decoratedMessage && 'qrCode' === decoratedMessage.gcDecoratedMessage.gcMessageType;
    }
    return false;
  }
  toggleFullscreen(message?: Message){
    if(this.fullScreenContent){
      this.fullScreenContent = null;
    }else {
      if(message.content) {
        this.fullScreenContent = message.content[0].attachmentUrl;
      } else {
        this.fullScreenContent = message.text;
      }
    }
  }

  getLocation(): void{
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position)=>{
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        this.messageToSend = `${latitude}, ${longitude}`;
        console.log(`sending lat,long: ${latitude}, ${longitude}`);
      });
    } else {
      console.log('Location Services is not available.');
      this.toastController.create({
        message: 'Location Services is not available.',
        duration: 2000,
        animated: true,
        color: 'secondary'
      }).then(toast => toast.present());
    }
  }

  async selectPhoto(): Promise<void> {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    });

    this.fileBase64Str = image.base64String;
    this.sendMessage();
    this.fileBase64Str = null;
  }
}
