import { Component,Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StoryService } from '../services/story.service';
import { LocationService } from '../services/location.service';

@Component({
  moduleId: module.id,
  selector: 'new-story',
  templateUrl: 'new_story.component.html',
  styleUrls:['../css/style-signup.css', ],
  providers: [LocationService,StoryService]
})
@Injectable()
export class NewStoryComponent  {
  title: string = "";
  description: string = "";
  location: string = "";
  locations: location[];
  pics: any = null;
  status: string = "*Fields are mandatory!";

  constructor(private router: Router,private locationService: LocationService,private storyService: StoryService) {
    if (sessionStorage.getItem("user")) {
      this.locationService.getLocations().subscribe((locs:location[]) => {
        this.locations = locs;
      });
    } else {
      this.router.navigate(["/"]);
    }
  }

  create() {
    if (this.title!="" && this.description!="" && this.location!="") {
      var data = new FormData();
      data.append("title", this.title);
      data.append("description", this.description);
      data.append("location", this.location);
      data.append("user_id", sessionStorage.getItem("user")); //
      if (this.pics!=null) {
        for (var i=0; i<this.pics.length; i++) {
          data.append("pictures", this.pics[i]);
        }
      }


      this.storyService.createStory(data).subscribe((res:story)=>{
        this.router.navigate(["/story/"+res._id])
      }, (error:any) => {
        var msg = JSON.parse(error._body);
        this.status = msg.error;
      });
    } else {
      this.status = "*Field(s) missing!";
    }
  }

  uploadPics(event:any) {
    var files = event.srcElement.files;
    this.pics = files;
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
  pictures: string[]
}
