import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject} from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { BackendService } from '@backend-service';

import { InstallProcessComponent } from './../install-process/install-process.component';

@Component({
  selector: 'app-install-wizard',
  templateUrl: './install-wizard.component.html',
  styleUrls: ['./install-wizard.component.scss']
})
export class InstallWizardComponent implements OnInit, OnDestroy {

  selectPackageGroup: FormGroup;

  reviewDetailsGroup: FormGroup;

  installPackageGroup: FormGroup;

  compatible = true;

  nameToLaunch: string;

  private _unSubscribe: Subject<any> = new Subject();

  public propertiesReady = true;
  public invalidFile = false;
  public brokenPackage = false;
  public installInfo: any;
  private curFile: string; // current plugin properties file stored in the backend setting

  private versionStream: Subject<string> = new Subject();
  public EULA: string;

  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.selectPackageGroup = this.formBuilder.group({
      packageName: new FormControl('', [], this.validateData.bind(this)),
    });
    this.reviewDetailsGroup = this.formBuilder.group({});
    this.installPackageGroup = this.formBuilder.group({
      launch: new FormControl(true)
    });

    this.backendService.get('InstallationPackage')
      .pipe(filter(info => info.value !== ''), takeUntil(this._unSubscribe))
      .subscribe(info => {
        if (info.value === '{}') {
          this.setState('broken');
        } else {
          this.installInfo = JSON.parse(info.value);
          this.versionStream.next(this.installInfo.minimumVersion);
          this.compatible = this.backendService.isCompatible(this.installInfo.minimumVersion);
          this.setState('good');
        }
    });
  }

  onFinished() {
    const INSTALL_DIALOG_CONFIG: MatDialogConfig = {
      panelClass: 'install-dialog',
      id: 'install-id',
      width: '420px',
      height: '400px',
      data: {
        orientVertical: true,
        installInfo: this.installInfo
      },
      autoFocus: false,
      hasBackdrop: true,
      disableClose: true,
    };
    this.dialog.open(InstallProcessComponent, INSTALL_DIALOG_CONFIG);
  }

  onCancel() {
    // reset setting value;
    this.backendService.set('SelectedToInstall');
    this.backendService.set('PlatformVersion');
  }

  onClick() {
    document.getElementById('fileInput').click();
  }

  onChange() {
    const file = (<HTMLInputElement>document.getElementById('fileInput')).files[0];
    let value: string;
    if (file) {
      this.setState('selected');
      value = file.path;
      if (value === this.curFile) {
        // if a previous file selected again, skip the unzip process and set the state to good
          (<HTMLInputElement>document.getElementById('pathToFile')).value = this.curFile;
          this.versionStream.next(this.installInfo.minimumVersion);
          this.setState('good');
          return;
      }
      this.curFile = value;
      if (this.findExtName(value) !== '.tgz' && this.findExtName(value) !== '.zip') {
        this.setState('invalid');
      } else {
        this.backendService.set('FileSelectedToInstall');
        this.backendService.set('ReadPackageInfo');
      }
      (<HTMLInputElement>document.getElementById('pathToFile')).value = value;
    } else {
      // if no file selected, clear the selection
      (<HTMLInputElement>document.getElementById('pathToFile')).value = '';
      this.setState('notSelected');
    }
  }

  findExtName(path: string) {
    if (!path || path === '') {
      return '';
    }
    const extIndex = path.lastIndexOf('.');
    return path.substr(extIndex, path.length);
  }

  setState(state: string) {
    switch (state) {
      case 'invalid':
        this.invalidFile = true;
        this.brokenPackage = false;
        this.propertiesReady = true;
        this.versionStream.next('');
        break;
      case 'broken':
        this.invalidFile = false;
        this.brokenPackage = true;
        this.propertiesReady = true;
        this.versionStream.next('');
        break;
      case 'selected':
        this.invalidFile = false;
        this.brokenPackage = false;
        this.propertiesReady = false;
        break;
      default:
        this.invalidFile = false;
        this.brokenPackage = false;
        this.propertiesReady = true;
        break;
    }
  }

  ngOnDestroy() {
    this.onCancel();
    this._unSubscribe.next();
    this._unSubscribe.complete();
  }
}
