import { Injectable } from '@angular/core'
import { ReplaySubject } from "rxjs/Rx";
import { Observable, Subscription } from 'rxjs/Rx'

import { ApiService } from './api.service';


@Injectable()

export class DataStore { // contains one observable property by database table/collection

    public KRINO: string= 'KRINO'
    public EURISKO: string= 'EURISKO'
    public SCREENS: string= 'SCREENS'

    private applicationId: string= undefined

    constructor(private apiService: ApiService) {
        console.log('datastore constructor')

        this.laboName = 'undefined'
        var laboFromLS = localStorage.getItem(this.LSLaboKey)
        if (laboFromLS) {
            this.laboName = laboFromLS
        }
        this.emitLaboName()
    }

    public setApplication(appId: string){
        this.applicationId= appId
    }

    // Labo name stuff
    // ================

    private laboNameSubject: ReplaySubject<string> = new ReplaySubject(1)
    private laboName: string = 'undefined' 

    private LSLaboKey: string = 'krinoLabo'  // this is for local storage
    private laboFieldName: string = 'laboName'  // labo field name in database

    public getLaboNameObservable(): Observable<any> {
        return this.laboNameSubject
    }

    public getLaboName(): string {
        return this.laboName
    }

    public setLaboName(labo: string) {
        this.laboName = labo ? labo : 'undefined'
        localStorage.setItem(this.LSLaboKey, labo)
        this.RetriggerAll()
        this.emitLaboName()
    }
    
    private emitLaboName() {
        this.laboNameSubject.next(this.laboName === 'undefined' ? '' : this.laboName)
    }
    
    public getLaboObservable(): Observable<any> {
        return this.getLaboNameObservable().switchMap(laboName => {
            return this.getDataObservable('labos.list').map(labos => labos.filter(labo => labo.shortcut === laboName)[0])
        })
    }

    public getLaboResponsablesObservable(): Observable<any> {
        return this.getLaboObservable().map(theLabo => theLabo ? (theLabo.responsables || []) : [])
    }

    private universalTables: string[] = ['products', 'suppliers', 'categories', 'labos.list', 'otp.product.classifications', 'sap.engage', 'sap.fusion', 'sap.supplier', 'sap.engage.map', 'users.public',
        'products.market', 'platform.enterprises', 'platform.clients', 'currencies', 'users.giga', 'users.giga.functions', 'users.giga.functions.new', 'users.giga.thematic.units', 'users.giga.teams', 'users.giga.labos',
        'users.eurisko', 'job.request', 'job.response', 'job.publicationChannels', 'dashlets.eurisko',
        'equipments'
    ]  

    private isFromRightLabo(table: string, rec): boolean {
        let laboNameInRecord = rec[this.laboFieldName]

        if ((this.universalTables.includes(table) || table.includes('xenia') || table.startsWith('screens.')) && !rec.isLabo) return true

        if (this.laboName === 'michel') return !laboNameInRecord || laboNameInRecord === this.laboName
        return laboNameInRecord === this.laboName
    }

    setLaboNameOnRecord(record) {
        record[this.laboFieldName] = this.laboName
    }

    
    // Pictures stuff
    // ==============

    public getPictureUrl(filename: string) {
        if (!filename) return undefined
        return this.apiService.getPictureUrlBase() + '/' + filename
    }

    public getUploadUrl() {
        return this.apiService.getUrlBaseForUpload()
    }

    public getPictureUrlBase() {
        return this.apiService.getPictureUrlBase()
    }


    // Trigger database query
    // ======================

    private collectionsUsedMap: Map<string, any>= new Map<string, any>()

    public RetriggerAll() {
        this.collectionsUsedMap.forEach((value, key) => {
            this.triggerNext(key)
        })
    }

    private triggerNext(table: string) {
        if (!this.collectionsUsedMap.has(table)) {
            this.collectionsUsedMap.set(table, new ReplaySubject<any[]>(1))
        }

        this.apiService.crudGetRecords(table).subscribe(
            res => {
                var res2 = res.filter(record => this.isFromRightLabo(table, record))
                this.collectionsUsedMap.get(table).next(res2)
            },
            err => console.log("Error retrieving Todos"),
            () => console.log("completed " + table)
        );
    }

    triggerDataNext(table: string) {
        this.triggerNext(table);
    }

    // Data observables
    // ================
    
    getDataObservable(table: string): Observable<any[]> {
        var getObservable= (table: string): Observable<any[]> => {
            if (!this.collectionsUsedMap.has(table)) {
                //console.log('akak')
                this.triggerNext(table);
            }
            return this.collectionsUsedMap.get(table)
        }
            
        return getObservable(table);
    }

    addData(table: string, newRecord: any): Observable<any> {
        newRecord[this.laboFieldName] = this.laboName
        let obs = this.apiService.crudCreateRecord(table, newRecord);
        obs.subscribe(res => {
            //this.triggerNext(table)
        });
        return obs;
    };

    addDataWithoutLabo(table: string, newRecord: any): Observable<any> {
        let obs = this.apiService.crudCreateRecord(table, newRecord);
        obs.subscribe(res => {
            //this.triggerNext(table)
        });
        return obs;
    };

    deleteData(table: string, id: string): Observable<any> {
        let obs = this.apiService.crudDeleteRecord(table, id);
        obs.subscribe(res => {
            //this.triggerNext(table)
        });
        return obs;
    }

    updateData(table: string, id: string, newRecord: any): Observable<any> {
        newRecord[this.laboFieldName] = this.laboName   // to be sure
        let obs = this.apiService.crudUpdateRecord(table, id, newRecord);
        obs.subscribe(res => {
            //this.triggerNext(table)
        });
        return obs;
    }

    // database utility
    // ================

    // For example: equipe records contain the list of user Ids... If you want to update the list of users for an equipe, it is easy. But if you want to update the list of equipes for a user? This can be used...

    reverseFKUpdate(tableName: string, fieldName: string, selectedIds: string[], foreignObjectId: string) {
        this.getDataObservable(tableName).map(records => records.filter(e => e[fieldName].includes(foreignObjectId)).map(e => e._id)).first().subscribe(beforeIds => {
            var toAddIds = selectedIds.filter(id => !beforeIds.includes(id))
            var toDeleteIds = beforeIds.filter(id => !selectedIds.includes(id))

            toAddIds.forEach(objId => {
                this.getDataObservable(tableName).first().map(objects => objects.filter(obj => obj._id === objId)[0])
                    .do(obj => {
                        if (!obj[fieldName]) obj[fieldName] = []
                        if (!obj[fieldName].includes(foreignObjectId)) {
                            obj[fieldName].push(foreignObjectId)
                            this.updateData(tableName, obj._id, obj)
                        }
                    }).subscribe()
            })
            toDeleteIds.forEach(objId => {
                this.getDataObservable(tableName).first().map(objects => objects.filter(obj => obj._id === objId)[0])
                    .do(obj => {
                        if (!obj[fieldName]) obj[fieldName] = []
                        if (obj[fieldName].includes(foreignObjectId)) {
                            var pos = obj[fieldName].findIndex(id => id === foreignObjectId);
                            obj[fieldName].splice(pos, 1);
                            this.updateData(tableName, obj._id, obj)
                        }
                    }).subscribe()
            })
        })
    }


}