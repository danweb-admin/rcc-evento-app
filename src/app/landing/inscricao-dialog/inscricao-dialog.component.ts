import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EventoService } from 'src/app/admin/services/eventos.service';
import { ValidateService } from '../services/validate.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

interface Decanato {
  id: string;
  name: string;
}

@Component({
  selector: 'app-inscricao-dialog',
  styleUrls: ['./inscricao-dialog.component.scss'],
  templateUrl: './inscricao-dialog.component.html',
})
export class InscricaoDialogComponent implements OnInit{
  @Input() show = false;
  @Output() closed = new EventEmitter<void>();
  @Input() eventoId!: string;
  @ViewChild('cpfInput') cpfInput!: ElementRef;
  
  selectedTab: 'inscricao' | 'pagamento' = 'inscricao';
  slug: string = ''
  inscricaoForm: FormGroup;
  decanatos: Decanato[] = [];
  
  grupos: any[] = [];
  gruposComFiltro: any[] = []; 
  
  semGrupo = false;
  eventoGratuito = false;
  permitirPagamento = false;
  
  valorInscricao!: number;
  formaSelecionada: 'pix' | 'cartao' | 'dinheiro'  = 'pix';
  modoVisualizacao = false;
  qrCode = false;
  mostrarCartao =  true;
  mostrarQRCode =  true;
  bloquearConfirmar = false;
  qrCodeLink: string  = ''
  qrCodePNG: string  = ''

  pixCopiaECola: string = '';
  copiado = false;
  codigoInscricao: string = '';
  linkPgtoCartao: string = '';
  pagoDinheiro: boolean = false;
  habilitarPix: boolean = false;
  habilitarCartao: boolean = false;
  habilitarDinheiro: boolean = false;
  
  qtdParcelas: number = 1;
  // Tempo total do Pix (em segundos)
  tempoTotalPix = 15 * 60; // 15 minutos
  tempoRestante = this.tempoTotalPix;
  camposDinamicos: any[] = [];

  mostrarDecanato: boolean = true;
  mostrarGrupo: boolean = true;
  mostrarNenhumGrupo: boolean = true;
  valorInscricaoOriginal  = 0;

  
  pixExpirado = false;
  private timerPix: any;
  statusPagamento: 'PENDENTE' | 'PAGO' | 'EXPIRADO' | 'GRATUITO' = 'PENDENTE';
  private pollingPix: any;
  
  constructor(private fb: FormBuilder,
    private service: EventoService,
    private validateService: ValidateService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    
  ) {
    this.inscricaoForm = this.fb.group({
      eventoId: this.eventoId,
      cpf: ['', Validators.required],
      nome: ['', Validators.required],
      email: ['', [Validators.required]],
      telefone: ['', Validators.required],
      decanatoId: [''],
      grupoOracaoId: [''],
      semGrupo: [false],
      servoId: [''],
      tipoPagamento: this.formaSelecionada,
      valorInscricao: [],
      numeroCartao: [],
      nomeCartao: [],
      validade: [],
      cvv: [],
      quantidadeParcelas: [0],
      formaSelecionada: ''
      
    });
  }
  ngOnInit(): void {
    this.carregarDecanato();
    this.carregarGrupoOracoes();
    this.carregarCampos();
    this.getEventoById();

        const slug= this.route.snapshot.paramMap.get('slug');

    
    
    this.inscricaoForm.patchValue({ eventoId: this.eventoId });
    
    this.inscricaoForm.get('decanatoId')?.valueChanges.subscribe(decanatoId => {
      if (decanatoId) {
        this.gruposComFiltro = this.filtrarGruposPorDecanato(decanatoId)
      } else {
        this.gruposComFiltro = [];
        this.inscricaoForm.patchValue({ grupoOracaoId: '' });
      }
    });
    
    this.inscricaoForm.get('semGrupo')?.valueChanges.subscribe((value) => {
      this.semGrupo = value;
      
      if (value) {
        // desmarca e desativa decanato/grupo
        this.inscricaoForm.patchValue({
          decanatoId: '',
          grupoOracaoId: ''
        });
        this.inscricaoForm.get('decanatoId')?.disable();
        this.inscricaoForm.get('grupoOracaoId')?.disable();
      } else {
        // reativa os campos
        this.inscricaoForm.get('decanatoId')?.enable();
        this.inscricaoForm.get('grupoOracaoId')?.enable();
      }
    });
    
    this.buscaLoteInscricao();

    if (this.eventoId.toUpperCase() === '910BFAC1-3E76-422A-BDAB-C3B7A2EEC649') {
      this.mostrarDecanato = false
      this.mostrarGrupo = false;
      this.mostrarNenhumGrupo = false;
    }
  }
  
  formatarTempo(): string {
    const min = Math.floor(this.tempoRestante / 60);
    const sec = this.tempoRestante % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
  
  iniciarVerificacaoPagamento() {
    this.pollingPix = setInterval(() => {
      this.service.verificarStatus(this.codigoInscricao)
      .subscribe(
        response => {
          if (response.status === 'PAGO') {
            clearInterval(this.pollingPix);
            clearInterval(this.timerPix);
            
            this.statusPagamento = 'PAGO';
          }
        },
        (error: any) =>{
          console.log(error);
          
        });
      }, 5000); // a cada 5 segundos
    }
    
    
    buscaLoteInscricao(){
      this.service.getLoteInscricao(this.eventoId).subscribe({
        next: (valor) => {
          
          this.valorInscricao = valor;
          this.inscricaoForm.patchValue({valorInscricao: valor});
        },
        error: (e) => {
          
          this.toastr.error('Evento não está ativo para receber Inscrições!');
          this.bloquearConfirmar = true;
          this.valorInscricao = 0;
        }
      });
    }

    proximo() {
      var quantidade = this.inscricaoForm.get('quantidade')
      
      if (quantidade != null){
        var valueQtd = quantidade?.value;

        if (valueQtd == 0){
          this.toastr.error('Quantidade não pode ser 0!');
          return;
        }

        this.valorInscricao = this.valorInscricao * valueQtd;
        this.inscricaoForm.patchValue({valorInscricao: this.valorInscricao})
      }

      if (this.inscricaoForm.invalid) {
        this.inscricaoForm.markAllAsTouched();
        return;
      }

      this.selectedTab = 'pagamento'
      this.bloquearConfirmar = false;

      // verifica se atingiu o limite de participantes
      this.service.getLimiteParticipantes(this.eventoId).subscribe({
        next: (valor) => {
          
          if (!valor){
            this.toastr.error('As inscrições desse Evento foram encerradas!');
            this.bloquearConfirmar = true;
          }
        }
      });

      if (this.eventoId.toUpperCase() === '910BFAC1-3E76-422A-BDAB-C3B7A2EEC649') {
        
        let camiseta = this.inscricaoForm.value["comprarcamiseta?"];

        if (camiseta === 'SIM'){
          this.valorInscricao = 49.90
        }

        if (camiseta === 'NÃO'){
          this.valorInscricao = 0
        }
      }
    }
    
    
    fechar() {
      this.closed.emit();
    }
    
    salvar() {
      if (this.inscricaoForm.valid) {
        console.log('Dados inscrição:', this.inscricaoForm.value);
        this.selectedTab = 'pagamento';
      }
    }
    
    formaPagamento(forma: any){
      this.formaSelecionada = forma;
      this.inscricaoForm.patchValue({tipoPagamento: forma})

      this.formaSelecionada = forma;
      this.inscricaoForm.patchValue({tipoPagamento: forma})

      // ESSA CONFIGURACAO É ESPECIFICA PARA O EVENTO -> EPA 2026
      if (this.eventoId.toUpperCase() === '910BFAC1-3E76-422A-BDAB-C3B7A2EEC649' && forma === 'cartao') {
        this.valorInscricaoOriginal = this.valorInscricao

        this.valorInscricao = this.valorInscricao *  1.04
        this.inscricaoForm.patchValue({valorInscricao: this.valorInscricao})
      }

      // ESSA CONFIGURACAO É ESPECIFICA PARA O EVENTO -> EPA 2026
      if (this.eventoId.toUpperCase() === '910BFAC1-3E76-422A-BDAB-C3B7A2EEC649' && forma === 'pix') {
        if (this.valorInscricaoOriginal === undefined){
          this.valorInscricaoOriginal = this.valorInscricao
        }

        this.valorInscricao = this.valorInscricaoOriginal
        this.inscricaoForm.patchValue({valorInscricao: this.valorInscricao})
      }
    }
    
    confirmar() {
      
      if (this.eventoGratuito){
        this.inscricaoForm.patchValue({tipoPagamento: 'gratuito'})
        this.inscricaoForm.patchValue({valorInscricao: this.valorInscricao})
        this.inscricaoForm.patchValue({formaSelecionada: this.formaSelecionada})
      }
      
      if (!this.formaSelecionada &&  !this.eventoGratuito){
        this.toastr.warning('Selecione uma forma de pagamento! Pix ou Cartão')
        return;
      }

      if (this.valorInscricao == 0 && !this.eventoGratuito){
        this.toastr.warning('Valor da Inscrição não pode ser 0.')
        return;
      }
      
      const payload = {
        ...this.inscricaoForm.value,
        camposDinamicos: this.camposDinamicos.map(c => ({
          eventoCampoId: c.id,
          valor: this.inscricaoForm.value[c.nomeCampo]
        }))
      };
      
      // Aqui você envia a forma de pagamento para o backend
      this.service.inscricao(payload).subscribe(resp => {
        
        if (resp.tipoPagamento === 'pix' || this.formaSelecionada === 'pix'){
          this.toastr.success('A inscrição será efetivada após o pagamento, verifique seu email!');
          
          this.qrCode = true;
          this.qrCodeLink = `data:image/png;base64,${resp.linkQrCodeBase64}`;
          this.qrCodePNG = resp.linkQrCodePNG;
          this.pixCopiaECola = resp.qrCodeCopiaCola;
          this.mostrarCartao = false;
          this.iniciarTimerPix();
          this.iniciarVerificacaoPagamento();
        }
        
        if (resp.tipoPagamento === 'cartao' || this.formaSelecionada === 'cartao'){
          this.toastr.success('Link para pagamento com cartão de crédito foi gerado com sucesso.!');
          this.mostrarQRCode = false
          this.linkPgtoCartao = resp.linkPgtoCartao;
        }
        
        if (resp.tipoPagamento === 'dinheiro'){
          this.toastr.success('Inscrição realizada com sucesso.!');
          this.pagoDinheiro = true;
          this.statusPagamento = 'PAGO';
        }

        if (resp.tipoPagamento === 'gratuito' && !['cartao', 'pix'].includes(this.formaSelecionada)){
          this.toastr.success('Inscrição realizada com sucesso.!');
          this.statusPagamento = 'GRATUITO';
        }
        
        
      },(error: any) =>{
        this.toastr.warning(error.error.message)
      });
      
    }
    
    iniciarTimerPix() {
      // Evita múltiplos timers
      if (this.timerPix) {
        clearInterval(this.timerPix);
      }
      
      this.pixExpirado = false;
      this.tempoRestante = this.tempoTotalPix;
      
      this.timerPix = setInterval(() => {
        this.tempoRestante--;
        
        if (this.tempoRestante <= 0) {
          clearInterval(this.timerPix);
          this.pixExpirado = true;
        }
      }, 1000);
    }
    
    
    copiarCodigoPix(event: any) {
      event.preventDefault();
      navigator.clipboard.writeText(this.pixCopiaECola)
      .then(() => {
        this.toastr.info('Código PIX copiado!')
      })
      .catch(err => {
        console.error('Erro ao copiar PIX: ', err);
      });
    }
    
    voltar(){
      
    }
    
    getEventoById(){
      this.service.getById(this.eventoId).subscribe(resp => {
        this.habilitarCartao = resp.habilitarCartao;
        this.habilitarPix = resp.habilitarPix;
        this.habilitarDinheiro = resp.habilitarDinheiro;
        this.qtdParcelas = resp.qtdParcelas;
        this.eventoGratuito = resp.eventoGratuito;
      });
    }
    
    validarCpf(event: any) {
      let cpf = event.target.value;
      
      if (!this.validateService.validarCpf(cpf)){
        this.toastr.warning("CPF Inválido.")
        
        setTimeout(() => {
          this.cpfInput.nativeElement.focus();
        }, 0);
        
        return;
      }
      
      this.service.verificarCPF(cpf,this.eventoId).subscribe(resp => {
        this.inscricaoForm.patchValue({
          servoId: resp.id,
          cpf: cpf,
          nome: resp.nome,
          email: resp.email.toLowerCase(),
          telefone: resp.telefone,
          decanatoId: resp.decanatoId,
          grupoOracaoId: resp.grupoOracaoId
        });
        
        this.valorInscricao = resp.valorInscricao;
        
        this.inscricaoForm.get('semGrupo')?.disable();
        
        this.modoVisualizacao = true;
        
        if (resp.status == 'pagamento_confirmado'){
          this.statusPagamento = 'PAGO'
        }
        
        if (resp.status == 'pendente'){
          if (resp.tipoPagamento === 'pix'){
            this.toastr.success('A inscrição será efetivada após o pagamento, verifique seu email!');
            
            this.qrCode = true;
            this.qrCodeLink = `data:image/png;base64,${resp.linkQrCodeBase64}`;
            this.qrCodePNG = resp.linkQrCodePNG;
            this.pixCopiaECola = resp.qrCodeCopiaCola;
            this.mostrarCartao = false;
            this.iniciarTimerPix();
            this.iniciarVerificacaoPagamento();
          }
          
          if (resp.tipoPagamento === 'cartao'){
            this.toastr.success('Link para pagamento com cartão de crédito foi gerado com sucesso.!');
            this.mostrarQRCode = false
            this.linkPgtoCartao = resp.linkPgtoCartao;
          }
          
          if (resp.tipoPagamento === 'dinheiro'){
            this.toastr.success('Inscrição realizada com sucesso.!');
            this.pagoDinheiro = true;
            this.statusPagamento = 'PAGO';
          }
        }
        
        this.codigoInscricao = resp.codigoInscricao;
        this.bloquearConfirmar = true;
        
      },(error: any) =>{
        if (error.status === 404) {
          // Usuário não encontrado — habilita todos os campos
          this.inscricaoForm.get('nome')?.enable();
          this.inscricaoForm.get('telefone')?.enable();
          this.inscricaoForm.get('decanatoId')?.enable();
          this.inscricaoForm.get('grupoOracaoId')?.enable();
          this.inscricaoForm.get('email')?.enable();
          
          this.toastr.info('Cadastro não encontrado, preencha seus dados.');
        } else {
          this.toastr.error('Erro ao buscar CPF.');
        }
        
      });
    }
    
    irParaPagamento(event: any){
      event.preventDefault();
      if (this.linkPgtoCartao) {
        window.open(this.linkPgtoCartao, '_blank');
      }
    }
    
    selecionarForma(forma: 'pix' | 'cartao') {
      this.formaSelecionada = forma;
    }
    
    getDescricaoForma(forma: string): string {
      return forma === 'pix'
      ? 'Pagamento via Pix (QR Code instantâneo)'
      : 'Pagamento com Cartão de Crédito';
    }
    
    carregarDecanato(){
      this.service.getDecanatos().subscribe(resp => {
        this.decanatos = resp;
      })
    }
    
    carregarGrupoOracoes() {
      this.service.getGrupoOracoes().subscribe(resp => {
        this.grupos = resp;
      })
    }
    
    carregarCampos() {
      this.service.getCarregaCampos(this.eventoId)
      .subscribe(campos => {
        this.camposDinamicos = campos;
        
        campos.forEach(campo => {
          this.inscricaoForm.addControl(
            campo.nomeCampo,
            new FormControl(
              '',
              campo.obrigatorio ? Validators.required : null
            )
          );
        });

        console.log(this.slug)
        // if (this.slug == 'deus-conosco-2026'){
          this.inscricaoForm.get('comprarcamiseta?')?.valueChanges.subscribe(camiseta => {
            
            if (camiseta == 'NÃO'){
              this.inscricaoForm.get('tamanhocamiseta')?.disable();
            }else{
              this.inscricaoForm.get('tamanhocamiseta')?.enable();
            }
            console.log(camiseta)
          });

          this.inscricaoForm.get('participantedeoutradiocese')?.valueChanges.subscribe(diocese => {
            
            if (diocese == 'NÃO'){
              this.inscricaoForm.get('qualdioceseparticipa?')?.disable();
            }else{
              this.inscricaoForm.get('qualdioceseparticipa?')?.enable();
            }
          });

          this.inscricaoForm.get('façopartedarcc?')?.valueChanges.subscribe(rcc => {
            
            if (rcc == 'SIM'){
              this.inscricaoForm.get('qualmovimento/pastoralouserviçoparticipa')?.disable();
            }else{
              this.inscricaoForm.get('qualmovimento/pastoralouserviçoparticipa')?.enable();
            }
          });
          
        // }
        
      });
    }
    
    
    filtrarGruposPorDecanato(decanatoId: string): any[] {
      return this.grupos.filter(g =>
        g.paroquiaCapela?.decanatoSetor?.id === decanatoId
      );
    }
  }
  