import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class StatisticsService {
  constructor(private http: Http) {
  }

  getStoriesPerUser(from:string,to:string) {
    var query = '?fromDate='+from+'&toDate='+to;
    var url = 'http://localhost:8080/statistics/stories_per_user'+query;
    return this.http.get(url, {withCredentials:true})
      .map(res => res.json());
  }

  getStoriesPerLocation(from:string,to:string) {
    var query = '?fromDate='+from+'&toDate='+to;
    var url = 'http://localhost:8080/statistics/stories_per_location'+query;
    return this.http.get(url, {withCredentials:true})
      .map(res => res.json());
  }

  getViewsPerStory(from:string,to:string) {
    var query = '?fromDate='+from+'&toDate='+to;
    var url = 'http://localhost:8080/statistics/views_per_story'+query;
    return this.http.get(url, {withCredentials:true})
      .map(res => res.json());
  }

  getViewsPerLocation(from:string,to:string) {
    var query = '?fromDate='+from+'&toDate='+to;
    var url = 'http://localhost:8080/statistics/views_per_location'+query;
    return this.http.get(url, {withCredentials:true})
      .map(res => res.json());
  }

}
