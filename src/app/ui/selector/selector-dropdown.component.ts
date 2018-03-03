import { Component, Input, Output, OnInit, OnChanges, ViewEncapsulation, EventEmitter, HostBinding } from '@angular/core';

@Component({
    //moduleId: module.id,
    selector: 'gg-dropdown-selector',
    host: {
        'class': 'editor'
    },
    templateUrl: './selector-dropdown.component.html',
    encapsulation: ViewEncapsulation.None
})
export class SelectorDropdownComponent implements OnInit, OnChanges {
    // @Input() readOnly: boolean= false;    
    @Input() selectedValue;
    @Input() selectableOptions : any[];
    @Input() readOnly = false;
    @Input() @HostBinding('class.editor--edit-mode') editMode = false;
    @Output() selectionSaved = new EventEmitter();

    public selectedValueEdited;

    ngOnInit(): void {
        this.selectedValueEdited = this.selectedValue
    }

    ngOnDestroy(): void {
        if (this.editMode) {
            this.save()
        }
    }

    ngOnChanges(changes) {
        if (changes.selectedValue) {
            this.selectedValueEdited = this.selectedValue;
        }
    }

    save() {
        this.selectedValue = this.selectedValueEdited;
        this.selectionSaved.next(this.selectedValue);
        this.editMode = false;
    }

    cancel() {
        this.selectedValueEdited = this.selectedValue;
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    setSelection(newValue) {
        this.selectedValueEdited = newValue
    }

    getName(optionValue) {
         let option = this.selectableOptions.filter( o => o.id == optionValue)[0];
         return option ? option.name : 'Unknown value';
    }
}
