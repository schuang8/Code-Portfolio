import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings-group-tile',
  templateUrl: './settings-group-tile.component.html',
  styleUrls: ['./settings-group-tile.component.scss']
})
export class SettingsGroupTileComponent {

  @Input() settingGroup?: any;

  constructor() {
  }
}
