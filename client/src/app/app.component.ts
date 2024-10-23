import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { ContactComponent } from "./components/contact/contact.component";
import { HistoryComponent } from "./components/history/history.component";
import { ServicesComponent } from "./components/services/services.component";
import { AboutComponent } from "./components/about/about.component";
import { MainContentComponent } from "./components/main-content/main-content.component";
import { MenuComponent } from "./components/menu/menu.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    HeaderComponent,
    FooterComponent,
    RouterOutlet,
    ContactComponent,
    HistoryComponent,
    ServicesComponent,
    AboutComponent,
    MainContentComponent,
    MenuComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'scp-landing-page';
}
