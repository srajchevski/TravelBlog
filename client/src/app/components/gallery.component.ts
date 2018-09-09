import {Component, Input} from '@angular/core';
 
@Component({
  selector: 'gallery',
  templateUrl:'./gallery.component.html',
  styleUrls:['../../css/gallery.component.css']
})
export class GalleryComponent { 
 
   @Input() datasource: string[];
  selectedImage: string;

   imgCarousel: string[];
   
   constructor(){
     //this.imgCarousel = this.datasource.slice(1);
     console.log("gallery constructor");
     //console.log(this.datasource);
   }
 
  setSelectedImage(image:string){
      this.selectedImage= image;	
     // this.imgCarousel = this.datasource;
       this.imgCarousel = this.datasource.slice(0);
     
      let index: number = this.imgCarousel.indexOf(image);
        if (index !== -1) {
            this.imgCarousel.splice(index, 1);
        }        
      console.log(this.imgCarousel);
   }

  /*  navigate(forward:boolean){
   var index = this.datasource.indexOf(this.selectedImage)+(forward ? 1: -1);
   if(index >= 0 && index < this.datasource.length){
      this.selectedImage = this.datasource[index];  
   }
  }*/
}
