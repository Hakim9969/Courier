import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/layout/footer/footer.component';
import { NavbarComponent } from '../../shared/layout/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FooterComponent, NavbarComponent],
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.css'
})
export class TrackOrderComponent {
  parcel: any = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('sendit_current_user');
    if (!user) return;
    const currentUser = JSON.parse(user);
    const stored = localStorage.getItem('parcels');
    const allParcels = stored ? JSON.parse(stored) : [];

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Find parcel by ID
        this.parcel = allParcels.find((p: any) => String(p.id) === String(id));
      } else {
        // Find first pending parcel for current user
        this.parcel = allParcels.find((p: any) =>
          (p.senderEmail === currentUser.email || p.email === currentUser.email) && p.status === 'Pending'
        );
      }
    });
  }
}
