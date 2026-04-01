import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'alta-activo',
    pathMatch: 'full'
  },

  {
    path: 'alta-activo',
    loadChildren: () => import('./alta-activo/alta-activo.module').then( m => m.AltaActivoPageModule)
  },
  
  {
    path: 'lista-activos',
    loadChildren: () => import('./lista-activos/lista-activos.module').then( m => m.ListaActivosPageModule)
  }




  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
