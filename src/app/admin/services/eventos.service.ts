import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class EventoService {
  private baseUrl = 'https://backend.rcc-londrina.online/api/v1';
  // private baseUrl = 'http://192.168.15.5:5100/api/v1';
    // private baseUrl = 'http://localhost:5290/api/v1';

  constructor(private http: HttpClient) {}

  getEventos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/eventos/get-all`);
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios-checkin`);
  }

  getReenvioComprovante(codigoInscricao: string, email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/eventos/reenvio-comprovante/?codigoInscricao=${codigoInscricao}&email=${email}`)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  getIsentarInscricao(codigoInscricao: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/eventos/isentar-inscricao/?codigoInscricao=${codigoInscricao}`)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/eventos/${id}`)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  getSlug(slug: string | null): Observable<any> {
    return this.http.get(`${this.baseUrl}/eventos/get-slug/?slug=${slug}`)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  getEventoById(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/eventos`).pipe(
      map(eventos => eventos.find(e => e.id === id))
    );
  }

  verificarStatus(codigoInscricao: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/eventos/verifica-status?codigoInscricao=${codigoInscricao}`);
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

  getCarregaCampos(eventoId: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/eventos/${eventoId}/campos`);
  }

  verificarCPF(cpf: string, eventoId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/eventos/verificar-cpf?cpf=${cpf}&eventoId=${eventoId}`);
  }

  getLoteInscricao(eventoId: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/eventos/lote-inscricao?eventoId=${eventoId}`);
  }

  getLimiteParticipantes(eventoId: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/eventos/verifica-limite-participantes?eventoId=${eventoId}`);
  }

  createUsuarioCheckin(payload: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/usuarios-checkin`,payload)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  inscricao(inscricao: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/eventos/inscricao`,inscricao)
    .pipe(map((resp: any) => {
      return resp;
    }));
  }

  exportCSV(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/eventos/exportar-inscricoes/${id}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

}
