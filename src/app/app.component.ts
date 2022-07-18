import { Component, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  FONT_LIST = [
    'Roboto',
    'serif',
    'sans-serif',
    'Bebas Neue',
    'Bubblegum Sans',
    'M PLUS Rounded 1c',
    'Open Sans',
  ]

  title = 'TextPortraitGenerator';
  fillText: string = "Test Phrase!";
  fontSizePx: number = 12;
  letterSpacingPx: number = 0;
  imageCanvas: HTMLCanvasElement|null = null;
  outputCanvas: HTMLCanvasElement|null = null;
  imagePreview: HTMLImageElement|null = null;
  outputHeight: number = 0;
  outputWidth: number = 0;
  uploadedFile: File|null = null;
  uploadedImage: HTMLImageElement = new Image(); 
  aspectRatio: number = 0;
  progressPercentage = 100;
  backgroundColor = '#000000';
  useBoldText: boolean = false;
  useItalicText: boolean = false;
  removeSpaces: boolean = false;
  selectedFont: string = this.FONT_LIST[0];


  ngOnInit() {
    this.imageCanvas = (document.getElementById('image') as HTMLCanvasElement) ;
    this.outputCanvas = (document.getElementById('portrait') as HTMLCanvasElement);
    this.imagePreview = (document.getElementById('uploadImagePreview') as HTMLImageElement)
  }

  onOutputHeightChange() {
    if (this.outputWidth > this.outputHeight) {
      this.outputWidth = this.outputHeight / this.aspectRatio;
    } else {
      this.outputWidth = this.outputHeight * this.aspectRatio;
    }
    
    this.redrawCanvas();
  }

  onOutputWidthChange() {
    if (this.outputWidth > this.outputHeight) {
      this.outputHeight = this.outputWidth / this.aspectRatio;
    } else {
      this.outputHeight = this.outputWidth * this.aspectRatio;
    }
    
    this.redrawCanvas();
  }

  redrawCanvas() {
    this.clearCanvas();
    this.drawImageCanvas();
    this.drawTextPortrait();
  }

  onFileSelect(event: Event): void {
    
    const files = (event.target as HTMLInputElement).files || [];
    const reader = new FileReader();
  
    reader.onload = (e: Event) => {
      this.uploadedImage = new Image();
      this.uploadedImage.onload = () => { 
        this.outputHeight = this.uploadedImage.height;
        this.outputWidth = this.uploadedImage.width;
        this.aspectRatio = this.outputWidth / this.outputHeight;

        this.redrawCanvas()
      }
      this.uploadedImage.src = (reader.result as string);

      if (this.imagePreview) {
        this.imagePreview.src = (reader.result as string);
      }
    }
    
    this.uploadedFile = files[0];
    reader.readAsDataURL(files[0]);
    this.drawTextPortrait();
  }

  clearCanvas() {
    if (!this.outputCanvas || !this.imageCanvas) return;

    const outputContext = this.outputCanvas.getContext('2d');
    const imageContext = this.imageCanvas.getContext('2d');

    outputContext?.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
    imageContext?.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
  }

  downloadImage() {
    if (!this.outputCanvas) return;

    let link = document.createElement("a");
    link.href = this.outputCanvas.toDataURL();
    link.download = `text-portrait-${Date.now()}.png`;
    link.click();
  }

  drawTextPortrait(): void {
    if (this.fillText.length <= 0) return;
    if (!this.outputCanvas || !this.imageCanvas) return;

    this.outputCanvas.height = this.outputHeight;
    this.outputCanvas.width = this.outputWidth;

    this.progressPercentage = 0;

    let drawX = 0;
    let drawY = 0;
    let imageCanvasContext = this.imageCanvas.getContext('2d');
    let outputCanvasContext = this.outputCanvas.getContext('2d');

    if (outputCanvasContext && this.backgroundColor != '') {
      outputCanvasContext.fillStyle = this.backgroundColor;
      outputCanvasContext.fillRect(0, 0, this.outputCanvas.width, this.outputCanvas.height)
    }

    outputCanvasContext = this.outputCanvas?.getContext('2d');

    if (!this.imageCanvas || !this.outputCanvas || !imageCanvasContext || !outputCanvasContext) return;

    while (drawY < this.outputCanvas.height) {
      this.progressPercentage = drawY / this.outputHeight * 100;
      for (const c of this.fillText) {
          if (this.removeSpaces && c === ' ') continue;

          let imagePixelData = imageCanvasContext.getImageData(drawX, drawY, 1, 1);
          // console.log(imagePixelData);

          let font = '';

          if (this.useBoldText) font += 'bold ';
          if (this.useItalicText) font += 'italic '

          font += `${this.fontSizePx}px `;
          font += this.selectedFont;
          
          outputCanvasContext.font = font;
          outputCanvasContext.fillStyle = `rgba(${imagePixelData.data})`;
          outputCanvasContext.fillText(c, drawX, drawY);

          drawX += outputCanvasContext.measureText(c).width + this.letterSpacingPx;
          
          if (drawX >= this.outputCanvas.width)  {
              drawX = 0;
              drawY += this.fontSizePx - 2;
          }
      }

      if (!this.removeSpaces) {
        drawX += outputCanvasContext.measureText(" ").width - 1;
      }
  }

  this.progressPercentage = 100;
  }

  drawImageCanvas(): void {
    if (this.imageCanvas && this.uploadedImage) {
      let canvasContext = this.imageCanvas?.getContext('2d');
      this.imageCanvas.height = this.outputHeight;
      this.imageCanvas.width = this.outputHeight;
    
      canvasContext?.drawImage(this.uploadedImage, 0, 0, this.outputWidth, this.outputHeight)
    }
  }
}
