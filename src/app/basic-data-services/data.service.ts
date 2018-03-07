import { Injectable } from '@angular/core'
import { ReplaySubject } from "rxjs/Rx";
import { Observable, Subscription } from 'rxjs/Rx'

import { ApiService } from './api.service';

@Injectable()

export class DataStore { // contains one observable property by database table/collection

    public KRINO: string = 'KRINO'
    public EURISKO: string = 'EURISKO'
    public SCREENS: string = 'SCREENS'
    public EQUIPMENTS: string = 'EQUIPMENTS'

    private applicationId: string = undefined

    // Todo (ak 25/02/2018) if that mess with initializing laboName to string 'undefined' (instead of undefined) is really necessary. Now I won't take the risk to change it (maybe due to records with laboName='undefined' in the DB)

    constructor(private apiService: ApiService) {
        console.log('datastore constructor')
        this.initCollectionsInfo()

        this.laboName = 'undefined'
        var laboFromLS = localStorage.getItem(this.LSLaboKey)
        if (laboFromLS) {
            this.laboName = laboFromLS
        }
        this.emitLaboName()
    }

    private extraTestFunction = (table) => true

    public setApplication(appId: string) {
        this.applicationId = appId

        if (appId === this.KRINO) {
            this.extraTestFunction = (table) => {
                return this.isLaboNameSet() || ['labos.list'].includes(table)
            }
            if (this.isLaboNameSet()) {
                this.RetriggerAll()
            }
        }
    }

    private collectionsConfigMap: Map<string, any> = new Map<string, any>()

    private initCollectionsInfo() {
        var addCol = (name: string, isLaboNeutral: boolean = true, applicationList: string[] = []) => {
            this.collectionsConfigMap.set(name, new CollectionInfo(name, isLaboNeutral, applicationList))
        }

        var addKrinoSpecific = (name) => addCol(name, false, [this.KRINO]);

        var addKrinoNonSpecific = (name) => addCol(name, true, [this.KRINO]);
        var addEuriskoNonSpecific = (name) => addCol(name, true, [this.EURISKO]);
        var addEquipmentNonSpecific = (name) => addCol(name, true, [this.EQUIPMENTS]);
        var addScreensNonSpecific = (name) => addCol(name, true, [this.SCREENS]);

        ['products', 'suppliers', 'categories', 'labos.list', 'otp.product.classifications', 'sap.engage', 'sap.fusion', 'sap.supplier', 'sap.engage.map',
            'users.public', 'products.market', 'platform.enterprises', 'platform.clients', 'currencies',
            'users.giga', 'users.giga.functions', 'users.giga.functions.new', 'users.giga.thematic.units', 'users.giga.teams', 'users.giga.labos'].forEach(addKrinoNonSpecific);

        ['basket', 'dashlets', 'equipes', 'equipes.gifts', 'equipes.groups', 'labos', 'messages', 'orders', 'orders.eproc', 'orders.fridge', 'orders.reception', 'orders.log',
            'orders.stock', 'orders.vouchers', 'otps', 'products.stock', 'products.stockage', 'users.krino', 'sap.krino.annotations', 'admin.monitor'].forEach(addKrinoSpecific);

        ['users.eurisko', 'job.request', 'job.response', 'job.publicationChannels', 'dashlets.eurisko'].forEach(addEuriskoNonSpecific);

        ['equipments'].forEach(addEquipmentNonSpecific);

        ['screens.images', 'screens.screens', 'screens.sequences'].forEach(addScreensNonSpecific);

    }

    private isLaboNeutral(table): boolean {
        return this.collectionsConfigMap.has(table) && this.collectionsConfigMap.get(table).isLaboNeutral
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

    public setLaboName(labo: string, fnWhenDone= () => {}) {
        this.laboName = labo ? labo : 'undefined'
        localStorage.setItem(this.LSLaboKey, labo)
        this.RetriggerAll(() => {
            this.emitLaboName()
            fnWhenDone()
        })
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

    private isFromRightLabo(table: string, rec): boolean {

        let laboNameInRecord = rec[this.laboFieldName]

        if (this.isLaboNeutral(table) && !rec.isLabo) return true

        return laboNameInRecord === this.laboName
    }

    setLaboNameOnRecord(record) {
        record[this.laboFieldName] = this.laboName
    }

    private isLaboNameSet() {
        return this.laboName && this.laboName !== 'undefined'
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

    private collectionsUsedMap: Map<string, any> = new Map<string, any>()

    private getCollectionSubject = (table): ReplaySubject<any[]> => {
        if (!this.collectionsUsedMap.has(table)) {
            this.collectionsUsedMap.set(table, new ReplaySubject<any[]>(1))
        }
        return this.collectionsUsedMap.get(table)
    }

    public RetriggerAll(fnWhenDone= () => {}) {
        console.log('entering retrigger all')
        var triggerForApplication = (appId, entryTable) => {
            if (this.isLaboNameSet()) {
                var collections = Array.from(this.collectionsConfigMap.values()).filter((c: CollectionInfo) => c.applicationList.includes(appId)).map((c: CollectionInfo) => c.name)
                if (collections.length > 0) {
                    collections.forEach(collection => this.getCollectionSubject(collection)) // prepare the subject...  so that get Requests (before we get an answer of this) is not querying the server
                    var record = {
                        collections: collections
                    }
                    this.apiService.callWebService('getCollections', record).subscribe((results: any[]) => {
                        results.forEach(result => {                               
                            var table = result.name
                            var res2 = result.data.filter(record => this.isFromRightLabo(table, record))
                            this.getCollectionSubject(table).next(res2)
                        })
                        fnWhenDone()
                    },
                        err => console.log("Error retrieving ", collections.reduce((a, b) => a + ', ' + b)),
                        () => console.log("completed retrigger all", collections.reduce((a, b) => a + ', ' + b)))
                }
            }
            else {
                this.collectionsUsedMap.forEach((value, key) => {
                    if (key !== entryTable) {
                        value.next([])
                    }
                    fnWhenDone()
                })
                console.log("completed retrigger all empty")
            }
        }

        if (this.applicationId === this.KRINO) {
            triggerForApplication(this.KRINO, 'labos.list')
        }
        else {
            this.collectionsUsedMap.forEach((value, key) => {
                this.triggerNext(key)
            })
        }
    }

    private triggerNext(table: string) {
        var subject= this.getCollectionSubject(table)

        if (this.extraTestFunction(table) && (this.isLaboNameSet() || this.isLaboNeutral(table))) {
            this.apiService.crudGetRecords(table).subscribe(
                res => {
                    var res2 = res.filter(record => this.isFromRightLabo(table, record))
                    subject.next(res2)
                },
                err => console.log("Error retrieving Todos"),
                () => console.log("completed " + table)
            )
        }
        else {
            subject.next([])
        }
    }

    triggerDataNext(table: string) {
        this.triggerNext(table);
    }



    // Data observables
    // ================

    getDataObservable(table: string): Observable<any[]> {
        var getObservable = (table: string): Observable<any[]> => {
            if (!this.collectionsUsedMap.has(table)) {
                console.log('I want', table)
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

class CollectionInfo {
    public name: string
    public isLaboNeutral: boolean
    public applicationList: string[] = []

    constructor(name: string, isLaboNeutral: boolean = true, applicationList: string[] = []) {
        this.name = name
        this.isLaboNeutral = isLaboNeutral
        this.applicationList = applicationList
    }
}