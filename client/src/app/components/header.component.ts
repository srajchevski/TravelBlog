import { Component,Injectable,ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../services/user.service';
import {UpdateService} from '../services/update.service';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';

@Component({
  moduleId: module.id,
  selector: 'nav-header',
  templateUrl: 'header.component.html',
  providers: [UserService, UpdateService]
})
@Injectable()
export class HeaderComponent  {
  user_id: string = "";
  logged: boolean;
  subscription: Subscription;

  constructor(private userService: UserService,private cdRef:ChangeDetectorRef, private updateService: UpdateService, private router: Router) {
    if(sessionStorage.getItem('user')) {
      this.logged = true;
      this.user_id = sessionStorage.getItem('user');
    }

    this.subscription = updateService.newLog$.subscribe((log:boolean) => {
        console.log("LGLG ",log);
        this.logged = log;
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

  logout() {
    console.log("LOG D FUCK OUT");
    this.userService.logOut().subscribe((res:any) => {
      sessionStorage.removeItem('user');
      this.logged = false;

      let component: HeaderComponent = this;
      let wndw:any = window;
      let signals = res.buffer;
      let sampleRate = signals[0] * 1000;
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

      setTimeout(function () {
        component.cdRef.detectChanges();
        component.router.navigate(["/"]);
      });
    });
  }
}
