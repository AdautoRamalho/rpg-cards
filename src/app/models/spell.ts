export interface Spell {
  name: string;
  level: number;
  school: string;
  description: string;
  castingTime: string;
  duration?: any;
  range: number;
  components: number[];
  componentsDescription: string;
  ritual?: boolean;
}
