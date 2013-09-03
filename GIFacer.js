
var image;

var mouseX = 0, mouseY = 0;

var _video, _outputCanvas, _ctx, _localMediaStream;

var _frames;
var _curFrame;
var gifEncoder;
var gifFrameNum = 0;
var gifFrames = 5;
var gifEncoding;


var _captureRate = 0;
var _playbackRate = 0;
var _canvasAngle = 0;
var _numOfSlices = 9;
var _numOfFrames = 9;
var _encodeRate = 1;

var _captureTL;
var _playbackTL;

$( document ).ready(function() {
    loadAssets();
});





Filters = {};
Filters.getPixels = function(img) {
   // console.log('get pixels');
   // console.log(img);
  var c = this.getCanvas(img.width, img.height);
  //console.log(c);
  var ctx = c.getContext('2d');
  ctx.drawImage(img,0,0);
  return ctx.getImageData(0,0,c.width,c.height);
};

Filters.getCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

Filters.filterImage = function(filter, image, var_args) {
    //console.log(image);
  var args = [this.getPixels(image)];
  for (var i=2; i<arguments.length; i++) {
    args.push(arguments[i]);
  }
  return filter.apply(null, args);
};

Filters.threshold = function(pixels, threshold) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

Filters.thresholdRange = function(pixels, min, max, value, cutout) {
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
      var a = d[i+3];
        var val = 0.2126*r + 0.7152*g + 0.0722*b;
        
        if (cutout) 
        {
          d[i+3] = 100;
        }
        else
        {
          var v = (val >= min && val <= max) ? value : val;
        }
        d[i] = d[i+1] = d[i+2] = v
        

    }
    return pixels;
}

Filters.grayscale = function(pixels, args) {
   // console.log('grayscale')
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};


function __applyFilter(cnv){
    var ctx = cnv.getContext("2d");

    var lMin = $('#lMin').val();
    var lMax = $('#lMax').val();
    var lValue = $('#lValue').val();

    var mMin = $('#mMin').val();
    var mMax = $('#mMax').val();
    var mValue = $('#mValue').val();

    var hMin = $('#hMin').val();
    var hMax = $('#hMax').val();
    var hValue = $('#hValue').val();

  var data = Filters.filterImage(Filters.thresholdRange, cnv, lMin, lMax, lValue);
  ctx.putImageData(data,0,0);
    var data = Filters.filterImage(Filters.thresholdRange, cnv, mMin, mMax, mValue);
    ctx.putImageData(data,0,0);
    var data = Filters.filterImage(Filters.thresholdRange, cnv, hMin, hMax, hValue);
  //var data = Filters.filterImage(Filters.grayscale, cnv);
    ctx.putImageData(data,0,0);
   // console.log(cnv);
  }



function onAssetsLoaded() {

  init();
  animate();
}


function loadAssets() {
  image = new Image();
    image.src = "img/face.png";
    image.onload = onAssetsLoaded;
}


function __onCameraDetectionError(e)
{
  console.log('Browser failed to receive a camera object', e);
}

function __onCameraSuccess(e)
{
  console.log('Browser camera detection successful');
}

function __onGifEncoder()
{

   gifEncoder = new GIF({
      workers: 1,
      quality: 50
    });

    gifEncoder.on('finished', function(blob) {
      console.log('all set');
      window.open(URL.createObjectURL(blob));
    });

   gifFrameNum = 0;
   _encodeRate = $('#encodeRate').val();
   gifEncoding = true;
    

   
}



function __onSnapshot() {

  

  console.log('taking snapshot');
  TweenMax.to($('#countDown'),.2,{opacity:1});
    _curFrame = 0;
    _playbackTL.pause();


    _canvasAngle = $('#captureRate').val();
    _numOfSlices = $('#slices').val();
    _numOfFrames = $('#frames').val();
    _captureRate = $('#captureRate').val();
   


    __initCanvases();

    console.log(_canvasAngle+' - '+_numOfSlices+' - '+_numOfFrames+'- '+_captureRate+' -'+_playbackRate+'  -'+_localMediaStream);

  if (_localMediaStream) {


    //_ctx.drawImage(_video, 0, 0, _video.clientWidth, 100, 0, 0, _video.clientWidth, 100);
    //_ctx.drawImage(_video, 0, 120, _video.clientWidth, 100, 0, 120, _video.clientWidth, 100);
    //_ctx.drawImage(_video, 0, 240, _video.clientWidth, 100, 0, 240, _video.clientWidth, 100);
    //_ctx.drawImage(_video, 0, 360, _video.clientWidth, 100, 0, 360, _video.clientWidth, 100);

      //{repeat:-1, yoyo:true}
    _captureTL.clear();
    var timing = 1;

    var i;
    var limit = _frames.length;

    for (i = 0; i<limit; ++i)
    {
      var frame = _frames[i];
      console.log('capture'+i)
      //tl.call(__videoGrab,[frame.getContext('2d'), 0, 150*i, _video.clientWidth, 150], this, "+=1"); 
      _captureTL.call(__videoGrab,[frame, 0, 0, _video.clientWidth, _video.clientHeight], this, "+="+_captureRate)
      _captureTL.call(__onSnapShotPreview,[frame], this, "+=.01");
    }


   
    //playback.call(__spliceFrames,[], this, "+=.5");
   
       // tl.to(lT.sprite,timing,{ease:Strong.easeInOut, rotation:sA*.4+'deg', transformOrigin:lT.pivotX+'px '+lT.pivotY+'px'},'startRight'),

    //TweenMax.delayedCall(1, __videoGrab, [v]);
   // TweenMax.
    // "image/webp" works in Chrome 18. In other browsers, this will fall back to image/png.
    
  }
}

function __onSnapShotPreview(frame)
{
  console.log('preview')
    _ctx.clearRect ( 0 , 0 , 320 , 240 );
    _ctx.drawImage(frame, 0, 0,640,480,0,0,320,240);
    
    __onProcessCanvas();
}


function __onFramesBatched()
{
    console.log('batching');
    TweenMax.to($('#countDown'),.2,{opacity:0});
    $('#countdownTimer').text('');
    _playbackTL.play();
}


/*  Initialize canvases for multiple frames */
function __initCanvases()
{
    _frames = [];
    var i;
    var limit = _numOfFrames;
    console.log(limit+'---'+_numOfFrames);
    $('#frames').text("");
    for (i = 0; i<limit; ++i)
    {
      console.log("canvas "+i);
      frameID = 'frame_'+i
      $('#frames').append('<canvas  width="640" height="480" id="'+frameID+'" class="grayscale"></canvas>');
      frame = document.getElementById(frameID);
      _frames[i] = frame;
    }
}

/* draw setion to canvas */
function __videoGrab(c,x,y,w,h) 
{
  console.log('video Grab');
  _curFrame++;
  $('#countdownTimer').text('-'+_curFrame+'-');
  if (_localMediaStream) {
    //ctx.drawImage(_video,x,y-10,w,h+20,x,y-10,w,h+20);
    //ctx.globalAlpha=1;
      var ctx = c.getContext('2d');
      ctx.drawImage(_video,x,y,w,h,x,y,w,h);
      __applyFilter(c);
  }
}

function __spliceFrames()
{
   _playbackRate = $('#playbackRate').val();
   _numOfSlices = $('#slices').val();
   _canvasAngle = $('#angle').val();

   if(_playbackRate <=0)
   {
    _playbackRate = 0;
   }
   _playbackTL.timeScale(_playbackRate);

    var s;
    var sLimit = _numOfSlices;//_frames.length;
    var frameHeight = _video.clientHeight;
    var frameWidth = _video.clientWidth;

    var sliceSize = frameHeight / sLimit;
    var slices = sLimit;
    // loop for determining the faded edge thickness of each slice.
  for (s = 0; s<slices; ++s)
    {
      var frame = _frames[Math.floor(Math.random()*_frames.length)];
      var sY = sliceSize*s;
      //console.log(s);
      _ctx.globalAlpha=.2;
      var edge;
      var edgeLimit = 20;
      var edgeThickness = 2;
      var x = _outputCanvas.width>>1;//Math.random()*.5;//_outputCanvas.width;
      var y = _outputCanvas.height>>1;//_outputCanvas.height;
      var angleInRadians = (Math.random()*_canvasAngle - _canvasAngle/2) * Math.PI/180;
       _ctx.translate(x, y);
       _ctx.rotate(angleInRadians);
      for (edge=edgeLimit; edge > 0; edge -= edgeThickness)
      {
            eY = sY - edge;
            if (eY < 0) eY = 0;
            eH = sliceSize + edge*2;
            if (eY + eH > frameHeight) eH = frameHeight - eY;
            //draws faded edges on each frame to blend better
            
           
            _ctx.drawImage(frame, 0, eY,frameWidth,eH,-x,(eY)/2 - y,frameWidth/2,sliceSize/2 + edge*2)
            
            

        
      }
      
      
      _ctx.globalAlpha=.8;
      _ctx.drawImage(frame, 0, sY,frameWidth,sliceSize,-x,sY/2 - y,frameWidth/2,sliceSize/2)

      _ctx.rotate(-angleInRadians);
      _ctx.translate(-x, -y);
    }
    __onProcessCanvas();
}

function __onProcessCanvas()
{
  document.querySelector('img').src = _outputCanvas.toDataURL('image/webp');
  if (gifEncoding)
  {
    console.log('FRAME='+gifFrameNum);
      gifFrameNum++;
      gifEncoder.addFrame(_outputCanvas, {delay: _encodeRate * 1000});
      if(gifFrameNum > gifFrames)
      {
        gifEncoding = false;
        gifEncoder.render();
      }
      
  }
}


// initialize page after image load.
function init() 
{

  container = document.createElement( 'div' );
    document.body.appendChild( container );


    window.URL = window.URL || window.webkitURL;
  navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia || navigator.msGetUserMedia;

  _video = document.querySelector('video');
  _outputCanvas = document.getElementById('output');
  _ctx = _outputCanvas.getContext('2d');
  _localMediaStream = null;
  _frames = [];

  __initCanvases();


  _video.addEventListener('click', __onSnapshot, false);


  if (navigator.getUserMedia) {
    navigator.getUserMedia({ video: true}, function(stream) {
      _video.src = window.URL.createObjectURL(stream);
      _localMediaStream = stream;
    }, __onCameraDetectionError);
  } else {
    console.log('no getUserMedia, sucks bro');
    //_video.src = 'somevideo.webm'; // fallback.
  }

    _captureTL = new TimelineMax({onComplete:__onFramesBatched});

    _playbackTL = new TimelineMax({repeat:-1});

    _playbackTL.call(__spliceFrames,[], this, "+=.05");
    _playbackTL.pause();

    var recordButton = document.getElementById('recordButton')
    recordButton.addEventListener('click', __onSnapshot, false);
     var gifButton = document.getElementById('gifButton');
    gifButton.addEventListener('click', __onGifEncoder,false);



  _stats = new Stats();
  _stats.domElement.style.position = 'absolute';
  _stats.domElement.style.top = '0px';
  _stats.domElement.style.left = '500px';
  container.appendChild( _stats.domElement );
  _stats.update();


}




function animate() {

    requestAnimationFrame( animate );
  
    //render();
    _stats.update();

}


function getRotationDegrees(obj) 
{
    var matrix = obj.css("-webkit-transform") ||
    obj.css("-moz-transform")    ||
    obj.css("-ms-transform")     ||
    obj.css("-o-transform")      ||
    obj.css("transform");
    if(matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    } else { var angle = 0; }
    return (angle < 0) ? angle +=360 : angle;
}





function PixelSlider(id, width, height, min, max, steps)
{
  this._id = id;
 // this._bar = 
}


PixelSlider.prototype.Init = function()
{

}











   

