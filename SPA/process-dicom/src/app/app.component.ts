import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'process-dicom';
  @Input() requiredFileType: string = 'application/dicom';

  fileName = '';
  uploadProgress: number | null = 0;
  uploadSub: Subscription | null = Subscription.EMPTY;
  file: File | null = null;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    this.fileName = this.file?.name || "No file uploaded yet.";
  }

  cancelUpload() {
    this.uploadSub?.unsubscribe();
    this.reset();
  }

  openSnackBar(message: string, duration: number = 2000) {
    this._snackBar.open(message, '', { duration });
  }

  lines: any = [];
  linesR: any = [];

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }
  upload() {
    if (this.file && this.file.size > 0) {

      const formData = new FormData();
      formData.append("File", this.file);
      this._snackBar.open('uploading...');
      const upload$ = this.http.post("https://process-dicom.azurewebsites.net/api/HttpTrigger", formData, {
        reportProgress: true,
        observe: 'events',
        responseType: 'arraybuffer'
      })
        .pipe(
          finalize(() => {
            this.reset();
          })
        )

      this.uploadSub = upload$.subscribe((event: any) => {
        if (event.type == HttpEventType.Response) {
          let ref = this._snackBar.open("File processed", 'download');
          console.log(ref)
          ref.onAction().subscribe(() => {
            this.downLoadFile(event.body, 'application/csv');
            ref.dismiss();
          });
        }
      }, (err) => {
        this.openSnackBar('upload failed, please check your file', 3000);
        this.reset();
      });
    }
  }

  downLoadFile(data: any, type: string) {
    let binaryData = [];
    binaryData.push(data);
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type }));
    if (this.fileName) {
      downloadLink.setAttribute('download', this.fileName.split('.')[0] + '.csv');
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink?.parentNode?.removeChild(downloadLink);
    }
  }
}
