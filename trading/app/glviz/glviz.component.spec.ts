import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlvizComponent } from './glviz.component';

describe('GlvizComponent', () => {
  let component: GlvizComponent;
  let fixture: ComponentFixture<GlvizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlvizComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlvizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
