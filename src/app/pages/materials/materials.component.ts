import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {firstValueFrom} from 'rxjs';

interface Item {
  name: string;
  description: string;
  attributes: { type: string, description: string, weight: number }[];
  sources: { location: string, chance: string }[];
  tags: string[];
  image?: string;
}

@Component({
  selector: 'app-materials.component',
  imports: [
    CommonModule, FormsModule, NgOptimizedImage
  ],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.scss'
})
export class MaterialsComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];

  nameFilter: string = '';
  sourceFilter: string = '';
  attributeFilter: string = '';
  tagFilter: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadItems();
    window.addEventListener('keydown', this.handleEscape);

  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleEscape);
  }

  handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.closeImage();
    }
  };

  async loadItems() {
    try {
      const data = await firstValueFrom(
        this.http.get<Item[]>('data/items.json')
      );
      this.items = data ?? [];
      this.applyFilters();
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  }

  getAttributeColor(attr: { type: string, weight: number }): string {
    const weight = Math.max(1, Math.min(attr.weight, 50));
    const factor = (weight - 1) / 49;

    let hue = 0, saturation = 0, lightness = 70 - (factor * 40);

    switch (attr.type) {
      case 'm':
        hue = 270 + (30 * factor);
        saturation = 40 + (factor * 40);
        break;
      case 'a':
        hue = 30 - (30 * factor);
        saturation = 50 + (factor * 40);
        break;
      case 'd':
        hue = 180 + (40 * factor);
        saturation = 40 + (factor * 40);
        break;
    }

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  applyFilters(): void {
    const name = this.nameFilter.trim().toLowerCase();
    const source = this.sourceFilter.trim().toLowerCase();
    const attribute = this.attributeFilter.trim().toLowerCase();
    const tag = this.tagFilter.trim().toLowerCase();

    this.filteredItems = this.items.filter(item =>
      (!name || item.name.toLowerCase().includes(name)) &&
      (!source || item.sources.some(src => src.location.toLowerCase().includes(source))) &&
      (!attribute || item.attributes.some(attr => attr.description.toLowerCase().includes(attribute))) &&
      (!tag || item.tags.some(t => t.toLowerCase().includes(tag)))
    );
  }

  modalImage: string | null = null;

  openImage(imageName: string) {
    this.modalImage = imageName;
    document.body.style.overflow = 'hidden'; // prevent scrolling
  }

  closeImage() {
    this.modalImage = null;
    document.body.style.overflow = '';
  }
}
