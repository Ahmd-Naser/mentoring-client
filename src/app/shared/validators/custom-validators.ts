import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null; 

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
      
      const isValid = passwordRegex.test(control.value);
      
      // إذا كان غير صالح، نرجع اسم خطأ مخصص مثل 'weakPassword'
      return isValid ? null : { weakPassword: true };
    };
  }
}