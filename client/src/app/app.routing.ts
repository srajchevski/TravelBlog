import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {HomePageComponent} from './components/home_page.component';
import {UserComponent} from './components/user.component';
import {LoginComponent} from './components/login.component';
import {RegisterComponent} from './components/register.component';
import {StoryComponent} from './components/story.component';
import {StoriesComponent} from './components/stories.component';
import {DestinationComponent} from './components/destination.component';
import {DestinationsComponent} from './components/destinations.component';
import {NewStoryComponent} from './components/new_story.component';
import {EditStoryComponent} from './components/edit_story.component';
import {EditUserComponent} from './components/edit_user.component';

const appRoutes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },{
    path: 'user/:id',
    component: UserComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'story/:id',
    component: StoryComponent
  },
  {
    path: 'stories',
    component: StoriesComponent
  },
  {
    path: 'destination/:id',
    component: DestinationComponent
  },
  {
    path: 'destinations',
    component: DestinationsComponent
  },
  {
    path: 'new_story',
    component: NewStoryComponent
  },
  {
    path: 'edit_story/:id',
    component: EditStoryComponent
  },
  {
    path: 'edit_user/:id',
    component: EditUserComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
