import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { OfflineBannerComponent } from '../../../shared/components/offline-banner/offline-banner';
import { AdminRealtimeService } from '../services/admin-realtime.service';
import { Store } from '@ngrx/store';
import { selectUnreadNotifications } from '../../../store/auth/auth.selectors';
import { ToolbarNotificationsComponent } from '../../../shared/components/toolbar-notifications/toolbar-notifications';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    OfflineBannerComponent,
    ToolbarNotificationsComponent,
  ],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() || sidenavOpen()"
        (openedChange)="onSidenavChange($event)"
        [fixedInViewport]="isMobile()"
        class="side-nav admin-side"
      >
        <div class="brand">
          <span class="brand-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
            </svg>
          </span>
          <div class="brand-text">
            <span class="brand-title">AutoSOS</span>
            <span class="brand-sub">Administración</span>
          </div>
        </div>
        <mat-nav-list class="nav-list">
          <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>analytics</mat-icon>
            <span matListItemTitle>KPIs operativos</span>
          </a>
          <a mat-list-item routerLink="/admin/usuarios" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>group</mat-icon>
            <span matListItemTitle>Usuarios</span>
          </a>
          <a mat-list-item routerLink="/admin/talleres" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>store</mat-icon>
            <span matListItemTitle>Talleres</span>
          </a>
          <a mat-list-item routerLink="/admin/comision" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>percent</mat-icon>
            <span matListItemTitle>Comisión</span>
          </a>
          <a mat-list-item routerLink="/admin/planes" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>card_membership</mat-icon>
            <span matListItemTitle>Planes suscripción</span>
          </a>
          <a mat-list-item routerLink="/admin/incidentes" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>warning</mat-icon>
            <span matListItemTitle>Incidentes</span>
          </a>
          <a mat-list-item routerLink="/admin/pagos" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
            <span matListItemTitle>Pagos</span>
          </a>
          <a mat-list-item routerLink="/admin/reportes" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>assessment</mat-icon>
            <span matListItemTitle>Reportes</span>
          </a>
          <a mat-list-item routerLink="/admin/notificaciones" routerLinkActive="active" (click)="closeNavMobile()">
            <mat-icon matListItemIcon>notifications</mat-icon>
            <span matListItemTitle>Notificaciones</span>
            @if (unread() > 0) {
              <span class="nav-badge">{{ unread() }}</span>
            }
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="main">
        <mat-toolbar class="app-top-toolbar top-bar">
          @if (isMobile()) {
            <button mat-icon-button type="button" (click)="openNav()" aria-label="Abrir menú">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="toolbar-fill"></span>
          <app-toolbar-notifications />
          <span class="user-name">{{ auth.currentUser()?.first_name }}</span>
          <button mat-icon-button type="button" (click)="auth.logout()" aria-label="Salir">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        <app-offline-banner />
        <div class="content admin-content"><router-outlet /></div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .shell {
      min-height: 100dvh;
      background: var(--app-bg, #f1f5f9);
    }
    .side-nav.admin-side {
      width: min(280px, 86vw);
      background: #0f0c24;
      border-right: none;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 1.5rem 1.25rem 1.25rem;
      border-bottom: 1px solid rgb(255 255 255 / 8%);
    }
    .brand-mark {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .brand-title {
      font-weight: 800;
      font-size: 0.95rem;
      letter-spacing: -0.03em;
      color: #ffffff;
    }
    .brand-sub {
      font-size: 0.7rem;
      color: rgb(255 255 255 / 40%);
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .nav-list a.mat-mdc-list-item {
      border-radius: 10px !important;
      margin: 2px 8px;
      width: calc(100% - 16px) !important;
      color: rgb(255 255 255 / 60%) !important;
    }
    .nav-list a.mat-mdc-list-item .mdc-list-item__primary-text {
      color: rgb(255 255 255 / 60%) !important;
    }
    .nav-list a.mat-mdc-list-item.active {
      background: rgb(245 158 11 / 18%) !important;
      color: #fde68a !important;
    }
    .nav-list a.mat-mdc-list-item.active .mdc-list-item__primary-text {
      color: var(--app-accent-hover, #0f766e) !important;
    }
    .nav-list a.mat-mdc-list-item.active mat-icon {
      color: #fbbf24 !important;
    }
    .nav-list a.mat-mdc-list-item mat-icon {
      color: var(--app-text-muted, #64748b);
    }
    .main {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 4;
      min-height: 56px;
    }
    .toolbar-fill {
      flex: 1;
    }
    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--app-text-muted, #64748b);
      margin-right: 4px;
      max-width: 42vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .content {
      flex: 1;
      padding: clamp(12px, 2.5vw, 24px);
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .nav-badge {
      margin-left: auto;
      background: #dc2626;
      color: #fff;
      border-radius: 999px;
      padding: 0 7px;
      font-size: 11px;
      font-weight: 700;
      min-width: 1.25rem;
      text-align: center;
    }
  `,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly realtime = inject(AdminRealtimeService);
  private readonly store = inject(Store);
  private readonly platformId = inject(PLATFORM_ID);
  readonly unread = this.store.selectSignal(selectUnreadNotifications);

  readonly isMobile = toSignal(
    this.breakpoint.observe('(max-width: 959.98px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly sidenavOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile()) this.sidenavOpen.set(false);
      });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      void this.realtime.start();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.realtime.stop();
    }
  }

  onSidenavChange(opened: boolean): void {
    if (this.isMobile()) this.sidenavOpen.set(opened);
  }

  openNav(): void {
    this.sidenavOpen.set(true);
  }

  closeNavMobile(): void {
    if (this.isMobile()) this.sidenavOpen.set(false);
  }
}
