import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuOpen = new BehaviorSubject<boolean>(false);
  menuOpen$ = this.menuOpen.asObservable();

  toggle() {
    this.menuOpen.next(!this.menuOpen.value);
  }
}