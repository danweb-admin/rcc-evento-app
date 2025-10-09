import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoLandingComponent } from './evento-landing.component';

describe('EventoLandingComponent', () => {
  let component: EventoLandingComponent;
  let fixture: ComponentFixture<EventoLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventoLandingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventoLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
