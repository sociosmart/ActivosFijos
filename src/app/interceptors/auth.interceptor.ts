import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';

import { Observable, defer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // no tocar login
    if (req.url.includes('/auth')) {
      return next.handle(req);
    }

    return defer(() => this.auth.getToken()).pipe(
      switchMap(token => {

        if (!token) return next.handle(req);

        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        return next.handle(cloned);
      })
    );
  }
}