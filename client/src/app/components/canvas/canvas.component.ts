import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { StoryService } from '../../services/story.service';
import * as THREE from 'three';

@Component({
  selector: 'picture-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  providers: [StoryService]
})
export class CanvasComponent implements AfterViewInit {
  /* HELPER PROPERTIES (PRIVATE PROPERTIES) */
  private camera: THREE.PerspectiveCamera;
  private get canvas() : HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  @ViewChild('canvas')
  private canvasRef: ElementRef;
  private cube: any;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  /* DATA */
  @Input()
  public data: any[];

  /* WEB SOCKET */
  public ws: WebSocket = new WebSocket('ws://localhost:8080/review/picture');

  /* CUBE PROPERTIES */
  @Input()
  public size: number = 200;

  /* STAGE PROPERTIES */
  @Input()
  public cameraZ: number = 400;
  @Input()
  public fieldOfView: number = 70;
  @Input('nearClipping')
  public nearClippingPane: number = 1;
  @Input('farClipping')
  public farClippingPane: number = 1000;

  /* DEPENDENCY INJECTION (CONSTRUCTOR) */
  constructor(public storyService: StoryService) { }

  createImg() {
    let component: CanvasComponent = this;
    let list_pixelsR:any = [], list_pixelsG:any = [], list_pixelsB:any = [];
    let pixelsR:any = new Array(), pixelsG:any = new Array(), pixelsB:any = new Array();

    for (let i=0; i<this.data.length; i++) {
      let path = this.data[i].split("/")[2];
      path = path.split(".")[0];
      console.log("IMG path: ", path);

      component.ws.onopen = function () {
        component.ws.send("path="+path);
      };
      component.ws.onmessage = function (msg: any) {
        console.log("RECEIVED: ", msg, msg.data);
        let arrayBuffer;
        let fileReader = new FileReader();
        fileReader.onload = function (event:any) {
          arrayBuffer = event.target.result;
          var arrBf = new Uint16Array(arrayBuffer);
          console.log(arrBf);
          const arr_len = (arrBf.length-3)/3;
          if (arrBf[0] == 1) {
            pixelsR = Create2DArray(arr_len);
            pixelsG = Create2DArray(arr_len);
            pixelsB = Create2DArray(arr_len);

            firstTier(arrBf, arr_len);
          }
          else if (arrBf[0] == 2) {
            secondTier(arrBf, arr_len);
          }
          else if (arrBf[0] == 3) {
            thirdTier(arrBf, arr_len);
          }
          else if (arrBf[0] == 4) {
            lastTier(arrBf, arr_len);
          }
        };
        fileReader.readAsArrayBuffer(msg.data);
      };
      component.ws.onclose = function () {
        console.log("DISCONNECTED");
      };
    }

       //this.storyService.getDCTpicture(path).subscribe(img_data => {
       //let list_pix:any = Create2DArray(img_data.first.length);

       function firstTier(first:any, len:number) {
           console.log("START #1");
           const height:number = first[1], width:number = first[2];

           for (let ind=0, fi=3; ind<len; ind++, fi+=3) {
               pixelsR[ind] = new Array(64);
               pixelsR[ind][0] = first[fi];
               pixelsG[ind][0] = first[fi+1];
               pixelsB[ind][0] = first[fi+2];
               for (let r=1; r<64; r++) {
                   pixelsR[ind][r] = 0;
                   pixelsG[ind][r] = 0;
                   pixelsB[ind][r] = 0;
               }

               let res = Create2DArray(8);
               let blok_pixels = iZigZag(pixelsR[ind]);
               let pixs = iDCT(blok_pixels, 0, 14, 0, res);
               list_pixelsR[ind] = pixs;

               res = Create2DArray(8);
               blok_pixels = iZigZag(pixelsG[ind]);
               pixs = iDCT(blok_pixels, 0, 14, 0, res);
               list_pixelsG[ind] = pixs;

               res = Create2DArray(8);
               blok_pixels = iZigZag(pixelsB[ind]);
               pixs = iDCT(blok_pixels, 0, 14, 0, res);
               list_pixelsB[ind] = pixs;
               //console.log("#"+ind+" DONE!");
           }
           drawImg(height,width);
           console.log("1T# DONE!");
           component.ws.send("second");
       }

       function secondTier(second:any, len:number) {
           console.log("START #2");
           const height:number = second[1], width:number = second[2];

           for (let ind=0, si=3; ind<len/9; ind++) {
               for (let j=1; j<10; j++, si+=3) {
                   pixelsR[ind][j] = second[si] > 60000 ? (parseInt(String(second[si])) - 65536) : second[si];
                   pixelsG[ind][j] = second[si + 1] > 60000 ? (parseInt(String(second[si+1])) - 65536) : second[si+1];
                   pixelsB[ind][j] = second[si + 2] > 60000 ? (parseInt(String(second[si+2])) - 65536) : second[si+2];
                   //pixels[j] = pix_val[pi];
               }

               let blok_pixels = iZigZag(pixelsR[ind]);
               let prev_pixs = list_pixelsR[ind];
               let pixs = iDCT(blok_pixels, 1, 3, 3, prev_pixs);
               list_pixelsR[ind] = pixs;

               blok_pixels = iZigZag(pixelsG[ind]);
               prev_pixs = list_pixelsG[ind];
               pixs = iDCT(blok_pixels, 1, 3, 3, prev_pixs);
               list_pixelsG[ind] = pixs;

               blok_pixels = iZigZag(pixelsB[ind]);
               prev_pixs = list_pixelsB[ind];
               pixs = iDCT(blok_pixels, 1, 3, 3, prev_pixs);
               list_pixelsB[ind] = pixs;
               //console.log("2T #"+ind+" DONE!");
           }
           drawImg(height,width);
           console.log("2T# DONE!");
           component.ws.send("third");
       }
       function thirdTier(third:any, len:number) {
           console.log("START #3");
           const height:number = third[1], width:number = third[2];

           for (let ind=0, ti=3; ind< len/39; ind++) {
               for (let j=10; j<49; j++, ti+=3) {
                   pixelsR[ind][j] = third[ti] > 60000 ? (parseInt(String(third[ti])) - 65536) : third[ti];
                   pixelsG[ind][j] = third[ti + 1] > 60000 ? (parseInt(String(third[ti+1])) - 65536) : third[ti+1];
                   pixelsB[ind][j] = third[ti + 2] > 60000 ? (parseInt(String(third[ti+2])) - 65536) : third[ti+2];
                   //pixels[j] = pix_val[pi];
               }

               let blok_pixels = iZigZag(pixelsR[ind]);
               let prev_pixs = list_pixelsR[ind];
               let pixs = iDCT(blok_pixels, 4, 9, 9, prev_pixs);
               list_pixelsR[ind] = pixs;

               blok_pixels = iZigZag(pixelsG[ind]);
               prev_pixs = list_pixelsG[ind];
               pixs = iDCT(blok_pixels, 4, 9, 9, prev_pixs);
               list_pixelsG[ind] = pixs;

               blok_pixels = iZigZag(pixelsB[ind]);
               prev_pixs = list_pixelsB[ind];
               pixs = iDCT(blok_pixels, 4, 9, 9, prev_pixs);
               list_pixelsB[ind] = pixs;
               //console.log("3T #"+ind+" DONE!");
           }
           drawImg(height, width);
           console.log("3T# DONE!");
           component.ws.send("last");
       }
       function lastTier(last:any, len:number) {
           console.log("START #4");
           const height:number = last[1], width:number = last[2];

           for (let ind=0, li=3; ind< len/15; ind++) {
               for (var j=49; j<64; j++, li+=3) {
                 pixelsR[ind][j] = last[li] > 60000 ? (parseInt(String(last[li])) - 65536) : last[li];
                 pixelsG[ind][j] = last[li + 1] > 60000 ? (parseInt(String(last[li+1])) - 65536) : last[li+1];
                 pixelsB[ind][j] = last[li + 2] > 60000 ? (parseInt(String(last[li+2])) - 65536) : last[li+2];
               }

               let blok_pixels = iZigZag(pixelsR[ind]);
               let prev_pixs = list_pixelsR[ind];
               let pixs = iDCT(blok_pixels, 10, 14, 14, prev_pixs);
               list_pixelsR[ind] = pixs;

               blok_pixels = iZigZag(pixelsG[ind]);
               prev_pixs = list_pixelsG[ind];
               pixs = iDCT(blok_pixels, 10, 14, 14, prev_pixs);
               list_pixelsG[ind] = pixs;

               blok_pixels = iZigZag(pixelsB[ind]);
               prev_pixs = list_pixelsB[ind];
               pixs = iDCT(blok_pixels, 10, 14, 14, prev_pixs);
               list_pixelsB[ind] = pixs;
               //console.log("4T #"+ind+" DONE!");
           }
           drawImg(height, width);
           console.log("#4T DONE");
       }

       function drawImg(height:number, width:number) {
           // RESIZE
           //height *= 2;
           //width *= 2;
           console.log("HW: ", height, width);

           let pixelsARR_r = pixListToArr(list_pixelsR, height, (width/8));
           let pixelsARR_g = pixListToArr(list_pixelsG, height, (width/8));
           let pixelsARR_b = pixListToArr(list_pixelsB, height, (width/8));

           let stride: number;
           let pixel_data = new Uint8Array(height*width*3); // 6
           for (let i=0; i<height; i++) {
               for (let j=0; j<width; j++) {
                   stride = (i*height + j)*3; // 6

                   // TRANSFORM FROM YCC TO RGB
                   let R = parseInt(String((1.140945313 * pixelsARR_r[i][j]) + (0 * pixelsARR_g[i][j]) + (1.596027344 * pixelsARR_b[i][j]) - 222.921));
                   let G = parseInt(String((1.140945313 * pixelsARR_r[i][j]) + (-0.3917617188 * pixelsARR_g[i][j]) + (-0.81296875 * pixelsARR_b[i][j]) + 135.576));
                   let B = parseInt(String((1.140945313 * pixelsARR_r[i][j]) + (2.017234375 * pixelsARR_g[i][j]) + (0 * pixelsARR_b[i][j]) - 276.836));

                   pixel_data[stride] = R;
                   pixel_data[stride+1] = G;
                   pixel_data[stride+2] = B;
                   /*pixel_data[stride+3] = R;
                   pixel_data[stride+4] = G;
                   pixel_data[stride+5] = B;*/
               }
           }

           if (stride > (height*width*3)-4) { // 6 ,7
             let tex = new THREE.DataTexture( pixel_data, width, height, THREE.RGBFormat );
             tex.flipY = true;
             tex.needsUpdate = true;
             component.cube.material.map = tex;
             component.cube.material.needsUpdate = true;
             //component.createCube(tex);
           }
       }

       function iDCT(polje:any, min_sum:number, max_sum:number, max_uv:number, res:any) {
           // let res = Create2DArray(8);
           for (let x=0; x<8; x++)
           {
               for (let y=0; y<8; y++)
               {
                   if (x+y >= min_sum && x+y <= max_sum) {
                       let sum = 0.0;
                       for (let u = 0; u < 8; u++)
                       {
                           for (let v = 0; v < 8; v++)
                           {
                               if (u+v <= max_uv) { // pogolemi od max_sum = 0
                                   let tmp_sum = C(u) * C(v);
                                   tmp_sum *= polje[u][v];
                                   tmp_sum *= Math.cos(parseFloat(String(parseFloat(String((2 * x + 1) * u * Math.PI)) / 16)));
                                   tmp_sum *= Math.cos(parseFloat(String(parseFloat(String((2 * y + 1) * v * Math.PI)) / 16)));

                                   sum += tmp_sum;
                               }
                           }
                       }

                       sum *= 0.25; // 1/4
                       res[x][y] = parseInt(String(Math.round(sum)));
                   }
               }
           }
           return res;
       }

       function C(x:number) {
           if (x == 0)
              return parseFloat(String(1.0/Math.sqrt(2)));
           else
              return 1.0;
       }
       // transform arr to 2d arr
       function pixListToArr(polje:any, height:number, blocks_w_size:number) {
           let pixARR = Create2DArray(height);
           for (let i = 0, col = 0, row = -1; i < polje.length; i++, col++) // ena iteracija - EN BLOK  (levo proti desnem)
           {
               let blok = polje[i];
               if (i % blocks_w_size == 0)
               {
                   row += 1;
                   col = 0;
               }

               for (let x = 0; x < 8; x++)
               {
                   for (let y = 0; y < 8; y++)
                   {
                      pixARR[row * 8 + x][col * 8 + y] = blok[x][y];
                   }
               }
           }

              return pixARR;
       }
       function Create2DArray(rows:number) {
           let arr: any[] = new Array(rows);
           for (let i=0;i<rows;i++) {
               arr[i] = new Array();
           }
           return arr;
       }
       function iZigZag(arr: number[]) {
           let res = Create2DArray(8);
           let predef_cols =[0, 1, 0, 0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 0, 1, 2,
           3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 3, 4, 5,
           6, 7, 7, 6, 5, 4, 5, 6, 7, 7, 6, 7];
           let predef_rows = [0, 0, 1, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 5, 4,
           3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5,
           4, 3, 4, 5, 6, 7, 7, 6, 5, 6, 7, 7];
           for (let i = 0; i < 64; i++)
              res[predef_rows[i]][predef_cols[i]] = arr[i];
           return res;
       }
  }



  /* STAGING, ANIMATION, AND RENDERING */

  /**
   * Animate the cube
   */
  private animateCube() {
    //this.cube.rotation.x += this.rotationSpeedX;
    //this.cube.rotation.y += this.rotationSpeedY;
  }

  /**
   * Create the cube
   */
  private createCube() {
    let material = new THREE.MeshBasicMaterial(); //{ map: txr }
    let geometry = new THREE.BoxBufferGeometry(this.size, this.size, this.size);
    this.cube = new THREE.Mesh(geometry, material);

    // Add cube to scene
    this.scene.add(this.cube);
  }

  /**
   * Create the scene
   */
  private createScene() {
    /* Scene */
    this.scene = new THREE.Scene();

    /* Camera */
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    );
    this.camera.position.z = this.cameraZ;
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  /**
   * Start the rendering loop
   */
  private startRenderingLoop() {
    /* Renderer */
    // Use canvas element in template
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0xddccdd, 1);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: CanvasComponent = this;
    (function render() {
      requestAnimationFrame(render);
      //component.animateCube();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  /*
  // IMAGE PROCESSING
  private transformImage() {
    console.log("TRANSFORM");

    let bit_string: string = "";
    for (let di=0; di<this.data.length; di++) {
      let pic_bytes = this.data[di].split(',');
      for (let z: number = 0; z<pic_bytes.length; z++) {
        bit_string += String("00000000"+parseInt(pic_bytes[z]).toString(2)).slice(-8);
      }
      console.log(pic_bytes);
    }

    let bit_index: number = 0;
    let height: number = parseInt(bit_string.substring(bit_index, bit_index+16), 2);
    bit_index += 16;
    let width:  number = parseInt(bit_string.substring(bit_index, bit_index+16), 2);
    bit_index += 16;

    let blocks_w_size: number = parseInt(String(width / 8));
    let blocks_h_size: number = parseInt(String(height / 8));
    let blocks_size:   number = blocks_h_size * blocks_w_size;
    let vp8_types: any = [];
    let pixR = decodePixels();
    let pixR_arr = pixListToArr();
    let pixelsARR = pixR_arr;//iVP8(pixR_arr);

    let stride: number;
    let pixel_data = new Uint8Array(height*width*3);
    for (let i=0; i<height; i++) {
      for (let j=0; j<width; j++) {
        stride = (i*512 + j)*3;
        pixel_data[stride] = parseInt(pixelsARR[i][j]);
        pixel_data[stride+1] = parseInt(pixelsARR[i][j]);
        pixel_data[stride+2] = parseInt(pixelsARR[i][j]);
      }
    }
    if (stride > (height*width*3)-4) {
      let tex = new THREE.DataTexture( pixel_data, width, height, THREE.RGBFormat );
      tex.flipY = true;
      tex.needsUpdate = true;
      this.createCube(tex);
    }


    function decodePixels () {
      let res = [], zz_piksli = [];
      let blocks_num = 0, blocks_h = 0, blocks_w = 0;
      let num_coef = 0, vp8_type = 0, vp_cnt = 0;
      let vp8 = false;

      while (blocks_num < blocks_size) {
        if (blocks_h > 0 && blocks_w > 0 && !vp8) // vmesni bloki (CONTAINING VP8!)
        {
          vp8_type = parseInt(bit_string.substring(bit_index, bit_index+2), 2) + 1; // +1 !! -> (NONE:0, ver:1, hor:2, dc:3, tm: 4) taka gi cuvam gore
          bit_index += 2;
          vp8 = true;
        }
        if (num_coef == 0) // zacetek bloka -> DC
        {
          let neg = bit_string.substring(bit_index, bit_index+1);
          bit_index += 1;
          let DC = parseInt(bit_string.substring(bit_index, bit_index+11), 2);
          bit_index += 11;

          if (neg=="1")
          {
            DC *= -1;
          }
          zz_piksli[num_coef] = DC;
          num_coef += 1;
        }

        let code_type = bit_string.substring(bit_index, bit_index+1);
        bit_index += 1;
        if (code_type == "0") // A / B
        {
          let tek_dolz = parseInt(bit_string.substring(bit_index, bit_index+6), 2); // 6biti tek_dolz
          bit_index += 6;
          for (let x = 0; x < tek_dolz; x++)
          {
            zz_piksli[num_coef] = 0;
            num_coef += 1;
          }

          if (num_coef != 64) // A
          {
            let AC_length = parseInt(bit_string.substring(bit_index, bit_index+4), 2);  // 4biti dolzina
            bit_index += 4;

            let neg = bit_string.substring(bit_index, bit_index+1);
            bit_index += 1;
            let AC = parseInt(bit_string.substring(bit_index, bit_index+(AC_length-1)), 2); // |dolzina-1|biti AC
            bit_index += AC_length-1;

            if (neg == "1")
            {
              AC *= -1;
            }
            zz_piksli[num_coef] = AC;
            num_coef += 1;
          }
        }
        else if (code_type == "1") // C
        {
          let AC_length = parseInt(bit_string.substring(bit_index, bit_index+4), 2);  // 4biti dolzina
          bit_index += 4;

          let neg = bit_string.substring(bit_index, bit_index+1);
          bit_index += 1;
          let AC = parseInt(bit_string.substring(bit_index, bit_index+(AC_length-1)), 2); // |dolzina-1|biti AC
          bit_index += AC_length - 1;

          if (neg == "1")
          {
            AC *= -1;
          }
          zz_piksli[num_coef] = AC;
          num_coef += 1;
        }


        if (num_coef == 64) // KONEC BLOKA, zacetek novega
        {
          console.log("Block #"+blocks_num+" done!");
          // iZIGZAG
          let pixs = iZigZag(zz_piksli);
          // iDCT
          pixs = iDCT(pixs);

          res.push(pixs);
          // RESET VALUES
          num_coef = 0;
          vp8_type = 0;
          blocks_num += 1;
          blocks_w += 1;
          zz_piksli = [];

          if (blocks_w == blocks_w_size) // konec vrstice (koncni stolpec)
          {
            blocks_w = 0;
            blocks_h += 1;
          }
        }
      }

      return res;
    }
    // DECODE HELPER FUNCTIONS (iDCT, iVP8 ...)
    function iVP8(piksli:any) {
      let cnt = 0, i, j;
      // BLOK PO BLOK
      for (let U = 0; U < height; U += 8) // < PIX_WIDTH
      {
        for (let V = 0; V < width; V += 8) // < PIX_HEIGHT
        { // EN BLOK
          if (U > 0 && V > 0) // vsebuje VP8
          {
            let dc_avg: number = 0;
            // calc dc avg
            for (i = 0; i < 8; i++)
            {
              dc_avg += piksli[U + i][V - 1] + piksli[U - 1][V + i];
            }
            dc_avg = parseInt(String(dc_avg/16));
            switch (vp8_types[cnt])
            {
              case 1: // VERTICAL
                for (i = 0; i < 8; i++)
                {
                  for (j = 0; j < 8; j++)
                  {
                    piksli[U + i][V + j] += piksli[U - 1][V + j];
                  }
                }
                break;
              case 2: // HORIZONTAL
                for (i = 0; i < 8; i++)
                {
                  for (j = 0; j < 8; j++)
                  {
                    piksli[U + i][V + j] += piksli[U + i][V - 1];
                  }
                }
                break;
              case 3:   // DC
                for (i = 0; i < 8; i++)
                {
                  for (j = 0; j < 8; j++)
                  {
                    piksli[U + i][V + j] += dc_avg;
                  }
                }
                break;
              case 4:   // TRUEMOTION
                for (i = 0; i < 8; i++)
                {
                  for (j = 0; j < 8; j++)
                  {
                    let tm_p = (piksli[U + i][V - 1] + piksli[U - 1][V + j]) - piksli[U - 1][V - 1];
                    piksli[U + i][V + j] += tm_p;
                  }
                }
                break;
            }
            cnt++;
          }
        }
      }

      return piksli;
    }
    function iDCT(polje:any) {
      let res = Create2DArray(8);
      for (let x=0; x<8; x++)
      {
        for (let y=0; y<8; y++)
        {
          let sum = 0.0;
          for (let u = 0; u < 8; u++)
          {
            for (let v = 0; v < 8; v++)
            {
              let tmp_sum = C(u) * C(v);
              tmp_sum *= polje[u][v];
              tmp_sum *= Math.cos(parseFloat(String(parseFloat(String((2 * x + 1) * u * Math.PI)) / 16)));
              tmp_sum *= Math.cos(parseFloat(String(parseFloat(String((2 * y + 1) * v * Math.PI)) / 16)));

              sum += tmp_sum;
            }
          }
          sum *= 0.25; // 1/4
          res[x][y] = parseInt(String(Math.round(sum)));
        }
      }
      return res;
    }

    function C(x:number) {
      if (x == 0)
        return parseFloat(String(1.0/Math.sqrt(2)));
      else
        return 1.0;
    }
    // transform arr to 2d arr
    function pixListToArr() {
      let pixARR = Create2DArray(height);
      for (let i = 0, col = 0, row = -1; i < pixR.length; i++, col++) // ena iteracija - EN BLOK  (levo proti desnem)
      {
        let blok = pixR[i];
        if (i % blocks_w_size == 0)
        {
          row += 1;
          col = 0;
        }

        for (let x = 0; x < 8; x++)
        {
          for (let y = 0; y < 8; y++)
          {
            pixARR[row * 8 + x][col * 8 + y] = blok[x][y];
          }
        }
      }

      return pixARR;
    }
    // create 2d array
    function Create2DArray(rows:number) {
      let arr: any[] = [];
      for (let i=0;i<rows;i++) {
        arr[i] = [];
      }
      return arr;
    }
    function iZigZag(arr: number[]) {
      let res = Create2DArray(8);
      let predef_cols =[0, 1, 0, 0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 0, 1, 2,
        3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 3, 4, 5,
        6, 7, 7, 6, 5, 4, 5, 6, 7, 7, 6, 7];
      let predef_rows = [0, 0, 1, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 5, 4,
        3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5,
        4, 3, 4, 5, 6, 7, 7, 6, 5, 6, 7, 7];
      for (let i = 0; i < 64; i++)
        res[predef_rows[i]][predef_cols[i]] = arr[i];
      return res;
    }
  }*/



  /* EVENTS */
  /**
   * Update scene after resizing.
   */
  public onResize() {
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }



  /* LIFECYCLE */
  /**
   * We need to wait until template is bound to DOM, as we need the view
   * dimensions to create the scene. We could create the cube in a Init hook,
   * but we would be unable to add it to the scene until now.
   */
  public ngAfterViewInit() {
    this.createScene();
    this.createCube();
    this.createImg();
    //this.transformImage();
    this.startRenderingLoop();
  }
}
