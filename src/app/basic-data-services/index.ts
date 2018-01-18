import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from './api.service';
import { DataStore } from './data.service';
import { ConfigService } from './config.service'
import { WebSocketService } from './websocket.service'

@NgModule({
    providers: [ ]
})
export class BasicDataServicesModule {
  static forRoot() {
    return {
      ngModule: BasicDataServicesModule,
      providers: [ WebSocketService, ConfigService, ApiService, DataStore  ]
    }
  }
}

export * from "./api.service";
export * from "./config.service";
export * from "./data.service"
export * from "./websocket.service"
