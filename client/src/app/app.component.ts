import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<nav-header></nav-header>
             <div style="margin-top:5%"><router-outlet></router-outlet></div>`,
})
export class AppComponent  { }
