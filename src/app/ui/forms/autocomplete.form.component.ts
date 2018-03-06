import { Component, forwardRef, Input, Output, OnInit, OnChanges, EventEmitter, HostBinding, ViewChild } from '@angular/core'
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Observable, Subscription, Subject } from 'rxjs/Rx'

@Component({
    selector: 'gg-autocomplete-for-forms',
    templateUrl: './autocomplete.form.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutoCompleteForFormsComponent),
            multi: true
        }
    ]
})
export class AutoCompleteForFormsComponent implements OnInit, ControlValueAccessor {
    @Input() selectableData: any[]
    @Input() placeholderKey: string
    @Input() editable: boolean= false
    @Input() disabled = false
    @Input() nbItemsShown: number= 15
    @ViewChild('instance') instance: NgbTypeahead;    
    @HostBinding('style.opacity')
    get opacity() {
      return this.disabled ? 0.25 : 1;
    }

    selectedItem: any
    selectableDataObservable: Observable<any[]>

    // Function to call when the rating changes.
    onChange = (id: string) => { };

    // Function to call when the input is touched (when a star is clicked).
    onTouched = () => { };

    public contentEdited;

    ngOnInit(): void {
        this.selectableDataObservable= Observable.from([this.selectableData])
    }

    ngOnDestroy(): void {
    }

    focus$ = new Subject<string>();
    click$ = new Subject<string>();    

    searchFn= (text$: Observable<string>) =>
    text$
        .debounceTime(200).distinctUntilChanged()
        .merge(this.focus$)
        .merge(this.click$.filter(() => !this.instance.isPopupOpen()))        
        .switchMap((term: string) => {
            return this.selectableDataObservable.map(sd => !term ? sd.slice(0, this.nbItemsShown) : sd.filter(item => item.name.toLowerCase().includes(term.toLowerCase())).slice(0, this.nbItemsShown))
        })

    formatter = (x: { name: string }) => {
        return x.name
    };

    private choiceMade: boolean= false

    optionSelected(event: NgbTypeaheadSelectItemEvent) {
        this.choiceMade= true
        this.onChange(event.item.id)
    }

    writeValue(id: string): void {
        var item= this.selectableData.filter(sd => sd.id ===id)[0]
        if (item) {
            this.choiceMade= true
        }
        this.selectedItem= item || { name: '' }
        this.onChange(item ? id : undefined)
    }

    registerOnChange(fn: (id: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onTypeText(txt) {
        var item= this.selectableData.filter(sd => sd.name.toUpperCase() ===txt.trim().toUpperCase())[0]
        if (item) {
            this.choiceMade= true
            this.onChange(item.id)                
        }
        else if (this.choiceMade){
            this.onChange(undefined)
            this.choiceMade= false
        }        
    }
}
