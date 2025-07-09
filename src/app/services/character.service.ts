import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';

export interface SimplifiedCharacter {
  name: string;
  attributes: Record<string, { value: number; modifier: number }>;
  skills: Record<string, { proficiencyBonus: number }>;
  inventory: {
    name: string;
    type: string;
    quantity: number;
    equipped: boolean;
    attuned: boolean;
    description: string;
  }[];
  spells: {
    name: string;
    level: number;
    school: string;
    castingTime: string;
    range: number;
    components: any;
    componentsDescription: string;
    description: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  constructor(private http: HttpClient) {}

  fetchCharacterJSON(id: string, cookieString: string): Observable<any> {
    const headers = new HttpHeaders({
      Cookie: cookieString,
      'User-Agent': 'Mozilla/5.0'
    });

    const url = `https://www.dndbeyond.com/character/${id}/json`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(err => {
        console.error('Fetch error:', err.message);
        return throwError(() => err);
      })
    );
  }

  simplifyCharacter(data: any): SimplifiedCharacter {
    const statsMap = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
    const getModifier = (score: number): number => Math.floor((score - 10) / 2);

    const simplified: SimplifiedCharacter = {
      name: data.name,
      attributes: {},
      skills: {},
      inventory: [],
      spells: []
    };

    data.stats.forEach((stat: any) => {
      const statName = statsMap[stat.id - 1];
      simplified.attributes[statName] = {
        value: stat.value,
        modifier: getModifier(stat.value)
      };
    });

    const skillModifiers = [
      ...data.modifiers.race,
      ...data.modifiers.class,
      ...data.modifiers.background,
      ...data.modifiers.feat
    ];

    skillModifiers
      .filter((mod: any) => mod.type === 'proficiency' && mod.subType === 'skill')
      .forEach((skill: any) => {
        simplified.skills[skill.friendlySubtypeName] = {
          proficiencyBonus: skill.value || data.preferences.proficiencyBonus
        };
      });

    data.inventory.forEach((item: any) => {
      simplified.inventory.push({
        name: item.definition.name,
        type: item.definition.filterType,
        quantity: item.quantity,
        equipped: item.equipped,
        attuned: item.isAttuned,
        description: item.definition.description
      });
    });

    data.classSpells?.forEach((cls: any) => {
      cls.spells.forEach((spell: any) => {
        simplified.spells.push({
          name: spell.definition.name,
          level: spell.definition.level,
          school: spell.definition.school,
          castingTime: spell.definition.activation.activationTime,
          range: spell.definition.range.rangeValue,
          components: spell.definition.components,
          componentsDescription: spell.definition.componentsDescription,
          description: spell.definition.description
        });
      });
    });

    return simplified;
  }
}
