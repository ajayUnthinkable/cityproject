import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStopsComponent } from './edit-stops.component';

describe('EditStopsComponent', () => {
  let component: EditStopsComponent;
  let fixture: ComponentFixture<EditStopsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStopsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
