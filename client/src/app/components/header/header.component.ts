import { Component, inject } from '@angular/core';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private menuService: MenuService = inject(MenuService);
  
  toggleMenu() {
    this.menuService.toggle();
  }
}
