import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeModule } from './home/home.module';
import { BlankPageModule } from './blank-page/blankPage.module';
import { BSComponentModule } from './bs-component/bsComponent.module';
import { StoriesModule } from './stories/stories.module';
import { DestinationsModule } from './destinations/destinations.module';
import { UsersModule } from './users/users.module';
import { DashboardComponent } from './dashboard.component';

import { SidebarComponent } from '../shared/index';

@NgModule({
    imports: [
        CommonModule,
    	RouterModule,
    	HomeModule,
      StoriesModule,
      DestinationsModule,
      UsersModule,
    	BSComponentModule,
        BlankPageModule,
    ],
    declarations: [DashboardComponent, SidebarComponent],
    exports: [DashboardComponent, SidebarComponent]
})

export class DashboardModule { }
