import { Component, Input, Output, OnInit, OnChanges, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { countries } from '../utils/lists'

@Component({
    //moduleId: module.id,
    selector: 'gg-editor-autocomplete-country',
    templateUrl: './editor-autocomplete-country.html'
})
export class EditorAutocompleteCountry implements OnInit {
    constructor() {

    }
    @Input() readOnly: boolean = false;
    @Input() selectedCountryCode: string
    @Input() emptyContentText: string = ''
    @Input() linkable: boolean = false
    @Input() timeoutSeconds: number = 5 * 60;

    @Output() countryCodeChanged = new EventEmitter();

    selectableData: Observable<any[]>;

    ngOnInit(): void {
        this.selectableData= Observable.from([countries])
    }

    ngOnDestroy():void 
    {
    }

    _countryCodeChanged(id) {
        this.countryCodeChanged.next(id)
    }


}
