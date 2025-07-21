import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/layout/footer/footer.component';

@Component({
  selector: 'app-track-order',
  imports: [CommonModule, FooterComponent],
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.css'
})
export class TrackOrderComponent {

}
