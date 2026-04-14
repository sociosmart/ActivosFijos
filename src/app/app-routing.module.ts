import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard' ;
const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'alta-activo',
    loadChildren: () => import('./alta-activo/alta-activo.module').then( m => m.AltaActivoPageModule),
    canActivate: [AuthGuard] // 🔒 PROTEGIDO
  },  
  {
    path: 'lista-activos',
    loadChildren: () => import('./lista-activos/lista-activos.module').then( m => m.ListaActivosPageModule),
    canActivate: [AuthGuard] // 🔒 PROTEGIDO
  },
{
  path: 'login',
  loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule),
  canActivate: [LoginGuard]
},
  {
    path: 'pruebaimpresion',
    loadChildren: () => import('./pruebaimpresion/pruebaimpresion.module').then( m => m.PruebaimpresionPageModule)
  },  {
    path: 'scan-barcode',
    loadChildren: () => import('./scan-barcode/scan-barcode.module').then( m => m.ScanBarcodePageModule)
  }



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
