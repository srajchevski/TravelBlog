import { Component, Injectable} from '@angular/core';
import { LocationService } from '../services/location.service';

@Component({
  moduleId: module.id, // for relative paths
  selector: 'destinations',
  templateUrl: 'destinations.component.html',
  providers: [LocationService]
})
@Injectable()
export class DestinationsComponent {
  locations:location[];
  selectedSort: string;
  search: string;

  constructor(private locationService: LocationService) {
    this.selectedSort = "";
    this.search = "";
    this.locationService.getLocations().subscribe(res => {
      this.locations = res;
    });
  }

  onSort(sort:string) {
    this.selectedSort = sort;
    this.locationService.getLocations(this.search,sort).subscribe(res => {
      this.locations = res;
    });
  }

  onSearch() {
    this.locationService.getLocations(this.search,this.selectedSort).subscribe(locs => {
      this.locations = locs;
    });
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
