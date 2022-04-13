import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStopTimetableComponent } from './add-stop-timetable.component';

describe('AddStopTimetableComponent', () => {
  let component: AddStopTimetableComponent;
  let fixture: ComponentFixture<AddStopTimetableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStopTimetableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStopTimetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
