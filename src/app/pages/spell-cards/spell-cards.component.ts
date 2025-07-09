import { AfterViewChecked, Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import truncate from 'truncate-html';
import { LucideAngularModule } from 'lucide-angular';
import { Spell } from '../../models/spell';
import { SpellService } from '../../services/spell.service';

@Component({
  selector: 'app-spell-cards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  styleUrls: ['./spell-cards.component.scss'],
  templateUrl: './spell-cards.component.html',
})
export class SpellCardsComponent implements OnInit, AfterViewChecked {
  @ViewChildren('overflowDescription') overflowDescriptions!: QueryList<ElementRef>;
  private hasAdjustedFont = false;
  spells: Spell[] = [];
  characters = ['Turquesa', 'Zirael', 'Xaratustra', 'Big bob', 'Bastian'];
  selectedCharacter = 'Turquesa';
  selectedLevel: number = 1;

  processedSpells: { spell: any, split: [string, string] | null }[] = [];

  constructor(private spellService: SpellService) {}

  pastelColors = [
    '#f9f2ec', '#e1f5fe', '#e8f5e9', '#fff3e0', '#f3e5f5',
    '#e0f7fa', '#fce4ec', '#ede7f6', '#fffde7', '#eceff1'
  ];

  ngOnInit(): void {
    this.loadCharacter();
  }

  loadCharacter(): void {
    this.hasAdjustedFont = false;
    this.spellService.getSpells(this.selectedCharacter, this.selectedLevel)
      .subscribe(spells => {
        this.spells = spells;
        let index = 0;
        this.processedSpells = this.spells.map(spell => ({
          spell,
          split: this.getSplitDescription(spell),
          index: index++
        }));
      });
  }

  getSpellPages(): { index: number, page: any[] }[] {
    const pages: { index: number, page: any[] }[] = [];
    let currentPage: any[] = [];
    let currentSlotCount = 0;
    let pageIndex = 0;

    for (const item of this.processedSpells) {
      const takesTwoSlots = !!item.split; // if it's split, it takes 2 slots
      const neededSlots = takesTwoSlots ? 2 : 1;

      // if not enough space left, start a new page
      if (currentSlotCount + neededSlots > 9) {
        pages.push({ index: pageIndex++, page: currentPage });
        currentPage = [];
        currentSlotCount = 0;
      }

      currentPage.push(item);
      currentSlotCount += neededSlots;
    }

    if (currentPage.length > 0) {
      pages.push({ index: pageIndex++, page: currentPage });
    }

    return pages;
  }

  ngAfterViewChecked(): void {
    if (this.hasAdjustedFont || this.overflowDescriptions.length === 0) return;

    this.overflowDescriptions.forEach((el) => {
      this.adjustFontSizeUntilFits(el.nativeElement);
    });

    this.hasAdjustedFont = true;
  }

  adjustFontSizeUntilFits(element: HTMLElement, minSize = 5, maxSize = 9): void {
    let size = maxSize;
    element.style.fontSize = `${size}pt`;

    while (element.scrollHeight > element.offsetHeight && size > minSize) {
      size -= 0.5;
      element.style.fontSize = `${size}pt`;
    }
  }

  getSplitDescription(spell: Spell): [string, string] | null {
    return this.smartSplitText(spell.description, 180)
  }

  smartSplitText(htmlText: string, maxHeight: number, fontSize = '9pt'): [string, string] | null {
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.width = '63mm';
    testDiv.style.fontSize = fontSize;
    testDiv.style.lineHeight = '1.2';
    document.body.appendChild(testDiv);

    const plainWords = htmlText.replace(/<[^>]+>/g, '').trim().split(/\s+/);
    let low = 0;
    let high = plainWords.length;
    let bestFit = '';
    let bestWordCount = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const truncated = truncate(htmlText, mid, {byWords: true, ellipsis: '[...]'});
      testDiv.innerHTML = truncated;

      if (testDiv.scrollHeight > maxHeight) {
        high = mid - 1;
      } else {
        bestFit = truncated;
        bestWordCount = mid;
        low = mid + 1;
      }
    }

    document.body.removeChild(testDiv);

    if (bestFit.length == htmlText.length) {
      return null;
    }

    return [bestFit || '', htmlText]; // part1 = cropped, part2 = full original
  }


  getComponentStringHtml(components: number[]): string {
    const tags = components
      .map(c => ['V', 'S', 'M'][c - 1])
      .filter(Boolean)
      .map(letter => `<strong>${letter}</strong>`);
    return tags.join(' ');
  }

  formatDuration(duration: any): string {
    if (typeof duration === 'string') return duration;

    if (!duration?.durationUnit) return 'Instant';
    const interval = duration.durationInterval || 1;

    let unit = `${duration.durationUnit}${interval > 1 ? 's' : ''}`;
    unit = unit == 'Minutes' || unit == 'Minute' ? 'Min.' : duration.durationUnit;
    return `${interval} ${unit}`;
  }

  formatRange(range: any): string {
    if (range === null) return 'Special';

    return range != 0 ? range : 'Touch';
  };

}
