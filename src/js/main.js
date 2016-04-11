const settings = {
  bgColor: '#111',
  worldSize: 16,
  cubeSize: 9,
  cubeColor: 0x2194ce,
  cubeSpacing: 0,
  outerCube: {
    color: 0xff66ff,
    opacity: 0.3
  },
  zoom: 500,
  refreshRate: 100,

  liveRangeLow: 2,
  liveRangeHigh: 3,
  birthNum: 3
};

function main() {

  'use strict';

  // SETUP ================================================

  let scene, renderer, camera, lights, outerCube, cube, life, running = false, cells = [];

  const MIN   = Math.min;
  const MAX   = Math.max;
  const FLOOR = Math.floor;
  const CEIL  = Math.ceil;
  const POW   = Math.pow;
  const RAND  = Math.rand;

  const select = (e) => document.querySelector(e);

  const DOM = {
    body: select('body'),
    main: select('.main'),
    header: select('.main-header h1'),
    canvas: select('.main-canvas'),
    controls: select('.controls'),
    controlsToggle: select('.controls-toggle'),

    ctrlCellCount: select('#ctrl-cell-count'),
    cellCountValue: select('.control-group.cell-count .slider-value'),

    ctrlCellSize: select('#ctrl-cell-size'),
    cellSizeValue: select('.control-group.cell-size .slider-value'),

    ctrlCellSpacing: select('#ctrl-cell-spacing'),
    cellSpacingValue: select('.control-group.cell-spacing .slider-value'),

    ctrlZoom: select('#ctrl-zoom'),
    zoomValue: select('.control-group.zoom .slider-value'),

    ctrlSpeed: select('#ctrl-speed'),
    speedValue: select('.control-group.speed .slider-value'),

    ctrlLiveRangeLow: select('#ctrl-live-range-low'),
    ctrlLiveRangeHigh: select('#ctrl-live-range-high'),
    ctrlBirthNum: select('#ctrl-birth-num'),

    ctrlPlay: select('#ctrl-play'),
    ctrlPause: select('#ctrl-pause'),
    ctrlReset: select('#ctrl-reset')
  };

  const measure = {
    height() { return DOM.main.clientHeight; },
    width() { return DOM.main.clientWidth + DOM.header.clientHeight; }
  };

  const setup = {
    camera() {
      camera = new THREE.PerspectiveCamera(40, getAspect(), 0.1, 1000)
      camera.position.z = settings.zoom;
    },
    renderer() {
      renderer = new THREE.WebGLRenderer({ canvas: DOM.canvas });
      renderer.setSize(measure.width(), measure.height());
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(settings.bgColor);
      // if canvas option is not specified in WebGLRenderer creation,
      // the below line is required...
      // DOM.main.appendChild(DOM.canvas);
    },
    lighting() {
      lights = [
        new THREE.PointLight(0xffffff),
        new THREE.PointLight(0xffffff),
        new THREE.PointLight(0xffffff)
      ];

      lights[0].position.set(150, -150, 150);
      lights[1].position.set(-150, 0, 150);
      lights[2].position.set(0, 150, 150);

      lights.forEach(light => {
        scene.add(light);
      });
    },
    controls() {
      DOM.ctrlCellCount.value = settings.worldSize;
      DOM.ctrlCellSize.value = settings.cubeSize;
      DOM.ctrlCellSpacing.value = settings.cubeSpacing;
      DOM.ctrlZoom.value = -settings.zoom;
      DOM.ctrlSpeed.value = settings.refreshRate;
    },
    listeners() {
      window.addEventListener('resize', debounce(updateCamera, 150));
      DOM.canvas.addEventListener('mousedown', () => {
        DOM.canvas.addEventListener('mousemove', rotateScene);
      });
      DOM.canvas.addEventListener('mouseup', () => {
        DOM.canvas.removeEventListener('mousemove', rotateScene);
      });
      DOM.controlsToggle.addEventListener('click', toggleControls);
      DOM.ctrlCellCount.addEventListener('input', updateWorldSize);
      DOM.ctrlCellSize.addEventListener('input', updateCubeSize);
      DOM.ctrlCellSpacing.addEventListener('input', updateCubeSpacing);
      DOM.ctrlZoom.addEventListener('input', updateZoom);
      DOM.ctrlSpeed.addEventListener('input', updateSpeed);
      DOM.ctrlLiveRangeLow.addEventListener('input', updateRules);
      DOM.ctrlLiveRangeHigh.addEventListener('input', updateRules);
      DOM.ctrlBirthNum.addEventListener('input', updateRules);
      DOM.ctrlPlay.addEventListener('click', play);
      DOM.ctrlPause.addEventListener('click', pause);
      DOM.ctrlReset.addEventListener('click', reset);
    }
  };

  const material = {
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
    }),
    lambert() {
      return new THREE.MeshLambertMaterial({
        color: settings.cubeColor,
        transparent: true,
        opacity: 0.8
      });
    }
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
    // renderLoop();
    render();
  }

  init();

  function getAspect() {
    return measure.width() / measure.height();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function renderLoop() {
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  }

  // EVENT HANDLERS ================================================

  function updateCamera() {
    camera.aspect = getAspect();
    camera.updateProjectionMatrix();
    renderer.setSize(measure.width(), measure.height());
    render();
  }

  function rotateScene(event) {
    let strength = 6;
    let percentX = event.clientX / measure.width();
    let percentY = event.clientY / DOM.main.clientHeight;
    let rotationX = (Math.round(percentX * 100) - 50) / 100;
    let rotationY = (Math.round(percentY * 100) - 50) / 100;
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
    DOM.cellCountValue.innerHTML = POW(settings.worldSize, 3);
  }

  function updateCubeSize(event) {
    settings.cubeSize = event.target.valueAsNumber;
    DOM.cellSizeValue.innerHTML = event.target.valueAsNumber;
  }

  function updateCubeSpacing(event) {
    settings.cubeSpacing = event.target.valueAsNumber;
    DOM.cellSpacingValue.innerHTML = event.target.valueAsNumber;
  }

  function updateZoom(event) {
    settings.zoom = -event.target.valueAsNumber;
    DOM.zoomValue.innerHTML = event.target.valueAsNumber;
    camera.position.z = settings.zoom;
    render();
  }

  function updateSpeed(event) {
    settings.refreshRate = -event.target.valueAsNumber;
    DOM.speedValue.innerHTML = event.target.valueAsNumber;
  }

  // GO ================================================

  function go() {

    let liveCells = 0;

    for(var i = 0, length = cells.length; i < length; i++) {
      for(var j = 0; j < length; j++) {
        for(var k = 0; k < length; k++) {
          if(life.state[i][j][k]) {
            cells[i][j][k].visible = true;
            liveCells += 1;
          } else {
            cells[i][j][k].visible = false;
          }
        }
      }
    }

    life.generate();
    render();

    if(liveCells && running) {
      setTimeout(go, settings.refreshRate);
    }

    if(!liveCells) {
      reset();
    }

  }

  function constructWorld(cubeSize, cubeSpacing) {

    // let outerCubeSize = (settings.worldSize * cubeSize) + (settings.worldSize * cubeSpacing);
    let outerBox = new THREE.BoxGeometry(1, 1, 1);
    let outerBoxMaterial = material.transparent;
    outerCube = new THREE.Mesh(outerBox, outerBoxMaterial);
    scene.add(outerCube);

    let box = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    var maxPosCoords = settings.worldSize / 2,
        upper = (maxPosCoords * cubeSize) + (maxPosCoords * cubeSpacing) - cubeSpacing,
        lower = -upper,
        i, j, k, x, y, z, offsetHue;

    for(i = 0, x = lower; x < upper; i++, x += (cubeSize + cubeSpacing)) {
      cells[i] = [];
      for(j = 0, y = lower; y < upper; j++, y += (cubeSize + cubeSpacing)) {
        cells[i][j] = [];
        for(k = 0, z = lower; z < upper; k++, z += (cubeSize + cubeSpacing)) {
          cube = new THREE.Mesh(box, material.lambert());
          cube.material.color.offsetHSL((.005 * (j)), 0, 0);
          cube.position.x = x;
          cube.position.y = y;
          cube.position.z = z;
          cells[i][j][k] = cube;
        }
      }
    }
    cells.forEach(rows => {
      rows.forEach(cols => {
        cols.forEach(cell => {
          outerCube.add(cell);
        });
      });
    });
  }

  function clearScene() {
    for (let i = scene.children.length-1; i >= 0 ; i--) {
      let child = scene.children[i];
      if(child instanceof THREE.Mesh) {
        scene.remove(scene.children[i]);
      }
    }
  }

  function pause() {
    running = false;
  }

  function play() {
    running = true;
    go();
  }

  function reset() {
    pause();
    clearScene();
    constructWorld(settings.cubeSize, settings.cubeSpacing);
    life.seed(settings.worldSize, settings.worldSize, settings.worldSize);
    render();
  }
}

document.addEventListener('DOMContentLoaded', main);


// UTILITY ================================================

function debounce(fn, wait) {
  var timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(fn, wait);
  };
}

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
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
