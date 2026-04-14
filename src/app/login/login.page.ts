import { Component } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html'
})
export class LoginPage {

  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private toast: ToastController,
    private router: Router
  ) {
    
      this.router.navigate(['/alta-activo']);
  }
    


  async login() {

    if (!this.email || !this.password) {
      this.showToast('Completa los campos');
      return;
    }

    this.auth.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: async (res) => {

console.log(res);


        await this.auth.setToken(res.token);

        this.showToast('Login correcto');
      const token = await this.auth.getToken();
console.log('TOKEN GUARDADO:', token);
this.router.navigateByUrl('/alta-activo', { replaceUrl: true });
      },
      error: () => {
        this.showToast('Credenciales incorrectas');
      }
    });
  }

  async showToast(msg: string) {
    const t = await this.toast.create({
      message: msg,
      duration: 2000
    });
    t.present();
  }
}