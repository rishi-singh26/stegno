import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ByteConverterService, SizeUnit } from '../../services/byte-converter.service';

@Component({
  selector: 'app-extract-image',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './extract-image.component.html',
  styleUrl: './extract-image.component.scss'
})
export class ExtractImageComponent {
  @ViewChild('imageWithSecretInput', { static: false }) imageWithSecretInput!: ElementRef;

  imageWithSecret: File | null = null;
  imageWithSecretSrc: string | ArrayBuffer | null = null;
  imageWithSecretResolution: string = ''; // 1260 × 774 pixels

  resultImage: HTMLImageElement | null = null;

  isExecuting = false;

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
    map(result => result.matches),
    shareReplay()
  );

  onFileSelect(): void {
    this.imageWithSecretInput.nativeElement.click();
  }

  onImageWithSecretChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageWithSecret = input.files[0];

      const reader = new FileReader();
      // This method is called once the file has been read
      reader.onload = () => {
        this.imageWithSecretSrc = reader.result;
        this.getImageResolution();
      };
      reader.readAsDataURL(this.imageWithSecret); // Read the file as a Data URL
    }
  }

  resetHiddenFile(): void {
    this.imageWithSecret = null;
    this.imageWithSecretSrc = null;
  }

  getImageResolution(): void {
    if (this.imageWithSecretSrc !== null) {
      const hImg = new Image();
      hImg.src = this.imageWithSecretSrc as string;
      hImg.onload = () => {
        this.imageWithSecretResolution = `${hImg.width} × ${hImg.height} pixels`;
      };
    }
  }

  async onExecute(): Promise<void> {
    if (this.imageWithSecret !== null) {
      this.isExecuting = true;
      this.resultImage = await this.extractSecretImageFromBackground(this.imageWithSecret);
      this.isExecuting = false;
    }
  }

  extractSecretImageFromBackground(backgroundFile: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const bgReader = new FileReader();

      // Load the background image
      bgReader.onload = () => {
        const backgroundImage = new Image();
        backgroundImage.src = bgReader.result as string;

        backgroundImage.onload = () => {
          // Create canvas for background image
          const bgCanvas = document.createElement('canvas');
          bgCanvas.width = backgroundImage.width;
          bgCanvas.height = backgroundImage.height;

          const bgCtx = bgCanvas.getContext('2d');
          if (!bgCtx) {
            reject(new Error('Failed to get canvas 2D context.'));
            return;
          }

          // Draw the background image onto the canvas
          bgCtx.drawImage(backgroundImage, 0, 0);

          // Get image data from the background image
          const bgImageData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height);
          const bgPixels = bgImageData.data; // Background image RGBA values

          // Create a canvas for the extracted secret image
          const secretCanvas = document.createElement('canvas');
          secretCanvas.width = bgCanvas.width;
          secretCanvas.height = bgCanvas.height;
          const secretCtx = secretCanvas.getContext('2d');
          if (!secretCtx) {
            reject(new Error('Failed to get secret canvas 2D context.'));
            return;
          }

          // Create a new ImageData object for the secret image
          const secretImageData = secretCtx.createImageData(secretCanvas.width, secretCanvas.height);
          const secretPixels = secretImageData.data;

          // Loop through all the pixels to extract the secret image
          for (let i = 0; i < bgPixels.length; i += 4) {
            // Extract the LSBs of the background image (which contain the MSBs of the secret image)
            const redLSB = bgPixels[i] & 0b00001111;
            const greenLSB = bgPixels[i + 1] & 0b00001111;
            const blueLSB = bgPixels[i + 2] & 0b00001111;

            // Shift the bits to reconstruct the original secret image's MSBs
            secretPixels[i] = redLSB << 4;       // Red
            secretPixels[i + 1] = greenLSB << 4; // Green
            secretPixels[i + 2] = blueLSB << 4;  // Blue
            secretPixels[i + 3] = 255;           // Fully opaque
          }

          // Put the secret image pixel data into the canvas
          secretCtx.putImageData(secretImageData, 0, 0);

          // Convert the canvas to a data URL
          const dataUrl = secretCanvas.toDataURL('image/png');

          // Create an HTMLImageElement and set the data URL as its source
          const secretImageElement = new Image();
          secretImageElement.src = dataUrl;

          // Resolve the HTMLImageElement
          resolve(secretImageElement);
        };

        backgroundImage.onerror = reject;
      };

      // Read the background image file
      bgReader.readAsDataURL(backgroundFile);
    });
  }

  downloadResult(): void {
    if (this.resultImage !== null) {
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = this.resultImage.src;
      link.download = 'steganography-image.png';
      // Trigger the download
      link.click();
    }
  }

  getImageSize(sizeinBytes: number): string {
    return ByteConverterService.fromBytes(sizeinBytes).toHumanReadable(SizeUnit.MB);
  }
}
