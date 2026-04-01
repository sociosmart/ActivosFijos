import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaActivosPage } from './lista-activos.page';

const routes: Routes = [
  {
    path: '',
    component: ListaActivosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaActivosPageRoutingModule {}
