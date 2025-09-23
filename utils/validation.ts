import { VALIDATION_RULES } from './constants';

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Optionnel
  return VALIDATION_RULES.PHONE_REGEX.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateLoginForm = (
  email: string,
  password: string
): ValidationResult => {
  const errors: string[] = [];

  if (!validateRequired(email)) {
    errors.push('L\'email est requis');
  } else if (!validateEmail(email)) {
    errors.push('L\'email n\'est pas valide');
  }

  if (!validateRequired(password)) {
    errors.push('Le mot de passe est requis');
  } else if (!validatePassword(password)) {
    errors.push(`Le mot de passe doit contenir au moins ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caractères`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSignupForm = (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
  phoneNumber?: string
): ValidationResult => {
  const errors: string[] = [];

  if (!validateRequired(firstName)) {
    errors.push('Le prénom est requis');
  } else if (!validateName(firstName)) {
    errors.push('Le prénom doit contenir au moins 2 caractères');
  }

  if (!validateRequired(lastName)) {
    errors.push('Le nom est requis');
  } else if (!validateName(lastName)) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (!validateRequired(email)) {
    errors.push('L\'email est requis');
  } else if (!validateEmail(email)) {
    errors.push('L\'email n\'est pas valide');
  }

  if (!validateRequired(password)) {
    errors.push('Le mot de passe est requis');
  } else if (!validatePassword(password)) {
    errors.push(`Le mot de passe doit contenir au moins ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caractères`);
  }

  if (password !== confirmPassword) {
    errors.push('Les mots de passe ne correspondent pas');
  }

  if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
    errors.push('Le numéro de téléphone n\'est pas valide');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};