import { Injectable } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Observable} from 'rxjs/Rx'


export interface ILocale {
  lang: string;
  data: Object;
}

@Injectable()
export class TranslationLoaderService {

  constructor(
    private translate: TranslateService
  ) { }

  public loadTranslations(...args: ILocale[]): void {
    const locales = [...args];
    locales.forEach((locale) => {
      this.translate.setTranslation(locale.lang, locale.data, true);
    });
  }

  getTranslationWord(key: string): Observable<string> {
    return Observable.combineLatest(this.translate.get(key), this.translate.onLangChange.startWith(undefined), (translation, event: LangChangeEvent) => {
      if (!event) return translation || key
      var keyArr = key.split('.')
      var value = keyArr.reduce((acc, key) => {
        return acc ? acc[key] : undefined
      }, event.translations)
      return value || key
    })
  }


}

