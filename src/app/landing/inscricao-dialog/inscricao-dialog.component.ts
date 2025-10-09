import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Decanato {
  id: number;
  nome: string;
}

interface Grupo {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-inscricao-dialog',
  templateUrl: './inscricao-dialog.component.html',
})
export class InscricaoDialogComponent {
  @Input() show = false;
  @Output() closed = new EventEmitter<void>();

  selectedTab: 'inscricao' | 'pagamento' = 'inscricao';
  formaPagamento: 'pix' | 'cartao' | null = null;

  inscricaoForm: FormGroup;
  decanatos: Decanato[] = [
    { id: 1, nome: 'Decanato Norte' },
    { id: 2, nome: 'Decanato Sul' }
  ];

  grupos: Grupo[] = [
    { id: 1, nome: 'Grupo São José' },
    { id: 2, nome: 'Grupo Nossa Senhora' }
  ];

  constructor(private fb: FormBuilder) {
    this.inscricaoForm = this.fb.group({
      cpf: ['', Validators.required],
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      decanatoId: [''],
      grupoOracaoId: [''],
      numeroCartao: [''],
      nomeCartao: [''],
      validade: [''],
      cvv: ['']
    });
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

  confirmarPagamento() {
    console.log('Forma de pagamento:', this.formaPagamento);
    console.log('Dados finais:', this.inscricaoForm.value);

    // aqui você chamaria o backend para gerar QR Code ou processar pagamento
    this.fechar();
  }

  validarCpf() {
    // lógica de CPF
  }

  carregarGrupos(event: any) {
    // lógica para carregar grupos
  }
}
