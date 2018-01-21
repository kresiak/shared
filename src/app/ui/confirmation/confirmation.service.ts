import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from './../modal/modal-confirm.component'

@Injectable()
export class ConfirmationService {

    constructor(private modalService: NgbModal) { }

    checkForConfirmation(explicationKey: string = undefined, fnCloseAction = undefined) {
        var modalRef = this.modalService.open(ModalConfirmComponent)
        if (explicationKey)
            modalRef.componentInstance.explicationKey = explicationKey
        if (fnCloseAction)
            modalRef.componentInstance.fnCloseAction = fnCloseAction
    }

}
