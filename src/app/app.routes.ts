import {Routes} from '@angular/router';
import {SpellCardsComponent} from './pages/spell-cards/spell-cards.component';

export const routes: Routes = [
  { path: 'spell-cards', component: SpellCardsComponent },
  { path: '', redirectTo: 'spell-cards', pathMatch: 'full' }
];
