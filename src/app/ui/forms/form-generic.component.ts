import { Component, Input, OnInit, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { FormItemType, FormItemStructure } from './form-data.class'
import { SelectorComponent } from '../selector/selector.component'
import { EditorDate } from '../editor/editor-date'
import { Observable } from 'rxjs/Observable';
import { ConfirmationService } from '../confirmation/confirmation.service'
import { countries } from '../utils/lists'

@Component(
    {
        selector: 'gg-form',
        templateUrl: './form-generic.component.html'
    }
)

export class FormGenericComponent implements OnInit {

    public newForm: FormGroup = new FormGroup({});
    public errorMessage: string = ''

    constructor(private formBuilder: FormBuilder, private confirmationService: ConfirmationService) {
    }

    @ViewChildren(SelectorComponent) selectorViewChildren: QueryList<SelectorComponent>
    @ViewChildren(EditorDate) datesViewChildren: QueryList<EditorDate>

    FormItemType: typeof FormItemType = FormItemType;        // Necessary: see https://stackoverflow.com/questions/35923744/pass-enums-in-angular2-view-templates 

    @Input() structure: FormItemStructure[] = []
    @Input() labelColumns: number = 3
    @Input() dataColumns: number = 4
    @Input() primaryControlName: string = 'name'
    @Input() primaryDataObservable: Observable<any> = undefined
    @Input() cannotRecreatePrimary:boolean = true
    @Output() formSaved = new EventEmitter()

    @Output() gigaControlChanged = new EventEmitter()

    public validatorColumns: number = 5

    showValidation: boolean = false

    public isPageRunning: boolean = true

    private mapValues: Map<string, any> = new Map<string, any>()

    ngOnInit(): void {
        const telRegex = /^\s*[\+0]{1}[0-9]{7,20}\s*$/im
        const emailRegex = /^\s*([0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3})\s*$/i;
        //const priceRegEx = `^\\d+(.\\d*)?$`

        this.validatorColumns = 12 - this.labelColumns - this.dataColumns
        this.structure.filter(s => s.isStandard()).forEach(s => {
            var validators = []
            if (s.isRequired) validators.push(Validators.required)
            if (s.minimalLength) validators.push(Validators.minLength(s.minimalLength))
            if (s.isEmail) validators.push(Validators.pattern(emailRegex))
            if (s.isTelephone) validators.push(Validators.pattern(telRegex))
            this.newForm.addControl(s.name, new FormControl(s.value, validators))
        })

        this.initCheck()
    }

    public alreadyInDb: boolean = false

    private initCheck() {
        if (!this.primaryDataObservable || !this.newForm.controls[this.primaryControlName]) return
        this.newForm.controls[this.primaryControlName].valueChanges.debounceTime(400).distinctUntilChanged().startWith('').takeWhile(() => this.isPageRunning)
            .switchMap(catName => {
                return this.primaryDataObservable.map(list => list.filter(element => element.toUpperCase().trim() === (catName || '').toUpperCase().trim())[0]).takeWhile(() => this.isPageRunning)
            })
            .subscribe(similarCategory => {
                this.alreadyInDb = similarCategory !== undefined && similarCategory !== ''
            })
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    save(formValue, isValid) {
        this.showValidation = true
        if (!isValid) return

        var modalRef = this.confirmationService.openMessageBox('UI.FORM.SAVING MSG')
        var retObj = {}
        this.structure.filter(s => s.isStandard()).forEach(s => {
            var value = formValue[s.name]
            if (s.type === FormItemType.InputNumber) value = +value
            if (s.type === FormItemType.InputText) value = (value || '').trim()
            if (s.type === FormItemType.InputCheckbox) value = value !== '' && value !== null
            retObj[s.name] = value
        })
        this.structure.filter(s => !s.isStandard()).forEach(s => {
            retObj[s.name] = s.value
        })
        retObj['setError'] = (msg) => { this.errorMessage = msg }
        retObj['setSuccess'] = (msg) => {
            this.mapValues.clear()
            this.structure.filter(s => s.isStandard()).forEach(s => this.mapValues.set(s.name, formValue[s.name]))
            this.structure.filter(s => !s.isStandard()).forEach(s => this.mapValues.set(s.name, s.value))
            this.reset();
            modalRef.componentInstance.explicationKey = 'UI.FORM.SAVING MSG DONE'
            setTimeout(() => { modalRef.close() }, 650)

        }
        this.formSaved.next(retObj)
    }

    reset() {
        this.showValidation = false
        this.selectorViewChildren.toArray().forEach(s => s.emptyContent())
        this.datesViewChildren.toArray().forEach(s => s.emptyContent())
        this.structure.filter(s => !s.isStandard()).forEach(s => s.value= undefined)        
        this.newForm.reset();
        this.initCheck()
    }

    canReuse() {
        return this.mapValues.size > 0
    }

    reuse() {
        this.structure.filter(s => s.isStandard()).forEach(s => {
            var control = this.newForm.controls[s.name]
            if (control && this.mapValues.has(s.name)) {
                control.setValue(this.mapValues.get(s.name))
            }
        })
        this.structure.filter(s => !s.isStandard()).forEach(s => {
            if (this.mapValues.has(s.name)) {
                s.value= this.mapValues.get(s.name)
            }
        })
    }

    isInvalid(controlName): boolean {
        var control = this.newForm.controls[controlName]
        if (!control) return true
        return !control.valid
    }

    fieldChanged(controlName, value) {
        var control = this.structure.filter(s => s.name === controlName)[0]
        if (control) control.value = value
        this.gigaControlChanged.next({
            name: controlName,
            value: value,
            fnChangeControl: (_controlName, _value) => {
                var obj: any = {}
                obj[_controlName] = _value
                this.newForm.patchValue(obj)
            }
        })
    }

    onPaste(item, e: any) {
        const emailRegex = /[0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3}/i;
        if (item.isEmail) { // clean e-mail address, as people tend to copy paste e-mail addresses
            let content: string = e.clipboardData.getData('text/plain')
            var test = content.match(emailRegex)
            if (test) {
                if (test[0] !== content) {
                    e.preventDefault()
                    e.target.value = test[0]
                    var obj: any = {}
                    obj[item.name] = test[0]
                    this.newForm.patchValue(obj)
                }
            }
        }
    }

    getCountries() {
        return countries
    }

}