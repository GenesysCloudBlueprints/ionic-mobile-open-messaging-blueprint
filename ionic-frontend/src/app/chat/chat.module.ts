import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatPage } from './chat.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { QRCodeModule } from 'angular2-qrcode';

import { ChatPageRoutingModule } from './chat-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ChatPageRoutingModule,
    QRCodeModule
  ],
  declarations: [ChatPage]
})
export class ChatPageModule {}
