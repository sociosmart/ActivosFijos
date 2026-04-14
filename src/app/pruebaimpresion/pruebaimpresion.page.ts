import { Component } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-pruebaimpresion',
  templateUrl: './pruebaimpresion.page.html',
  styleUrls: ['./pruebaimpresion.page.scss'],
})
export class PruebaimpresionPage {

  // ================= CONFIG ETIQUETA =================
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
  ) {
    
  }
async print(){
  for (let index = 0; index <10; index++) {
      this.imprimirEtiqueta();
      
    }
}
  // ================= IMPRESIÓN =================
  async imprimirEtiqueta() {

    if (!this.platform.is('cordova')) {
      this.showToast('Solo en dispositivo real', 'warning');
      return;
    }

    const permisos = await this.pedirPermisos();
    if (!permisos) return;

    try {

      const devices: any[] = await this.bluetoothSerial.list();

      if (!devices.length) {
        this.showToast('No hay impresoras', 'danger');
        return;
      }

      const deviceId = devices[0].address || devices[0].id;

      const id = '1234567890';
      const nombre = 'DEMO';
      const fecha = new Date().toLocaleDateString();

      this.bluetoothSerial.connect(deviceId).subscribe({

        next: async () => {

          const ESC = 0x1B;
          const GS = 0x1D;

          const cmds: number[] = [];
          const encoder = new TextEncoder();

          // ================= RESET =================
          cmds.push(ESC, 0x40);

          // ================= CONFIG BASE =================
          cmds.push(ESC, 0x74, 0x00); // charset
          cmds.push(ESC, 0x33, 0x00); // SIN espacio entre líneas (CRÍTICO)
          cmds.push(ESC, 0x61, 0x00); // align left

          // ================= MODO ETIQUETA (GAP) =================
          cmds.push(0x1D, 0x7C, 0x00);

          // ================= ÁREA DE IMPRESIÓN FIJA =================
          cmds.push(0x1D, 0x57, this.LABEL_WIDTH_DOTS & 0xff, this.LABEL_WIDTH_DOTS >> 8);
          cmds.push(0x1D, 0x50, this.LABEL_HEIGHT_DOTS & 0xff, this.LABEL_HEIGHT_DOTS >> 8);

          // ================= FUENTE =================
          //cmds.push(ESC, 0x4D, 0x00);font A
          //cmds.push(GS, 0x21, 0x00);
          cmds.push(ESC, 0x4D, 0x01); // Font B (más pequeña)
          cmds.push(GS, 0x21, 0x00);
         

          // ================= CONTENIDO =================
          cmds.push(...this.texto(`ID: ${id}\n`));
          cmds.push(...this.texto(`NOM: ${nombre}\n`));
          cmds.push(...this.texto(`FEC: ${fecha}\n`));

          // ================= BARCODE =================
          const barcode = encoder.encode(id);

          cmds.push(GS, 0x68, 80); // alto barcode
          cmds.push(GS, 0x77, 2);  // grosor

          cmds.push(GS, 0x6B, 0x49);
          cmds.push(barcode.length);
          cmds.push(...barcode);

          // ================= CONTROL FINAL =================
          cmds.push(0x0A); // SOLO UNO (evita desfase)
          cmds.push(0x0A); 
          //cmds.push(0x0A); 

          // ================= CORTE SIN FEED EXTRA =================
         //cmds.push(GS, 0x56, 0x00);

          await new Promise(res => setTimeout(res, 300));

          await this.bluetoothSerial.write(new Uint8Array(cmds).buffer);

          this.bluetoothSerial.disconnect();

          this.showToast('Etiqueta 50x30 calibrada OK ✅', 'success');
        },

        error: err => {
          console.error(err);
          this.showToast('Error de impresora', 'danger');
        }
      });

    } catch (err) {
      console.error(err);
      this.showToast('Error Bluetooth', 'danger');
    }
  }

  // ================= TEXTO =================
  private texto(texto: string): number[] {
    return Array.from(new TextEncoder().encode(texto));
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
    const t = await this.toastController.create({
      message: msg,
      duration: 3000,
      color
    });
    t.present();
  }
}