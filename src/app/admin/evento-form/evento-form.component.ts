import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../services/eventos.service';
import { ToastrService } from 'ngx-toastr';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-evento-form',
  templateUrl: './evento-form.component.html',
  styleUrls: ['./evento-form.component.scss']
  
})
export class EventoFormComponent implements OnInit {
  eventoForm!: FormGroup;
  titulo = 'Novo Evento';
  abaAtiva = 'dados';
  inscricoes: any[] = [];
  eventoId: string | null = null;
  baseUrl = 'https://backend.rcc-londrina.online/api/v1/eventos';
  
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '300px',
    minHeight: '0',
    placeholder: 'Digite o conteúdo sobre o evento...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['insertVideo', 'toggleEditorMode']
    ]
  };
  
  // Lista filtrada que será exibida
  inscricoesFiltradas: any[] = [];
  // control de busca (reactive)
  searchTerm = new FormControl('');
  
  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.eventoForm = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      slug: [''],
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      organizadorNome: ['', Validators.required],
      organizadorEmail: ['', [Validators.required, Validators.email]],
      organizadorContato: ['', Validators.required],
      bannerImagem: ['', Validators.required],
      status: ['Criado', Validators.required],
      local: this.fb.group({
        id: [null],
        eventoId: [null],
        latitude: [''],
        longitude: [''],
        endereco: [''],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: ['']
      }),
      sobre: this.fb.group({
        id: [null],
        eventoId: [null],
        conteudo: ['']
      }),
      informacoesAdicionais: this.fb.group({
        id: [null],
        eventoId: [null],
        texto: ['']
      }),
      participacoes: this.fb.array([]),
      programacao: this.fb.array([]),
      exibirPregadores: [true],
      exibirProgramacao: [true],
      exibirInformacoesAdicionais: [true],
      lotesInscricoes: this.fb.array([])
    });
    
    // Slug automático
    this.eventoForm.get('nome')?.valueChanges.subscribe((nome: string) => {
      this.eventoForm.patchValue({
        slug: this.slugify(nome)
      }, { emitEvent: false });
    });
    
    // Edição
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventoId = id;
      this.titulo = 'Editar Evento';
      this.loadEvento(id);
    }
    
    this.aplicarFiltros();
    
    this.searchTerm.valueChanges.pipe(
      debounceTime(250)
    ).subscribe(() => {
      this.aplicarFiltros();
    });
  }
  
  // Total de páginas calculadas dinamicamente
  get totalPaginas(): number {
    return Math.ceil(this.inscricoesFiltradas.length / this.itensPorPagina);
  }
  
  aplicarFiltros() {
    const termo = (this.searchTerm.value || '').toString().toLowerCase().trim();
    
    this.inscricoesFiltradas = this.inscricoes.filter(i => {
      return (
        (i.codigoInscricao || '').toString().toLowerCase().includes(termo) ||
        (i.nome || '').toString().toLowerCase().includes(termo) ||
        (i.cpf || '').toString().includes(termo) ||
        (i.telefone || '').toString().includes(termo) ||
        (i.grupoOracao || '').toString().toLowerCase().includes(termo) ||
        (i.decanato || '').toString().toLowerCase().includes(termo)
      );
    });
    
    this.paginaAtual = 1;
  }
  
  
  get dadosPaginados() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.inscricoesFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }
  
  proximaPagina(event: any) {
    event.preventDefault();    
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
    }
  }
  
  paginaAnterior(event: any) {
    event.preventDefault();
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
    }
  }
  
  // -------- SOBRE --------
  get sobre(): FormArray {
    return this.eventoForm.get('sobre') as FormArray;
  }
  
  addSobre(item: any = { id: null, eventoId: this.eventoId, conteudo: '' }) {
    this.sobre.push(
      this.fb.group({
        id: [item.id],
        eventoId: [item.eventoId],
        conteudo: [item.conteudo, Validators.required]
      })
    );
  }
  
  removeSobre(i: number) {
    this.sobre.removeAt(i);
  }
  
  // -------- PREGADORES --------
  get participacoes(): FormArray {
    return this.eventoForm.get('participacoes') as FormArray;
  }
  
  addPregador(p: any = { id: null, eventoId: this.eventoId, nome: '', foto: '', descricao: '' }) {
    this.participacoes.push(
      this.fb.group({
        id: [p.id],
        eventoId: [p.eventoId],
        nome: [p.nome, Validators.required],
        foto: [p.foto, Validators.required],
        descricao: [p.descricao || '']
      })
    );
  }
  
  removePregador(i: number) {
    this.participacoes.removeAt(i);
  }
  
  // -------- PROGRAMAÇÃO --------
  get programacao(): FormArray {
    return this.eventoForm.get('programacao') as FormArray;
  }
  
  addProgramacao(item: any = { id: null, eventoId: this.eventoId, dia: '', descricao: '' }) {
    
    this.programacao.push(
      this.fb.group({
        id: [item.id],
        eventoId: [item.eventoId],
        dia: [item.dia, Validators.required],
        descricao: [item.descricao, Validators.required]
      })
    );
  }
  
  removeProgramacao(i: number) {
    this.programacao.removeAt(i);
  }
  
  // -------- INFORMAÇÕES ADICIONAIS --------
  get informacoesAdicionais(): FormArray {
    return this.eventoForm.get('informacoesAdicionais') as FormArray;
  }
  
  addInformacoesAdicionais(item: any = { id: null, eventoId: this.eventoId, texto: '' }) {
    this.informacoesAdicionais.push(
      this.fb.group({
        id: [item.id],
        eventoId: [item.eventoId],
        texto: [item.texto, Validators.required]
      })
    );
  }
  
  removeInformacaoAdicional(i: number) {
    this.informacoesAdicionais.removeAt(i);
  }
  
  // ---------- LOTES ----------
  get lotesInscricoes(): FormArray {
    return this.eventoForm.get('lotesInscricoes') as FormArray;
  }
  
  addLote(lote: any = { id: null, eventoId: this.eventoId, nome: '', dataInicio: '', dataFim: '', valor: 0 }) {
    const loteGroup = this.fb.group({
      id: [lote.id],
      eventoId: [lote.eventoId],
      nome: [lote.nome, Validators.required],
      dataInicio: [this.formatarData(lote.dataInicio), Validators.required],
      dataFim: [this.formatarData(lote.dataFim), Validators.required],
      valor: [lote.valor, [Validators.required, Validators.min(0)]]
    });
    this.lotesInscricoes.push(loteGroup);
  }
  
  removeLote(index: number) {
    this.lotesInscricoes.removeAt(index);
  }
  
  // ---------- GETTERS ----------
  getSobre(): FormArray { 
    return this.eventoForm.get('sobre') as FormArray; 
  } 
  
  getPregadores(): FormArray { 
    return this.eventoForm.get('participacoes') as FormArray; 
  } 
  
  getProgramacao(): FormArray { 
    return this.eventoForm.get('programacao') as FormArray; 
  } 
  
  getInformacoesAdicionais(): FormArray { 
    return this.eventoForm.get('informacoesAdicionais') as FormArray; 
  }
  
  loadEvento(id: string) {
    this.eventoService.getById(id).subscribe({
      next: (dados: any[]) => {
        const evento = Array.isArray(dados)
        ? dados.find(e => e.id == id)
        : dados;
        
        if (!evento) {
          console.error('Evento não encontrado!');
          return;
        }
        
        this.eventoForm.patchValue({
          id: evento.id,
          nome: evento.nome,
          slug: evento.slug,
          bannerImagem: evento.bannerImagem,
          dataInicio: this.formatarData(evento.dataInicio),
          dataFim: this.formatarData(evento.dataFim),
          organizadorNome: evento.organizadorNome,
          organizadorEmail: evento.organizadorEmail,
          organizadorContato: evento.organizadorContato,
          status: evento.status,
          local: evento.local || {},
          sobre: evento.sobre || {},
          informacoesAdicionais: evento.informacoesAdicionais || {},
          
          exibirPregadores: evento.exibirPregadores,
          exibirProgramacao: evento.exibirProgramacao,
          exibirInformacoesAdicionais: evento.exibirInformacoesAdicionais
        });
        
        // this.getSobre().clear();
        this.getPregadores().clear();
        this.getProgramacao().clear();
        // this.getInformacoesAdicionais().clear();
        this.lotesInscricoes.clear();
        
        this.inscricoes = evento.inscricoes || [];
        // inicializa filtrados
        this.inscricoesFiltradas = [...this.inscricoes];
        
        // (evento.sobre || []).forEach((p: any) => this.addSobre(p));
        (evento.participacoes || []).forEach((p: any) => this.addPregador(p));
        (evento.programacao || []).forEach((p: any) => this.addProgramacao(p));
        (evento.lotesInscricoes || []).forEach((p: any) => this.addLote(p));
      },
      error: (err) => {
        console.error('Erro ao carregar evento:', err);
      }
    });
  }
  
  salvar() {
    this.mostrarCamposInvalidos(this.eventoForm);
    
    if (this.eventoForm.valid) {
      const evento = this.eventoForm.value;
      
      if (evento.id === "" || evento.id === null ){
        this.eventoService.save(evento).subscribe((resp: any) => {
          this.toastr.success('Evento adicionado com sucesso.');
          this.router.navigate(['/admin/eventos']);
        },
        (error: any) =>{
          console.log(error);
          this.toastr.warning(error.error?.message)
          this.router.navigate(['/admin/eventos']);
        });
      } else {
        this.eventoService.update(evento).subscribe((resp: any) => {
          
          this.toastr.success('Evento atualizado com sucesso.');
          this.router.navigate(['/admin/eventos']);
        },
        (error: any) =>{
          console.log(error);
          this.toastr.warning(error.error?.message)
          this.router.navigate(['/admin/eventos']);
        });
      }
      
    } else {
      this.eventoForm.markAllAsTouched();
    }
  }
  
  verificaCamposRequeridos(formGroup: FormGroup) {
    Object.keys(this.eventoForm.controls).forEach(campo => {
      const controle = this.eventoForm.get(campo);
      if (controle && controle.invalid) {
        console.log(`❌ Campo inválido: ${campo}`, controle.errors);
      }
    });
  }
  
  mostrarCamposInvalidos(formGroup: FormGroup | FormArray, caminho: string = '') {
    Object.keys(formGroup.controls).forEach(chave => {
      const controle = formGroup.get(chave);
      const novoCaminho = caminho ? `${caminho}.${chave}` : chave;
      
      if (controle instanceof FormGroup || controle instanceof FormArray) {
        this.mostrarCamposInvalidos(controle, novoCaminho);
      } else if (controle?.invalid) {
        console.warn(`❌ Campo inválido: ${novoCaminho}`, controle.errors);
      }
    });
  }
  
  cancelar() {
    this.router.navigate(['/admin/eventos']);
  }
  
  formatarData(data: string | Date): string | null {
    if (!data) return null;
    const d = new Date(data);
    return d.toISOString().split('T')[0]; // retorna yyyy-MM-dd
  }
  
  descreverTipoPagameto(tipoPagamento: string){
    if (tipoPagamento == 'pix')
      return 'Pix'
    if (tipoPagamento == 'cartao')
      return 'Cartão'
    return ''
  }
  
  descreverPagameto(pagamento: string){
    if (pagamento == 'pendente')
      return 'Pendente'
    if (pagamento == 'pagamento_confirmado')
      return 'Confirmado'
    if (pagamento == 'cancelado')
      return 'Cancelado'
    return ''
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
