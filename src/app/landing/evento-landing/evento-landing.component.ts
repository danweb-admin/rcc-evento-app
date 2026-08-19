import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventoService } from 'src/app/admin/services/eventos.service';

@Component({
  selector: 'app-evento-landing',
  templateUrl: './evento-landing.component.html',
  styleUrls: ['./evento-landing.component.scss']
})
export class EventoLandingComponent implements OnInit {
  evento: any;
  showModal = false;
  
  grupos: any[] = [];
  wazeUrl!: SafeResourceUrl;
  menuAberto = false;
  
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: EventoService,
    
  ) {
    
  }
  
  
  ngOnInit(): void {
    const slug= this.route.snapshot.paramMap.get('slug');
    
    this.service.getSlug(slug).subscribe(ev => {
      this.evento = ev;
      this.gerarMapaWaze();

      if (slug == 'deus-conosco-2026') {
        this.abrirModal();
      }
    });
  }
  
  isMobile(): boolean {
    return window.innerWidth < 768;
  }
  
  gerarMapaWaze(): void {
    if (this.evento?.local?.latitude && this.evento?.local?.longitude) {
      const mapaUrl = `https://embed.waze.com/iframe?zoom=16&lat=${this.evento.local.latitude}&lon=${this.evento.local.longitude}&pin=1&locale=pt-BR`;
      this.wazeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapaUrl);
    }
  }
  
  abrirModal() {
    this.showModal = true;
  }
  
  fecharModal() {
    this.showModal = false;
  }
  
  formatarData(data: string | Date): string | null {
    if (!data) return null;
    const d = new Date(data);
    return d.toISOString().split('T')[0]; // retorna yyyy-MM-dd
  }
  
}
