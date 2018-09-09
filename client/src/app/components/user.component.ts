import { ActivatedRoute, Params} from '@angular/router';
import { Component, Injectable} from '@angular/core';
import { UserService } from '../services/user.service';
import { LocationService } from '../services/location.service';
import { StoryService } from '../services/story.service';

@Component({
  moduleId: module.id, // for relative paths
  selector: 'user',
  templateUrl: 'user.component.html',
  providers: [UserService,LocationService,StoryService]
})
@Injectable()
export class UserComponent {
  id: string;
  user:user;
  positions: any = [];
  userLocations: location[];
  stories: story[];
  allOptions:any;

  constructor(private activatedRoute: ActivatedRoute, private userService: UserService,
              private locationService: LocationService, private storyService: StoryService) {
    this.id="";
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.id = params['id'];

        this.userService.getUser(this.id).subscribe((user:user) => {
              this.user = user;
              this.locationService.getLocations().subscribe((locs:location[]) => {
                this.storyService.getStories("user="+this.user._id,"date").subscribe((stories:story[]) => {
                    stories.map((story:story) => {
                        locs.map((loc:location) => {
                          if (story.location == loc._id) {
                            story.city = loc.city;
                            story.country = loc.country;
                          }
                        });
                    });
                    this.stories = stories;

                    this.userService.getMap(this.id).subscribe((locs:location[]) => {
                      this.userLocations = locs;
                      this.allOptions = {
                        center: {lat: locs[0].latitude, lng: locs[0].longitude},
                        zoom: 3,
                        mapTypeId: 'terrain',
                        tilt: 45
                      };

                      locs.map((row) => {
                        this.positions.push([row.latitude, row.longitude]);
                      });
                    });
                });
              });
        });
      } else {
        alert("NO ID GIVEN");
      }
    });
  }
}

interface user {
  _id: string,
  first_name: string,
  last_name: string,
  username: string,
  email: string,
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
  country:string,
  location: string,
  rating: number,
  pictures: string[],
  date_added: string
}
interface location {
  _id: string,
  city: string,
  country: string,
  description: string,
  latitude: number,
  longitude: number,
  pictures: string[],
  rating: number
}
