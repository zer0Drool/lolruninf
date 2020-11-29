let scene, camera, renderer, light, skyboxGeo, skybox, raycaster, mouse, intersects;
let forward, backward = null;
let currentPos = 0;
let mats = {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null
};
// let mats = [];
let transitioning = false;
let rotation;

let noOfSpheres = 10;
let spheres = [];
let spherePos = 0;
let sphereRots = [100, 90, 90, 90, 90, 90, -90, -90, -90, 90];

let arrowObjs = [];
let arrowsPos = [[-6000, -4000, -9000], [0, -4000, 9000]];
let arrowsRot = [[0, 90, 0], [0, 9.5, 0]];

let arrowInfo = [
    [
        // 0
        {
            position: [-300, -800, -1500],
            rotation: -5,
        },
        {
            position: null,
            rotation: null,
        }
    ],
    [
        // 1
        {
            position: [0, -800, -1500],
            rotation: 0,
        },
        {
            position: [0, -800, 1500],
            rotation: 180,
        },
    ],
    [
        // 2
        {
            position: [0, -800, -1500],
            rotation: 0,
        },
        {
            position: [0, -800, 1500],
            rotation: 180,
        },
    ],
    [
        // 3
        {
            position: [0, -800, -1500],
            rotation: 0,
        },
        {
            position: [0, -800, 1500],
            rotation: 180,
        },
    ],
    [
        // 4
        {
            position: [0, -800, -1500],
            rotation: 0,
        },
        {
            position: [0, -800, 1500],
            rotation: 180,
        },
    ],
    [
        // 5
        {
            position: [10, -800, -1500],
            rotation: -5,
        },
        {
            position: [-10, -800, 1500],
            rotation: 185,
        },
    ],
    [
        // 6
        {
            position: [0, -800, -1500],
            rotation: 5,
        },
        {
            position: [200, -800, 1500],
            rotation: 185,
        },
    ],
    [
        // 7
        {
            position: [60, -800, -1500],
            rotation: -7,
        },
        {
            position: [0, -800, 1500],
            rotation: 180,
        },
    ],
    [
        // 8
        {
            position: [60, -800, -1500],
            rotation: -7,
        },
        {
            position: [0, -800, 1500],
            rotation: 180,
        },
    ],
    [
        // 9
        {
            position: null,
            rotation: null,
        },
        {
            position: [0, -800, 1500],
            rotation: 180,
        },
    ]
];

let instructionsWrap = document.getElementById('instructions-wrap');
let instructions = document.getElementById('instructions');
let spans;

let loadingInt;
let loading = ['', 'l', 'lo', 'loa', 'load', 'loadi', 'loadin', 'loading'];
let loadingCount = 0;

loadingInt = setInterval(() => {
    loadingAnim();
}, 200);

function loadingAnim () {
    loadingCount++;
    if (loadingCount > loading.length - 1) {
        loadingCount = 0;
    };
    instructions.innerText = loading[loadingCount];
};

let manager = new THREE.LoadingManager();
manager.onLoad = function () {
    init();
};

for (let i = 0; i < noOfSpheres; i++) {

    axios.get(`https://cors-anywhere.herokuapp.com/${vistas[i]}`)
    .then((response) => {
        let texture = new THREE.TextureLoader(manager).load(response.config.url);
        let sphereMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
        mats[i] = sphereMaterial;
    }, (error) => {
        console.log(error);
    });

};

function positionArrows() {

    for (var i = 0; i < arrowObjs.length; i++) {
        if (arrowInfo[currentPos][i].position === null) {
            arrowObjs[i].visible = false;
        } else {
            arrowObjs[i].rotation.y = THREE.Math.degToRad(arrowInfo[currentPos][i].rotation);
            arrowObjs[i].position.set(arrowInfo[currentPos][i].position[0], arrowInfo[currentPos][i].position[1], arrowInfo[currentPos][i].position[2]);
            arrowObjs[i].visible = true;
        };
    };

};

function move(direction) {

    console.log(currentPos);

    transitioning = true;

    for (var i = 0; i < spheres.length; i++) {
        let pos = spheres[i].position;
        let posZ = pos.z;

        if (direction === 'forward') {
            posZ += 10000;
        } else {
            posZ -= 10000;
        };

        var tweenMove = new TWEEN.Tween(pos)
        .to(
            {
                x: 0,
                y: 0,
                z: posZ
            },
            700
        )
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()
    };

    setTimeout(() => {
        jump(direction);
    }, 710);

    positionArrows();

};

function jump(direction) {

    if (currentPos !== 1 && currentPos !== (noOfSpheres - 2) && currentPos !== (noOfSpheres - 1)) {
        if (direction === 'forward') {
            let mover = spheres[0];
            spheres[0].position.z = spheres[0].position.z - 40000;
            mover.material = mats[currentPos + 2];
            spheres.shift();
            spheres.push(mover);
        };
    };

    transitioning = false;

};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

function init() {
    console.log(
        `%c
        ██░ ██  ▒█████   ██▓     ██▓   ▓██   ██▓ █     █░ ▒█████   ▒█████  ▓█████▄
        ▓██░ ██▒▒██▒  ██▒▓██▒    ▓██▒    ▒██  ██▒▓█░ █ ░█░▒██▒  ██▒▒██▒  ██▒▒██▀ ██▌
        ▒██▀▀██░▒██░  ██▒▒██░    ▒██░     ▒██ ██░▒█░ █ ░█ ▒██░  ██▒▒██░  ██▒░██   █▌
        ░▓█ ░██ ▒██   ██░▒██░    ▒██░     ░ ▐██▓░░█░ █ ░█ ▒██   ██░▒██   ██░░▓█▄   ▌
        ░▓█▒░██▓░ ████▓▒░░██████▒░██████▒ ░ ██▒▓░░░██▒██▓ ░ ████▓▒░░ ████▓▒░░▒████▓
        ▒ ░░▒░▒░ ▒░▒░▒░ ░ ▒░▓  ░░ ▒░▓  ░  ██▒▒▒ ░ ▓░▒ ▒  ░ ▒░▒░▒░ ░ ▒░▒░▒░  ▒▒▓  ▒
        ▒ ░▒░ ░  ░ ▒ ▒░ ░ ░ ▒  ░░ ░ ▒  ░▓██ ░▒░   ▒ ░ ░    ░ ▒ ▒░   ░ ▒ ▒░  ░ ▒  ▒
        ░  ░░ ░░ ░ ░ ▒    ░ ░     ░ ░   ▒ ▒ ░░    ░   ░  ░ ░ ░ ▒  ░ ░ ░ ▒   ░ ░  ░
        ░  ░  ░    ░ ░      ░  ░    ░  ░░ ░         ░        ░ ░      ░ ░     ░
        ░ ░                                 ░
        `,
        "color: deeppink"
    );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        45,
        300000
    );

    camera.position.set(0, 0, 0);

    // LIGHT =====================================================

    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 5000, 0);
    scene.add(light);

    //RENDERER =====================================================

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0xffffff, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = "canvas";

    document.body.appendChild(renderer.domElement);

    // CONTROLS =====================================================

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.minDistance = 700;
    controls.maxDistance = 150000;

    // SPHERES =====================================================

    for (var i = 0; i < 4; i++) {
    // for (var i = 0; i < noOfSpheres; i++) {

        let skysphereGeo = new THREE.SphereGeometry(5000, 32, 32);
        let skysphere = new THREE.Mesh(skysphereGeo, mats[i]);
        skysphere.receiveShadow = true;
        skysphere.position.set(0, 0, spherePos);
        spherePos -= 10000;
        skysphere.rotation.y = THREE.Math.degToRad(sphereRots[i]);
        spheres.push(skysphere);
        scene.add(skysphere);

    };

    // ARROWS =====================================================

    let arrowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x928012,
        emissive: 0x000000,
        metalness: 0.5,
        flatShading: false,
        roughness: 0.5,
        reflectivity: 1,
    });

    for (let i = 0; i < 2; i++) {
        let loader = new THREE.OBJLoader();
        loader.load(
            "https://cors-anywhere.herokuapp.com/https://street-infrastructure.herokuapp.com/infrastructure/uber/arrow.obj",
            // called when resource is loaded
            function (object) {
                object.traverse(function (node) {
                    if (node.isMesh) node.material = arrowMaterial;
                });
                object.castShadow = true;
                object.scale.set(3.5, 2, 6);

                if (i === 0) {
                    object.name = 'forward';
                    forward = object;
                } else {
                    object.name = "backward";
                    backward = object;
                };
                arrowObjs.push(object);
                scene.add(object);
                if (i === 1) {
                    positionArrows();
                };
            },
            // called when loading is in progresses
            function (xhr) {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            // called when loading has errors
            function (error) {
                console.log(error);
            }
        );
    };


    // RAYCASTING =====================================================

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    function onClick(event) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        intersects = raycaster.intersectObjects(scene.children, true);

        for (var i = 0; i < intersects.length; i++) {
            // console.log(intersects[i].object.parent.name);
            if (intersects[i].object.parent && intersects[i].object.parent.name === "forward") {
                if (currentPos === noOfSpheres - 1) {
                    return;
                } else {
                    if (!transitioning) {
                        currentPos++;
                        move('forward');
                    };
                };
            } else if (intersects[i].object.parent && intersects[i].object.parent.name === "backward") {
                if (currentPos === 0) {
                    return;
                } else {
                    if (!transitioning) {
                        currentPos--;
                        move('backward');
                    };
                };
            };
        };

    }

    function onTouch(event) {
        console.log('touch');
        event.preventDefault();

        mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObjects(scene.children, true);

        for (var i = 0; i < intersects.length; i++) {
            // console.log(intersects[i].object.parent.name);
            if (
                intersects[i].object.parent &&
                intersects[i].object.parent.name === "forward"
            ) {
                if (currentPos === names.length - 1) {
                    return;
                } else {
                    currentPos++;
                    move(names[currentPos]);
                }
            } else if (
                intersects[i].object.parent &&
                intersects[i].object.parent.name === "backward"
            ) {
                if (currentPos === 0) {
                    return;
                } else {
                    currentPos--;
                    move(names[currentPos]);
                }
            }
        }
    }

    // EVENT LISTENERS =====================================================

    //   document.addEventListener("keypress", (e) => keyPress(e));
    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("click", onClick, false);
    window.addEventListener("touchend", onTouch, false);

    // MISC =====================================================

    clearInterval(loadingInt);
    instructions.innerText = '';
    instructionsWrap.style.opacity = '0';
    setTimeout(() => {
        instructionsWrap.style.display = 'none';
    }, 2100);

    animate();
};

function animate() {
    // if (forward) {
    //     forward.rotation.z += 0.008;
    // };
    // if (backward) {
    //     backward.rotation.z += 0.008;
    // };

    // // update the picking ray with the camera and mouse position
    // raycaster.setFromCamera(mouse, camera);

    // // calculate objects intersecting the picking ray
    // intersects = raycaster.intersectObjects(scene.children);

    // for (var i = 0; i < intersects.length; i++) {
    //     // intersects[i].object.material.color.set(0xff0000);
    //     // if (intersects[i] === forward) {
    //         console.log('yeet', intersects[i].object);
    //     // };
    // };

    // skybox.rotation.y += 0.005;
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};
