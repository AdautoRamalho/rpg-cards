import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Spell } from '../models/spell';
import { SimplifiedCharacter } from './character.service';

@Injectable({ providedIn: 'root' })
export class SpellService {
  constructor(private http: HttpClient) {}

  getSpells(character: string, minLevel = 1): Observable<Spell[]> {
    const path = `/crawler/characters/${character}.json`;
    return this.http.get<SimplifiedCharacter>(path).pipe(
      map(data => this.filterAndSort(data.spells, minLevel))
    );
  }

  private filterAndSort(spells: Spell[], minLevel: number): Spell[] {
    const seen = new Map<string, Spell>();
    for (const spell of spells) {
      if (spell.level >= minLevel && (!seen.has(spell.name) || (seen.get(spell.name)!.level > spell.level))) {
        seen.set(spell.name, spell);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }
}
