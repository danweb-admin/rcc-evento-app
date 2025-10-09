import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-evento-landing',
  templateUrl: './evento-landing.component.html',
  styleUrls: ['./evento-landing.component.scss']
})
export class EventoLandingComponent implements OnInit {
  evento: any;
  showModal = false;
  
  decanatos = [
    { id: 1, nome: 'Decanato Norte' },
    { id: 2, nome: 'Decanato Sul' }
  ];
  
  grupos: any[] = [];
  wazeUrl!: SafeResourceUrl;
  menuAberto = false;
  
  
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
    
  ) {
    
  }
  
  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    
    this.http.get<any[]>('assets/eventos.json').subscribe(eventos => {
      this.evento = eventos.find(e => e.slug === slug);
      this.gerarMapaWaze();
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
  
  
  
  
}
