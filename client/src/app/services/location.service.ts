import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class LocationService {
  constructor(private http: Http) { }

  incrementViews(id:string) {
    return this.http.put('http://localhost:8080/location/views/'+id, {})
      .map(res => res.json());
  }

  getLocation(id:string) {
    var url = 'http://localhost:8080/location/'+id;
    return this.http.get(url)
      .map(res => res.json());
  }

  getLocations(search="",sort="",limit=0) {
    var query = "?search="+search+"&sort="+sort+"&limit="+limit;
    var url = 'http://localhost:8080/location'+query;
    return this.http.get(url)
      .map(res => res.json());
  }

  rateLocation(num:number, id:string) {
    var url = 'http://localhost:8080/location/rating/'+id;
    return this.http.put(url, {rating:num}, {withCredentials: true})
      .map(res => res.json());
  }

  getLikes(id:string) {
    var url = 'http://localhost:8080/location/votes/'+id;
    return this.http.get(url, {withCredentials: true})
      .map(res => res.json());
  }

  postComment(comment:string,id:string) {
    var url = 'http://localhost:8080/location/comment/'+id;
    return this.http.put(url, {comment:comment},{withCredentials: true})
      .map(res => res.json());
  }

  removeComment(story_id:string,comment_id:string) {
    var url = 'http://localhost:8080/location/delete_comment/'+story_id;
    return this.http.put(url, {comment_id:comment_id},{withCredentials: true})
      .map(res => res.json());
  }
}
