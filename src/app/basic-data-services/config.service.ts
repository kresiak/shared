import { Injectable, Inject } from '@angular/core'
import { TranslateService, LangChangeEvent } from '@ngx-translate/core'
import { Observable} from 'rxjs/Rx'

@Injectable()
export class ConfigService {

    constructor(private translate: TranslateService) {

    }

    private _isProduction: boolean= false

    isProduction(): boolean {
        return this._isProduction
    }

    setProduction(flag: boolean) {
        console.log('set production to ' + flag)
        this._isProduction= flag
    }

    isVM2(): boolean {
        return true
    }


    private listSaveMap= new Map<string, any>()

    private getMapElement(listType: string): any {
        if (!this.listSaveMap.has(listType)) this.listSaveMap.set(listType, {searchTxt:'', nbHits: -1})
        return this.listSaveMap.get(listType)
    }

    listSaveSearchText(listType: string, searchTxt: string) {
        var elem= this.getMapElement(listType)
        elem.searchTxt= searchTxt
        this.listSaveMap.set(listType, elem)
    }

    listGetSearchText(listType: string) {
        return this.getMapElement(listType).searchTxt
    }

    listSaveNbHits(listType: string, nbHits: number) {
        var elem= this.getMapElement(listType)
        elem.nbHits= nbHits
        this.listSaveMap.set(listType, elem)
    }

    listGetNbHits(listType: string, defaultNb:number) {
        var n= this.getMapElement(listType).nbHits
        return n != -1 ? n : defaultNb
    }

}