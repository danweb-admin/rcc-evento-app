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
  inscricaoSelecionada: any = null;
  isModalOpen = false;
  filtroStatus = {
    pendente: true,
    confirmado: true,
    expirado: true,
    isento: true
  };
  
  
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
      habilitarPix: [false],
      habilitarCartao: [false],
      habilitarDinheiro: [false],
      qtdParcelas: [1],
      bannerImagem: ['', Validators.required],
      capaImagem: ['', Validators.required],
      status: ['Criado', Validators.required],
      limiteParticipantes: [0],
      taxaServico: [0],
      local: this.fb.group({
        id: [null],
        eventoId: [null],
        nomeLocal: [''],
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
      lotesInscricoes: this.fb.array([]),
      eventoCampos: this.fb.array([])
      
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
  
  get totalFiltrado(): number {
    return this.inscricoesFiltradas.length;
  }
  
  aplicarFiltros() {
    const termo = (this.searchTerm.value || '')
    .toString()
    .toLowerCase()
    .trim();
    
    this.inscricoesFiltradas = this.inscricoes.filter(i => {
      
      /* 🔎 FILTRO DE TEXTO */
      const matchTexto =
      (i.codigoInscricao || '').toString().toLowerCase().includes(termo) ||
      (i.nome || '').toString().toLowerCase().includes(termo) ||
      (i.cpf || '').toString().includes(termo) ||
      (i.telefone || '').toString().includes(termo) ||
      (i.grupoOracao || '').toString().toLowerCase().includes(termo) ||
      (i.decanato || '').toString().toLowerCase().includes(termo);
      
      if (!matchTexto) return false;
      
      /* ✅ FILTRO DE STATUS */
      if (i.status === 'pendente' && this.filtroStatus.pendente) return true;
      if (i.status === 'pagamento_confirmado' && this.filtroStatus.confirmado) return true;
      if (i.status === 'pagamento_expirado' && this.filtroStatus.expirado) return true;
      if (i.status === 'isento' && this.filtroStatus.isento) return true;
      
      
      return false;
    });
    
    this.paginaAtual = 1;
  }
  
  addCampo(item: any = { id: null, eventoId: this.eventoId, label: '', tipo: 'text', obrigatorio: false, opcoes: '', ordem: 0} ) {
    
    this.eventoCampos.push(
      this.fb.group({ 
        id: [item.id || null],
        eventoId: [this.eventoId],
        label: [ item.label],
        tipo: [item.tipo],
        nomeCampo: [''],
        obrigatorio: [item.obrigatorio],
        opcoes: [Array.isArray(item.opcoes) ? item.opcoes.join('\n') : ''],
        ordem: [item.ordem]
      })
    );
  }
  
  removeCampo(index: number) {
    this.eventoCampos.removeAt(index);
  }
  
  get eventoCampos(): FormArray {
    return this.eventoForm.get('eventoCampos') as FormArray;
  }
  
  downloadCsv(e: any) {
    e.preventDefault()
    
    if (!this.inscricoesFiltradas || this.inscricoesFiltradas.length === 0) {
      return;
    }
    
    const headers = [
      'Código Inscrição',
      'Nome',
      'CPF',
      'Telefone',
      'Grupo de Oração',
      'Decanato',
      'Pagamento',
      'Status'
    ];
    
    
    
    const rows = this.inscricoesFiltradas.map(i => [
      i.codigoInscricao,
      i.nome,
      i.cpf,
      i.telefone,
      i.grupoOracao,
      i.decanato,
      i.tipoPagamento,
      i.status
    ]);
    
    const csvContent =
    '\uFEFF' + // BOM para Excel aceitar acentos
    [
      headers.join(';'),
      ...rows.map(row =>
        row.map(value => `"${(value ?? '').toString().replace(/"/g, '""')}"`).join(';')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscricoes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    
    window.URL.revokeObjectURL(url);
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

  getEventoCampos(): FormArray { 
    return this.eventoForm.get('eventoCampos') as FormArray; 
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
          capaImagem: evento.capaImagem,
          dataInicio: this.formatarData(evento.dataInicio),
          dataFim: this.formatarData(evento.dataFim),
          organizadorNome: evento.organizadorNome,
          organizadorEmail: evento.organizadorEmail,
          organizadorContato: evento.organizadorContato,
          status: evento.status,
          limiteParticipantes: evento.limiteParticipantes,
          taxaServico: evento.taxaServico,

          local: evento.local || {},
          sobre: evento.sobre || {},
          informacoesAdicionais: evento.informacoesAdicionais || {},
          
          exibirPregadores: evento.exibirPregadores,
          exibirProgramacao: evento.exibirProgramacao,
          exibirInformacoesAdicionais: evento.exibirInformacoesAdicionais,
          habilitarPix: evento.habilitarPix,
          habilitarCartao: evento.habilitarCartao,
          habilitarDinheiro: evento.habilitarDinheiro,
          qtdParcelas: evento.qtdParcelas, 
          
        });

        // this.getSobre().clear();
        this.getPregadores().clear();
        this.getProgramacao().clear();
        this.getEventoCampos().clear();
        this.lotesInscricoes.clear();
        
        this.inscricoes = evento.inscricoes || [];
        // inicializa filtrados
        this.inscricoesFiltradas = [...this.inscricoes];
        
        (evento.eventoCampos || []).forEach((p: any) => this.addCampo(p));
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
      
      evento.eventoCampos = evento.eventoCampos.map((c: { opcoes: string; }) => ({
        ...c,
        opcoes: c.opcoes
        ? c.opcoes.split('\n').map(o => o.trim()).filter(o => o)
        : []
      }));
      
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
        this.toastr.info(`❌ Campo inválido: ${novoCaminho}`);
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
    if (tipoPagamento == 'dinheiro')
      return 'Dinheiro'
    return ''
  }
  
  descreverPagameto(pagamento: string){
    if (pagamento == 'pendente')
      return 'Pendente'
    if (pagamento == 'pagamento_confirmado')
      return 'Confirmado'
    if (pagamento == 'cancelado')
      return 'Cancelado'
    if (pagamento == 'pagamento_expirado')
      return 'Expirado'
    if (pagamento == 'isento')
      return 'Isento'
    return ''
  }
  
  
  abrirModalReenvio(event: any, inscricao: any) {
    event.preventDefault();    
    this.inscricaoSelecionada = inscricao;
    this.isModalOpen = true;
  }
  
  fecharModal() {
    this.isModalOpen = false;
  }
  
  reenviarComprovante(inscricao: any) {
    if (!this.inscricaoSelecionada) return;
    
    // this.eventoService.getReenvioComprovante(event.codigoInscricao, )
    // .subscribe({
    //   next: () => {
    //     alert('Comprovante reenviado com sucesso!');
    //     this.isModalOpen = false;
    //   },
    //   error: () => {
    //     alert('Erro ao reenviar comprovante.');
    //   }
    // });
  }
  
  isentarInscricao(event: any, inscricao: any) {
    event.preventDefault();
    
    if (!confirm(`Deseja isentar a inscrição ${inscricao.codigoInscricao}?`)) {
      return;
    }
    
    // Aqui você chama o backend
    console.log('Isentando inscrição:', inscricao.codigoInscricao);
    
    // Exemplo:
    this.eventoService.getIsentarInscricao(inscricao.codigoInscricao)
    .subscribe({
      next: () => {
        this.toastr.info('Inscrição foi isentada com sucesso!');
      },
      error: () => {
        alert('Erro ao isentar inscrição.');
      }
    });
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
