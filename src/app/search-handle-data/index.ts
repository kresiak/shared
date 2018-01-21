import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SearchBoxService} from './search/search-box.service'

import { SearchBoxComponent } from './search/search-box.component'

import { locale as english } from './locale/en'
import { locale as french } from './locale/fr'

@NgModule({
  imports: [
    CommonModule, TranslateModule.forChild(), FormsModule, ReactiveFormsModule, NgbModule
  ],
  declarations: [
    SearchBoxComponent
  ],
  exports: [
    SearchBoxComponent
  ]
})
export class SearchHandleDataModule { 
  constructor(private translateService: TranslateService) {

    var loadTranslations= (...args: ILocale[]): void => {
      const locales = [...args];
      locales.forEach((locale) => {
        this.translateService.setTranslation(locale.lang, locale.data, true);
      });
    }
    
    loadTranslations(english, french)
  }

  static forRoot() {
    return {
      ngModule: SearchHandleDataModule,
      providers: [ SearchBoxService  ]
    }
  }  
}

export interface ILocale {
  lang: string;
  data: Object;
}

import * as utilsComparators  from "./utils/comparators" 
export {utilsComparators}