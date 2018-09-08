import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class StoryService {
  constructor(private http: Http) { }

  incrementViews(id:string) {
    return this.http.put('http://localhost:8080/review/views/'+id, {})
      .map(res => res.json());
  }

  createStory(data:any) {
    return this.http.post('http://localhost:8080/review', data, {withCredentials: true})
      .map(res => res.json());
  }

  editStory(data:any,id:string) {
    return this.http.put('http://localhost:8080/review/'+id, data, {withCredentials: true})
      .map(res => res.json());
  }

  getStoriesByUser(id:string) {
    return this.http.get('http://localhost:8080/review?user_id='+id)
      .map(res => res.json());
  }

  getStory(id:string) {
    var url = 'http://localhost:8080/review/'+id;
    console.log(url);
    return this.http.get(url)
      .map(res => res.json());
  }

  getStoriesGeo(lat:number,lon:number,limit:number=0,max:number=550) {
    var query = '?lat='+lat+'&lon='+lon+'&limit='+limit+'&max='+max;
    var url = 'http://localhost:8080/review/geo'+query;
    return this.http.get(url)
      .map(res => res.json());
  }

  getStoriesLikes(id:string,limit:number=6,max:number=600) {
    var query = '?limit='+limit+'&max='+max;
    var url = 'http://localhost:8080/review/by_rating/'+id+query;
    return this.http.get(url, {withCredentials: true})
      .map(res => res.json());
  }

  getStories(search='',sort='',limit=0) {
    var query = '?'+search+'&sort='+sort+'&limit='+limit;
    var url = 'http://localhost:8080/review'+query;
    return this.http.get(url)
      .map(res => res.json());
  }

  getStoriesByLocation(loc_id:string) {
    var url = 'http://localhost:8080/review/location/'+loc_id;
    return this.http.get(url)
      .map(res => res.json());
  }

  getTrendingStories() {
    var url = 'http://localhost:8080/review/trending';
    return this.http.get(url)
      .map(res => res.json());
  }

  getLike(id:string) {
    var url = 'http://localhost:8080/review/votes/'+id;
    return this.http.get(url, {withCredentials: true})
      .map(res => res.json());
  }

  rate(id:string) {
    var url = 'http://localhost:8080/review/rating/'+id;
    return this.http.put(url, {},{withCredentials: true})
      .map(res => res.json());
  }

  postComment(comment:string,id:string) {
    var url = 'http://localhost:8080/review/comment/'+id;
    return this.http.put(url, {comment:comment},{withCredentials: true})
      .map(res => res.json());
  }

  removeComment(story_id:string,comment_id:string) {
    var url = 'http://localhost:8080/review/delete_comment/'+story_id;
    return this.http.put(url, {comment_id:comment_id},{withCredentials: true})
      .map(res => res.json());
  }

  removeStory(id:string) {
    var url = 'http://localhost:8080/review/' + id;
    return this.http.delete(url, {withCredentials: true});
  }
}
