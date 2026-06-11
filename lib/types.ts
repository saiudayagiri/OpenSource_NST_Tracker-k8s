export interface EventItem {
  id: string;
  type: 'deadline' | 'milestone';
  title: string;
  description: string;
  datetime: string;
  program?: string;
  programColor?: string;
  url?: string;
}
