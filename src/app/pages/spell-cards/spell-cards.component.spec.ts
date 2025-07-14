import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SpellCardsComponent } from './spell-cards.component';
import { SpellService } from '../../services/spell.service';

describe('SpellCardsComponent', () => {
  let component: SpellCardsComponent;
  let fixture: ComponentFixture<SpellCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpellCardsComponent],
      providers: [
        { provide: SpellService, useValue: { getSpells: () => of([]) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpellCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
