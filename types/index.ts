import * as Yup from 'yup';

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

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface SocialAuthRequest {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
  userInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface Credentials {  
  id: string;
  email: string;
  password: string;

}

export interface Critere {
  id: number;
  valueId: number | null;
  libelle: string;
  type: string;
  value: string | null;
  required?: boolean; 
  options?: string[]; // utile pour le type "select"
}

export interface Category {
  id: number;
  libelle: string;
  description: string;
  categoryParent: number | null;
  criteres: Critere[];
}


export interface Announcement {
  id: number;
  titre: string;
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
  date: string; 
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
  titre: string;
  titre_annonce: string;
  description: string;
  ville: string;
  type: 'perdu' | 'trouvé'; // 'LOST' | 'FOUND'
  codePostal: string;
  secretQuestion: string;
  categorieId: number;
  date: string; 
  criteres: CritereValue[];
  photo?: Photo;
}

export interface CritereValue {
  id: number;
  libelle: string;
  type: string;
  value: string;
  required?: boolean; 
  options?: string[]; // utile pour le type "select"
}

export interface Photo {
  id: number;
  name: string;
  data: string; // base64
}


function mapFormToPostAddingDTO(data: CreateAnnouncementData) {
  // transforme la liste de critères en un objet { "5": "valeur", "7": "valeur" }
  const critereMap: Record<number,string> = {};
  data.criteres.forEach(c => {
    critereMap[c.id] = c.value;
  });

  return {
    titre: data.titre_annonce,
    description: data.description,
    ville: data.ville,
    type: data.type,
    codePostal: data.codePostal,
    secretQuestion: data.secretQuestion || "",
    categorie: Number(data.categorieId),
    date: `${data.date}T00:00:00`, // forcer format ISO
    critereValues: critereMap,
    photo: data.photo || null,
    id: null
  };
}
export { mapFormToPostAddingDTO };