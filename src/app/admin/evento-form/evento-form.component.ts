import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-evento-form',
  templateUrl: './evento-form.component.html'
})
export class EventoFormComponent implements OnInit {
  eventoForm!: FormGroup;
  titulo = 'Novo Evento';
  abaAtiva = 'dados'
  inscricoes: any[] = [];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
    
  ) {}
  
  ngOnInit(): void {
    this.eventoForm = this.fb.group({
      nome: ['', Validators.required],
      slug: [''],
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      organizadorNome: ['', Validators.required],
      organizadorEmail: ['', [Validators.required, Validators.email]],
      organizadorContato: ['', Validators.required],
      bannerImagem: ['', Validators.required],
      status: ['Criado', Validators.required],
      sobre: this.fb.group({
        titulo: ['Sobre', Validators.required],
        conteudo: this.fb.array([])
      }),
      local: this.fb.group({
        latitude: [''],
        longitude: [''],
        endereco: [''],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: ['']
      }),
      pregadores: this.fb.array([]),
      programacao: this.fb.array([]),
      informacoesAdicionais: this.fb.group({
        texto: this.fb.array([])
      }),
      exibirPregadores: [true],
      exibirProgramacao: [true],
      exibirInformacoesAdicionais: [true]
      
    });
    
    // slug automático
    this.eventoForm.get('nome')?.valueChanges.subscribe((nome: string) => {
      this.eventoForm.patchValue({
        slug: this.slugify(nome)
      }, { emitEvent: false });
    });
    
    // se for edição
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.titulo = 'Editar Evento';
      this.loadEvento(id);
    }
  }
  
  // -------- SOBRE --------
  get conteudoSobre(): FormArray {
    return this.eventoForm.get('sobre.conteudo') as FormArray;
  }
  
  addConteudoSobre(valor: string = '') {
    this.conteudoSobre.push(this.fb.control(valor, Validators.required));
  }
  
  removeConteudoSobre(i: number) {
    this.conteudoSobre.removeAt(i);
  }
  
  // -------- PREGADORES --------
  get pregadores(): FormArray {
    return this.eventoForm.get('pregadores') as FormArray;
  }
  
  addPregador(p: any = { nome: '', foto: '', descricao: '' }) {
    this.pregadores.push(
      this.fb.group({
        nome: [p.nome, Validators.required],
        foto: [p.foto, Validators.required],
        descricao: [p.descricao || '']
      })
    );
  }
  
  removePregador(i: number) {
    this.pregadores.removeAt(i);
  }
  
  // -------- PROGRAMAÇÃO --------
  get programacao(): FormArray {
    return this.eventoForm.get('programacao') as FormArray;
  }
  
  addProgramacao(item: any = { dia: '', descricao: '' }) {
    this.programacao.push(
      this.fb.group({
        dia: [item.dia, Validators.required],
        descricao: [item.descricao, Validators.required]
      })
    );
  }
  
  // -------- INFORMACOES ADICIONAIS --------
  get textoInformacoesAdicionais(): FormArray {
    return this.eventoForm.get('informacoesAdicionais.texto') as FormArray;
  }
  
  addTextoInformacoesAdicionais(valor: string = '') {
    this.textoInformacoesAdicionais.push(this.fb.control(valor, Validators.required));
  }
  
  removeInformacaoAdicional(i: number) {
    this.textoInformacoesAdicionais.removeAt(i);
  }
  
  removeProgramacao(i: number) {
    this.programacao.removeAt(i);
  }
  
  getConteudoSobre(): FormArray {
    return this.eventoForm.get('sobre.conteudo') as FormArray;
  }
  
  getPregadores(): FormArray {
    return this.eventoForm.get('pregadores') as FormArray;
  }
  
  getProgramacao(): FormArray {
    return this.eventoForm.get('programacao') as FormArray;
  }
  
  getTextoInformacoesAdicionais(): FormArray {
    return this.eventoForm.get('informacoesAdicionais.texto') as FormArray;
  }
  
  
  
  // -------- MOCK DE EDIÇÃO --------
  loadEvento(id: string) {
    this.http.get<any>('assets/eventos.json').subscribe({
      next: (dados: any[]) => {
        // se o JSON contiver vários eventos, filtra
        const evento = Array.isArray(dados) 
        ? dados.find(e => e.id == id)
        : dados;
        
        if (!evento) {
          console.error('Evento não encontrado!');
          return;
        }
        
        // Preenche campos simples
        this.eventoForm.patchValue({
          nome: evento.nome,
          slug: evento.slug,
          bannerImagem: evento.bannerImagem,
          dataInicio: evento.dataInicio,
          dataFim: evento.dataFim,
          organizadorNome: evento.organizadorNome,
          organizadorEmail: evento.organizadorEmail,
          organizadorContato: evento.organizadorContato,
          status: evento.status,
          sobre: {
            titulo: evento.sobre?.titulo
          },
          local: evento.local || {},
          exibirPregadores: evento.exibirPregadores,
          exibirProgramacao: evento.exibirProgramacao,
          exibirInformacoesAdicionais: evento.exibirInformacoesAdicionais
        });
        
        // limpa arrays
        this.getConteudoSobre().clear();
        this.getPregadores().clear();
        this.getProgramacao().clear();
        this.getTextoInformacoesAdicionais().clear();
        this.inscricoes = evento.inscricoes || [];

        
        // popula arrays
        (evento.sobre?.conteudo || []).forEach((c: string | undefined) => this.addConteudoSobre(c));
        (evento.pregadores || []).forEach((p: any) => this.addPregador(p));
        (evento.programacao || []).forEach((p: any) => this.addProgramacao(p));
        (evento.informacoesAdicionais?.texto || []).forEach((info: string | undefined) => this.addTextoInformacoesAdicionais(info));
      },
      error: (err) => {
        console.error('Erro ao carregar evento:', err);
      }
    });
  }
  
  salvar() {
    if (this.eventoForm.valid) {
      console.log('Evento salvo:', this.eventoForm.value);
      this.router.navigate(['/admin/eventos']);
    } else {
      this.eventoForm.markAllAsTouched();
    }
  }
  
  cancelar() {
    this.router.navigate(['/admin/eventos']);
  }
  
  private slugify(text: string): string {
    return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  }
}
