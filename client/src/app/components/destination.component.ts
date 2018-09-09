import { Component,Injectable } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';
import { StoryService } from '../services/story.service';
import { LocationService } from '../services/location.service';
import {RatingModule} from 'ngx-rating';
import { UserService } from '../services/user.service';

@Component({
  moduleId: module.id,
  selector: 'destination',
  templateUrl: 'destination.component.html',
  providers: [LocationService,StoryService,UserService]
})
@Injectable()
export class DestinationComponent  {
  location: location;
  logged: boolean = false;
  stories: story[];
  id:string;
  comment:string='';
  rating: number;
  rtng:number =1;
  span:string = 'glyphicon glyphicon-star-empty';

  constructor(private activatedRoute: ActivatedRoute,private locationService: LocationService,private storyService: StoryService,private userService: UserService) {
    this.id='';
    if (sessionStorage.getItem('user'))
      this.logged = true;

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.id = params['id'];

        this.locationService.getLocation(this.id).subscribe(loc => {
            this.location = loc;
            this.location.comments.map((comment:any) => {
              this.userService.getUser(comment.user_id).subscribe((res:user)=>{
                comment.user_fullname = res.first_name + ' ' + res.last_name;
                if(sessionStorage.getItem('user') && (sessionStorage.getItem('user')==comment.user_id))
                  comment.owner = true;
                else
                  comment.owner = false;
              });
            });
            this.locationService.getLikes(this.id).subscribe((res:any)=>{
              if (res.rating) {
                this.rating = res.rating;
              }
            });
            this.storyService.getStories('location='+this.id,'rating').subscribe(stories => {
              stories.map((story:story) => {

                  if (story.location == loc._id) {
                    story.city = loc.city;
                    story.country = loc.country;
                  }

              });
              this.stories = stories;

              this.locationService.incrementViews(this.id).subscribe(() => {
                console.log('views++');
              });
            });
        });
      }
      else {
          alert('NO ID GIVEN');
      }
    });
  }


  rate() {
    this.locationService.rateLocation(this.rating,this.id).subscribe((loc:location)=> {
      this.location = loc;
    }, (error:any)=> {
        alert('Something went wrong. Please try again later');
    });
  }

  postComment() {
    this.locationService.postComment(this.comment, this.id).subscribe((res: location)=>{
      this.location = res;
      this.location.comments.map((comment:any) => {
        this.userService.getUser(comment.user_id).subscribe((res:user)=>{
          comment.user_fullname = res.first_name + ' ' + res.last_name;
          if(sessionStorage.getItem('user') && (sessionStorage.getItem('user')==comment.user_id))
            comment.owner = true;
          else
            comment.owner = false;
        });
      });
      this.comment = '';
    });
  }

  removeComment(comment_id:string) {
    this.locationService.removeComment(this.id, comment_id).subscribe((res: location)=>{
      this.location = res;
      this.location.comments.map((comment:any) => {
        this.userService.getUser(comment.user_id).subscribe((res:user)=>{
          comment.user_fullname = res.first_name + ' ' + res.last_name;
          if(sessionStorage.getItem('user') && (sessionStorage.getItem('user')==comment.user_id))
            comment.owner = true;
          else
            comment.owner = false;
        });
      });
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
  comments: any[],
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
