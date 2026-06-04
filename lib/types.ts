export interface EventItem {
  id: string;
  type: 'session' | 'deadline' | 'milestone';
  title: string;
  description: string;
  datetime: string;
  durationMins?: number;
  bookingUrl?: string;
  mentor?: string;
  mentorName?: string;
  program?: string;
  programColor?: string;
  url?: string;
}
