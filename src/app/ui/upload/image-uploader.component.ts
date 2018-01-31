import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { UploadMetadata, FileHolder, ImageUploadComponent } from "angular2-image-upload";

@Component({
    selector: 'gg-image-uploader',
    templateUrl: 'image-uploader.component.html'
})
export class ImageUploaderComponent {

    @Input() maxNbOfFiles = 5
    @Input() uploadUrl: string 
    @Input() buttonCaptionKey = 'UI.UPLOAD.SELECT IMAGES'
    @Input() dropBoxMessageKey = 'UI.UPLOAD.DROP YOUR IMAGES HERE'
    @Input() clearButtonCaptionKey = 'UI.UPLOAD.CLEAR'
    @Input() extensions = [] // default value will make it possible to drop all file types and open the file explorer for all file types
    @Output() imagesChanged = new EventEmitter()

    @ViewChild(ImageUploadComponent) imageUploadComponent: ImageUploadComponent;

    constructor() { }

    public createOurFileObj(file) {
        return {
            name: file.name,
            size: file.size,
            lastModified: file.lastModified
        }
    }

    public fileDocuments: any[] = []

    private hasBeenCleared: boolean= false

    public getServerFileName(res) {
        var x = JSON.parse(res.serverResponse._body)
        var filename = x ? x.filename : 'unknown'
        return filename
    }

    public clearPictures() {
        this.hasBeenCleared= true
        this.fileDocuments= []
        this.imageUploadComponent.deleteAll()
    }
    
    public onUploadFinished(res) {
        this.hasBeenCleared= false
        var filename = this.getServerFileName(res)

        var newRecord= {
            file: this.createOurFileObj(res.file),
            filename: filename
        }

        this.fileDocuments.push(newRecord)
        this.imagesChanged.next(this.fileDocuments)
    }

    public onBeforeUpload = (metadata: UploadMetadata) => {
        if (!metadata || !metadata.file) {
            metadata.abort = true
            return metadata
        }
        var ab = this.createOurFileObj(metadata.file)
        var x = JSON.stringify(ab)
        if (this.fileDocuments.map(f => JSON.stringify(f.file)).includes(x)) {
            metadata.abort = true
        }

        return metadata;
    };

    public onRemoved(res: FileHolder) {
        if (this.hasBeenCleared) return // if the client of this component has asked for a reset of the uploads, he is not interested in getting these events and fileDocuments has already been reset to empty
        var filename = this.getServerFileName(res)
        var theFile = this.fileDocuments.filter(fn => fn.filename === filename)[0]
        if (theFile) {
            var index = this.fileDocuments.indexOf(theFile)
            if (index > -1) {
                this.fileDocuments.splice(index, 1)
            }
            this.imagesChanged.next(this.fileDocuments)        
        }
    }


}