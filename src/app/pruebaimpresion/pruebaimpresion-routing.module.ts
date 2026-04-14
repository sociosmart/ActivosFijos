import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PruebaimpresionPage } from './pruebaimpresion.page';

const routes: Routes = [
  {
    path: '',
    component: PruebaimpresionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PruebaimpresionPageRoutingModule {}
