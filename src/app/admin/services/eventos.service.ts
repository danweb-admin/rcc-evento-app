import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class EventoService {
  private apiUrl = 'assets/eventos.json'; // simulando backend

  constructor(private http: HttpClient) {}

  getEventos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getEventoById(id: number): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(eventos => eventos.find(e => e.id === id))
    );
  }
}
