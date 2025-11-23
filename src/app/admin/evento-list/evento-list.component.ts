import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { EventoService } from '../services/eventos.service';

@Component({
  selector: 'app-evento-list',
  templateUrl: './evento-list.component.html'
})
export class EventoListComponent implements OnInit {
  private apiUrl = 'assets/eventos.json';
  eventos: any[] = [];
  carregando = false;
  baseUrl = 'https://backend.rcc-londrina.online/api/v1/eventos/get-all';
  // baseUrl = 'http://localhost:5290/api/v1/eventos/get-all';

  
  constructor(private http: HttpClient, private router: Router, 
              private eventoService: EventoService
  ) {}
  
  ngOnInit() {
    this.carregarEventos();
  }

  
  
  carregarEventos() {
    this.carregando = true;

    this.eventoService.getEventos().subscribe(resp => {
      this.eventos = resp;
      this.carregando = false;
    })
    
    // this.http.get<any[]>('/api/eventos').subscribe({
    //   next: res => {
    
    //     this.eventos = res;
    //     this.carregando = false;
    //   },
    //   error: err => {
    //     console.error('Erro ao buscar eventos', err);
    //     this.carregando = false;
    //   }
    // });
  }
  
  novo() {
    this.router.navigate(['/admin/eventos/novo']);
  }
  
  editar(id: number) {
    this.router.navigate([`/admin/eventos/${id}/editar`]);
  }
  
  sections(id: number) {
    this.router.navigate([`/admin/eventos/${id}/sections`]);
  }
}
