import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-lista-activos',
  templateUrl: './lista-activos.page.html',
  styleUrls: ['./lista-activos.page.scss'],
})
export class ListaActivosPage implements OnInit {

  activos: any[] = [];

  // 🔥 Aquí guardamos las imágenes ya procesadas
  imagenes: { [key: number]: SafeUrl } = {};

  private apiUrl = 'http://172.16.64.136:80/api_activos_v2/public/';
  private loginUrl = 'http://172.16.64.136:80/api_activos_v2/public/?auth&action=login';

  private accessToken: string = '';

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
  ) {}

  // ================= INIT =================
  ngOnInit() {
    this.init();
  }

  async init() {

    const loading = await this.loadingController.create({
      message: 'Inicializando...'
    });
    await loading.present();

    const ok = await this.loginApi();

    if (ok) {
      await this.cargarActivos();
    } else {
      this.showToast('No se pudo autenticar ❌', 'danger');
    }

    await loading.dismiss();
  }

  // ================= LOGIN =================
  async loginApi(): Promise<boolean> {
    try {

      const response: any = await this.http.post(this.loginUrl, {
        email: 'admin@test.com',
        password: '123456'
      }).toPromise();

      this.accessToken = response?.access || '';

      console.log('Token:', this.accessToken);

      return !!this.accessToken;

    } catch (err) {
      console.error('Error login:', err);
      this.showToast('Error login API ❌', 'danger');
      return false;
    }
  }

  // ================= GET ACTIVOS =================
  async cargarActivos() {

    const loading = await this.loadingController.create({
      message: 'Cargando activos...'
    });
    await loading.present();

    try {

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json'
      });

      const response: any = await this.http.get(this.apiUrl, { headers }).toPromise();

      console.log('Activos:', response);

      this.activos = response || [];

      // 🔥 Cargar imágenes protegidas
      for (const activo of this.activos) {
        if (activo.id) {
          this.cargarImagen(activo.id);
        }
      }

      await loading.dismiss();

    } catch (err) {

      console.error('Error cargando activos:', err);

      await loading.dismiss();

      this.showToast('Error al cargar activos ❌', 'danger');
    }
  }

  // ================= IMAGEN CON TOKEN =================
  async cargarImagen(id: number) {

    try {

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`
      });

      const blob = await this.http.get(
        `http://172.16.64.136:80/api_activos_v2/public/activo/${id}/imagen`,
        {
          headers,
          responseType: 'blob'
        }
      ).toPromise();

      if (!blob) return;

      const url = URL.createObjectURL(blob);

      // 🔥 Sanitizar para Angular
      this.imagenes[id] = this.sanitizer.bypassSecurityTrustUrl(url);

    } catch (err) {
      console.error('Error cargando imagen ID:', id, err);
    }
  }

  // ================= REFRESH =================
  async refrescar(event: any) {
    await this.cargarActivos();
    event.target.complete();
  }

  // ================= TOAST =================
  private async showToast(msg: string, color: string) {
    const t = await this.toastController.create({
      message: msg,
      duration: 3000,
      color
    });
    t.present();
  }
  
}