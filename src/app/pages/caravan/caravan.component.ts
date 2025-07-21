import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';

interface Beast {
  type: string;
  name: string;
  description: string;
}

interface Member {
  type: string;
  name: string;
  description: string;
}

interface Wagon {
  type: string;
  name: string;
  size: string;
  description: string;
  beast: Beast[];
  member: Member[];
  x?: number;
  y?: number;
}

@Component({
  selector: 'app-caravan.component',
  imports: [
    NgStyle,
    FormsModule
  ],
  templateUrl: './caravan.component.html',
  styleUrl: './caravan.component.scss'
})
export class CaravanComponent  implements OnInit {
  wagons: Wagon[] = [];
  searchTerm: string = '';
  selectedWagon: Wagon | null = null;
  draggingWagon: Wagon | null = null;
  dragOffset = { x: 0, y: 0 };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Wagon[]>('/data/wagons.json').subscribe(data => {
      this.wagons = data.map(wagon => ({
        ...wagon
      }));
    });

    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  get filteredWagons(): Wagon[] {
    const term = this.searchTerm.toLowerCase();
    return this.wagons.filter(wagon => {
      const wagonText = [
        wagon.name,
        wagon.type,
        wagon.description,
        wagon.size,
        ...wagon.beast.map(b => `${b.name} ${b.type} ${b.description}`),
        ...wagon.member.map(m => `${m.name} ${m.type} ${m.description}`)
      ].join(' ').toLowerCase();
      return wagonText.includes(term);
    });
  }

  openModal(wagon: Wagon) {
    this.selectedWagon = wagon;
  }

  closeModal() {
    this.selectedWagon = null;
  }

  getWagonStyle(wagon: Wagon): any {
    const [w, h] = wagon.size.split('x').map(Number);
    const x = wagon.x ?? 0;
    const y = wagon.y ?? 0;

    return {
      position: 'absolute',
      left: `${x * 72}px`,
      top: `${y * 72}px`,
      width: `${w * 72}px`,
      height: `${h * 72}px`
    };
  }

  onMouseDown(event: MouseEvent, wagon: Wagon) {
    event.preventDefault();
    this.draggingWagon = wagon;

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  onMouseMove(event: MouseEvent) {
    if (!this.draggingWagon) return;

    const canvas = document.querySelector('.canvas-grid') as HTMLElement;
    const canvasRect = canvas.getBoundingClientRect();

    const relativeX = event.clientX - canvasRect.left - this.dragOffset.x;
    const relativeY = event.clientY - canvasRect.top - this.dragOffset.y;

    const gridX = Math.max(0, Math.round(relativeX / 72));
    const gridY = Math.max(0, Math.round(relativeY / 72));

    this.draggingWagon.x = gridX;
    this.draggingWagon.y = gridY;
  }

  onMouseUp() {
    this.draggingWagon = null;
  }
}
