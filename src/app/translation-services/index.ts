import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslationLoaderService } from './translation.loader.service'


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class TranslationServicesModule {

  static forRoot() {
    return {
      ngModule: TranslationServicesModule,
      providers: [  TranslationLoaderService ]
    }
  }
}

export * from "./translation.loader.service";
