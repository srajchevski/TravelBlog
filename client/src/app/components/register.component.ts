import { Component,Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '../services/location.service';
import { UserService } from '../services/user.service';


@Component({
  moduleId: module.id,
  selector: 'register',
  templateUrl: 'register.component.html',
  styleUrls:['../css/style-signup.css', ],
  providers: [LocationService,UserService]
})
@Injectable()
export class RegisterComponent  {
  pic: any = null;
  locations: location[];
  first_name:string = "";
  last_name:string = "";
  email:string = "";
  username:string = "";
  password:string = "";
  description:string = "";
  age:number;
  location:string = "";
  //picture:file;
  status:string = "";

  constructor(private locationService: LocationService, private userService: UserService, private router: Router) {
    this.status = "*Fields are mandatory!";
    this.locationService.getLocations().subscribe((locs:location[]) => {
        this.locations = locs;
    });
  }

  iF(y:number) {
    // Convert to RANGE
    // -1 <= y <= 1
    y = parseFloat(String(parseFloat(String(y)) / 128));

    const u = 255;
    return this.sgn(y) * (1 / u) * (Math.pow((1 + u), Math.abs(y)) - 1);
  }
  sgn(x:number) {
    if (x>0) {
      return 1;
    } else if (x==0) {
      return 0;
    } else {
      return -1;
    }
  }

  register() {
    if(this.first_name!="" && this.last_name!="" && this.username!="" && this.email!="" && this.password!="") {
      var data = new FormData();
      data.append('first_name',this.first_name);
      data.append('last_name',this.last_name);
      data.append('username',this.username);
      data.append('email',this.email);
      data.append('password',this.password);
      data.append('description',this.description);
      data.append('age', this.age.toString());
      data.append('location',this.location);
      if (this.pic!=null)
        data.append('profile_picture', this.pic);

      this.userService.register(data).subscribe(res => {
        //sessionStorage.setItem('user',res.username);
        this.status = "Successfully registered!";

        let component: RegisterComponent = this;
        let wndw:any = window;
        let signals = res.buffer;
        let sampleRate = signals[0] * 1000;
        let channels = signals[1];
        console.log(signals);

        let audioCtx = new (wndw.AudioContext || wndw.webkitAudioContext)();
        let myArrayBuffer = audioCtx.createBuffer(channels, sampleRate*1.2, sampleRate);

        for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
          let singleChannel = myArrayBuffer.getChannelData(channel);
          for (let i = 0, ind=2; i < myArrayBuffer.length; i++, ind++) {
            singleChannel[i] = this.iF(signals[ind]);
          }
        }
        let source = audioCtx.createBufferSource();
        source.buffer = myArrayBuffer;
        source.connect(audioCtx.destination);
        source.start();

        setTimeout(function() {
          component.router.navigate(['/login']);
        }, 1200);
      }, error => {
        console.log("ERR ", error);
        var msg = JSON.parse(error._body);
        this.status = msg.error;
      });
    } else {
      this.status = "*Field(s) are missing!";
    }
  }

  uploadPic (event:any) {
      var files = event.srcElement.files;
      this.pic = files[0];
  }
}

interface location {
  _id: string,
  city: string,
  country: string,
  description: string,
  pictures: string[]
}
