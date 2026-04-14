import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PruebaimpresionPageRoutingModule } from './pruebaimpresion-routing.module';

import { PruebaimpresionPage } from './pruebaimpresion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PruebaimpresionPageRoutingModule
  ],
  declarations: [PruebaimpresionPage]
})
export class PruebaimpresionPageModule {}
