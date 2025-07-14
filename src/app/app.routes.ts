import {Routes} from '@angular/router';
import {SpellCardsComponent} from './pages/spell-cards/spell-cards.component';
import {HarvestComponent} from './pages/harvest/harvest.component';
import {MaterialsComponent} from './pages/materials/materials.component';

export const routes: Routes = [
  { path: 'spell-cards', component: SpellCardsComponent },
  { path: 'harvest', component: HarvestComponent },
  { path: 'materials', component: MaterialsComponent },
  { path: '', redirectTo: 'spell-cards', pathMatch: 'full' }
];
