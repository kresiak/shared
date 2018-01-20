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

}