import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsGroupTileComponent } from './settings-group-tile.component';

describe('SettingsGroupTileComponent', () => {
  let component: SettingsGroupTileComponent;
  let fixture: ComponentFixture<SettingsGroupTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsGroupTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsGroupTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
