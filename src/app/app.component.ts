import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { appRoutes } from './constants/route-name.constatns';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private router: Router = inject(Router);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Tablet, Breakpoints.Handset]).pipe(
    map(result => result.matches),
    shareReplay()
  );

  getPageTitle(): string {
    switch (this.router.url) {
      case '/' + appRoutes.landing:
        return 'Hide Image in Image'
      case '/' + appRoutes.hideImage:
        return 'Hide Image in Image'
      case '/' + appRoutes.extractImage:
        return 'Extract Image from Image'
      case '/' + appRoutes.hideText:
        return 'Hide Text in Image'
      case '/' + appRoutes.extractText:
        return 'Extract Text from Image'
      default:
        return '';
    }
  }
}
