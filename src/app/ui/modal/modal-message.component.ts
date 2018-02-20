import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { Component, Input } from '@angular/core'

@Component({
    template: `
    <div class="modal-header">
      <h4 class="modal-title">{{titleKey | translate}}</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p *ngIf="explicationKey">{{explicationKey | translate}}</p>
    </div>
  `
})
export class ModalMessageComponent {
    @Input() explicationKey: string = undefined
    @Input() titleKey: string = 'UI.MODAL.DEFAULT TITLE INFO'

    constructor(public activeModal: NgbActiveModal) { }
    
}