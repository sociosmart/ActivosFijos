import { Component } from '@angular/core';
import { Platform, ToastController, LoadingController } from '@ionic/angular';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-alta-activo',
  templateUrl: './alta-activo.page.html',
  styleUrls: ['./alta-activo.page.scss'],
})
export class AltaActivoPage {

  // ================= VARIABLES =================
  activoId = '';
  nombreActivo = '';
  ubicacion = '';
  compania = '';
  selectedFile: File | null = null;
  previewImage: string | null = null;
  private accessToken: string = '';
  companias = [
  'AUTOSERVICIO LA PIEDRERA',
  'CORPOX',
  'MOLECULA'
];

  constructor(
    private platform: Platform,
    private bluetoothSerial: BluetoothSerial,
    private androidPermissions: AndroidPermissions,
    private toastController: ToastController,
    private http: HttpClient,
    private loadingController: LoadingController,
  ) {}

  // ================= LOGIN =================
  async loginApi() {
    const url = 'http://172.16.64.136:80/api_activos_v2/public/?auth&action=login';

    try {
      const response: any = await this.http.post(url, {
        email: 'admin@test.com',
        password: '123456'
      }).toPromise();

      this.accessToken = response?.access || '';
      return !!this.accessToken;

    } catch (err) {
      console.error(err);
      this.showToast('Error login API ❌', 'danger');
      return false;
    }
  }

  // ================= TOMAR FOTO =================
  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (!image?.dataUrl) {
        this.showToast('No se pudo capturar la imagen ❌', 'danger');
        return;
      }

      this.previewImage = image.dataUrl;

      this.selectedFile = this.base64ToFile(
        image.dataUrl,
        `foto_${Date.now()}.jpg`
      );

    } catch (err) {
      console.error(err);
      this.showToast('Error cámara ❌', 'danger');
    }
  }

  // ================= GUARDAR =================
  async guardarActivoYImprimir() {

    if (!this.nombreActivo) {
      this.showToast('Nombre es obligatorio', 'warning');
      return;
    }

    if (!this.selectedFile) {
      this.showToast('Debes tomar una fotografía 📸', 'warning');
      return;
    }

    if (!this.accessToken) {
      const ok = await this.loginApi();
      if (!ok) return;
    }

    const url = 'http://172.16.64.136:80/api_activos_v2/public/';
    const formData = new FormData();

    formData.append('nombre', this.nombreActivo);
    formData.append('ubicacion', this.ubicacion || '');
    formData.append('compania', this.compania || '');
    formData.append('fecha', new Date().toISOString().split('T')[0]);

    formData.append('fotografia', this.selectedFile, this.selectedFile.name);

    // ===== GPS seguro =====
    const gps = await this.obtenerUbicacion();
    formData.append('latitud', gps?.lat ? gps.lat.toString() : '');
    formData.append('longitud', gps?.lng ? gps.lng.toString() : '');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`
    });

    try {
      const response: any = await this.http.post(url, formData, { headers }).toPromise();

      console.log('Respuesta API:', response);

      this.activoId = response?.id || response?.data?.id || 'TEMP-' + Date.now();

      this.showToast('Activo guardado ✅', 'success');

      await this.imprimirTicket();

      // limpiar
      this.previewImage = null;
      this.selectedFile = null;

    } catch (err) {
      console.error(err);
      this.showToast('Error al guardar ❌', 'danger');
    }
  }

  // ================= IMPRIMIR =================
  private async imprimirTicket() {

    if (!this.platform.is('cordova')) {
      this.showToast('Solo en dispositivo real', 'warning');
      return;
    }

    const permisos = await this.pedirPermisos();
    if (!permisos) return;

    try {
      const devices: any[] = await this.bluetoothSerial.list();
      console.log('BT devices:', devices);

      const impresora = devices.find(d => d);

      if (!impresora) {
        this.showToast('No hay impresora ❌', 'danger');
        return;
      }

      // 🔥 FIX PRINCIPAL
      const deviceId = impresora.id || impresora.address;

      if (!deviceId) {
        this.showToast('Impresora inválida ❌', 'danger');
        return;
      }

      const idSeguro = this.activoId || '0';

      this.bluetoothSerial.connect(deviceId).subscribe({

        next: async () => {

          const ESC = 0x1B;
          const GS = 0x1D;
          const cmds: number[] = [];
          const encoder = new TextEncoder();

          const dataBytes = encoder.encode(idSeguro);
          const len = dataBytes.length + 3;

          cmds.push(ESC, 0x40);
          cmds.push(ESC, 0x61, 0x01);

          cmds.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x08);
          cmds.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30);

          cmds.push(
            GS, 0x28, 0x6B,
            len & 0xFF,
            (len >> 8) & 0xFF,
            0x31, 0x50, 0x30,
            ...dataBytes
          );

          cmds.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);

          cmds.push(ESC, 0x61, 0x00);
          cmds.push(0x0A);

          const d = new Date();
          const fecha = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;

          cmds.push(...this.textoABytes(`ID: ${idSeguro}\n`));
          cmds.push(...this.textoABytes(`Nombre: ${this.nombreActivo}\n`));
          cmds.push(...this.textoABytes(`Ubicación: ${this.ubicacion}\n`));
          cmds.push(...this.textoABytes(`Compañía: ${this.compania}\n`));
          cmds.push(...this.textoABytes(`Fecha: ${fecha}\n`));

          // 🔹 Espacio sin bug
          cmds.push(ESC, 0x64, 0x05);
          await new Promise(res => setTimeout(res, 100));

          cmds.push(GS, 0x56, 0x00);

          await this.bluetoothSerial.write(new Uint8Array(cmds).buffer);
          this.bluetoothSerial.disconnect();

          this.showToast('Ticket impreso ✅', 'success');
        },

        error: err => {
          console.error(err);
          this.showToast('Error impresora ❌', 'danger');
        }
      });

    } catch (err) {
      console.error(err);
      this.showToast('Error Bluetooth ❌', 'danger');
    }
  }

  // ================= PERMISOS =================
  private async pedirPermisos(): Promise<boolean> {
    try {
      await this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
        this.androidPermissions.PERMISSION.BLUETOOTH_SCAN,
        this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
      ]);

      const res = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT
      );

      return res.hasPermission;

    } catch {
      return false;
    }
  }

  // ================= GPS =================
  async obtenerUbicacion() {

    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    const loading = await this.loadingController.create({
      message: '📍 Obteniendo ubicación...'
    });

    await loading.present();

    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      await loading.dismiss();

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

    } catch (err) {
      await loading.dismiss();
      console.error(err);
      return null;
    }
  }

  // ================= UTIL =================
  private textoABytes(texto: string): number[] {
    const mapa: any = {
      'á':160,'é':130,'í':161,'ó':162,'ú':163,
      'ñ':164,'Ñ':165
    };

    return Array.from(texto).map(c => mapa[c] || c.charCodeAt(0));
  }

  private base64ToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);

    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  private async showToast(msg: string, color: string) {
    const t = await this.toastController.create({
      message: msg,
      duration: 3000,
      color
    });
    t.present();
  }
}