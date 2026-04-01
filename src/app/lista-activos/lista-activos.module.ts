import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaActivosPageRoutingModule } from './lista-activos-routing.module';

import { ListaActivosPage } from './lista-activos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaActivosPageRoutingModule
  ],
  declarations: [ListaActivosPage]
})
export class ListaActivosPageModule {}
