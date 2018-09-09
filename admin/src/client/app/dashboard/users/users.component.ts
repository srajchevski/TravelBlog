import { Component } from '@angular/core';
import {StoryService} from '../../services/story.service';
import {LocationService} from '../../services/location.service';
import {UserService} from '../../services/user.service';

@Component({
	moduleId: module.id,
    selector: 'users-component',
    templateUrl: './users.component.html',
    providers: [StoryService,LocationService,UserService]
})

export class UsersComponent {
  pic:any=null;
  newPic:any=null;
  stories: story[];
  locations: location[];
  users: user[];
  activeUser: user = null;
  search: string = '';
  sort: string = '';
  uploaded:boolean = false;
  newUser:any = {
    first_name:'', last_name: '',  username: '', email: '', password: '', location: '', description: '', age: null
  };

  constructor (private storyService: StoryService, private locationService: LocationService, private userService: UserService) {
    this.userService.getAllUsers().subscribe((res:user[])=> {
      this.storyService.getStories().subscribe((stories:story[])=> {
        res.map((user:user)=> {
          user.stories = [];
          stories.map((story:story)=> {
            if (user._id === story.user_id)
              user.stories.push(story);
          });
        });
        this.locationService.getLocations().subscribe((locs:location[]) => {
          this.locations = locs;
          this.users = res;
          this.stories = stories;
        });
      });
    });
  }
  cleanUser() {
    this.newUser = {
      first_name:'', last_name: '',  username: '', email: '', password: '', location: '', description: '', age: null
    };
    this.newPic = null;
  }
  setActiveUser(user:user) {
    this.pic = null;
    if (user.location && user.location !='') {
      this.locations.map((loc:location)=> {
        if (user.location == loc._id)
          user.full_location = loc.city + ', ' + loc.country;
      });
    }
    this.activeUser = user;
  }

  onSort(sort:string) {
    this.sort = sort;
    if (this.sort === 'stories') {
      var users = this.users;
      users.sort(function(a:user, b:user) {
        return b.stories.length - a.stories.length;
      });
      this.users = users;
    } else {
      this.userService.getAllUsers(this.search,this.sort).subscribe((res:user[])=> {
        res.map((user:user)=> {
          user.stories = [];
          this.stories.map((story:story)=> {
            if (user._id === story.user_id)
              user.stories.push(story);
          });
        });
        this.users = res;
      });
    }
  }

  onSearch() {
    if (this.sort === 'stories') {
      this.userService.getAllUsers(this.search).subscribe((res:user[])=> {
        res.map((user:user)=> {
          user.stories = [];
          this.stories.map((story:story)=> {
            if (user._id === story.user_id)
              user.stories.push(story);
          });
        });

        res.sort(function(a:user, b:user) {
          return b.stories.length - a.stories.length;
        });
        this.users = res;
      });
    } else {
      this.userService.getAllUsers(this.search,this.sort).subscribe((res:user[])=> {
        res.map((user:user)=> {
          user.stories = [];
          this.stories.map((story:story)=> {
            if (user._id === story.user_id)
              user.stories.push(story);
          });
        });
        this.users = res;
      });
    }
  }

  uploadPic(event:any) {
    var files = event.srcElement.files;
    this.pic = files[0];
  }
  uploadNewPic(event:any) {
    var files = event.srcElement.files;
    this.newPic = files[0];
  }

  createUser() {
    if (this.newUser.first_name!='' && this.newUser.last_name!='' && this.newUser.username!='' && this.newUser.email!='' && this.newUser.password!='') {
      var data = new FormData();
      data.append('first_name', this.newUser.first_name);
      data.append('last_name', this.newUser.last_name);
      data.append('username', this.newUser.username);
      data.append('email', this.newUser.email);
      data.append('password', this.newUser.password);
      data.append('location', this.newUser.location);
      data.append('description', this.newUser.description);
      data.append('age', this.newUser.age.toString());
      if (this.newPic!==null) {
        data.append('profile_picture', this.newPic);
      }

      this.userService.register(data).subscribe(()=> {
        alert('Succesfully created!');
        this.onSearch();
      }, (error:any) => {
        var msg = JSON.parse(error._body);
        alert(msg.error);
      });
    } else {
      alert('*Field(s) missing!');
    }
  }

  editUser() {
    if (this.activeUser.first_name!='' && this.activeUser.last_name!='' && this.activeUser.username!='' && this.activeUser.email!='') {
      var data = new FormData();
      data.append('first_name', this.activeUser.first_name);
      data.append('last_name', this.activeUser.last_name);
      data.append('username', this.activeUser.username);
      data.append('email', this.activeUser.email);
      data.append('location', this.activeUser.location);
      data.append('description', this.activeUser.description);
      data.append('age', this.activeUser.age.toString());
      if (this.pic!==null) {
        data.append('profile_picture', this.pic);
      }

      this.userService.editUser(data,this.activeUser._id).subscribe((res:user)=>{
        alert('Succesfully updated!');
        this.onSearch();
      }, (error:any) => {
        var msg = JSON.parse(error._body);
        alert(msg.error);
      });
    } else {
      alert('*Field(s) missing!');
    }
  }
  deleteUser() {
    if (this.activeUser != null) {
      this.userService.removeUser(this.activeUser._id).subscribe(() => {
        alert('Successfully removed');
        this.onSearch();
      }, (error:any)=> {
        var msg = JSON.parse(error._body);
        alert(msg.error);
      });
    }
  }

}

interface user {
  _id: string,
  first_name: string,
  last_name: string,
  username: string,
  full_location:string,
  email: string,
  stories: story[],
  rating: number,
  profile_picture: string,
  location: string,
  description: string,
  age: number
}
interface story {
  _id: string,
  title: string,
  description: string,
  city:string,
  user_id: string,
  country:string,
  location: string,
  user_fullname: string,
  rating:number,
  pictures: string[],
  date_added: string
}
interface location {
  _id: string,
  city: string,
  country: string,
  description: string,
  pictures: string[],
  rating: number
}

