import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaravanComponent } from './caravan.component';

describe('CaravanComponent', () => {
  let component: CaravanComponent;
  let fixture: ComponentFixture<CaravanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaravanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaravanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
