import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 기본적인 설정
const scene = new THREE.Scene();
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-aspectRatio * 4, aspectRatio * 4, 4, -4, 0.1, 1000); // 카메라 비율 조정
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 파도 효과를 위한 셰이더
const waveShader = {
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() }
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position.x, position.y, 0.0, 1.0); // z축을 0으로 고정하여 2D 효과
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv;

            // 파도 효과
            float wave = sin(uv.x * 10.0 + time) * 0.1; // 파도 높이 조정
            uv.y += wave;

            // 색상 설정
            vec3 sandColor = vec3(0.7, 0.7, 0.7); // 회색 모래 색상
            vec3 waveColor = vec3(0.0, 0.0, 0.0); // 검정색 파도
            vec3 foamColor = vec3(1.0, 1.0, 1.0); // 하얀색 물 튀김

            // 파도가 높은 부분에서 물 튀김 효과
            float foam = smoothstep(0.05, 0.1, wave - 0.05) * 1.5; // 물 튀김 높이 조정

            // 최종 색상 계산
            vec3 color = mix(sandColor, waveColor, uv.y) + foam * foamColor;
            gl_FragColor = vec4(color, 1.0);
        }
    `
};

// 파도 배경 생성
const planeGeometry = new THREE.PlaneGeometry(16, 9); // 화면 비율에 맞춰 크기 조정
const planeMaterial = new THREE.ShaderMaterial({
    uniforms: waveShader.uniforms,
    vertexShader: waveShader.vertexShader,
    fragmentShader: waveShader.fragmentShader
});


const wavePlane = new THREE.Mesh(planeGeometry, planeMaterial);
wavePlane.position.z = -10; // 카메라 뒤에 위치
scene.add(wavePlane);


// 조명 추가
const ambientLight = new THREE.AmbientLight(0xd3d3d3, 50); // 환경광
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xd3d3d3, 10); // 방향광
directionalLight.position.set(0, 0, -11).normalize();
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xd3d3d3, 1); // 방향광
directionalLight2.position.set(0, 0, 10).normalize();
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xd3d3d3, 1); // 방향광
directionalLight3.position.set(10, 0, 10).normalize();
scene.add(directionalLight3);

const directionalLight4 = new THREE.DirectionalLight(0xd3d3d3, 1); // 방향광
directionalLight4.position.set(10, 0, 10).normalize();
scene.add(directionalLight4);

// GLTFLoader를 사용하여 3D 모델 로드
const gltfLoader = new GLTFLoader();
const models = []; // 모델을 저장할 배열
const modelPath = 'source/male_head.glb'; // 동일한 모델 경로

let loadedModels = 0;
const numberOfModels = 3; // 로드할 모델 수

// 모델 위치와 크기 비율 조정
const positions = [
    { x: -5, y: 1, z: -10 }, // 왼쪽 상단 (1번)
    { x: 4, y: -2, z: -5 },  // 오른쪽 중간 (2번)
    { x: -2, y: -4, z: -7 } // 왼쪽 하단 (3번)
];

// 각 모델의 크기 설정
const scales = [
    { x: 0.8, y: 0.8, z: 0.8 }, // 모델 1 크기
    { x: 1.1, y: 1.1, z: 1.1 }, // 모델 2 크기
    { x: 1.4, y: 1.4, z: 1.4 }  // 모델 3 크기
];

// 각 모델에 대한 페이지 경로
const pages = [
    'activity.html', 
    'portfolio.html', 
    'introduce.html'
];

for (let index = 0; index < numberOfModels; index++) {
    gltfLoader.load(modelPath, (gltf) => {
        const model = gltf.scene;

        // 모델 위치 설정
        model.position.set(positions[index].x, positions[index].y, positions[index].z);

        // 모델 회전 설정
        if (index === 0) {
            model.rotation.set(-Math.PI / 4, Math.PI+0.2, 0); // 1번 모델: 오른쪽 아래를 바라보도록
        } else if (index === 1) {
            model.rotation.set(0, Math.PI / 2, 0); // 2번 모델: 왼쪽을 바라보도록
        } else {
            model.rotation.set(Math.PI / 4, -Math.PI,-0.1); // 3번 모델: 오른쪽 위를 바라보도록
        }

         // 모델 크기 설정
         model.scale.set(scales[index].x, scales[index].y, scales[index].z);

        // 물광 피부 재질 설정
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x000000, // 검정색
            metalness: 0.1,
            roughness: 0.4,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        // 모델의 재질을 검정색으로 설정
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = material; // 검정색 재질
                child.material.needsUpdate = true;
            }
        });

        // 모델에 페이지 정보 추가
        model.userData.page = pages[index];

        scene.add(model);
        models.push(model);
        loadedModels++;

       // 클릭 가능한 영역 추가 (가상의 구 메쉬)
          const clickableArea = new THREE.Mesh(
            new THREE.SphereGeometry(2, 32, 32), // 클릭 가능한 구의 크기
            new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 }) // 붉은색으로 설정 -> 추후에 제거
        );
        clickableArea.position.set(model.position.x, model.position.y + 2.5, model.position.z+5); // 모델 위치에 맞춰 이동하고 y축으로 올리기
        scene.add(clickableArea); // 클릭 가능한 영역 추가
        clickableArea.userData.page = pages[index]; // 페이지 정보 추가

        // 모든 모델이 로드되었을 때 카메라 위치 조정
        if (loadedModels === numberOfModels) {
            camera.position.set(0, 0, 6); // 카메라 위치 조정 (기존 위치)
        }
    }, undefined, (error) => {
        console.error('모델 로드 실패:', error);
    });
}

// 클릭 이벤트 리스너
renderer.domElement.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // 클릭 위치를 정 normalized device coordinates (-1 to +1)으로 변환
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 레이캐스터 설정
    raycaster.setFromCamera(mouse, camera);
    const intersects = !raycaster.intersectObjects(models, true); // 모델과 충돌 검사 -> 충돌해도 상관없어서 ! 추가
    const clickableIntersects = raycaster.intersectObjects(scene.children, true); // 클릭 가능한 영역과 충돌 검사

    if (intersects.length > 0) {
        const clickedModel = intersects[0].object.parent; // 클릭된 모델의 부모 객체
        if (clickedModel.userData.page) {            
            moveModelsTo(clickedModel.position, clickedModel.userData.page);
        }
    } else if (clickableIntersects.length > 0) {
        const clickedArea = clickableIntersects[0].object; // 클릭된 영역
        if (clickedArea.userData.page) {
            moveModelsTo(clickedArea.position, clickedArea.userData.page);
        }
    }
});

// 회전 관련 변수
let rotationSpeed = 0.05; // 기본 회전 속도
let isRotating = false; // 회전 상태를 추적

// 클릭 이벤트
window.addEventListener('click', () => {
    isRotating = !isRotating; // 클릭 시 회전 상태 토글
});

// 스크롤 이벤트
window.addEventListener('wheel', (event) => {
    if (isRotating) {
        rotationSpeed += event.deltaY * -0.001; // 스크롤에 따라 회전 속도 조정
        rotationSpeed = Math.max(0.01, Math.min(rotationSpeed, 0.5)); // 속도 범위 제한
    }
});

// 모델을 클릭했을 때 나머지 모델을 빠르게 이동시키고 페이지 이동하는 함수
function moveModelsTo(targetPosition, page) {
    const duration = 300; // 빠른 이동 시간
    const startTime = performance.now();

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        models.forEach((model) => {
            const direction = new THREE.Vector3().subVectors(targetPosition, model.position).normalize();
            model.position.add(direction.multiplyScalar(progress * 10)); // 빠른 이동 속도
        });

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 이동이 완료된 후 1초 대기하고 페이지 이동
            setTimeout(() => {
                window.location.href = page; // 페이지 이동
            }, 40);
        }
    }
    animate();
}


// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    if (isRotating) {
        models.forEach(model => {
            model.rotation.y += rotationSpeed; // 각 모델 회전
        });
    }

    waveShader.uniforms.time.value += 0.05; // 시간 값을 증가시켜 애니메이션 효과 추가

    renderer.render(scene, camera);
}

animate();