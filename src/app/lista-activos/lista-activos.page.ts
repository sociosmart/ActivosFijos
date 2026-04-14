import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../services/auth.services';

@Component({
  selector: 'app-lista-activos',
  templateUrl: './lista-activos.page.html',
  styleUrls: ['./lista-activos.page.scss'],
})
export class ListaActivosPage implements OnInit {

  activos: any[] = [];
  imagenes: { [key: number]: SafeUrl } = {};
  imagenSeleccionada: SafeUrl | null = null;
  modalImagenAbierto = false;

  private apiUrl = 'http://192.168.68.149/api_activos_v2/public/';

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.init();
  }

  // ================= INIT =================
  async init() {

    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });

    await loading.present();

    try {

      const token = await this.auth.getToken();

      if (!token) {
        this.showToast('Sesión expirada ❌', 'danger');
        return;
      }

    await this.cargarActivos();

    } catch (err) {
      console.error(err);
      this.showToast('Error inicial ❌', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  // ================= CARGAR ACTIVOS =================
 async cargarActivos() {

  const loading = await this.loadingController.create({
    message: 'Cargando activos...'
  });

  await loading.present();

  this.http.get<any[]>(`${this.apiUrl}activos`)
    .subscribe({
      next: (res) => {

        console.log('ACTIVOS:', res);

        this.activos = res || [];

        // 🔥 cargar imágenes
        for (const activo of this.activos) {
          if (activo.id) {
            this.cargarImagen(activo.id);
          }
        }

      },
      error: async (err) => {

        console.error('ERROR API:', err);

        if (err.status === 401) {
          this.showToast('Sesión expirada ❌', 'danger');
        } else {
          this.showToast('Error al cargar activos ❌', 'danger');
        }

        await loading.dismiss();
      },
      complete: async () => {
        await loading.dismiss();
      }
    });
}
cargarImagen(id: number) {

  this.http.get(`${this.apiUrl}activo/${id}/imagen`, {
    responseType: 'blob'
  }).subscribe({
    next: (blob) => {

      const url = URL.createObjectURL(blob);
      this.imagenes[id] = this.sanitizer.bypassSecurityTrustUrl(url);

    },
    error: (err) => {
      console.error('ERROR IMAGEN:', id, err);
    }
  });
}
  // ================= MODAL =================
  abrirImagen(img: SafeUrl) {
    this.imagenSeleccionada = img;
    this.modalImagenAbierto = true;
  }

  cerrarImagen() {
    this.modalImagenAbierto = false;
    this.imagenSeleccionada = null;
  }

  // ================= REFRESH =================
async refrescar(event?: any) {

  await this.cargarActivos();

  // 🔥 solo si existe (evita error)
  if (event?.target?.complete) {
    event.target.complete();
  }
}

  // ================= TOAST =================
  private async showToast(msg: string, color: string) {
    const t = await this.toastController.create({
      message: msg,
      duration: 2500,
      color
    });
    t.present();
  }
  
}