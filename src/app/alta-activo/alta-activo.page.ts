import { Component } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../services/auth.services';

@Component({
  selector: 'app-alta-activo',
  templateUrl: './alta-activo.page.html',
  styleUrls: ['./alta-activo.page.scss'],
})
export class AltaActivoPage {

  activoId = '';
  nombreActivo = '';
  ubicacion = '';
  compania = '';

  selectedFile: File | null = null;
  previewImage: string | null = null;

  // 🔁 ÚLTIMO TICKET PARA REIMPRESIÓN
  ultimoTicket: any = null;

  private DPI = 203;
  private LABEL_WIDTH_MM = 50;
  private LABEL_HEIGHT_MM = 30;

  private LABEL_WIDTH_DOTS = Math.floor((this.LABEL_WIDTH_MM / 25.4) * this.DPI);
  private LABEL_HEIGHT_DOTS = Math.floor((this.LABEL_HEIGHT_MM / 25.4) * this.DPI);

  constructor(
    private platform: Platform,
    private bluetoothSerial: BluetoothSerial,
    private androidPermissions: AndroidPermissions,
    private toastController: ToastController,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // ================= FOTO =================
  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (!image?.dataUrl) return;

      this.previewImage = image.dataUrl;

      this.selectedFile = this.base64ToFile(
        image.dataUrl,
        `foto_${Date.now()}.jpg`
      );

    } catch {
      this.showToast('Error cámara ❌', 'danger');
    }
  }

  // ================= GUARDAR + IMPRIMIR =================
  async guardarActivoYImprimir() {

    try {

      const token = await this.auth.getToken();

      if (!token) {
        this.showToast('Sesión expirada ❌', 'danger');
        return;
      }

      if (!this.nombreActivo) {
        this.showToast('Nombre requerido ⚠️', 'warning');
        return;
      }

      if (!this.selectedFile) {
        this.showToast('Debe tomar una foto 📸', 'warning');
        return;
      }

      const gps = await this.obtenerUbicacion();

      const formData = new FormData();
      formData.append('nombre', this.nombreActivo);
      formData.append('ubicacion', this.ubicacion || '');
      formData.append('compania', this.compania || '');
      formData.append('fecha', new Date().toISOString().split('T')[0]);
      formData.append('latitud', gps?.lat ? String(gps.lat) : '');
      formData.append('longitud', gps?.lng ? String(gps.lng) : '');
      formData.append('fotografia', this.selectedFile, this.selectedFile.name);

      this.http.post(
        'http://192.168.68.149/api_activos_v2/public/activos',
        formData
      ).subscribe({

        next: async (resp: any) => {

          this.activoId = resp?.id;

          const dataPrint = {
            id: this.activoId,
            nombre: this.nombreActivo,
            ubicacion: this.ubicacion,
            compania: this.compania,
            fecha: new Date().toLocaleDateString()
          };

          // 🔁 GUARDAR PARA REIMPRESIÓN
          this.ultimoTicket = { ...dataPrint };

          this.showToast('Activo guardado ✅', 'success');

          await this.imprimirTicket(dataPrint);

          this.limpiarFormulario();
        },

        error: (err) => {
          console.error(err);
          this.showToast('Error al guardar ❌', 'danger');
        }

      });

    } catch (e) {
      console.error(e);
      this.showToast('Error inesperado ❌', 'danger');
    }
  }

  // ================= REIMPRESIÓN =================
  async reimprimirTicket() {

    if (!this.ultimoTicket) {
      this.showToast('No hay ticket para reimprimir ❌', 'warning');
      return;
    }

    await this.imprimirTicket(this.ultimoTicket);
  }

  // ================= CODIGO BAR =================
  private generarCodigo(data: any): string {

    const clean = (txt: string) =>
      (txt || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase();

    const nombre = clean(data.nombre).substring(0, 2).padEnd(2, 'X');
    const ubicacion = clean(data.ubicacion).substring(0, 2).padEnd(2, 'X');
    const compania = clean(data.compania).substring(0, 2).padEnd(2, 'X');

    const id = String(data.id).padStart(6, '0');

    return `${nombre}-${ubicacion}-${compania}-${id}`;
  }

  // ================= GPS =================
  async obtenerUbicacion() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
    } catch {
      return null;
    }
  }

  // ================= LIMPIAR =================
  limpiarFormulario() {
    this.nombreActivo = '';
    this.ubicacion = '';
    this.compania = '';
    this.previewImage = null;
    this.selectedFile = null;
    this.activoId = '';
  }

  // ================= IMPRESIÓN =================
  private async imprimirTicket(data: any) {

    if (!this.platform.is('cordova')) {
      this.showToast('Solo en dispositivo real', 'warning');
      return;
    }

    try {

      await this.pedirPermisos();

      const devices = await this.bluetoothSerial.list();

      if (!devices.length) {
        this.showToast('No hay impresoras', 'danger');
        return;
      }

      const deviceId = devices[0].address || devices[0].id;

      this.bluetoothSerial.connect(deviceId).subscribe({

        next: async () => {

          const ESC = 0x1B;
          const GS = 0x1D;
          const encoder = new TextEncoder();

          const cmds: number[] = [];

          const codigoBarra = this.generarCodigo(data);

          cmds.push(ESC, 0x40); // reset
cmds.push(ESC, 0x33, 0x00); // sin interlineado
cmds.push(ESC, 0x61, 0x00); // izquierda

          cmds.push(0x1D, 0x57,
            this.LABEL_WIDTH_DOTS & 0xff,
            this.LABEL_WIDTH_DOTS >> 8
          );

          cmds.push(0x1D, 0x50,
            this.LABEL_HEIGHT_DOTS & 0xff,
            this.LABEL_HEIGHT_DOTS >> 8
          );

          cmds.push(ESC, 0x4D, 0x01);
          cmds.push(GS, 0x21, 0x00);

              
          cmds.push(...this.texto(`NOM: ${data.nombre}\n`));
          cmds.push(...this.texto(`UBI: ${data.ubicacion}\n`));
          cmds.push(...this.texto(`EMP: ${data.compania}\n`));
          cmds.push(...this.texto(`FEC: ${data.fecha}\n`));

          const barcode = encoder.encode(codigoBarra);

// 🔥 BARCODE
cmds.push(GS, 0x68, 90);
cmds.push(GS, 0x77, 2);

cmds.push(GS, 0x6B, 0x49);
cmds.push(barcode.length);
cmds.push(...barcode);

// salto
//cmds.push(0x0A);

// 🔥 CENTRAR TEXTO ABAJO
cmds.push(0x1B, 0x61, 0x01); // center
cmds.push(...this.texto(`${codigoBarra}\n`));

// volver a izquierda
cmds.push(0x1B, 0x61, 0x00);
cmds.push(0x0A);


// 🔥 pequeño avance controlado ANTES del corte
cmds.push(0x1B, 0x64, 0x02);

// ✂️ corte estable Qian
cmds.push(0x1D, 0x56, 0x42, 0x00);

          await new Promise(res => setTimeout(res, 300));

          await this.bluetoothSerial.write(new Uint8Array(cmds).buffer);

          this.bluetoothSerial.disconnect();

          this.showToast('Etiqueta impresa ✅', 'success');
        },

        error: err => {
          console.error(err);
          this.showToast('Error impresión ❌', 'danger');
        }

      });

    } catch (err) {
      console.error(err);
      this.showToast('Error Bluetooth ❌', 'danger');
    }
  }

  // ================= UTIL =================
  private texto(texto: string): number[] {
    return Array.from(new TextEncoder().encode(texto));
  }

  private base64ToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new File([u8arr], filename, { type: mime });
  }

  // ================= PERMISOS =================
  private async pedirPermisos(): Promise<boolean> {
    try {
      await this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
        this.androidPermissions.PERMISSION.BLUETOOTH_SCAN,
        this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
      ]);
      return true;
    } catch {
      return false;
    }
  }

  // ================= TOAST =================
  private async showToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2500,
      color
    });
    toast.present();
  }
}