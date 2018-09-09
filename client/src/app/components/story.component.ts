import { Component,Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params} from '@angular/router';
import { StoryService } from '../services/story.service';
import { LocationService } from '../services/location.service';
import { UserService } from '../services/user.service';

@Component({
  moduleId: module.id,
  selector: 'story',
  templateUrl: 'story.component.html',
  providers: [StoryService,LocationService,UserService]
})
@Injectable()
export class StoryComponent  {
  id:string;
  logged: boolean = false;
  owner: boolean = false;
  story: story;
  locations: location[];
  location: location;
  user: user;
  comment: string = "";
  liked: boolean = false;
  suggestedStories: story[];
  containsDCT: boolean = false;

  constructor(private activatedRoute: ActivatedRoute,private storyService: StoryService,private locationService: LocationService,
              private userService: UserService, private router: Router) {
    if (sessionStorage.getItem('user'))
      this.logged = true;


    this.id="";
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.id = params['id'];

        this.storyService.getStory(this.id).subscribe(story => {
          if (story.pictures && story.pictures.length>0) {
            const re = /(?:\.([^.]+))?$/;
            const ext = re.exec(story.pictures[0])[1];
            console.log("EXT: ", ext);
            if (ext == "bin" || ext == "bimg") {
              this.containsDCT = true;
            }
          }
          this.story = story;

          this.story.comments.map((comment:any) => {
              this.userService.getUser(comment.user_id).subscribe((res:user)=>{
                comment.user_fullname = res.first_name + " " + res.last_name;
                if(sessionStorage.getItem('user') && (sessionStorage.getItem('user')==comment.user_id))
                  comment.owner = true;
                else
                  comment.owner = false;
              });
            });
            // check if current user is owner of the story
            if (sessionStorage.getItem('user') && (this.story.user_id == sessionStorage.getItem('user'))) {
              this.owner = true;
            }
            this.locationService.getLocation(story.location).subscribe(loc => {
                this.location = loc;
                this.userService.getUser(story.user_id).subscribe(user => {
                    this.user = user;
                    this.storyService.getLike(this.id).subscribe((res:any) => {
                      if (res.exists) {
                        this.liked = true;
                      }

                      if (this.logged) {
                        this.storyService.getStoriesLikes(this.id).subscribe((stories: story[]) => {
                            stories.map((story: story) => {
                              this.locationService.getLocation(story.location).subscribe((story_loc: location) => {
                                if (story.location == story_loc._id) {
                                  story.city = story_loc.city;
                                  story.country = story_loc.country;
                                }
                              });
                            });

                            this.suggestedStories = stories;
                            this.storyService.incrementViews(this.id).subscribe(() => {
                              console.log("views++");
                            });
                        });
                      } else {
                        this.storyService.getTrendingStories().subscribe((stories: story[]) => {
                          stories.map((story: story) => {
                            this.locationService.getLocation(story.location).subscribe((story_loc: location) => {
                              if (story.location == story_loc._id) {
                                story.city = story_loc.city;
                                story.country = story_loc.country;
                              }
                            });
                          });

                          this.suggestedStories = stories;

                          this.storyService.incrementViews(this.id).subscribe(() => {
                            console.log("views++");
                          });
                        });
                      }
                    });
                });
            });
        });
      } else {
        alert("NO ID GIVEN");
      }
    });
  }

  getColor() {
    if(this.liked) {
      return "skyblue";
    } else {
      return "";
    }
  }

  rate() {
    this.storyService.rate(this.id).subscribe((story:story)=>{
      this.story = story;
      this.liked = !this.liked;
    }, (error:any) => {
      alert("Something went wrong. Please try again later");
    });
  }

  postComment() {
    this.storyService.postComment(this.comment, this.id).subscribe((res: story)=>{
      this.story = res;
      this.story.comments.map((comment:any) => {
        this.userService.getUser(comment.user_id).subscribe((res:user)=>{
          comment.user_fullname = res.first_name + " " + res.last_name;
          if(sessionStorage.getItem('user') && (sessionStorage.getItem('user')==comment.user_id))
            comment.owner = true;
          else
            comment.owner = false;
        });
      });
      this.comment = "";
    });
  }

  removeComment(comment_id:string) {
    this.storyService.removeComment(this.id, comment_id).subscribe((res: story)=>{
      this.story = res;
      this.story.comments.map((comment:any) => {
        this.userService.getUser(comment.user_id).subscribe((res:user)=>{
          comment.user_fullname = res.first_name + " " + res.last_name;
          if(sessionStorage.getItem('user') && (sessionStorage.getItem('user')==comment.user_id))
            comment.owner = true;
          else
            comment.owner = false;
        });
      });
    });
  }

  deleteStory() {
    this.storyService.removeStory(this.id).subscribe(() => {
      this.router.navigate(["/stories"]);
    })
  }

  initCanvas() {
    /*var clock = new THREE.Clock(), raycaster = new THREE.Raycaster(), mouseVector = new THREE.Vector3()
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xddccdd, 1);
    renderer.setSize( window.innerWidth, window.innerHeight );
    //document.body.appendChild( renderer.domElement );
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(70, 1.0, 1, 1000);
    scene.add(camera);*/
  }
}
interface story {
  _id: string,
  title: string,
  description: string,
  city:string,
  country:string,
  user_id: string,
  comments: any[],
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
