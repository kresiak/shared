
import { Component, Input, Output, ViewEncapsulation, EventEmitter, Inject, OnInit, SimpleChanges } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs/Rx'
import * as moment from "moment"


@Component({
    //moduleId: module.id,
    selector: 'gg-selector-date-time',
    host: {
        'class': 'editor'
    },
    templateUrl: './selector-date-time.component.html',
    encapsulation: ViewEncapsulation.None
})
export class SelectorDateTimeComponent implements OnInit {
    public editMode = false;

    @Input() readOnly: boolean= false;    
    @Input() content: string;
    @Input() format= 'DD/MM/YYYY HH:mm:ss'
    
    @Output() selectionChanged = new EventEmitter();

    constructor(private modalService: NgbModal) {
    }

    ngOnInit(): void {
        this.content2object()
    }

    ngOnChanges(changes: SimpleChanges) {
         if (changes.content) {
            this.content2object()
         }
    }

    emptyContent() {
    }

    openModal(template) {
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "lg" });
        var promise = ref.result;
        promise.then((res) => {
            this.save();
        }, (res) => {
            this.cancel();
        });
        promise.catch((err) => {
            this.cancel();
        });

        this.editMode = true;
    }


    public save() {
        this.object2content()
        this.selectionChanged.next(this.content);
        this.editMode = false;
    }

    public cancel() {
        this.editMode = false;
    }

    dateModel: any 
    timeModel: any

    content2object() {
        var x= this.content
        //if (!this.content || this.content.trim()==='') this.content= 'Choose a date'  
        this.dateModel= this.toDatePickerDateObject(x)
        this.timeModel= this.toTimePickerDateObject(x)
    }

    object2content() {
        this.content= this.fromDateTimePickerDateObject(this.dateModel, this.timeModel)
    }

    toDatePickerDateObject(date: string): Object {
        var md;
        if (!date || date.trim()===''){
            md= moment()
        } 
        else {
            md = moment(date, this.format)
        }

        var obj = { year: md.year(), month: md.month() + 1, day: md.date() };
        return obj;
    }

    toTimePickerDateObject(date: string): Object {
        var md;
        if (!date || date.trim()===''){
            md= moment()
        } 
        else {
            md = moment(date, this.format)
        }

        var obj = { hour: md.hour(), minute: md.minute()};
        return obj;
    }


    fromDateTimePickerDateObject(objDate: any, objTime: any): string {
        var md = moment() 
        md.year(objDate.year)       // Very important to put first year and month and then day, only at the end: otherwise strange effects happen when setting the 31st on any months when the current months has only 30 days 
                                // see https://github.com/moment/moment/issues/2725   Explication: First you create moment() that gives you current date (November 3rd as of today). You try to set its day to 31 but November has only 30 days, so JS native date object "intelligently" adds one day and moves date to 1st December (you can set day to any crazy number, like 42, and JS will do an arithmetic by adding a proper number of days and rewinding month and year if needed, not the best practice, it would have been better if it was throwing).

        md.month(objDate.month - 1)
        md.date(objDate.day)

        md.hour(objTime.hour)
        md.minute(objTime.minute)

        return md.format(this.format);       
    }
    
}
