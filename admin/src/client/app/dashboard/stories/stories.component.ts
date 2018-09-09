import { Component } from '@angular/core';
import {StoryService} from '../../services/story.service';
import {LocationService} from '../../services/location.service';
import {UserService} from '../../services/user.service';
import { DatePipe } from '@angular/common';
@Component({
	moduleId: module.id,
    selector: 'stories-component',
    templateUrl: './stories.component.html',
    providers: [StoryService,LocationService,UserService]
})

export class StoriesComponent {
  stories: story[];
  locations: location[];
  users: user[];
  activeStory: story = null;
  search: string = '';
  sort: string = '';
  newPic:any=null;
  pic:any=null;
  newStory:any = {
    title:'', description:'', location:''
  };

  constructor (private storyService: StoryService, private locationService: LocationService, private userService: UserService) {
    this.storyService.getStories().subscribe((res:story[])=> {
      this.locationService.getLocations().subscribe((locs:location[]) => {
        this.userService.getAllUsers().subscribe((users:any)=> {
          res.map((story:story) => {
            locs.map((loc:location) => {
              if (story.location === loc._id) {
                story.city = loc.city;
                story.country = loc.country;
              }
            });
            users.map((usr:any)=> {
              if (story.user_id === usr._id) {
                story.user_fullname = usr.first_name + ' ' + usr.last_name;
              }
            });
          });
          this.stories = res;
          this.locations = locs;
          this.users = users;
        });
      });
    }, (error:any)=> {
      alert('Something went wrong');
    });
  }

  cleanStory() {
    this.newStory = {
      title:'', description:'', location:''
    };
    this.newPic = null;
  }
  setActiveStory(story:story) {
    this.locations.map((loc:location)=> {
      if (story.location == loc._id)
        story.full_location = loc.city + ', ' + loc.country;
    });
    this.users.map((user:user)=>{
      if (story.user_id == user._id)
        story.user_fullname = user.first_name + ' ' + user.last_name;
    });
    this.activeStory = story;
    this.pic = null;
  }
  uploadPic(event:any) {
    var files = event.srcElement.files;
    this.pic = files;
  }
  uploadNewPic(event:any) {
    var files = event.srcElement.files;
    this.newPic = files;
  }

  onSort(sort:string) {
    this.sort = sort;
    this.storyService.getStories('search='+this.search,sort).subscribe((stories:story[]) => {
      stories.map((story:story) => {
        this.locations.map((loc:location) => {
          if (story.location === loc._id) {
            story.city = loc.city;
            story.country = loc.country;
          }
        });
        this.users.map((usr:any)=> {
          if (story.user_id === usr._id) {
            story.user_fullname = usr.first_name + ' ' + usr.last_name;
          }
        });
      });
      this.stories = stories;
    });
  }

  onSearch() {
    this.storyService.getStories('search='+this.search,this.sort).subscribe((stories:story[]) => {
      stories.map((story:story) => {
        this.locations.map((loc:location) => {
          if (story.location === loc._id) {
            story.city = loc.city;
            story.country = loc.country;
          }
        });
        this.users.map((usr:any)=> {
          if (story.user_id === usr._id) {
            story.user_fullname = usr.first_name + ' ' + usr.last_name;
          }
        });
      });
      this.stories = stories;
    });
  }

  createStory() {
    if(this.newStory.title!='' && this.newStory.description!='' && this.newStory.location!='') {
      var data = new FormData();
      data.append('title', this.newStory.title);
      data.append('description', this.newStory.description);
      data.append('location', this.newStory.location);
      if (this.newPic!=null) {
        for (var i=0; i<this.newPic.length; i++) {
          data.append('pictures', this.newPic[i]);
        }
      }

      this.storyService.createStory(data).subscribe(()=>{
        alert('Successfully created');
        this.onSearch();
      }, (error:any)=> {
        var msg = JSON.parse(error._body);
        alert(msg.error);
      });
    } else {
      alert('*Field(s) missing');
    }
  }
  editStory() {
    if(this.activeStory.title!='' && this.activeStory.description!='' && this.activeStory.location!='') {
      var data = new FormData();
      data.append('title', this.activeStory.title);
      data.append('description', this.activeStory.description);
      data.append('location', this.activeStory.location);
      if (this.pic!=null) {
        for (var i=0; i<this.pic.length; i++) {
          data.append('pictures', this.pic[i]);
        }
      }

      this.storyService.editStory(data,this.activeStory._id).subscribe(()=>{
        alert('Successfully updated');
        this.onSearch();
      }, (error:any)=> {
        var msg = JSON.parse(error._body);
        alert(msg.error);
      });
    } else {
      alert('*Field(s) missing');
    }
  }
  deleteStory() {
    if (this.activeStory != null) {
      this.storyService.removeStory(this.activeStory._id).subscribe(() => {
        alert('Successfully removed');
        this.storyService.getStories('search='+this.search,this.sort).subscribe((res:story[])=> {
          this.stories = res;
        }, (error:any) => {
          var msg = JSON.parse(error._body);
          alert(msg.error);
        });
      }, (error:any)=> {
        var msg = JSON.parse(error._body);
        alert(msg.error);
      });
    }
  }
}

interface story {
  _id: string,
  title: string,
  description: string,
  city:string,
  user_id: string,
  country:string,
  full_location:string,
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
interface user {
  _id: string,
  first_name: string,
  last_name: string,
  username: string,
  email: string,
  rating: number,
  profile_picture: string,
  location: string,
  description: string,
  age: number
}
