import { Component } from '@angular/core';
import { Router } from '@angular/router';
/**
*	This class represents the lazy loaded DashboardComponent.
*/

@Component({
	moduleId: module.id,
	selector: 'dashboard-cmp',
	templateUrl: 'dashboard.component.html'
})

export class DashboardComponent {
  constructor(private router: Router) {
    if (!sessionStorage.getItem('admin'))
      this.router.navigate(['/admin']);
  }
}
