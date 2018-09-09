import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {routing} from './app.routing';
import { NguiMapModule } from '@ngui/map';
import {RatingModule} from "ngx-rating";
import { UpdateService } from './services/update.service';

import { AppComponent }  from './app.component';
import { UserComponent } from './components/user.component';
import { HeaderComponent } from './components/header.component';
import { LoginComponent } from './components/login.component';
import { HomePageComponent } from './components/home_page.component';
import { RegisterComponent } from './components/register.component';
import { StoryComponent } from './components/story.component';
import { StoriesComponent } from './components/stories.component';
import { DestinationComponent } from './components/destination.component';
import { DestinationsComponent } from './components/destinations.component';
import { NewStoryComponent } from './components/new_story.component';
import { EditStoryComponent } from './components/edit_story.component';
import { EditUserComponent } from './components/edit_user.component';
import { MiniStoryComponent } from './components/mini_story.component';
import { GalleryComponent } from './components/gallery.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { DiarySceneComponent } from './components/diary/diary.component';


@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule, RatingModule, routing,
    NguiMapModule.forRoot({apiUrl: 'https://maps.google.com/maps/api/js?key=AIzaSyArRYqwdcL1xGkbk263rX1tsuPJvX57IRM&libraries=visualization,places,drawing'}),
  ],
  declarations: [ AppComponent, UserComponent, HeaderComponent, LoginComponent, HomePageComponent, RegisterComponent, EditUserComponent,
                  StoryComponent, StoriesComponent, DestinationComponent, DestinationsComponent, NewStoryComponent, EditStoryComponent, MiniStoryComponent,
                  GalleryComponent, CanvasComponent, DiarySceneComponent],
  bootstrap:    [ AppComponent ],
  providers: [UpdateService]
})
export class AppModule { }
