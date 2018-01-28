import { Component, OnInit, Input } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router'
import {TranslateService} from '@ngx-translate/core'


@Component(
    {
        selector: 'gg-main-header',
        templateUrl: './main.header.component.html'
    }
)
export class MainHeaderComponent implements OnInit {

    constructor() {
    }

    public isPageRunning: boolean = true
    
    @Input() title: string= 'No title software'
    @Input() translateKeyRoot: string= 'GENERAL'

    ngOnInit(): void {
        
    }

    ngOnDestroy(): void {
        this.isPageRunning= false
    }

}