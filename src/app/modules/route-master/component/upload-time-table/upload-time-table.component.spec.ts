import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadTimeTableComponent } from './upload-time-table.component';

describe('UploadTimeTableComponent', () => {
  let component: UploadTimeTableComponent;
  let fixture: ComponentFixture<UploadTimeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadTimeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadTimeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
