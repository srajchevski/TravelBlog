import { Component } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
/**
*	This class represents the lazy loaded HomeComponent.
*/

@Component({
	moduleId: module.id,
	selector: 'home-cmp',
	templateUrl: 'home.component.html',
  providers:[StatisticsService]
})

export class HomeComponent {
  toDate:any = new Date();
  fromDate:any = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7);
  formatedFrom: string='';
  formatedTo: string='';
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  tab:number = 1;
  labels: string[];
  dataset:any;
  chartType:string = 'line';

  constructor(private statsService: StatisticsService) {
    this.changeTab(this.tab);
  }

  changeTab(tab:number) {
    this.tab = tab;
    switch(this.tab) {
      case 1:
        this.dataset = null;
        this.labels = null;
        this.statsService.getStoriesPerUser(this.fromDate,this.toDate).subscribe((res:any)=> {
          this.dataset = res.dataset;
          this.labels = res.dates;
        }, (error:any)=> {
          var msg = JSON.parse(error._body);
          alert(msg.error);
        });
        break;
      case 2:
        this.dataset = null;
        this.labels = null;
        this.statsService.getStoriesPerLocation(this.fromDate,this.toDate).subscribe((res:any)=> {
          this.dataset = res.dataset;
          this.labels = res.dates;
        }, (error:any)=> {
          var msg = JSON.parse(error._body);
          alert(msg.error);
        });
        break;
      case 3:
        this.dataset = null;
        this.labels = null;
        this.statsService.getViewsPerStory(this.fromDate,this.toDate).subscribe((res:any)=> {
          this.dataset = res.dataset;
          this.labels = res.dates;
        });
        break;
      case 4:
        this.dataset = null;
        this.labels = null;
        this.statsService.getViewsPerLocation(this.fromDate,this.toDate).subscribe((res:any)=> {
          this.dataset = res.dataset;
          this.labels = res.dates;
        });
        break;
    }
  }
}
