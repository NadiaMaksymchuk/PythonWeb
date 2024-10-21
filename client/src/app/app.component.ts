import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./components/footer/footer.component";
import { ContactComponent } from "./components/contact/contact.component";
import { MainContentComponent } from "./components/main-content/main-content.component";
import { MenuComponent } from "./components/menu/menu.component";
import { HeaderComponent } from "./components/header/header.component";
import { HistoryComponent } from "./components/history/history.component";
import { ServicesComponent } from "./components/services/services.component";
import { AboutComponent } from "./components/about/about.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, ContactComponent, MainContentComponent, MenuComponent, HeaderComponent, HistoryComponent, ServicesComponent, AboutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'client';
}
