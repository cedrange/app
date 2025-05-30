const tintColorLight = '#007AFF';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Électroniques',
    criteria: [
      { 
        id: '1', 
        name: 'Marque', 
        type: 'select', 
        options: ['Apple', 'Samsung', 'Huawei', 'Google', 'Xiaomi', 'Autre'], 
        required: true 
      },
      { 
        id: '2', 
        name: 'Couleur', 
        type: 'select', 
        options: ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Rose', 'Gris', 'Autre'], 
        required: true 
      },
      { 
        id: '3', 
        name: 'Modèle', 
        type: 'text', 
        required: false 
      },
    ],
  },
  {
    id: '2',
    name: 'Vêtements',
    criteria: [
      { 
        id: '4', 
        name: 'Type', 
        type: 'select', 
        options: ['Veste', 'Pantalon', 'T-shirt', 'Robe', 'Chaussures', 'Chapeau', 'Écharpe', 'Gants'], 
        required: true 
      },
      { 
        id: '5', 
        name: 'Couleur', 
        type: 'select', 
        options: ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Violet', 'Marron', 'Gris'], 
        required: true 
      },
      { 
        id: '6', 
        name: 'Taille', 
        type: 'select', 
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], 
        required: false 
      },
    ],
  },
  {
    id: '3',
    name: 'Bijoux',
    criteria: [
      { 
        id: '7', 
        name: 'Type', 
        type: 'select', 
        options: ['Bague', 'Collier', 'Bracelet', 'Montre', 'Boucles d\'oreilles', 'Broche'], 
        required: true 
      },
      { 
        id: '8', 
        name: 'Matériau', 
        type: 'select', 
        options: ['Or', 'Argent', 'Acier', 'Plastique', 'Cuir', 'Tissu', 'Autre'], 
        required: true 
      },
    ],
  },
  {
    id: '4',
    name: 'Sacs et Portefeuilles',
    criteria: [
      { 
        id: '9', 
        name: 'Type', 
        type: 'select', 
        options: ['Sac à main', 'Sac à dos', 'Portefeuille', 'Sacoche', 'Trousse', 'Valise'], 
        required: true 
      },
      { 
        id: '10', 
        name: 'Couleur', 
        type: 'select', 
        options: ['Noir', 'Marron', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Autre'], 
        required: true 
      },
      { 
        id: '11', 
        name: 'Marque', 
        type: 'text', 
        required: false 
      },
    ],
  },
  {
    id: '5',
    name: 'Documents',
    criteria: [
      { 
        id: '12', 
        name: 'Type', 
        type: 'select', 
        options: ['Carte d\'identité', 'Passeport', 'Permis de conduire', 'Carte vitale', 'Carte bancaire', 'Autre document'], 
        required: true 
      },
      { 
        id: '13', 
        name: 'Nom sur le document', 
        type: 'text', 
        required: false 
      },
    ],
  },
  {
    id: '6',
    name: 'Clés',
    criteria: [
      { 
        id: '14', 
        name: 'Type', 
        type: 'select', 
        options: ['Clés de maison', 'Clés de voiture', 'Clés de bureau', 'Autre'], 
        required: true 
      },
      { 
        id: '15', 
        name: 'Porte-clés', 
        type: 'text', 
        required: false 
      },
    ],
  },
];

export default Colors;