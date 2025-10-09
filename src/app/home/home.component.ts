import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  eventos: any[] = [];
  menuAberto = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any[]>('/assets/eventos.json').subscribe(data => {
      this.eventos = data;
    });
  }

  abrirEvento(slug: string) {
    // Navega até a landing page do evento
    this.router.navigate(['/eventos', slug]);
  }
}
