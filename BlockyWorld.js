// Vertex shader program
var VSHADER_SOURCE =`
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform int u_whichTexture;
  uniform bool u_lightOn;
  uniform vec3 u_lightColor;
  void main() {

    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor;     //use color
  
    }else if (u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);   //use texture0
    
    }else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);   //use texture1
    }
    else if (u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);   //use normal color
    }
    else {
      gl_FragColor = vec4(1,1,1,1);   //use white for ERROR
    }
    
    vec3 lightVector = u_lightPos-vec3(v_VertPos);
    float r = length(lightVector);
    
    //N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    //Reflection 
    vec3 R = reflect(-L, N);
    
    // Eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    //Specular
    vec3 specular = u_lightColor * pow(max(dot(E, R), 0.0), 10.0);

    vec3 diffuse = vec3(gl_FragColor) * u_lightColor * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    if(u_lightOn){
      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);  
    }
  }`

  // Global Variables
  let canvas;
  let gl;
  let a_Position;
  let a_UV;
  let a_Normal
  let u_FragColor;
  let u_ModelMatrix;
  let u_ProjectionMatrix;
  let u_ViewMatrix;
  let u_GlobalRotateMatrix;
  let u_Sampler0;
  let u_Sampler1;
  let u_whichTexture;
  let u_lightPos;
  let u_cameraPos;
  let u_lightOn;
  let u_lightColor;

  function setUpGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);
  }

  function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
    }
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
      return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    //Set an initial valu for this matrix to identity
    let modelMatrix = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }

    //Set an initial val for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
  
    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
    }

    // Get the storage location of u_Samplers
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
      console.log('Failed to get the storage location of u_lightPos');
      return;
    }

    // Get the storage location of u_cameraPos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
      console.log('Failed to get the storage location of u_cameraPos');
      return;
    }

    // Get the storage location of u_lightOn
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
      console.log('Failed to get the storage location of u_lightOn');
      return;
    }

    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
      console.log('Failed to get the storage location of u_lightColor');
      return;
    }
  }

  //Global Variables related to UI Elements
  let g_sliderAngle = 0;
  let g_mouseAngle = 0;

  // Animal Variables
  let g_headAngle = 0;
  let g_bodyAngle = 0;
  let g_buttAngle = 0;
  let g_WingAngle = 0;
  let g_leg1Angle = 0;

  // Animation Variables 
  let g_headAnimation = false;
  let g_bodyAnimation = false;
  let g_buttAnimation = false;
  let g_wingsAnimation = false;
  let g_legsAnimation = false;
  let g_NormalOn = false;
  let g_lightPos = [0, 1, -2];
  let g_lightOn = false;
  let g_lightColor = [1, 1, 1];

  // Set up actions for HTML UI elements
  function addActionsForHtmlUI(){
    // Slider Events
    document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){g_lightPos[1] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){g_lightPos[2] = this.value/100; renderAllShapes();}});

    document.getElementById('lightOnButton').onclick = function() { g_lightOn = true; };
    document.getElementById('lightOffButton').onclick = function() { g_lightOn = false; };
    document.getElementById('colorSlide').addEventListener('input', function() {
      let h = parseFloat(this.value);  // Get value (0 to 1)
      g_lightColor = hslToRgb(h);      // Convert hue to RGB
      renderAllShapes();               // Redraw scene with new color
  });
    //Animation Events
    document.getElementById("NormalOnButton").onclick = function() { g_NormalOn = true; };
    document.getElementById("NormalOffButton").onclick = function() { g_NormalOn = false; };
    document.getElementById("monsterAniOnButton").onclick = function() { g_bodyAnimation = true; };
    document.getElementById("monsterAniOffButton").onclick = function() { g_bodyAnimation = false; };
  }

  function initTextures() {
    //Create Texture0
    var floorImage = new Image();  // Create the image object
    if (!floorImage) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    floorImage.onload = function(){ 
      console.log("Floor texture Loaded", floorImage);
      sendImageToTEXTURE0(floorImage); 
    };
    // Tell the browser to load an image
    floorImage.src = './textures/floor.jpg';

    //Create Texture1
    var wallImage = new Image();  // Create the image object
    if (!wallImage) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    wallImage.onload = function(){ 
      console.log("Wall texture Loaded", wallImage);
      sendImageToTEXTURE1(wallImage); 
    };
    // Tell the browser to load an image
    wallImage.src = './textures/grass.jpg';
    return true;
  }
  let texture, texture1;
  function sendImageToTEXTURE0(floorImage) {
    texture = gl.createTexture();   // Create a texture object
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    console.log("Applying Floor Texture...");

    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, floorImage);
    
    // Set the texture unit 0 to the sampler
    console.log("Binding Floor Texture to Sampler0");
    gl.uniform1i(u_Sampler0, 0);
    console.log('Finished setting texture0');
  }

  //Create Texture1
  function sendImageToTEXTURE1(wallImage){
    texture1 = gl.createTexture();   // Create a texture object
    if (!texture1) {
      console.log('Failed to create the texture object');
      return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    console.log("Applying Wall Texture...");

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, wallImage);
    gl.uniform1i(u_Sampler1, 1);
    console.log('Finished setting texture1');
  }

function main() {  
  // Set up canvas and gl varaibles 
  setUpGL();

  // Set up GLSL shader program and connect GLSL variables
  connectVariablesToGLSL();
  

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Set up textures
  initTextures();

  //Set up mouse rotation
  mouseControl(); 

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // get animations
  requestAnimationFrame(tick);
}

// performance variables 
var g_StartTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_StartTime;

function tick(){
  g_seconds = performance.now()/1000.0 - g_StartTime;

  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

let startTime = Date.now();
let isDrawing = true;
var g_shapesList = [];

function convertCoordinatesEventTOGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}

function updateAnimationAngles(){
  //Monster Animation
  if (g_headAnimation){ g_headAngle = (30 * Math.sin(g_seconds) - 80); }
  if (g_bodyAnimation){ g_bodyAngle = -(30 * Math.sin(g_seconds) + 30); }
  if (g_buttAnimation){ g_buttAngle = (30 * Math.sin(g_seconds) + 30); }
  if (g_wingsAnimation){ g_WingAngle = (30 * Math.sin(g_seconds) - 80); }
  if (g_legsAnimation){ g_leg1Angle = (30 * Math.sin(g_seconds) - 10); }

  //Light Animation
  g_lightPos[0] = Math.cos(g_seconds);
}
function renderScene(){ 
  // Draw Body
  var bodyMatrix = new Matrix4();
  bodyMatrix.translate(-0.25, 0, 0.02);
  bodyMatrix.rotate(g_bodyAngle, 1, 0, 0);
  var body = new Cube(new Matrix4(bodyMatrix), [0.5, 0.35, 0.05, 1.0]);
  if(g_NormalOn) body.textureNum = -3;
  body.matrix.scale(0.3, 0.3, 0.3);
  body.render();

  // Save transformed matrices for other parts
  var bodyCoordinateMat = new Matrix4(bodyMatrix);
  var bodyCoordinateMat1 = new Matrix4(bodyMatrix);
  var bodyCoordinateMat2 = new Matrix4(bodyMatrix);
  var bodyCoordinateMat3 = new Matrix4(bodyMatrix);
  var bodyCoordinateMat4 = new Matrix4(bodyMatrix);
  var bodyCoordinateMat5 = new Matrix4(bodyMatrix);

  // Draw Head
  var headMatrix = new Matrix4(bodyCoordinateMat);
  headMatrix.translate(0, 0, -0.3);
  headMatrix.rotate(g_headAngle, 1, 0, 0);
  var head = new Cube(new Matrix4(headMatrix), [1.0, 1.0, 0, 1.0]);
  if(g_NormalOn) head.textureNum = -3;
  head.matrix.scale(0.3, 0.3, 0.3);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.uniform1i(u_Sampler1, 1);
  head.render();

  // Draw Butt
  var buttMatrix = new Matrix4(bodyCoordinateMat1);
  buttMatrix.translate(0, 0, 0.3);
  buttMatrix.rotate(g_buttAngle, 1, 0, 0);
  var butt = new Cube(new Matrix4(buttMatrix), [1, 1, 0, 1.0]);
  if(g_NormalOn) butt.textureNum = -3;
  butt.matrix.scale(0.3, 0.3, 0.3);
  butt.render();

  // Draw Wings
  var wingLMatrix = new Matrix4(bodyCoordinateMat2);
  wingLMatrix.translate(0.1, 0.20, 0.0);
  wingLMatrix.rotate(-g_WingAngle, 0, 0, 1);
  var wingL = new Cube(new Matrix4(wingLMatrix), [1.0, 1.0, 1.0, 1.0]);
  if(g_NormalOn) wingL.textureNum = -3;
  wingL.matrix.scale(0.1, 0.3, 0.3);
  wingL.render();

  var wingRMatrix = new Matrix4(bodyCoordinateMat3);
  wingRMatrix.translate(0.2, 0.30, 0.0);
  wingRMatrix.rotate(g_WingAngle, 0, 0, 1);
  var wingR = new Cube(new Matrix4(wingRMatrix), [1.0, 1.0, 1.0, 1.0]);
  if(g_NormalOn) wingR.textureNum = -3;
  wingR.matrix.scale(0.1, 0.3, 0.3);
  wingR.render();

  // Draw Legs
  var legLMatrix = new Matrix4(bodyCoordinateMat4);
  legLMatrix.translate(0.2, -0.10, 0.0);
  legLMatrix.rotate(-g_leg1Angle, 1, 0, 0);
  var legL = new Cube(new Matrix4(legLMatrix), [0.5, 0.35, 0.05, 1.0]);
  if(g_NormalOn) legL.textureNum = -3;
  legL.matrix.scale(0.05, 0.2, 0.1);
  legL.render();

  var legRMatrix = new Matrix4(bodyCoordinateMat5);
  legRMatrix.translate(0.04, -0.10, 0.0);
  legRMatrix.rotate(-g_leg1Angle, 1, 0, 0);
  var legR = new Cube(new Matrix4(legRMatrix), [0.5, 0.35, 0.05, 1.0]);
  if(g_NormalOn) legR.textureNum = -3;
  legR.matrix.scale(0.05, 0.2, 0.1);
  legR.render();

  //Draw Sky
  var skyMatrix = new Matrix4();
  skyMatrix.scale(-50, -50, -50);
  skyMatrix.translate(-0.5, -0.5, -0.5);
  var sky = new Cube(skyMatrix, [0.6, 0.8, 1.0, 1.0], -2);
  if(g_NormalOn) sky.textureNum = -3;
  gl.uniform1i(u_whichTexture, sky.textureNum);
  sky.render();
  
  //Draw Floor
  var floorMatrix = new Matrix4();
  floorMatrix.translate(0, -0.75, 0);
  floorMatrix.scale(10, 0, 10);
  var floor = new Cube(floorMatrix, [0.0, 1.0, 0.0, 1.0], 0);
  floor.matrix.translate(-0.5, 0.1, -0.5);
  floor.render();

  // Draw Sphere
  var sphereMatrix = new Matrix4();
  sphereMatrix.translate(1, 0, 0);
  sphereMatrix.scale(0.5, 0.5, 0.5);
  var sphere = new Sphere(sphereMatrix, [1.0, 0.0, 1.0, 1.0]); // White by default

  // Ensure the normal is applied
  if (g_NormalOn) { sphere.textureNum = -3; } 
  else { sphere.textureNum = -2; }

  // Make sure we are setting the correct uniform
  gl.uniform1i(u_whichTexture, sphere.textureNum);
  sphere.render();
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  //Draw Light 
  var lightMatrix = new Matrix4();
  lightMatrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  lightMatrix.scale(-0.1, -0.1, -0.1);
  lightMatrix.translate(-0.5, -0.5, -0.5);
  var light = new Cube(lightMatrix, [2, 2, 0, 1]);
  light.render();
}

var g_camera = new Camera();
var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

function renderAllShapes(){
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the global rotation matrix
  let totalRotation = g_mouseAngle + g_sliderAngle;
  var globalRotMat = new Matrix4();
  globalRotMat.setRotate(totalRotation, 0, 1, 0); // Apply combined rotation
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    
  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Pass Light Posiiton
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  //Pass camera Position
  gl.uniform3f(u_cameraPos, g_eye[0], g_eye[1], g_eye[2]);

  //Pass Light On
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);


  renderScene();

  // Calculate Performance
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: "+ Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}
//Display Performance
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

// Rotate Camera with Mouse
let lastMouseX = 0;
let mouseMoved = false; // Flag to indicate if mouse moved

function mouseControl() {
    canvas.onmousedown = function(ev) {
        lastMouseX = ev.clientX;
    };

    canvas.onmousemove = function(ev) {
        if (ev.buttons == 1) { // Only rotate if mouse button is held
            let deltaX = ev.clientX - lastMouseX;

            if (Math.abs(deltaX) > 0) { // Only update if actual movement happened
                g_mouseAngle += deltaX * 0.5;  // Adjust rotation speed
                lastMouseX = ev.clientX;

                mouseMoved = true;  // Flag that rotation changed
            }
        }
    };
}

function hslToRgb(h) {
  let r = Math.abs(h * 6 - 3) - 1;
  let g = 2 - Math.abs(h * 6 - 2);
  let b = 2 - Math.abs(h * 6 - 4);
  return [Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b))];
}
