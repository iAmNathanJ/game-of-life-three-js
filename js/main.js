'use strict';

var settings = {
  bgColor: '#111',
  worldSize: 16,
  cubeSize: 9,
  cubeColor: 0x2194ce,
  cubeSpacing: 1,
  outerCube: {
    color: 0xff66ff,
    opacity: 0.3
  },
  zoom: 400,
  refreshRate: 100,

  liveRangeLow: 2,
  liveRangeHigh: 3,
  birthNum: 3
};

function main() {

  'use strict';

  // SETUP ================================================

  var scene = void 0,
      _renderer = void 0,
      _camera = void 0,
      lights = void 0,
      outerCube = void 0,
      cube = void 0,
      life = void 0,
      running = false,
      cells = [];

  var MIN = Math.min;
  var MAX = Math.max;
  var FLOOR = Math.floor;
  var CEIL = Math.ceil;
  var RAND = Math.rand;

  var select = function select(e) {
    return document.querySelector(e);
  };

  var DOM = {
    main: select('.main'),
    header: select('.main-header'),
    controls: select('.controls'),
    controlsToggle: select('.controls-toggle'),
    ctrlCellCount: select('#ctrl-cell-count'),
    ctrlCellSize: select('#ctrl-cell-size'),
    ctrlCellSpacing: select('#ctrl-cell-spacing'),
    ctrlZoom: select('#ctrl-zoom'),
    ctrlSpeed: select('#ctrl-speed'),
    ctrlLiveRangeLow: select('#ctrl-live-range-low'),
    ctrlLiveRangeHigh: select('#ctrl-live-range-high'),
    ctrlBirthNum: select('#ctrl-birth-num'),
    ctrlGo: select('#ctrl-go')
  };

  var measure = {
    height: function height() {
      return DOM.main.clientHeight - DOM.header.clientHeight;
    },
    width: function width() {
      return DOM.main.clientWidth;
    }
  };

  var setup = {
    camera: function camera() {
      _camera = new THREE.PerspectiveCamera(40, getAspect(), 0.1, 1000);
      _camera.position.z = settings.zoom;
    },
    renderer: function renderer() {
      _renderer = new THREE.WebGLRenderer();
      _renderer.setSize(measure.width(), measure.height());
      _renderer.setPixelRatio(window.devicePixelRatio);
      _renderer.setClearColor(settings.bgColor);
      DOM.main.appendChild(_renderer.domElement);
    },
    lighting: function lighting() {
      lights = [new THREE.PointLight(0xffffff), new THREE.PointLight(0xffffff), new THREE.PointLight(0xffffff)];

      lights[0].position.set(150, -150, 150);
      lights[1].position.set(-150, 0, 150);
      lights[2].position.set(0, 150, 150);

      lights.forEach(function (light) {
        scene.add(light);
      });
    },
    controls: function controls() {
      DOM.ctrlCellCount.value = settings.worldSize;
      DOM.ctrlCellSize.value = settings.cubeSize;
      DOM.ctrlCellSpacing.value = settings.cubeSpacing;
      DOM.ctrlZoom.value = -settings.zoom;
      DOM.ctrlSpeed.value = settings.refreshRate;
    },
    listeners: function listeners() {
      window.addEventListener('resize', debounce(updateCamera, 150));
      window.addEventListener('mousemove', throttle(rotateScene, 50));
      DOM.controlsToggle.addEventListener('click', toggleControls);
      DOM.ctrlCellCount.addEventListener('input', updateWorldSize);
      DOM.ctrlCellSize.addEventListener('input', updateCubeSize);
      DOM.ctrlCellSpacing.addEventListener('input', updateCubeSpacing);
      DOM.ctrlZoom.addEventListener('input', updateZoom);
      DOM.ctrlSpeed.addEventListener('input', updateRefreshRate);
      DOM.ctrlLiveRangeLow.addEventListener('input', updateRules);
      DOM.ctrlLiveRangeHigh.addEventListener('input', updateRules);
      DOM.ctrlBirthNum.addEventListener('input', updateRules);
      DOM.ctrlGo.addEventListener('click', go);
    }
  };

  var material = {
    transparent: new THREE.MeshLambertMaterial({
      color: settings.cubeColor,
      transparent: true,
      opacity: 0
    }),
    solid: new THREE.MeshLambertMaterial({
      color: settings.cubeColor,
      transparent: true,
      opacity: 0.8
    }),
    wireframe: new THREE.MeshLambertMaterial({
      color: settings.outerCube.color,
      transparent: true,
      opacity: settings.outerCube.opacity,
      wireframe: true
    })
  };

  // INITIALIZE ================================================

  function init() {

    scene = new THREE.Scene();

    setup.camera();
    setup.renderer();
    setup.lighting();
    setup.controls();
    setup.listeners();

    life = $_life(settings.liveRangeLow, settings.liveRangeHigh, settings.birthNum);
    life.seed(settings.worldSize, settings.worldSize, settings.worldSize);
    constructWorld(settings.cubeSize, settings.cubeSpacing);
  }

  init();

  // RENDER HELPERS ================================================

  function getAspect() {
    return measure.width() / measure.height();
  }

  function render() {
    _renderer.render(scene, _camera);
  };

  function play() {
    render();
    requestAnimationFrame(play);
  }

  // EVENT HANDLERS ================================================

  function updateCamera() {
    _camera.position.z = settings.zoom;
    _camera.aspect = getAspect();
    _camera.updateProjectionMatrix();
    _renderer.setSize(measure.width(), measure.height());
    render();
  }

  function rotateScene(event) {
    var strength = 6;
    var percentX = event.clientX / measure.width();
    var percentY = event.clientY / DOM.main.clientHeight;
    var rotationX = (Math.round(percentX * 100) - 50) / 100;
    var rotationY = (Math.round(percentY * 100) - 50) / 100;
    outerCube.rotation.y = rotationX * strength;
    outerCube.rotation.x = rotationY * strength;
    render();
  }

  function toggleControls() {
    DOM.controls.classList.toggle('open');
  }

  function updateRules(event) {
    switch (event.target.name) {
      case 'live-range-low':
        settings.liveRangeLow = event.target.value;
        life.setLiveRangeLow(settings.liveRangeLow);
        break;
      case 'live-range-high':
        settings.liveRangeHigh = event.target.value;
        life.setLiveRangeHigh(settings.liveRangeHigh);
        break;
      case 'birth-num':
        settings.birthNum = event.target.value;
        life.setBirthNum(settings.birthNum);
        break;
    }
  }

  function updateWorldSize(event) {
    settings.worldSize = event.target.valueAsNumber;
  }

  function updateCubeSize(event) {
    settings.cubeSize = event.target.valueAsNumber;
  }

  function updateCubeSpacing(event) {
    settings.cubeSpacing = event.target.valueAsNumber;
  }

  function updateZoom(event) {
    var update = -event.target.valueAsNumber;
    settings.zoom = update;
    updateCamera();
  }

  function updateRefreshRate(event) {
    settings.refreshRate = -event.target.valueAsNumber;
  }

  // GO ================================================

  function go() {

    var liveCells = 0;

    for (var i = 0, length = cells.length; i < length; i++) {
      for (var j = 0; j < length; j++) {
        for (var k = 0; k < length; k++) {
          if (life.state[i][j][k]) {
            cells[i][j][k].material = material.solid;
            liveCells += 1;
          } else {
            cells[i][j][k].material = material.transparent;
          }
        }
      }
    }

    life.generate();
    render();

    if (liveCells) {
      setTimeout(go, settings.refreshRate);
    }
  }

  function constructWorld(cubeSize, cubeSpacing) {

    var outerCubeSize = settings.worldSize * settings.cubeSize + settings.worldSize * settings.cubeSpacing;
    var outerBox = new THREE.BoxGeometry(outerCubeSize, outerCubeSize, outerCubeSize);
    var outerBoxMaterial = material.wireframe;
    outerCube = new THREE.Mesh(outerBox, outerBoxMaterial);
    scene.add(outerCube);

    var box = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    var maxPosCoords = settings.worldSize / 2 - settings.cubeSpacing,
        upper = maxPosCoords * cubeSize + maxPosCoords * cubeSpacing - settings.cubeSpacing,
        lower = -upper,
        i,
        j,
        k,
        x,
        y,
        z;

    for (i = 0, x = lower; x < upper; i++, x += cubeSize + cubeSpacing) {
      cells[i] = [];
      for (j = 0, y = lower; y < upper; j++, y += cubeSize + cubeSpacing) {
        cells[i][j] = [];
        for (k = 0, z = lower; z < upper; k++, z += cubeSize + cubeSpacing) {
          cube = new THREE.Mesh(box, material.solid);
          cube.position.x = x;
          cube.position.y = y;
          cube.position.z = z;
          cells[i][j][k] = cube;
        }
      }
    }

    cells.forEach(function (rows) {
      rows.forEach(function (cols) {
        cols.forEach(function (cell) {
          outerCube.add(cell);
        });
      });
    });

    render();
  }
}

document.addEventListener('DOMContentLoaded', main);

// UTILITY ================================================

function debounce(fn, wait) {
  var timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, wait);
  };
}

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last, deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date(),
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}