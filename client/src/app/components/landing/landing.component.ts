import { Component } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { ContactComponent } from "../contact/contact.component";
import { HistoryComponent } from "../history/history.component";
import { ServicesComponent } from "../services/services.component";
import { AboutComponent } from "../about/about.component";
import { MainContentComponent } from "../main-content/main-content.component";
import { MenuComponent } from "../menu/menu.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FooterComponent, ContactComponent, HistoryComponent, ServicesComponent, AboutComponent, MainContentComponent, MenuComponent, HeaderComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

}
