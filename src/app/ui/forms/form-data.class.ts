export class FormItemStructure
{
    name: string
    labelKey: string
    type: FormItemType
    value: string= undefined
    tooltipKey: string = ''
    placeholderKey: string = ''
    isRequired: boolean = false
    minimalLength:  number = 0
    isEmail: boolean = false
    isTelephone: boolean = false
    options: any = {}

    constructor(name: string, labelKey: string, type: FormItemType, options: any= {})
    {
        this.name= name
        this.labelKey= labelKey
        this.type= type
        this.options= options
        if (options.isRequired) this.isRequired=true
        if (options.minimalLength) this.minimalLength=options.minimalLength
        if (options.isEmail) this.isEmail=true
        if (options.isTelephone) this.isTelephone=true
        if (options.value) this.value=options.value
        if (options.placeholderKey) this.placeholderKey= options.placeholderKey
        else this.placeholderKey=this.labelKey
        if (options.tooltipKey) this.tooltipKey= options.tooltipKey
        // other valid option (only for input number): minNumber
        // other valid option (only for selector): selectableData
    }

    public isStandard() : boolean {
        return this.type <= 20
    }
}

export enum FormItemType {
    InputText = 0,
    InputCheckbox = 1,
    InputNumber = 2,
    GigaSelector = 21,
    GigaDate = 22,
    GigaCountry = 23
}