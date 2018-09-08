import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
*	This class represents the lazy loaded LoginComponent.
*/

@Component({
	moduleId: module.id,
	selector: 'login-cmp',
	templateUrl: 'login.component.html',
	styleUrls: ['login.css'],
  providers: [UserService]
})

export class LoginComponent {
  user: string = ''
  password: string = '';
  status: string = '';

  constructor(private router: Router, private userService: UserService) {}

  login() {
    if(this.user !== '' && this.password !== '') {
      this.userService.logIn(this.user,this.password).subscribe((res:user) => {
        if (res.type === 'admin') {
          sessionStorage.setItem('admin',res._id);
          this.status = 'Successfully logged in!';
          this.router.navigate(['/dashboard/home']);
        } else {
          alert('User is not an admin');
        }
      }, error => {
        var msg = JSON.parse(error._body);
        this.status = msg.error;
      });
    } else {
      if (this.user === '' && this.password === '')
        this.status='Username/email and password missing!';
      else if (this.user === '')
        this.status='Username/email missing!';
      else
        this.status='Password missing!';
    }
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
