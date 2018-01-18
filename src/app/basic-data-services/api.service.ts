import { Injectable, Inject } from '@angular/core'
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable'
import { ConfigService } from './config.service'


@Injectable()
export class ApiService {

    // @Inject decorator is not needed: see https://toddmotto.com/angular-dependency-injection    
    constructor(private _http: HttpClient, private configService: ConfigService) {
    }

    private getUrlBaseForData() {
        return this.configService.isProduction() ? 'http://139.165.57.34:80/data' : 'http://localhost:1337/data'
    }

    private getUrlBaseForService()  {
        return this.configService.isProduction() ? 'http://139.165.57.34:80/service' : 'http://localhost:1337/service'
    }

    public getPictureUrlBase() {
        return this.configService.isProduction() ? 'http://139.165.57.34:80/pictures' : 'http://localhost:1337/pictures'
    }

    public getUrlBaseForUpload()  {
        return this.configService.isProduction() ? "http://139.165.57.34:80/upload" : "http://localhost:1337/upload"
    }

    callWebService(service, record): Observable<any> {
        return this._http.post(`${this.getUrlBaseForService()}/${service}`, record).share()
            .catch(this.logError);
    }

    crudGetRecords(table: string) {
        return this._http.get(`${this.getUrlBaseForData()}/${table}`)
            //.share()
            .catch(this.logError);
    }

    crudGetRecord(table: string, id: string) {
        return this._http.get(`${this.getUrlBaseForData()}/${table}/${id}`)
            .share()
            .catch(this.logError);
    }

    crudUpdateRecord(table: string, id: string, record: any) {
        return this._http.put(`${this.getUrlBaseForData()}/${table}/${id}`, record).share()
            .catch(this.logError);
    }

    crudCreateRecord(table: string, record) {
        return this._http.post(`${this.getUrlBaseForData()}/${table}`, record)
            .share()
            .catch(this.logError);
    }

    crudDeleteRecord(table: string, id: string) {
        return this._http.delete(`${this.getUrlBaseForData()}/${table}/${id}`).share()
            .catch(this.logError);
    }

    // Error handling 
    private logError(error: Error) {
        return Observable.throw(error || 'There was an error with the request');
    }
}
