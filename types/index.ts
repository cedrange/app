export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  webSite?: string | null;
  nickname?: string;
  role?: string | null;
  state?: string;
  roleName?: string | null;
  permissions?: any; // ou un type plus précis si connu
  roleId?: number;
  address?: string | null;
  gender?: 'M' | 'F' | string;
  registerDate?: number;
  token?: string;
  active?: boolean;
  password?: string | null;
  newPassword?: string | null;
  locationId?: number | null;
}


export interface Credentials {  
  id: string;
  email: string;
  password: string;

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
  id: number;
  titre_annonce: string;
  description: string;
  type: 'perdu' | 'trouvé'; // 'LOST' | 'FOUND'
  etat: string;
  ville: string;
  codePostal: string;
  secretQuestion?: string;
  categorieId: number;
  localiteId: number;
  annonceCorrespondantId?: number | null;
  date: string | number; 
  criteres: CritereValue[];
  userId: number;
  userFirstname: string;
  userLastname: string;
  categorie_libelle: string;
  photo?: Photo;
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

export interface CritereValue {
  id: number;
  valueId: number;
  libelle: string;
  type: string;
  value: string;
}

export interface Photo {
  id: number;
  name: string;
  data: string; // base64
}
