import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ByteConverterService, SizeUnit } from '../../services/byte-converter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hide-text',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, FormsModule],
  templateUrl: './hide-text.component.html',
  styleUrl: './hide-text.component.scss'
})
export class HideTextComponent {
  @ViewChild('backgroundImageInput', { static: false }) backgroundImageInput!: ElementRef;

  backgroundImage: File | null = null;
  backgroundImageSrc: string | ArrayBuffer | null = null;
  backgroundImageResolution: string = ''; // 1260 × 774 pixels

  resultImage: HTMLImageElement | null = null;

  isExecuting = false;
  secretText = '';
  maxTextLength = 0;

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
    map(result => result.matches),
    shareReplay()
  );

  onFileSelect(): void {
    this.backgroundImageInput.nativeElement.click();
  }

  async onImageWithSecretChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.backgroundImage = input.files[0];
      this.maxTextLength = await this.getMaxTextLength(input.files[0]);
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
    this.backgroundImage = null;
    this.backgroundImageSrc = null;
  }

  getImageResolution(): void {
    if (this.backgroundImageSrc !== null) {
      const hImg = new Image();
      hImg.src = this.backgroundImageSrc as string;
      hImg.onload = () => {
        this.backgroundImageResolution = `${hImg.width} × ${hImg.height} pixels`;
      };
    }
  }

  async onExecute(): Promise<void> {
    if (this.backgroundImage !== null) {
      this.isExecuting = true;
      this.resultImage = await this.hideTextInImage(this.backgroundImage, this.secretText);
      this.isExecuting = false;
    }
  }

  hideTextInImage(imageFile: File, secretText: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const imgReader = new FileReader();

      // Load the image file
      imgReader.onload = () => {
        const image = new Image();
        image.src = imgReader.result as string;

        image.onload = () => {
          // Create a canvas to draw the image
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas 2D context.'));
            return;
          }

          // Draw the image onto the canvas
          ctx.drawImage(image, 0, 0);

          // Get the image data (pixel RGBA values)
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imgData.data; // Image RGBA values

          // Convert the secret text to binary
          const binaryText = this.textToBinary(secretText + '\0'); // '\0' as end delimiter

          // Check if the image has enough pixels to hide the text
          if (binaryText.length > pixels.length) {
            reject(new Error('The image is too small to hide the text.'));
            return;
          }

          // Embed the binary text into the image's pixel data
          let binaryIndex = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            // Embed each RGB value's least significant bit with a bit from the binary text
            if (binaryIndex < binaryText.length) {
              pixels[i] = (pixels[i] & 0b11111110) | parseInt(binaryText[binaryIndex]); // Red
              binaryIndex++;
            }
            if (binaryIndex < binaryText.length) {
              pixels[i + 1] = (pixels[i + 1] & 0b11111110) | parseInt(binaryText[binaryIndex]); // Green
              binaryIndex++;
            }
            if (binaryIndex < binaryText.length) {
              pixels[i + 2] = (pixels[i + 2] & 0b11111110) | parseInt(binaryText[binaryIndex]); // Blue
              binaryIndex++;
            }

            // Alpha channel (pixels[i + 3]) is ignored to avoid transparency issues
          }

          // Put the modified pixel data back into the canvas
          ctx.putImageData(imgData, 0, 0);

          // Resolve the modified canvas
          const dataUrl = canvas.toDataURL('image/png');

          // Create an HTMLImageElement and set the data URL as its source
          const secretImageElement = new Image();
          secretImageElement.src = dataUrl;
          resolve(secretImageElement);
        };

        image.onerror = reject;
      };

      // Read the image file
      imgReader.readAsDataURL(imageFile);
    });
  }

  // Helper function to convert text to binary
  textToBinary(text: string): string {
    return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
  }

  getMaxTextLength(imageFile: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const imgReader = new FileReader();

      // Load the image file
      imgReader.onload = () => {
        const image = new Image();
        image.src = imgReader.result as string;

        image.onload = () => {
          const width = image.width;
          const height = image.height;

          // Calculate the maximum length of the string that can be hidden
          const maxLength = Math.floor((width * height * 3) / 8);

          resolve(maxLength);
        };

        image.onerror = reject;
      };

      imgReader.readAsDataURL(imageFile);
    });
  }

  downloadResult(): void {
    if (this.resultImage !== null) {
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = this.resultImage.src;
      link.download = 'hide-text.png';
      // Trigger the download
      link.click();
    }
  }

  getImageSize(sizeinBytes: number): string {
    return ByteConverterService.fromBytes(sizeinBytes).toHumanReadable(SizeUnit.MB);
  }
}
