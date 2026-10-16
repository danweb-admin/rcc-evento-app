import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventoService } from 'src/app/admin/services/eventos.service';

@Component({
  selector: 'app-consulta-inscricao-dialog',
  templateUrl: './consulta-inscricao-dialog.component.html',
  styleUrls: ['./consulta-inscricao-dialog.component.scss']
})
export class ConsultaInscricaoDialogComponent {
  @Input() show = false;
  @Input() eventoId!: string;

  @Output() closed = new EventEmitter<void>();

  form: FormGroup;

  inscricao: any = null;

  carregando = false;
  reenviando = false;

  erro = '';
  mensagemSucesso = '';

  constructor(
    private fb: FormBuilder,
    private eventosService: EventoService
  ) {

    this.form = this.fb.group({
      cpf: ['', Validators.required]
    });

  }


  consultar(): void {

    if (this.form.invalid)
      return;

    this.carregando = true;
    this.erro = '';
    this.inscricao = null;
    this.mensagemSucesso = '';

    const cpf = this.form.value.cpf;

    this.eventosService
      .consultarInscricao(this.eventoId, cpf)
      .subscribe({

        next: (resultado) => {
          this.inscricao = resultado;
          console.log(resultado)
          this.carregando = false;
        },

        error: (err) => {

          this.carregando = false;

          this.erro =
            err?.error?.message ||
            'Não foi possível localizar a inscrição. Verifique os dados informados.';

        }

      });

  }

  descreverStatus( status: string){
    
    if (status === 'pagamento_confirmado'){
      return 'Pagamento Confirmado'
    }else if (status === 'isento'){
      return 'Isento'
    }
    return ''
  }


  reenviarComprovante(): void {

    if (!this.inscricao)
      return;

    this.reenviando = true;
    this.erro = '';
    this.mensagemSucesso = '';

    this.eventosService
      .getReenvioComprovante(
        this.inscricao.codigoInscricao,
        this.inscricao.email
      )
      .subscribe({

        next: () => {
          this.reenviando = false;
          this.mensagemSucesso = 'Comprovante reenviado com sucesso para o seu e-mail.';
        },
        error: (err) => {
          this.reenviando = false;
          this.erro =
            err?.error?.message ||
            'Não foi possível reenviar o comprovante.';

        }

      });
  }

  fechar(): void {

    this.form.reset();

    this.inscricao = null;
    this.erro = '';
    this.mensagemSucesso = '';

    this.closed.emit();

  }
}
