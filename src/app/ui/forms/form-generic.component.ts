import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { FormItemType, FormItemStructure } from './form-data.class'

@Component(
    {
        selector: 'gg-form',
        templateUrl: './form-generic.component.html'
    }
)

export class FormGenericComponent implements OnInit {

    public newForm: FormGroup= new FormGroup({});

    constructor(private formBuilder: FormBuilder) {
    }

    FormItemType: typeof FormItemType = FormItemType;        // Necessary: see https://stackoverflow.com/questions/35923744/pass-enums-in-angular2-view-templates 

    @Input() structure: FormItemStructure[]= []
    @Input() labelColumns: number= 4
    @Input() dataColumns: number= 5
    @Output() formSaved = new EventEmitter()    

    showValidation: boolean= false

    ngOnInit(): void {
        const emailRegex = /^[0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3}\s*$/i;
        const telRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
        //const priceRegEx = `^\\d+(.\\d*)?$`

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
        this.structure.filter(s => s.isStandard()).forEach(s => {
            var value= formValue[s.name]
            if (s.type === FormItemType.InputNumber) value= +value
            s.value= value
        })
        this.formSaved.next(this.structure)
    }

    reset() {
        this.showValidation= false
        this.newForm.reset();
    }    

    isInvalid(controlName): boolean {
        var control= this.newForm.controls[controlName]
        if (!control) return true
        return !control.valid
    }
}