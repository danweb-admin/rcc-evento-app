// token.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from './spinner.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.show();
    const token = localStorage.getItem('token');
        console.log(req)

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned).pipe(
      finalize(() => {
        this.loadingService.hide()
      })
    );
    }
    return next.handle(req).pipe(
      finalize(() => {
        this.loadingService.hide()
      })
    );
  }
}
