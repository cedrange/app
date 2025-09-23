import { useState } from 'react';
import { ValidationResult } from '../utils/validation';

export const useValidation = () => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validate = (validationResult: ValidationResult) => {
    setErrors(validationResult.errors);
    setIsValid(validationResult.isValid);
    return validationResult.isValid;
  };

  const clearErrors = () => {
    setErrors([]);
    setIsValid(true);
  };

  const hasError = (field: string) => {
    return errors.some(error => error.toLowerCase().includes(field.toLowerCase()));
  };

  const getError = (field: string) => {
    return errors.find(error => error.toLowerCase().includes(field.toLowerCase()));
  };

  return {
    errors,
    isValid,
    validate,
    clearErrors,
    hasError,
    getError,
  };
};