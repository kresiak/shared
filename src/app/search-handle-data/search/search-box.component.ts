import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
//import { TranslationLoaderService } from 'gg-translation'
import * as comparatorsUtils from '../utils/comparators'
import {SearchBoxService} from './search-box.service'

@Component(
    {
        selector: 'gg-search-box',
        templateUrl: './search-box.component.html'
    }
)
export class SearchBoxComponent implements OnInit {
    allObjects: any;
    public searchControl = new FormControl();
    public searchForm;
    public showSearch: boolean = false

    public objects

    public nbHitsShown: number = 50
    public nbHitsIncrement: number = 20
    public nbHits: number
    public nbHitsShownObservable: BehaviorSubject<number> = new BehaviorSubject<number>(this.nbHitsShown)

    public moneyTotal: number = 0
    public objectTypeText: string

    public isReverse: boolean = false
    public isReverseObservable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isReverse)

    constructor(private searchBoxService: SearchBoxService) {    //private translationLoaderService: TranslationLoaderService, 
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSearchControl() {
        this.searchControl.setValue('')
    }

    @Input() objectTypeTranslationKey: string
    @Input() reportTipTranslationKey: string= 'UI.GENERAL.EMPTY'
    @Input() objectsObservable: Observable<any>
    @Input() hasReport: boolean = false
    @Input() hasReverseSort: boolean = true
    @Input() fnFilterObjects
    @Input() fnCalculateTotal
    @Input() sortFunctionObservable: Observable<any>

    @Output() listChanged = new EventEmitter(true);  // the true parameter is important to make the this.searchChanged.next() call asynchr and thus to avaoid the error: `ExpressionChangedAfterItHasBeenCheckedError` (https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4)
    @Output() reportNeeded = new EventEmitter(true);

    public explainedComplexQuery: string = ''

    public createFilterFn(searchString: string) {
        if (!this.fnFilterObjects) return (object) => true
        var orList = comparatorsUtils.searchTextIntoOrList(searchString)

        var fn= txt => '<b>' + txt + '</b>'
        var fn2= txt => ' <b>' + txt + '</b> '

        this.explainedComplexQuery = comparatorsUtils.getExplainedOrList(orList, searchString.toUpperCase(), fn, fn2)

        return object => comparatorsUtils.testObjectWithOrList(object, orList, this.fnFilterObjects)
    }

    ngOnInit(): void {
        this.nbHitsShownObservable.next(this.nbHitsShown = this.searchBoxService.listGetNbHits(this.objectTypeTranslationKey, this.nbHitsShown))

        var initialSearch = this.searchBoxService.listGetSearchText(this.objectTypeTranslationKey)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }

        Observable.combineLatest(this.objectsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch).takeWhile(() => this.isPageRunning), (objects, searchTxt: string) => {
            this.searchBoxService.listSaveSearchText(this.objectTypeTranslationKey, searchTxt)
            var filterFn = this.createFilterFn(searchTxt)
            return objects.filter(filterFn)
        }).do(objects => {
            this.nbHits = objects.length
            this.moneyTotal = this.fnCalculateTotal ? this.fnCalculateTotal(objects) : 0
            this.allObjects = objects
        }).switchMap(objects => {
            if (!this.sortFunctionObservable) return Observable.from([objects])
            var objectsCopy = comparatorsUtils.clone(objects)
            return this.sortFunctionObservable.map(fn => {
                return fn ? objectsCopy.sort(fn) : objects
            })
        }).switchMap(objects => {
            var objectsCopy = comparatorsUtils.clone(objects)
            return this.isReverseObservable.map(isReverse => {
                return isReverse ? objectsCopy.reverse() : objects
            })
        }).switchMap(objects => {
            return this.nbHitsShownObservable.map(nbItems => {
                return objects.slice(0, nbItems)
            })
        }).takeWhile(() => this.isPageRunning).subscribe(o => {
            if (!comparatorsUtils.softCopy(this.objects, o))
                this.objects = comparatorsUtils.clone(o)
            this.listChanged.next(this.objects)
        })

/*         this.translationLoaderService.getTranslationWord(this.objectTypeTranslationKey).takeWhile(() => this.isPageRunning).subscribe(txt => {
            this.objectTypeText = txt
        })
 */    }

    isPageRunning: boolean = true

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    public moreHits() {
        this.nbHitsShown += this.nbHitsIncrement
        this.searchBoxService.listSaveNbHits(this.objectTypeTranslationKey, this.nbHitsShown)
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    public allHits() {
        this.nbHitsShown = this.nbHits
        this.searchBoxService.listSaveNbHits(this.objectTypeTranslationKey, this.nbHitsShown)
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    createReport() {
        this.reportNeeded.next(this.allObjects)
    }

    public reverseHits() {
        this.isReverse = !this.isReverse
        this.isReverseObservable.next(this.isReverse)
    }

}

