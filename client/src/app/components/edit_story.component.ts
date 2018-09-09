import { Component,Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { StoryService } from '../services/story.service';
import { LocationService } from '../services/location.service';

@Component({
  moduleId: module.id,
  selector: 'edit-story',
  templateUrl: 'edit_story.component.html',
  styleUrls:['../css/style-signup.css', ],
  providers: [StoryService,LocationService]
})
@Injectable()
export class EditStoryComponent  {
  id:string;
  uploaded: boolean = false;
  story: story;
  locations: location[];
  status: string = "*Fields are mandatory!";

  constructor(private actRoute: ActivatedRoute,private router: Router,private storyService: StoryService,private locationService: LocationService) {
    if (sessionStorage.getItem("user")) {
      this.actRoute.params.subscribe((params: Params) => {
        if (params['id']) {
          this.id = params['id'];

          this.storyService.getStory(this.id).subscribe((res: story) => {
            this.story = res;
            // check user's "permission" to edit selected story
            if (sessionStorage.getItem("user") != this.story.user_id)
              this.router.navigate(["/"]);

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
    console.log(this.story);
    if (this.story.title!="" && this.story.description!="" && this.story.location!="") {
      var data = new FormData();
      data.append("title", this.story.title);
      data.append("description", this.story.description);
      data.append("location", this.story.location);
      data.append("user_id", sessionStorage.getItem("user"));
      if (this.uploaded) {
        for (var i=0; i<this.story.pictures.length; i++) {
          data.append("pictures", this.story.pictures[i]);
        }
      }

      this.storyService.editStory(data,this.id).subscribe((res:story)=>{
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
    this.story.pictures = files;
    this.uploaded = true;
  }
}
interface story {
  _id: string,
  title: string,
  description: string,
  user_id: string,
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
