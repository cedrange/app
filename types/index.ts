export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'PROFESSIONAL' | 'SUPERADMIN';
}

export interface Category {
  id: string;
  name: string;
  criteria: Criterion[];
}

export interface Criterion {
  id: string;
  name: string;
  type: 'text' | 'select' | 'number';
  options?: string[];
  required: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  city: string;
  postalCode: string;
  date: string;
  category: Category;
  type: 'LOST' | 'FOUND';
  photo?: string;
  secretQuestion?: string;
  criteriaValues: { [key: string]: string };
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  announcement1: Announcement;
  announcement2: Announcement;
  score: number;
}

export interface ChatMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: {
    _id: string | number;
    name: string;
    avatar?: string;
  };
}

export interface CreateAnnouncementData {
  title: string;
  description: string;
  city: string;
  postalCode: string;
  date: string;
  categoryId: string;
  type: 'LOST' | 'FOUND';
  photo?: string;
  secretQuestion?: string;
  criteriaValues: { [key: string]: string };
}