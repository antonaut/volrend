define(
  ["THREE",
   "RandomEngine"],
  function(THREE,
           RandomEngine) {

    // https://color.adobe.com/create/color-wheel
    var colorScheme = [0x4914CC, 0x665199, 0x0040FF, 0xFFB740, 0xCC6F14];
    var randomColorFromScheme = function () {
      var idx = Math.floor(RandomEngine.random()*colorScheme.length);
      return colorScheme[idx];
    };


    var NewCube = function(color) {
      var geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      var material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
      });

      var cube = new THREE.Mesh(geometry, material);

      return cube;
    };

    var NewAxis = function() {
      var redCube = NewCube(0xee0000);
      var blueCube = NewCube(0x00ee00);
      var greenCube = NewCube(0x0000ee);
      var whiteCube = NewCube(0xffffff);

      redCube.position.x = 1;      // positive x-axis
      blueCube.position.y = 1;     // positive y-axis
      greenCube.position.z = 1;    // positive z-axis
      // white is origo

      var axis = new THREE.Object3D();

      axis.add(redCube);
      axis.add(blueCube);
      axis.add(greenCube);
      axis.add(whiteCube);

      return axis;
    };

    var addLights = function(scene) {

      var light = new THREE.AmbientLight(0x404040); // soft white light
      scene.add(light);

      var pointLight = new THREE.PointLight(0xeeeeee, 1, 0);
      scene.add(pointLight);

      pointLight.position.y = 5;
      pointLight.position.z = -2;
    };

    var volumeTexture = null;
    var loadVolumeData = function() {
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data

      var oReq = new XMLHttpRequest();
      oReq.open("GET", "/dataset/fuel.raw", true);
      oReq.responseType = "arraybuffer";

      oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        if (arrayBuffer) {
          var byteArray = new Uint8Array(arrayBuffer);
          /*var MAX_VAL = 0;
          var byteArray = new Uint8Array(shortArray.length);
          for (var i = 0; i < byteArray.length; i++) {
            byteArray[i] = Math.floor(shortArray[i]/2);
          }*/
          volumeTexture = new THREE.DataTexture(byteArray,
                                                64*64,
                                                64,
                                                THREE.RGBFormat,
                                                THREE.UnsignedByteType);
        }
      };

      oReq.send(null);
    };

    function loadFile (sURL, fCallback, async) {
      var oReq = new XMLHttpRequest();
      if (typeof async == "undefined") {
        async = true;
      }
      oReq.open("get", sURL, async);
      oReq.onreadystatechange = function () {
        if (oReq.readyState == 4 && oReq.status == 200) {
          fCallback(oReq.responseText);
        }
      };
      oReq.send(null);
    }

    function makeVolCube (vshader, fshader) {
      var geometry = new THREE.BoxGeometry(10, 10, 10);
      var material = new THREE.ShaderMaterial({
        uniforms : {
          volTex: volumeTexture
        },
        vertexShader: vshader,
        fragmentShader: fshader,
        side: THREE.DoubleSide
      });
      return new THREE.Mesh(geometry, material);
    }


    (function () {

      var scene = new THREE.Scene();
      var clock = new THREE.Clock();
      var camera = new THREE.PerspectiveCamera(75,
                                               window.innerWidth /
                                               window.innerHeight,
                                               0.1,
                                               10000);
      var renderer = new THREE.WebGLRenderer();

      renderer.setSize(window.innerWidth, window.innerHeight);
      var bgColor = "#001144"; // randomColorFromScheme();
      renderer.setClearColor( bgColor );

      document.body.appendChild(renderer.domElement);

      // TODO: figure out how fog works
      // scene.fog = new THREE.FogExp2( bgColor, 0.0025 );

      addLights(scene);

      var topObj = new THREE.Object3D();

      var axis = NewAxis();

      topObj.add(axis);

      scene.add(topObj);

      camera.position.z = 20;
      camera.position.y = 3;

      loadVolumeData();

      var volCube;
      var vertexShaderSrc;
      var fragmentShaderSrc;

      // TODO: Do this in a more fashionable way.
      // JavaScript std lib - FileReader?

      loadFile('/shaders/volumeVertexShader.glsl',
               function(vsrc) {
                 vertexShaderSrc = vsrc;
               }, false);

      loadFile('/shaders/volumeFragmentShader.glsl',
               function (fsrc) {
                 fragmentShaderSrc = fsrc;
                 setTimeout(function() {
                   while (volumeTexture == null) {}
                   volCube = makeVolCube(vertexShaderSrc, fragmentShaderSrc);
                   scene.add(volCube);
                 }, 3000);
               }, true);



      var resizeHandler = function( event ) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize',
                              resizeHandler,
                              false);

      // Main render loop
      window.paused = false;

      var loop = function () {

        if (window.paused) { return window.requestAnimationFrame( loop ); }
        var deltaTime = clock.getDelta();

        renderer.render( scene, camera );
        return window.requestAnimationFrame( loop );
      };

      loop();
    })();

  });
