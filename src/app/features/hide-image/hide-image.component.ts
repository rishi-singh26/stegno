import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
// import { SimpleImage } from '../../services/stegno';

@Component({
  selector: 'app-hide-image',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './hide-image.component.html',
  styleUrl: './hide-image.component.scss'
})
export class HideImageComponent {
  @ViewChild('hiddenFileInput', { static: false }) hiddenFileInput!: ElementRef;
  @ViewChild('hiddenFileCanvas', { static: false }) hiddenFileCanvas!: ElementRef;

  hiddenFile: File | null = null;

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
    map(result => result.matches),
    shareReplay()
  );

  onHiddenFileSelect(): void {
    this.hiddenFileInput.nativeElement.click();
  }

  onHiddenFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.hiddenFile = input.files[0];
    }
  }

  resetHiddenFile(): void {
    this.hiddenFile = null;
  }
}
