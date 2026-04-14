import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storageReady: Promise<Storage>;

  private API = 'http://192.168.68.149/api_activos_v2/public';

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    // 🔥 SIEMPRE garantiza instancia válida
    this.storageReady = this.storage.create();
  }

  login(data: { email: string, password: string }) {
    return this.http.post<any>(`${this.API}/auth`, data);
  }

  async setToken(token: string) {
    const storage = await this.storageReady;
    await storage.set('token', token);
  }

  async getToken(): Promise<string | null> {
    const storage = await this.storageReady;
    return storage.get('token');
  }

  async logout() {
    const storage = await this.storageReady;
    await storage.remove('token');
  }
}