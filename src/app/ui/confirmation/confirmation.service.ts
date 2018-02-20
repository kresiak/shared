import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from './../modal/modal-confirm.component'
import { ModalMessageComponent } from './../modal/modal-message.component'

@Injectable()
export class ConfirmationService {

    constructor(private modalService: NgbModal) { }

    checkForConfirmation(explicationKey: string = undefined, fnCloseAction = undefined) {
        var modalRef = this.modalService.open(ModalConfirmComponent, { keyboard: false, backdrop: "static"})
        if (explicationKey)
            modalRef.componentInstance.explicationKey = explicationKey
        if (fnCloseAction)
            modalRef.componentInstance.fnCloseAction = fnCloseAction
    }

    openMessageBox(explicationKey: string = undefined, fnCloseAction = undefined) {
        var modalRef = this.modalService.open(ModalMessageComponent, { keyboard: false, backdrop: "static"})
        if (explicationKey)
            modalRef.componentInstance.explicationKey = explicationKey
        if (fnCloseAction)
            modalRef.componentInstance.fnCloseAction = fnCloseAction   
        return modalRef     
    }

}
