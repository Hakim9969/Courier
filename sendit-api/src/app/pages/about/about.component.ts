import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { FooterComponent } from '../../shared/layout/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {}
