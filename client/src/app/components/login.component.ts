import { Component,Injectable,ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import {UpdateService} from '../services/update.service';

@Component({
  moduleId: module.id,
  selector: 'login',
  templateUrl: 'login.component.html',
  styleUrls:['../css/style-login.css'],
  providers: [UserService, UpdateService]

})
@Injectable()
export class LoginComponent  {
  status:string;
  user: string;
  password: string;
  newLogged:boolean;

  constructor(private userService: UserService,  private router: Router, private updateService: UpdateService) {
    this.status = "";
    this.user="";
    this.password="";

  }
  changeOutside() {
    this.updateService.change(true);
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

  login() {
    if(this.user!="" && this.password!="") {
      this.userService.logIn(this.user,this.password).subscribe((res:any) => {
        sessionStorage.setItem('user',res._id);
        console.log("nrate", res._id);
        this.status = "Successfully logged in!";

        let component: LoginComponent = this;
        let wndw:any = window;
        let signals = res.buffer;
        let sampleRate = signals[0] * 1000; //
        let channels = signals[1];
        console.log(signals);

        let audioCtx = new (wndw.AudioContext || wndw.webkitAudioContext)();
        let myArrayBuffer = audioCtx.createBuffer(channels, sampleRate, sampleRate);

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

        // treba da se odkomentira
        setTimeout(function () {
          component.changeOutside();
          component.router.navigate(["/"]);
          location.reload();
        }, 900);

      }, error => {
        let msg = JSON.parse(error._body);
        this.status = msg.error;
      });
    } else {
      if (this.user=="" && this.password=="")
        this.status="Username/email and password missing!";
      else if (this.user=="")
        this.status="Username/email missing!";
      else
        this.status="Password missing!";
    }
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
