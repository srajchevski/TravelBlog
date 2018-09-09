import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class UserService {
  constructor(private http: Http) { }

  register(data:any) {
    return this.http.post('http://localhost:8080/user', data)
      .map(res => res.json());
  }

  getMap(id:string) {
    return this.http.get('http://localhost:8080/user/map/'+id)
      .map(res => res.json());
  }

  editUser(data:any,id:string) {

    return this.http.put('http://localhost:8080/user/'+id, data, {withCredentials: true})
      .map(res => res.json());
  }

  logIn(user:string,pass:string) {
    let headers = new Headers({'Content-Type': 'text/plain; charset=UTF-8'});

    return this.http.post('http://localhost:8080/user/login', {'user':user, 'password':pass}, { headers: headers, withCredentials: true })
      .map(res => res.json());
  }
  logOut() {
    let headers = new Headers({'Content-Type': 'text/plain; charset=UTF-8',});

    return this.http.post('http://localhost:8080/user/logout',{}, {headers: headers, withCredentials: true})
      .map((res:any) => res.json());
  }

  getUser(id:string) {
    var url = 'http://localhost:8080/user/'+id;
    return this.http.get(url)
      .map(res => res.json());
  }

  getAllUsers() {
    return this.http.get('http://localhost:8080/user')
      .map(res => res.json());
  }

  getAudio() {
    return this.http.get('http://localhost:8080/user/compress/welcome')
      .map(res => res.json());
  }
}
