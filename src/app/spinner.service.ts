import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private zone: NgZone) {}

  show() {
    this.zone.run(() => this.loadingSubject.next(true));
  }

  hide() {
    this.zone.run(() => this.loadingSubject.next(false));
  }
}
