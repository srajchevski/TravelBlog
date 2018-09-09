import { Component, Input } from '@angular/core';
import { StoryService } from '../services/story.service';
import { LocationService } from '../services/location.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'mini-story',
  templateUrl:'./mini_story.component.html',
  providers: [StoryService,LocationService,UserService]

})
export class MiniStoryComponent  {
	@Input() story: story;

 /* constructor(){
    console.log("mini-story construktor");
    console.log(this.story);
  }*/
	
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