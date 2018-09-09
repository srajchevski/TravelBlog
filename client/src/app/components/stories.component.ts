import { Component, Injectable} from '@angular/core';
import { StoryService } from '../services/story.service';
import { LocationService } from '../services/location.service';

@Component({
  moduleId: module.id, // for relative paths
  selector: 'stories',
  templateUrl: 'stories.component.html',
  providers: [StoryService,LocationService]
})
@Injectable()
export class StoriesComponent {
  locations: location[];
  stories:story[];
  selectedSort: string;
  search: string;

  constructor(private storyService: StoryService, private locationService: LocationService) {
    this.selectedSort = "";
    this.search = "";
    this.storyService.getStories().subscribe((stories:story[]) => {
      this.locationService.getLocations().subscribe((locs:location[]) => {
        stories.map((story:story) => {
          locs.map((loc:location) => {
            if (story.location == loc._id) {
              story.city = loc.city;
              story.country = loc.country;
            }
          });
        });
        this.stories = stories;
        this.locations = locs;
      });
    });
  }

  onSort(sort:string) {
    this.selectedSort = sort;
    this.storyService.getStories("search="+this.search,sort).subscribe((stories:story[]) => {
      stories.map((story:story) => {
        this.locations.map((loc:location) => {
          if (story.location == loc._id) {
            story.city = loc.city;
            story.country = loc.country;
          }
        });
      });
      this.stories = stories;
    });
  }

  onSearch() {
    this.storyService.getStories("search="+this.search,this.selectedSort).subscribe((stories:story[]) => {
      stories.map((story:story) => {
        this.locations.map((loc:location) => {
          if (story.location == loc._id) {
            story.city = loc.city;
            story.country = loc.country;
          }
        });
      });
      this.stories = stories;
    });
  }
}

interface story {
  _id: string,
  title: string,
  description: string,
  city:string,
  country:string,
  location: string,
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
