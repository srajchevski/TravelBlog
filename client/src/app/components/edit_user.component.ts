import { Component,Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { LocationService } from '../services/location.service';
//import { passwordHash } from 'password-hash';

@Component({
  moduleId: module.id,
  selector: 'edit-user',
  templateUrl: 'edit_user.component.html',
  styleUrls:['../css/style-signup.css', ],
  providers: [UserService,LocationService]
})
@Injectable()
export class EditUserComponent  {
  id:string;
  old_password: string ="";
  new_password: string ="";
  uploaded: boolean = false;
  user: user;
  locations: location[];
  pic: any = null;
  status: string = "*Fields are mandatory!";

  constructor(private actRoute: ActivatedRoute,private router: Router,private userService: UserService,private locationService: LocationService) {
    if (sessionStorage.getItem("user")) {
      this.actRoute.params.subscribe((params: Params) => {
        if (params['id']) {
          this.id = params['id'];
          // check user's "permission" to edit selected user
          if (sessionStorage.getItem("user") != this.id) {
            this.router.navigate(["/"]);
          }
          this.userService.getUser(this.id).subscribe((res: user) => {
            this.user = res;
            this.locationService.getLocations().subscribe((locs: location[]) => {
              this.locations = locs;
            });
          });
        } else {
          alert("NO ID GIVEN");
        }
      });
    } else {
      this.router.navigate(["/"]);
    }
  }

  edit() {
    if (this.user.first_name!="" && this.user.last_name!="" && this.user.username!="" && this.user.email!="") {
      var data = new FormData();
      data.append("first_name", this.user.first_name);
      data.append("last_name", this.user.last_name);
      data.append("username", this.user.username);
      data.append("email", this.user.email);
      data.append("location", this.user.location);
      data.append("description", this.user.description);
      data.append("age", this.user.age.toString());
      if (this.old_password!="" && this.new_password!="") {
        data.append("old_password", this.old_password);
        data.append("new_password", this.new_password);
      }
      if (this.pic!=null) {
          data.append("profile_picture", this.pic);
      }

      this.userService.editUser(data,this.id).subscribe((res:user)=>{
        this.router.navigate(["/user/"+res._id])
      }, (error:any) => {
        var msg = JSON.parse(error._body);
        this.status = msg.error;
      });
    } else {
      this.status = "*Field(s) missing!";
    }
  }

  uploadPic(event:any) {
    var files = event.srcElement.files;
    this.pic = files[0];
  }
}

interface user {
  _id: string,
  first_name: string,
  last_name: string,
  username: string,
  email: string,
  password: string,
  profile_picture: string,
  location: string,
  description: string,
  age: number
}
interface location {
  _id: string,
  city: string,
  country: string,
  description: string,
  pictures: string[]
}
