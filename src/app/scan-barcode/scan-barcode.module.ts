import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScanBarcodePageRoutingModule } from './scan-barcode-routing.module';

import { ScanBarcodePage } from './scan-barcode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScanBarcodePageRoutingModule
  ],
  declarations: [ScanBarcodePage]
})
export class ScanBarcodePageModule {}
