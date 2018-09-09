import { Component,Injectable } from '@angular/core';
import { LocationService } from '../services/location.service';
import { StoryService } from '../services/story.service';

@Component({
  moduleId: module.id,
  selector: 'home-page',
  templateUrl: 'home_page.component.html',
  styleUrls: ['../css/one-page-wonder.css'],
  providers: [LocationService,StoryService]
})
@Injectable()
export class HomePageComponent  {
  locations: location[];
  topLocations: location[];
  trendingStories: story[];
  nearStories: story[];
  latestStories: story[];
  isLarge: boolean;


  constructor(private locationService:LocationService, private storyService:StoryService) {
    this.locationService.getLocations("","rating",4).subscribe(locs => {
      this.topLocations = locs;
      this.storyService.getStories("","date",8).subscribe((stories:story[]) => {
        this.locationService.getLocations().subscribe((locs:location[]) => {
          this.locations = locs;
          stories.map((story:story) => {
            locs.map((loc:location) => {
              if (story.location == loc._id) {
                story.city = loc.city;
                story.country = loc.country;
              }
            });
          });
          this.latestStories = stories;

          this.storyService.getTrendingStories().subscribe((trending: story[]) => {
            trending.map((story: story) => {
              locs.map((loc: location) => {
                if (story.location == loc._id) {
                  story.city = loc.city;
                  story.country = loc.country;
                }
              });
            });
            this.trendingStories = trending;

            if (navigator.geolocation) {
              var obj = navigator.geolocation.getCurrentPosition((position:any) => {
                console.log("Latitude: " +position.coords.latitude +
                  ",  Longitude: " + position.coords.longitude);
                this.storyService.getStoriesGeo(position.coords.latitude, position.coords.longitude, 8).subscribe((geostories: story[]) => {
                  geostories.map((story:story) => {
                    this.locations.map((loc:location) => {
                      if (story.location == loc._id) {
                        story.city = loc.city;
                        story.country = loc.country;
                      }
                    });
                  });
                  this.nearStories = geostories;


                });
              });
            } else {
              alert("HTML5 NAVIGATOR NOT SUPPORTED");
              console.log("HTML5 NAVIGATOR NOT SUPPORTED");
            }
          });
        });
      });
    });
  }



  checkLength(sto:story){
    console.log(sto.title);
      if(sto.title.length>19){
        sto.isVelik = true;
      }
      else{
        sto.isVelik = false;
      }
  }


}

interface location {
  _id: string,
  city: string,
  country: string,
  description: string,
  pictures: string[],
  rating: number
}
interface story {
  _id: string,
  title: string,
  description: string,
  city:string,
  country:string,
  location: string,
  pictures: string[],
  date_added: string,
  isVelik: boolean
}
