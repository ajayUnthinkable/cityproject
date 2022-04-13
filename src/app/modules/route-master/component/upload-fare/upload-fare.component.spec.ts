import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFareComponent } from './upload-fare.component';

describe('UploadFareComponent', () => {
  let component: UploadFareComponent;
  let fixture: ComponentFixture<UploadFareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadFareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
