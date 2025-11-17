import { ChangeDetectorRef, Component } from '@angular/core';
import { LoadingService } from './spinner.service';

@Component({
  selector: 'app-spinner',
  template: `
    <div *ngIf="loadingService.loading$ | async" class="spinner-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }
  `]
})
export class SpinnerComponent {
  constructor(
    public loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadingService.loading$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }
}
