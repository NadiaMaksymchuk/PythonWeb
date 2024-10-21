import { Component, inject } from '@angular/core';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  isOpen = false;
  private menuService: MenuService = inject(MenuService);


  ngOnInit(): void {
    this.menuService.menuOpen$.subscribe(open => {
      this.isOpen = open;
    });
  }

  toggleMenu() {
    this.menuService.toggle();
  }
}
