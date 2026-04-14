import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.services';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {

    const token = await this.auth.getToken();

    // 🔥 si ya está logueado, redirige
    if (token) {
      this.router.navigateByUrl('/alta-activo', { replaceUrl: true });
      return false;
    }

    return true;
  }
}