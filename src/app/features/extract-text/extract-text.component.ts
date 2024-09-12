import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ByteConverterService, SizeUnit } from '../../services/byte-converter.service';

@Component({
  selector: 'app-extract-text',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './extract-text.component.html',
  styleUrl: './extract-text.component.scss'
})
export class ExtractTextComponent {
  @ViewChild('imageWithSecretInput', { static: false }) imageWithSecretInput!: ElementRef;

  imageWithSecret: File | null = null;
  imageWithSecretSrc: string | ArrayBuffer | null = null;
  imageWithSecretResolution: string = ''; // 1260 × 774 pixels
  resultText = '';
  isExecuting = false;

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
    map(result => result.matches),
    shareReplay()
  );

  onFileSelect(): void {
    this.imageWithSecretInput.nativeElement.click();
  }

  onHiddenFileChange(event: Event): void {
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
    this.imageWithSecretInput.nativeElement.value = '';
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
      this.resultText = await this.extractTextFromImage(this.imageWithSecret);
      this.isExecuting = false;
    }
  }

  extractTextFromImage(imageFile: File): Promise<string> {
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

          let binaryText = '';

          // Extract the binary text from the image's pixel data
          for (let i = 0; i < pixels.length; i += 4) {
            binaryText += (pixels[i] & 0b00000001).toString(); // Red
            binaryText += (pixels[i + 1] & 0b00000001).toString(); // Green
            binaryText += (pixels[i + 2] & 0b00000001).toString(); // Blue
          }

          // Convert the binary string to text
          const extractedText = this.binaryToText(binaryText);

          // Resolve the extracted text
          resolve(extractedText);
        };

        image.onerror = reject;
      };

      // Read the image file
      imgReader.readAsDataURL(imageFile);
    });
  }

  async copyExtractedText(): Promise<void> {
    if (this.resultText.length > 0) {
      await navigator.clipboard.writeText(this.resultText); 
    }
  }

  // Helper function to convert binary string to text
  binaryToText(binary: string): string {
    const textArray = [];
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.slice(i, i + 8);
      if (byte === '00000000') break; // Stop at null character
      textArray.push(String.fromCharCode(parseInt(byte, 2)));
    }
    return textArray.join('');
  }


  getImageSize(sizeinBytes: number): string {
    return ByteConverterService.fromBytes(sizeinBytes).toHumanReadable(SizeUnit.MB);
  }
}
