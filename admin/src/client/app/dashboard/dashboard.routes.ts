import { Route } from '@angular/router';

import { HomeRoutes } from './home/index';
import { BlankPageRoutes } from './blank-page/index';
import { BSComponentRoutes } from './bs-component/index';
import { StoriesComponentRoutes } from './stories/index';
import { DestinationsComponentRoutes } from './destinations/index';
import {UsersComponentRoutes} from './users/index';

import { DashboardComponent } from './index';

export const DashboardRoutes: Route[] = [
  	{
    	path: 'dashboard',
    	component: DashboardComponent,
    	children: [
	    	...HomeRoutes,
	    	...BSComponentRoutes,
        ...StoriesComponentRoutes,
        ...DestinationsComponentRoutes,
        ...UsersComponentRoutes,
	    	...BlankPageRoutes
    	]
  	}
];
