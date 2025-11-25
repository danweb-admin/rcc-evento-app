import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class EventoService {
  private apiUrl = 'assets/eventos.json'; // simulando backend
  // private baseUrl = 'https://backend.rcc-londrina.online/api/v1';
  private baseUrl = 'http://localhost:5290/api/v1';


  constructor(private http: HttpClient) {}

  getEventos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/eventos/get-all`);
  }



  getById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/eventos/${id}`)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  getEventoById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/eventos`).pipe(
      map(eventos => eventos.find(e => e.id === id))
    );
  }

  save(evento: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/eventos`,evento)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  update(evento: any): Observable<any>{
    return this.http.put(`${this.baseUrl}/eventos/${evento.id}`,evento)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  getDecanatos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/decanato-setor`);
  }

  getGrupoOracoes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/grupo-oracao/get-all`);
  }

  getServoByCPF(cpf: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/servos/by-cpf?cpf=${cpf}`);
  }

  getLoteInscricao(eventoId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/eventos/lote-inscricao?eventoId=${eventoId}`);
  }

  inscricao(inscricao: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/eventos/inscricao`,inscricao)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

}
