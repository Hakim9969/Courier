import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const CustomerGuard: CanActivateFn = (route, state) => {
  const role = localStorage.getItem('role');
  if (role === 'CUSTOMER') {
    return true;
  }
  const router = inject(Router);
  router.navigate(['/login']);
  return false;
};
