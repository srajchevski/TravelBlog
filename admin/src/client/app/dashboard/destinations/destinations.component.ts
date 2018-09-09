import { Component } from '@angular/core';
import {StoryService} from '../../services/story.service';
import {LocationService} from '../../services/location.service';
import {UserService} from '../../services/user.service';

@Component({
	moduleId: module.id,
    selector: 'destinations-component',
    templateUrl: './destinations.component.html',
    providers: [StoryService,LocationService,UserService]
})

export class DestinationsComponent {
  pic:any=null;
  newPic:any=null;
  locations: location[];
  stories: story[];
  users: user[];
  activeLocation: location = null;
  search: string = '';
  sort: string = '';
  newLocation: any = {
    city:'', country:'', description:''
  };

  constructor (private storyService: StoryService, private locationService: LocationService, private userService: UserService) {
    this.locationService.getLocations().subscribe((res:location[])=> {
      this.storyService.getStories().subscribe((stories:story[])=> {
        this.stories = stories;
        res.map((loc:location) => {
          loc.stories = [];
          this.stories.map((story:story) => {
            if (story.location === loc._id)
              loc.stories.push(story);
          });
        });
        this.locations = res;
      });
    });
  }

  cleanLocation() {
    this.newLocation = {
      city:'', country:'', description:''
    };
    this.newPic = null;
  }
  setActiveLocation(loc:location) {
    this.pic = null;
    this.activeLocation = loc;
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
    if (this.sort === 'stories') {
      var locs = this.locations;
      locs.sort(function(a:location, b:location) {
        return b.stories.length - a.stories.length;
      });
      this.locations = locs;
    } else {
      this.locationService.getLocations(this.search,this.sort).subscribe((res:location[])=> {
        res.map((loc:location) => {
          loc.stories = [];
          this.stories.map((story:story) => {
            if (story.location === loc._id)
              loc.stories.push(story);
          });
        });
        this.locations = res;
      });
    }
  }

  onSearch() {
    if (this.sort === 'stories') {
      this.locationService.getLocations(this.search).subscribe((res:location[])=> {
        res.map((loc:location) => {
          loc.stories = [];
          this.stories.map((story:story) => {
            if (story.location === loc._id)
              loc.stories.push(story);
          });
        });
        res.sort(function(a:location, b:location) {
          return b.stories.length - a.stories.length;
        });
        this.locations = res;
      });
    } else {
      this.locationService.getLocations(this.search,this.sort).subscribe((res:location[])=> {
        res.map((loc:location) => {
          loc.stories = [];
          this.stories.map((story:story) => {
            if (story.location === loc._id)
              loc.stories.push(story);
          });
        });
        this.locations = res;
      });
    }
  }

  createLocation() {
    if (this.newLocation.city!='' && this.newLocation.country!='' && this.newLocation.description!='') {
      var data = new FormData();
      data.append('city', this.newLocation.city);
      data.append('country', this.newLocation.country);
      data.append('description', this.newLocation.description);
      if (this.newPic!=null) {
        for (var i=0; i<this.newPic.length; i++) {
          data.append('pictures', this.newPic[i]);
        }
      }
      this.locationService.createLocation(data).subscribe(()=>{
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
  editLocation() {
    if (this.activeLocation.city!='' && this.activeLocation.country!='' && this.activeLocation.description!='') {
      var data = new FormData();
      data.append('city', this.activeLocation.city);
      data.append('country', this.activeLocation.country);
      data.append('description', this.activeLocation.description);
      if (this.pic!=null) {
        for (var i=0; i<this.pic.length; i++) {
          data.append('pictures', this.pic[i]);
        }
      }
      this.locationService.editLocation(data,this.activeLocation._id).subscribe(()=>{
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
  deleteLocation() {
    if (this.activeLocation != null) {
      this.locationService.removeLocation(this.activeLocation._id).subscribe(()=> {
        alert('Successfully removed');
        this.onSearch();
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
  stories: story[],
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
