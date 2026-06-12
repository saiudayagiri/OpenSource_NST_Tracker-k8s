export interface EventItem {
  id: string;
  type: 'session' | 'deadline' | 'announcement';
  title: string;
  description: string;
  date: string;
  link?: string;
}
