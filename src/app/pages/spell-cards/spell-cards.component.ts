import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

interface Spell {
  name: string;
  level: number;
  school: string;
  description: string;
  castingTime: number;
  duration?: string;
  range: number;
  components: number[];
  ritual?: boolean;
  materials?: string;
}

@Component({
  selector: 'app-spell-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./spell-cards.component.scss'],
  templateUrl: './spell-cards.component.html',
})
export class SpellCardsComponent implements OnInit {
  spells: Spell[] = [];
  characters = ['Turquesa', 'Zirael', 'Zaratustra', 'BigBob', 'Bastian'];
  selectedCharacter = 'Turquesa';

  pastelColors = [
    '#f9f2ec', '#e1f5fe', '#e8f5e9', '#fff3e0', '#f3e5f5',
    '#e0f7fa', '#fce4ec', '#ede7f6', '#fffde7', '#eceff1'
  ];

  castingTimeMap: Record<number, string> = {
    0: 'Special',
    1: '1 Action',
    2: '1 Bonus Action',
    3: '1 Reaction',
    4: '1 Minute',
    5: '10 Minutes',
    6: '1 Hour',
    7: '8 Hours',
    8: '12 Hours',
    9: '24 Hours'
  };

  ngOnInit(): void {
    this.loadCharacter();
  }

  loadCharacter(): void {
    const filename = `/crawler/characters/${this.selectedCharacter}.json`;

    fetch(filename)
      .then(res => res.json())
      .then(data => {
        const seen = new Map();
        for (const spell of data.spells) {
          if (!seen.has(spell.name) || seen.get(spell.name).level > spell.level) {
            seen.set(spell.name, spell);
          }
        }
        this.spells = Array.from(seen.values()).sort(
          (a, b) => a.level - b.level || a.name.localeCompare(b.name)
        );
      });
  }

  getSplitDescription(spell: Spell): [string, string] | null {
    const maxHeight = 155;
    const temp = document.createElement('div');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.style.width = '63mm';
    temp.style.fontSize = '9pt';
    temp.innerHTML = spell.description;
    document.body.appendChild(temp);

    if (temp.scrollHeight <= maxHeight) {
      document.body.removeChild(temp);
      return null;
    }

    const words = spell.description.split(' ');
    let part1 = '', part2 = '';
    for (let i = 0; i < words.length; i++) {
      temp.innerHTML = words.slice(0, i).join(' ');
      if (temp.scrollHeight > maxHeight) {
        part1 = words.slice(0, i - 1).join(' ') + ' [&hellip;]';
        part2 = words.slice(i - 1).join(' ');
        break;
      }
    }

    document.body.removeChild(temp);
    return [part1, part2];
  }

  getComponentStringHtml(components: number[]): string {
    const tags = components
      .map(c => ['V', 'S', 'M'][c - 1])
      .filter(Boolean)
      .map(letter => `<strong>${letter}</strong>`);
    return tags.join(' ');
  }

}
