import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-scan-barcode',
  templateUrl: './scan-barcode.page.html',
  styleUrls: ['./scan-barcode.page.scss'],
})
export class ScanBarcodePage {

  scannedCode = '';
  activo: any = null;
  imagenUrl = '';

  isScanning = false;
  showScannerUI = false;

  private API = 'http://192.168.68.149/api_activos_v2/public';

  constructor(private http: HttpClient, private toast: ToastController) {}

  // ================= INICIAR SCAN =================
  async startScan() {

    this.resetData(); // 🔥 limpia antes de escanear

    this.isScanning = true;
    this.showScannerUI = true;

    const permission = await BarcodeScanner.checkPermission({ force: true });

    if (!permission.granted) {
      this.showToast('Permiso requerido ❌', 'danger');
      return;
    }

    BarcodeScanner.hideBackground();
    document.body.classList.add('scanner-active');

    try {

      const result = await BarcodeScanner.startScan();

      if (!result?.hasContent) {
        this.showToast('No se detectó código ❌', 'danger');
        return;
      }

      const rawCode = result.content?.trim();
      const id = this.extraerId(rawCode);

      if (!id) {
        this.showToast('Código inválido ❌', 'danger');
        return;
      }

      // 🔥 limpiar pantalla antes de mostrar resultado
      this.showScannerUI = false;

      this.scannedCode = rawCode;

      await this.vibrarYBeep();

      await this.buscarActivo(id);

    } catch (e) {
      console.error(e);
      this.showToast('Error scan ❌', 'danger');

    } finally {
      this.stopScan();
    }
  }

  // ================= STOP =================
  stopScan() {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.body.classList.remove('scanner-active');
    this.isScanning = false;
  }

  // ================= CONSULTA =================
  async buscarActivo(id: string) {

    this.http.get<any[]>(`${this.API}/activos/${id}`).subscribe({

      next: async (resp) => {

        if (!resp?.length) {
          return this.showToast('No encontrado ❌', 'danger');
        }

        this.activo = resp[0];

        await this.cargarImagen(this.activo.id);

        this.showToast('Activo cargado ✅', 'success');
      },

      error: () => {
        this.showToast('Error consulta ❌', 'danger');
      }
    });
  }

  // ================= IMAGEN =================
  async cargarImagen(id: number) {

    const blob: any = await this.http.get(
      `${this.API}/activos/${id}/imagen`,
      { responseType: 'blob' }
    ).toPromise();

    const reader = new FileReader();

    reader.onload = () => {
      this.imagenUrl = reader.result as string;
    };

    reader.readAsDataURL(blob);
  }

  // ================= RESET =================
  resetData() {
    this.scannedCode = '';
    this.activo = null;
    this.imagenUrl = '';
  }

  // ================= VIBRAR =================
  private async vibrarYBeep() {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }

  // ================= EXTRAER ID =================
  private extraerId(code: string): string {
    if (!code) return '';
    const parts = code.split('-');
    return parts.length > 3
      ? parts[parts.length - 1].replace(/\D/g, '')
      : code.replace(/\D/g, '');
  }

  // ================= TOAST =================
  async showToast(msg: string, color: string) {
    const t = await this.toast.create({
      message: msg,
      duration: 2000,
      color
    });
    t.present();
  }
}