import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment"
import { TranslateService, LangChangeEvent } from '@ngx-translate/core'

@Pipe({name: 'fullDate'})
export class FullDatePipe implements PipeTransform {
  constructor(private translateService: TranslateService )  {

  }


  transform(date, param) {
    moment.locale(this.translateService.currentLang);
    
    if (!moment(date, 'DD/MM/YYYY HH:mm:ss').isValid()) return date
    return moment(date, 'DD/MM/YYYY HH:mm:ss').format('LLLL');    
  }
}