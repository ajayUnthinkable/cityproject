import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFareComponent } from './view-fare.component';

describe('ViewFareComponent', () => {
  let component: ViewFareComponent;
  let fixture: ComponentFixture<ViewFareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
