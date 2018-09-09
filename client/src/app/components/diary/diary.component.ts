import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';
const domtoimage = require('dom-to-image');
const Canvas2Image = require('canvas2image');
//import * as  from 'dom-to-image';
//import * as Canvas2Image from 'canvas2image';

@Component({
  selector: 'diary-scene',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.css']
})
export class DiarySceneComponent implements AfterViewInit {
  /* HELPER PROPERTIES (PRIVATE PROPERTIES) */
  private raycaster: THREE.Raycaster;
  private camera: THREE.PerspectiveCamera;
  private get canvas() : HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  private obj_loader: THREE.ObjectLoader;
  private json_loader: THREE.JSONLoader;

  // SOCKET
  public ws: WebSocket = new WebSocket('ws://localhost:3030/service');

  // public pages info
  private slp_name: string = "static_page_left";
  private srp_name: string = "static_right_page";
  private alp_name: string = "animation_page_left";
  private arp_name: string = "animation_right_page";
  private l_mixer: THREE.AnimationMixer = null;
  private r_mixer: THREE.AnimationMixer = null;
  private l_action: THREE.AnimationAction = null;
  private r_action: THREE.AnimationAction = null;
  @Input()
  private pages: any[] = [{title: "wrrcd11"}, {title: "Shipwreck"}, {title: "Bambus"}, {title: "OaAeNn"}, {title: "IccrA"},
    {title: "xASx"}, {title: "zzX"}, {title: "yr"}, {title: "XCv"}, {title: "YUYHM"}];
  private local_pages: any[] = [];

  private front_textures:any = [];
  private back_textures:any = [];

  // toggling states/names
  private first_stat: boolean = true;
  private first_anim: boolean = true;
  private hoveredPage: string = "";
  private page_index: number = 1;


  @ViewChild('diary')
  private canvasRef: ElementRef;
  private cube: any;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;


  /* STAGE PROPERTIES */
  @Input()
  public cameraZ: number = 95;
  @Input()
  public fieldOfView: number = 70;
  @Input('nearClipping')
  public nearClippingPane: number = 0.1;
  @Input('farClipping')
  public farClippingPane: number = 1000;

  /* DEPENDENCY INJECTION (CONSTRUCTOR) */
  constructor() { }

  /* STAGING, ANIMATION, AND RENDERING */
  /**
   * Create the cube
   */
  private createCube() {
    let material = new THREE.MeshBasicMaterial({ color:0xaa8253, side: THREE.FrontSide });
    let material2 = new THREE.MeshBasicMaterial({ color:0xab82ac, side: THREE.BackSide });
    let geometry = new THREE.BoxBufferGeometry(50,50,50);
    this.cube = new THREE.Mesh(geometry, material2);
    this.cube.doubleSided = true;
    this.cube.name = "maQb";

    console.log("cube mesh: ", this.cube);
    // Add cube to scene
    this.scene.add(this.cube);
  }

  /**
   * Create the scene
   */
  private createScene() {
    let component: DiarySceneComponent = this;
    /* Scene */
    const intensity = 0.65, distance = 400;
    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    let light1 = new THREE.PointLight( 0xCC7711 );
    light1.position.set( -10, 40, 10 );
    light1.intensity = intensity;
    light1.distance = distance;
    let light2 = new THREE.PointLight( 0xCC7711 );
    light2.position.set( 0, 40, 15 );
    light2.intensity = intensity;
    light2.distance = distance;
    let light3 = new THREE.PointLight( 0xCC7711 );
    light3.position.set( 10, 40, 10 );
    light3.intensity = intensity;
    light3.distance = distance;
    let light4 = new THREE.PointLight( 0xCC7711 );
    light4.intensity = 0.9;
    light4.position.set(-5,-40, 0); //0, -45, -5


    this.scene.add( light1 );
    this.scene.add( light2 );
    this.scene.add( light3 );
    this.scene.add( light4 );

    /* Camera */
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    );
    this.camera.rotation.x += 0.18;
    this.camera.position.z = this.cameraZ;

    // pages size % 2
    component.local_pages = Object.assign([], component.pages);
    if (component.local_pages.length%2!=0) {
      component.local_pages.push({title: "The End", description: "nodescs", pictures: []});
    }
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
    //this.renderer.setClearColor(0xddccdd, 1);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: DiarySceneComponent = this;
    let clock: THREE.Clock = new THREE.Clock();

    // SOCKET
    component.ws.onopen = function () {
      component.ws.send("Initialize communication");
      console.log("Communication established.");
    };
    component.ws.onmessage = function (msg: any) {
      console.log("RECEIVED: ", msg);
      if (msg.data == "L") {
        if (component.page_index>1) {
          component.page_index -= 2;
          component.animate(component.alp_name);
        }
        else
          console.log("first page");
      } else if (msg.data == "R") {
        if (component.page_index < component.local_pages.length-1) {
          component.page_index += 2;
          component.animate(component.arp_name);
        }
        else
          console.log("last page");
      }
    };
    component.ws.onclose = function () {
      console.log("DISCONNECTED");
    };


    (function render() {
      let delta = 0.75 * clock.getDelta();
      if( component.l_mixer ) {
        component.l_mixer.update( delta );
      }
      if( component.r_mixer ) {
        component.r_mixer.update( delta );
      }

      requestAnimationFrame(render);
      component.renderer.render(component.scene, component.camera);
    }());
  }

  // LOAD TEXTURES
  private loadAllTextures() {
    let component: DiarySceneComponent = this;
    component.back_textures[0] = {};

    (function next(pi) {
      if (pi == component.local_pages.length) {
        component.back_textures[component.local_pages.length-1] = {};
        component.loadScene();
        /*
        component.obj_loader.load("blender_objects/ink_quill.json", function(object) {
           const s = 14;
           object.rotateX(Math.PI/4);
           object.rotateY(Math.PI);
           object.scale.set(s,s,s);
           console.log("INK: ", object);
           component.scene.add( object );
           object.position.set(50,2.5,-22);
           object.updateMatrix();
        });
        */
        return;
      }

      let data = component.local_pages[pi];
      let node = component.loadHTML(data,true);
      domtoimage.toPng(node)
        .then(function (dataUrl:any) {
          let img = new Image();
          img.src = dataUrl;
          img.addEventListener( 'load', function ( event ) {
            let mapCanvas = document.createElement( 'canvas' );
            mapCanvas.width = img.width;
            mapCanvas.height = img.height;
            let ctx = mapCanvas.getContext( '2d' );
            ctx.translate( mapCanvas.width / 2, mapCanvas.height / 2 );
            ctx.rotate( 90*Math.PI / 180 );
            //ctx.translate( -mapCanvas.width / 2, -mapCanvas.height / 2 );
            ctx.drawImage( img, -100, -180);

            let img2 = Canvas2Image.convertToImage(mapCanvas, img.width, img.height, "jpeg");
            let texture = THREE.ImageUtils.loadTexture( img2.src );
            texture.needsUpdate = true;
            component.front_textures[pi] = texture;

            if (pi==0 || pi==component.local_pages.length-1) {
              next(pi+1);
            } else {
              node = component.loadHTML(data, false);
              domtoimage.toPng(node)
                .then(function (dataUrl:any) {
                  let img = new Image();
                  img.src = dataUrl;
                  img.addEventListener( 'load', function ( event ) {
                    let mapCanvas = document.createElement( 'canvas' );
                    mapCanvas.width = img.width;
                    mapCanvas.height = img.height;
                    let ctx = mapCanvas.getContext( '2d' );
                    ctx.translate( mapCanvas.width / 2, mapCanvas.height / 2 );
                    ctx.rotate( 90*Math.PI / 180 );
                    //ctx.translate( -mapCanvas.width / 2, -mapCanvas.height / 2 );
                    ctx.drawImage( img, -100, -180);

                    let img2 = Canvas2Image.convertToImage(mapCanvas, img.width, img.height, "jpeg");
                    let texture = THREE.ImageUtils.loadTexture( img2.src );
                    texture.needsUpdate = true;
                    component.back_textures[pi] = texture;

                    next(pi+1);
                  });
                }).catch(function (error:any) {
                console.error('oops, something went wrong!', error);
              });
            }
          });
        }).catch(function (error:any) {
        console.error('oops, something went wrong!', error);
      });
    }(0));
  }

  private loadHTML(data:any,front:boolean) {
    let div: HTMLElement = document.createElement("div");
    if (front)
      div.setAttribute("style", "background:url(textures/paper_texture.jpg) no-repeat; padding:5px 52px 8px 48px; font-size:12px; height:536px; width:368px;");
    else
      div.setAttribute("style", "background:url(textures/paper_texture.jpg) no-repeat; padding:5px 46px 8px 54px; font-size:12px; height:536px; width:368px; -webkit-transform: rotateY(180deg); transform: rotateY(180deg);");
    // TITLE
    let h2: HTMLElement = document.createElement("h2");
    h2.textContent = data.title;
    h2.setAttribute("style", "text-align:center;font-family:LobsterTwo-Regular;font-weight: bold; color: #af4433;");
    div.appendChild(h2);
    // PICTURES
    let div1: HTMLElement = document.createElement("div");
    let div2: HTMLElement = document.createElement("div");
    let div3: HTMLElement = document.createElement("div");
    switch(data.pictures.length) {
      case 1:
        div1.setAttribute("style", "width:92%; height:80px; margin-left:4%; margin-bottom:10px; background:url("+data.pictures[0]+"); background-size:100%;");
        div.appendChild(div1);
        break;
      case 2:
        div1.setAttribute("style", "width:48%; height:80px; margin-right:2%; margin-bottom:10px; float:left; background:url("+data.pictures[0]+"); background-size:100%;");
        div2.setAttribute("style", "width:48%; height:80px; margin-left:2%; margin-bottom:10px; float:left; background:url("+data.pictures[1]+"); background-size:100%;");
        div.appendChild(div1);
        div.appendChild(div2);
        break;
      case 3:
      default:
        div1.setAttribute("style", "width:30%; height:80px; margin-right:8px; margin-bottom:10px; float:left; background:url("+data.pictures[0]+"); background-size:100%;");
        div2.setAttribute("style", "width:30%; height:80px; margin-right:8px; margin-bottom:10px; float:left; background:url("+data.pictures[1]+"); background-size:100%;");
        div3.setAttribute("style", "width:30%; height:80px; margin-right:0px; margin-bottom:10px; float:left; background:url("+data.pictures[2]+"); background-size:100%;");
        div.appendChild(div1);
        div.appendChild(div2);
        div.appendChild(div3);
        break;
    }
    // DESCRIPTION
    let pt: string = data.description;
    if (data.description.length > 500) {  // extract desc. (correct size)
      for (let i=440; i<data.description.length; i++) {
        if (data.description.endsWith(".", i) || i+1==data.description.length) {
          pt = data.description.substr(0, i);
          break;
        }
        else if (data.title.length > 21 && i > 480) {
          if (data.description.endsWith(" ", i)) {
            pt = data.description.substr(0, i) + "...";
            break;
          }
        }
        else if (i>532) {
          pt = data.description.substr(0,i) + "...";
          break;
        }
      }
    }
    let p: HTMLElement = document.createElement("p");
    p.textContent = pt;
    p.setAttribute("style", "margin-top: 10px; font-family: Times New-Roman; font-style: italic; padding:5px; text-shadow: 0.2px 0.3px #000;");
    div.appendChild(p);

    document.getElementById("imgs").appendChild(div);
    setTimeout(function() {
     document.getElementById("imgs").removeChild(div);
    }, 2200);
    return div;
  }

  // LOAD SCENE
  private loadScene() {
    let component: DiarySceneComponent = this;
    // INIT LOADERS
    component.obj_loader = new THREE.ObjectLoader();
    component.json_loader = new THREE.JSONLoader();

    // load background scene (object)
    component.obj_loader.load("blender_objects/candle_big2.json", function(object:any) {
      const s = 2.5;
      let plane:any;
      object.rotateX(Math.PI/4);
      object.rotateY(Math.PI);
      object.scale.set(s,s,s);
      console.log("CANDLE_SCENE: ", object);
      object.traverse( function ( child:any ) {
        if ( child instanceof THREE.Mesh ) {
          if (child.name === "Plane") {
            plane = child;
            //child.position.z = 15;
            //child.updateMatrix();
          }
        }
      });
      component.scene.add( object );
      object.position.set(0,-7,0);
      object.updateMatrix();
      plane.position.z += 10;
      plane.updateMatrix();
      component.obj_loader.load("blender_objects/frame2.json", function(object) {
        const s = 22;
        const texture = new THREE.TextureLoader().load( "textures/JV.jpg" );
        object.rotateX(Math.PI/1.2);
        //object.rotateY(Math.PI);

        object.scale.set(s,s,s);
        console.log("obj: ", object);
        object.traverse( function ( child ) {
          if ( child instanceof THREE.Mesh ) {
            if (child.name === "Painting") {
              child.material = new THREE.MeshBasicMaterial({map:texture});
              // child.material.map = texture;
              child.material.needsUpdate = true;
            }
          }
        });
        component.scene.add( object );
        object.position.set(-12,60,4);
        object.updateMatrix();

        component.obj_loader.load("blender_objects/statue_head_full.json", function(object) {
          const s = 10;
          object.rotateX(Math.PI/4);
          object.rotateY(Math.PI*1.15);
          object.rotateZ(Math.PI);
          object.position.set(-40,25,-10);
          object.scale.set(s,s,s);
          object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
              if (child.name === "Cube") {
                child.position.y += 2.5;
              }
            }
          });
          console.log("obj: ", object);
          component.scene.add( object );

          component.obj_loader.load("blender_objects/book.json", function(object) {
            const s = 16;
            const texture = new THREE.TextureLoader().load( "textures/book_cover.jpg" );
            object.rotateX(Math.PI/4);
            object.rotateY(Math.PI);
/*
            object.position.set(100,11.5,-19);
            console.log("POS1: ", object.position.x);
            object.position.x += 25;
            console.log("POS2: ",object.position.x);
*/
            object.position.x += 25;
            object.scale.set(s,s,s);
            console.log("obj: ", object);
            object.traverse( function ( child:any ) {
              //if ( child instanceof THREE.Mesh ) {
              if (child.name === "sites") {
                child.material.map = texture;
                child.material.needsUpdate = true;
              } else {
                //child.position.z -= 10;
                child.position.set(-0.13,0.32,0.48);
              }
              //}
            });
            component.scene.add( object );
            object.position.set(50,11.5,-19);
            object.updateMatrix();

          });
        });
      });
    });



    component.obj_loader.load("blender_objects/book_cover.json", function(object) {
      const s = 19.8;
      object.rotateX(Math.PI/4);
      object.rotateZ(Math.PI);
      object.position.set(0.5,-14.8,9.7);
      object.scale.set(s,s,s);
      console.log("obj: ", object);
      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          if (child.name === "pages") {
            child.position.y -= 0.035;
          }
        }
      });
      component.scene.add( object );
    });

    // load pages
    component.json_loader.load("blender_objects/l_page_turn.json", loadStaticPage);
    setTimeout(function() {
      component.json_loader.load("blender_objects/r_page_turn.json", loadStaticPage);
    }, 250);
    setTimeout(function() {
      component.json_loader.load("blender_objects/left_page_turn.json", loadAnimPage);
    }, 500);
    setTimeout(function() {
      component.json_loader.load("blender_objects/r_page_turn.json", loadAnimPage);
    }, 750);
    // LOADER FUNCTIONS


    function loadAnimPage(geometry:any,materials:any) {
      let page_name;
      let mat1 = new THREE.MeshPhongMaterial({side: THREE.FrontSide, morphTargets: true}), //, color: 0xfd59d7
          mat2 = new THREE.MeshPhongMaterial({side: THREE.BackSide, morphTargets: true}); // , color: 0xdf9527

      for (let i = 0, len = geometry.faces.length; i < len; i++) {
        let face = geometry.faces[i].clone();
        face.materialIndex = 1;
        geometry.faces.push(face);
        geometry.faceVertexUvs[0].push(geometry.faceVertexUvs[0][i].slice(0));
      }
      let mesh:any = new THREE.Mesh(geometry,[mat1,mat2]);
      if (component.first_anim) {
        mesh.material[0].map = component.front_textures[2];
        mesh.material[1].map = component.back_textures[1];
        mesh.material[0].needsUpdate = true;
        mesh.material[1].needsUpdate = true;
        //component.loadTexture(2,mesh,true);
        //component.loadTexture(1,mesh,false);
        page_name = component.alp_name;
      } else {
        mesh.material[0].map = component.front_textures[1];
        mesh.material[1].map = component.back_textures[2];
        mesh.material[0].needsUpdate = true;
        mesh.material[1].needsUpdate = true;
        //component.loadTexture(1,mesh,true);
        //component.loadTexture(2,mesh,false);
        page_name = component.arp_name;
      }
      mesh.name = page_name;
      mesh.scale.set( 22,22,22 );
      mesh.rotateX(Math.PI/4);
      mesh.position.set(0.5,-14,10.5);
      mesh.doubleSided = true;
      mesh.visible = false;

      let mixer = new THREE.AnimationMixer(mesh);
      let clip = THREE.AnimationClip.CreateFromMorphTargetSequence( page_name+"_anim", geometry.morphTargets, 50, true);
      let action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.enabled = true;
      action.setDuration(1.5);
      if (component.first_anim) {
        component.l_mixer = mixer;
        component.l_action = action;
        //l_action.play().reset();
      } else {
        component.r_mixer = mixer;
        component.r_action = action;
        //r_action.play().reset();
      }

      component.scene.add( mesh );
      component.first_anim = false;
    }
    function loadStaticPage(geometry:any, materials:any) {
      let page_name;
      const matx = new THREE.MeshPhongMaterial({side:THREE.FrontSide, morphTargets: true});

      let mesh:any = new THREE.Mesh(geometry,matx);
      if (component.first_stat) {
        mesh.material.map = component.front_textures[0];
        mesh.material.needsUpdate = true;
        //component.loadTexture(0,mesh,true);
        page_name = component.slp_name;
      } else {
        mesh.material.map = component.front_textures[1];
        mesh.material.needsUpdate = true;
        //component.loadTexture(1,mesh,true);
        page_name = component.srp_name;
      }
      mesh.name = page_name;
      mesh.scale.set( 22,22,22 );
      mesh.rotateX(Math.PI/4);
      mesh.position.set(0.5,-14,10.5);
      //console.log("Mesh: ", mesh);
      component.scene.add( mesh );
      component.first_stat = false;
    }
  }
  private animate(page_name:string) {
    let component: DiarySceneComponent = this;
    component.scene.getObjectByName(page_name).visible = true;
    let slp:any = component.scene.getObjectByName(component.slp_name), srp:any = component.scene.getObjectByName(component.srp_name),
        alp:any = component.scene.getObjectByName(component.alp_name), arp:any = component.scene.getObjectByName(component.arp_name);
    let go_left = page_name == alp.name ? true : false;
    if (go_left) { // change slp before animation
      slp.material.map = component.front_textures[component.page_index-1];
      slp.material.needsUpdate = true;
    } else { // change srp before animation
      srp.material.map = component.front_textures[component.page_index];
      srp.material.needsUpdate = true;
    }

    setTimeout(function() {
      if (go_left) {
        component.l_action.play().reset();
      } else {
        component.r_action.play().reset();
      }
    }, 500);

    setTimeout(function() {
      // first load new texture on slp/srp
      if (go_left) { // now the right one
        srp.visible = false;
        srp.material.map = component.front_textures[component.page_index];
        srp.material.needsUpdate = true;
      } else { // now the left one
        slp.visible = false;
        slp.material.map = component.front_textures[component.page_index-1];
        slp.material.needsUpdate = true;
      }
    }, 1900);
    setTimeout(function() {
      if (go_left)
        srp.visible = true;
      else
        slp.visible = true;

      component.scene.getObjectByName(page_name).visible = false;
      // finally change animation pages textures:
      if (component.page_index>1) { // left anim page
        alp.material[0].map = component.front_textures[component.page_index-1];
        alp.material[1].map = component.back_textures[component.page_index-2];
        alp.material[0].needsUpdate = true;
        alp.material[1].needsUpdate = true;
      }
      if (component.page_index<component.local_pages.length-1) { // right anim page
        arp.material[0].map = component.front_textures[component.page_index];
        arp.material[1].map = component.back_textures[component.page_index+1];
        arp.material[0].needsUpdate = true;
        arp.material[1].needsUpdate = true;
      }
    }, 2150);
  }



  /* EVENTS */
  /**
   * Update scene after resizing.
   */
  public onResize() {
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
  public onMouseClick( e:any ) {
    if (this.hoveredPage == this.slp_name) {
      if (this.page_index>1) {
        this.page_index -= 2;
        //console.log("anim_l");
        this.animate(this.alp_name);
        //l_action.play().reset();
      }
      else
        console.log("first page");
    } else if (this.hoveredPage == this.srp_name) {
      if (this.page_index < this.local_pages.length-1) {
        this.page_index += 2;
        //console.log("anim_r");
        this.animate(this.arp_name);
        //r_action.play().reset();
      }
      else
        console.log("last page");
    }
  }
  public onMouseMove( e:any ) {
    //console.log(e);
    let mouseVector = new THREE.Vector3();
    mouseVector.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / window.innerHeight);

    this.raycaster.setFromCamera( mouseVector.clone(), this.camera );
    let scene_intersects = this.raycaster.intersectObjects( this.scene.children );

    //for ( let i=0; i< this.scene.children.length; i++ )
    //  this.scene.children[i].hovered = false;
    if (scene_intersects.length==0) {
      this.hoveredPage = "";
    } else {
      let min = 1000, obj_name = "";
      for ( let i = 0; i < scene_intersects.length; i++ ) {
        if (min > scene_intersects[ i ].distance) {
          min = scene_intersects[ i ].distance;
          this.hoveredPage = scene_intersects[ i ].object.name;
        }
      }
      console.log("hovered: ", this.hoveredPage);
    }
  }
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent) {
    console.log("EVENT", e.keyCode);
    if (e.keyCode == 76 || e.keyCode == 108) {
      alert("L");
    }
    else if  (e.keyCode == 82 || e.keyCode == 114) {
      alert("R");
    }
  }

  /* LIFECYCLE */
  /**
   * We need to wait until template is bound to DOM, as we need the view
   * dimensions to create the scene. We could create the cube in a Init hook,
   * but we would be unable to add it to the scene until now.
   */
  public ngAfterViewInit() {
    this.createScene();
    this.loadAllTextures();
    //this.loadScene();
    //this.createCube();
    this.startRenderingLoop();
  }
}
