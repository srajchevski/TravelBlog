import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
	moduleId: module.id,
	selector: 'sidebar-cmp',
	templateUrl: 'sidebar.html',
  providers: [UserService]
})

export class SidebarComponent {
	id:string = '';
	user: user;
  showMenu: string = '';

	constructor(private userService: UserService, private router: Router) {
	  if (sessionStorage.getItem('admin')) {
	    this.id = sessionStorage.getItem('admin');
	    this.userService.getUser(this.id).subscribe((res:user) => {
	      this.user = res;
      });
    } else {
	    alert('NOT LOGGED');
	    //this.router.navigate(['/']);
    }
  }

	addExpandClass(element: any) {
		if (element === this.showMenu) {
			this.showMenu = '0';
		} else {
			this.showMenu = element;
		}
	}

	logout() {
	  this.userService.logOut().subscribe(()=> {
	    sessionStorage.removeItem('admin');
	    this.router.navigate(['/']);
    }, error => {
	    alert('Something went wrong');
    });
  }
}

interface user {
  _id: string,
  first_name: string,
  last_name: string,
  username: string,
  email: string,
  type: string,
  profile_picture: string,
  location: string,
  description: string,
  age: number
}
