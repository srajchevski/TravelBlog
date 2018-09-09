import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class UpdateService {
  private logged = new Subject<boolean>();
  // Observable boolean streams
  newLog$ = this.logged.asObservable();

  change(log: boolean) {
    this.logged.next(log);
  }
}

