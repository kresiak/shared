
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ImageUploadModule } from "angular2-image-upload"

import { Editor } from './editor/editor'
import { EditorAutocomplete } from './editor/editor-autocomplete'
import { EditorAutocompleteText } from './editor/editor-autocomplete-text'
import { EditorAutocompleteCountry } from './editor/editor-autocomplete-country'
import { EditorNumber } from './editor/editor-number'
import { EditorDate } from './editor/editor-date'
import { EditorBoolean } from './editor/editor-boolean'
import { Checkbox } from './checkbox/checkbox'
import { CheckboxDelete } from './confirmation/checkbox-delete.component'
import { ButtonActionConfirm } from './confirmation/button-action.component'

import { SimpleTinyComponent } from './editor/editor-wysiwyg'
import { EditorTinyMce } from './editor/editor-tnymce'

import { SelectorComponent } from './selector/selector.component'
import { SelectorDateTimeComponent } from './selector/selector-date-time.component'

import { HelpPointerComponent } from './help/help-pointer.component'
import { DatePointerComponent } from './help/date-pointer.component'
import { TextCompactComponent } from './help/text-compact.component'
import { LinesTooltipComponent } from './help/lines-tooltip.component'

import { CompactDatePipe } from './pipes/compactdate.pipe'
import { FullDatePipe } from './pipes/fulldate.pipe'
import { ShortDatePipe } from './pipes/shortdate.pipe'
import { FromNowPipe } from './pipes/fromnow.pipe'
import { GigaCurrencyPipe } from './pipes/ggcurrency.pipe'

import { FocusDirective } from './directives/focus.directive'

import {MainHeaderComponent} from './application/main.header.component'
import {MenuComponent} from './application/menu.component'

import { ModalConfirmComponent } from './modal/modal-confirm.component'
import { ModalMessageComponent } from './modal/modal-message.component'

import { ImageUploaderComponent } from './upload/image-uploader.component'
import { ImageUploaderViewerComponent } from './upload/image-uploader-viewer.component'

import { SigninEnterComponent } from './login/signin-enter.component'

import { ConfirmationService} from './confirmation/confirmation.service'

import { FormGenericComponent } from './forms/form-generic.component'

import { locale as english } from './locale/en'
import { locale as french } from './locale/fr'

@NgModule({
  imports: [
    ImageUploadModule.forRoot(), RouterModule,
    Ng2AutoCompleteModule, NgbModule, CommonModule, TranslateModule.forChild(),
    FormsModule, ReactiveFormsModule
  ],
  declarations: [
    MainHeaderComponent, MenuComponent,
    Editor, EditorNumber, EditorDate, EditorBoolean, Checkbox, CheckboxDelete, ButtonActionConfirm, SelectorComponent, EditorAutocomplete, EditorAutocompleteText,
    EditorAutocompleteCountry,
    SimpleTinyComponent, EditorTinyMce,
    HelpPointerComponent, DatePointerComponent, TextCompactComponent, 
    FullDatePipe, ShortDatePipe, FromNowPipe, CompactDatePipe, ModalConfirmComponent, ModalMessageComponent, ImageUploaderComponent, ImageUploaderViewerComponent, GigaCurrencyPipe,
    FocusDirective, SigninEnterComponent, LinesTooltipComponent,
    SelectorDateTimeComponent,
    FormGenericComponent
  ],
  exports: [
    MainHeaderComponent, MenuComponent,
    Editor, EditorNumber, EditorDate, EditorBoolean, Checkbox, CheckboxDelete, ButtonActionConfirm, SelectorComponent, EditorAutocomplete, EditorAutocompleteText,
    EditorAutocompleteCountry,
    HelpPointerComponent, DatePointerComponent, TextCompactComponent, 
    SimpleTinyComponent, EditorTinyMce,
    FullDatePipe, ShortDatePipe, FromNowPipe, CompactDatePipe, GigaCurrencyPipe,
    ModalConfirmComponent, ModalMessageComponent, ImageUploaderComponent, ImageUploaderViewerComponent,
    FocusDirective, SigninEnterComponent, LinesTooltipComponent,
    SelectorDateTimeComponent,
    FormGenericComponent
  ],
  providers: [],
  entryComponents: [
    ModalConfirmComponent, ModalMessageComponent
  ],
  bootstrap: []
})
export class UiModule {
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
      ngModule: UiModule,
      providers: [ ConfirmationService  ]
    }
  }
  
}

export interface ILocale {
  lang: string;
  data: Object;
}

export {Editor} from './editor/editor'
export * from './confirmation/confirmation.service'
export * from './forms/form-data.class'
