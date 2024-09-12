import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ByteConverterService, SizeUnit } from '../../services/byte-converter.service';

@Component({
  selector: 'app-hide-image',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './hide-image.component.html',
  styleUrl: './hide-image.component.scss'
})
export class HideImageComponent {
  @ViewChild('hiddenImageInput', { static: false }) hiddenImageInput!: ElementRef;
  @ViewChild('backgroundImageInput', { static: false }) backgroundImageInput!: ElementRef;

  hiddenImage: File | null = null;
  hiddenImageSrc: string | ArrayBuffer | null = null;
  hiddenImageResolution: string = ''; // 1260 × 774 pixels

  backgroundImage: File | null = null;
  backgroundImageSrc: string | ArrayBuffer | null = null;
  backgroundImageResolution: string = ''; // 1260 × 774 pixels

  resultImage: HTMLImageElement | null = null;

  isExecuting = false;

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
    map(result => result.matches),
    shareReplay()
  );

  onFileSelect(isHidden = true): void {
    if (isHidden) {
      this.hiddenImageInput.nativeElement.click();
    } else {
      this.backgroundImageInput.nativeElement.click();
    }
  }

  onHiddenFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.hiddenImage = input.files[0];

      const reader = new FileReader();
      // This method is called once the file has been read
      reader.onload = () => {
        this.hiddenImageSrc = reader.result;
        this.getImageResolution();
      };
      reader.readAsDataURL(this.hiddenImage); // Read the file as a Data URL
    }
  }

  onBackgroundFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.backgroundImage = input.files[0];
      this.backgroundImage.size;
      this.backgroundImage;
      const reader = new FileReader();
      // This method is called once the file has been read
      reader.onload = () => {
        this.backgroundImageSrc = reader.result;
        this.getImageResolution();
      };
      reader.readAsDataURL(this.backgroundImage); // Read the file as a Data URL
    }
  }

  resetHiddenFile(): void {
    this.hiddenImageInput.nativeElement.value = '';
    this.hiddenImage = null;
    this.hiddenImageSrc = null;
  }

  resetBackgroundFile(): void {
    this.backgroundImageInput.nativeElement.value = '';
    this.backgroundImage = null;
    this.backgroundImageSrc = null;
  }

  getImageResolution(): void {
    if (this.hiddenImageSrc !== null) {
      const hImg = new Image();
      hImg.src = this.hiddenImageSrc as string;
      hImg.onload = () => {
        this.hiddenImageResolution = `${hImg.width} × ${hImg.height} pixels`;
      };
    }

    if (this.backgroundImageSrc !== null) {
      const bImg = new Image();
      bImg.src = this.backgroundImageSrc as string;
      bImg.onload = () => {
        this.backgroundImageResolution = `${bImg.width} × ${bImg.height} pixels`;
      };
    }
  }

  async onExecute(): Promise<void> {
    if (this.backgroundImage !== null && this.hiddenImage !== null) {
      this.isExecuting = true;
      this.resultImage = await this.hideSecretImageInBackground(this.backgroundImage, this.hiddenImage);
      this.isExecuting = false;
    }
  }

  hideSecretImageInBackground(backgroundFile: File, secretFile: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const bgReader = new FileReader();
      const secretReader = new FileReader();

      // Load the background image first
      bgReader.onload = () => {
        const backgroundImage = new Image();
        backgroundImage.src = bgReader.result as string;

        // When background image is loaded
        backgroundImage.onload = () => {
          // Load the secret image
          secretReader.onload = () => {
            const secretImage = new Image();
            secretImage.src = secretReader.result as string;

            // When secret image is loaded
            secretImage.onload = () => {
              // Create canvas elements
              const bgCanvas = document.createElement('canvas');
              const secretCanvas = document.createElement('canvas');

              // Ensure both canvases are the same size as the background image
              bgCanvas.width = backgroundImage.width;
              bgCanvas.height = backgroundImage.height;
              secretCanvas.width = backgroundImage.width;
              secretCanvas.height = backgroundImage.height;

              const bgCtx = bgCanvas.getContext('2d');
              const secretCtx = secretCanvas.getContext('2d');

              if (!bgCtx || !secretCtx) {
                reject(new Error('Failed to get canvas 2D contexts.'));
                return;
              }

              // Draw both images onto their respective canvases
              bgCtx.drawImage(backgroundImage, 0, 0);
              secretCtx.drawImage(secretImage, 0, 0, backgroundImage.width, backgroundImage.height);

              // Get image data (pixel RGB values) from both canvases
              const bgImageData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height);
              const secretImageData = secretCtx.getImageData(0, 0, secretCanvas.width, secretCanvas.height);

              const bgPixels = bgImageData.data; // Background image RGBA values
              const secretPixels = secretImageData.data; // Secret image RGBA values

              // Modify the background image by hiding the MSBs of the secret image inside the LSBs of the background image
              for (let i = 0; i < bgPixels.length; i += 4) {
                // Extract the MSBs from the secret image and remove LSBs
                const secretRedMSB = (secretPixels[i] & 0b11110000) >> 4;
                const secretGreenMSB = (secretPixels[i + 1] & 0b11110000) >> 4;
                const secretBlueMSB = (secretPixels[i + 2] & 0b11110000) >> 4;

                // Remove the LSBs from the background image and add the secret MSBs
                bgPixels[i] = (bgPixels[i] & 0b11110000) | secretRedMSB;
                bgPixels[i + 1] = (bgPixels[i + 1] & 0b11110000) | secretGreenMSB;
                bgPixels[i + 2] = (bgPixels[i + 2] & 0b11110000) | secretBlueMSB;
              }

              // Put the modified pixel data back into the background canvas
              bgCtx.putImageData(bgImageData, 0, 0);

              // Create a new image from the modified canvas and return it
              const resultImage = new Image();
              resultImage.onload = () => {
                resolve(resultImage);
              };
              resultImage.onerror = reject;

              resultImage.src = bgCanvas.toDataURL(); // Get the base64 URL of the modified canvas image
            };

            secretImage.onerror = reject;
          };

          // Read the secret image file
          secretReader.readAsDataURL(secretFile);
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
