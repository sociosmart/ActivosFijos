import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScanBarcodePage } from './scan-barcode.page';

const routes: Routes = [
  {
    path: '',
    component: ScanBarcodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScanBarcodePageRoutingModule {}
