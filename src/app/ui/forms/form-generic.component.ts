import { Component, Input, OnInit, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { FormItemType, FormItemStructure } from './form-data.class'
import { SelectorComponent } from '../selector/selector.component'
import { EditorDate } from '../editor/editor-date'

@Component(
    {
        selector: 'gg-form',
        templateUrl: './form-generic.component.html'
    }
)

export class FormGenericComponent implements OnInit {

    public newForm: FormGroup= new FormGroup({});
    public errorMessage: string= ''

    constructor(private formBuilder: FormBuilder) {
    }

    @ViewChildren(SelectorComponent) selectorViewChildren: QueryList<SelectorComponent>
    @ViewChildren(EditorDate) datesViewChildren: QueryList<EditorDate>

    FormItemType: typeof FormItemType = FormItemType;        // Necessary: see https://stackoverflow.com/questions/35923744/pass-enums-in-angular2-view-templates 

    @Input() structure: FormItemStructure[]= []
    @Input() labelColumns: number= 3
    @Input() dataColumns: number= 4
    @Output() formSaved = new EventEmitter()    

    public validatorColumns: number= 5

    showValidation: boolean= false

    ngOnInit(): void {
        const emailRegex = /^\s*[0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3}\s*$/i;
        const telRegex = /^\s*[\+0]{1}[0-9]{7,20}\s*$/im
        //const priceRegEx = `^\\d+(.\\d*)?$`

        this.validatorColumns= 12 - this.labelColumns - this.dataColumns
        this.structure.filter(s => s.isStandard()).forEach(s => {
            var validators= []
            if (s.isRequired) validators.push(Validators.required)
            if (s.minimalLength) validators.push(Validators.minLength(s.minimalLength)) 
            if (s.isEmail) validators.push(Validators.pattern(emailRegex))
            if (s.isTelephone) validators.push(Validators.pattern(telRegex))
            this.newForm.addControl(s.name, new FormControl(s.value, validators))
        })
    }

    save(formValue, isValid) {
        this.showValidation= true
        if (!isValid) return
        var retObj= {}
        this.structure.filter(s => s.isStandard()).forEach(s => {
            var value= formValue[s.name]
            if (s.type === FormItemType.InputNumber) value= +value
            if (s.type === FormItemType.InputText) value= (value || '').trim()
            if (s.type === FormItemType.InputCheckbox) value= value !== '' && value !== null
            retObj[s.name]= value
        })
        this.structure.filter(s => !s.isStandard()).forEach(s => {
            retObj[s.name]= s.value
        })
        retObj['setError']= (msg) => {this.errorMessage=msg}
        retObj['setSuccess']= (msg) => {this.reset()}
        this.formSaved.next(retObj)
    }

    reset() {
        this.showValidation= false
        this.selectorViewChildren.toArray().forEach(s => s.emptyContent())
        this.datesViewChildren.toArray().forEach(s => s.emptyContent())
        this.newForm.reset();
    }    

    isInvalid(controlName): boolean {
        var control= this.newForm.controls[controlName]
        if (!control) return true
        return !control.valid
    }

    fieldChanged(controlName, value) {
        var control= this.structure.filter(s => s.name === controlName)[0]
        if (control) control.value= value
    }
}