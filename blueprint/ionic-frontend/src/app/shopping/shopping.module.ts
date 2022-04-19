import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingPage } from './shopping.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ShoppingPageRoutingModule } from './shopping-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ShoppingPageRoutingModule
  ],
  declarations: [ShoppingPage]
})
export class ShoppingPageModule {}
