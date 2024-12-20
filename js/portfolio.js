import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 기본적인 설정
const scene = new THREE.Scene();
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 배경 색상 설정 (완전 검은색)
scene.background = new THREE.Color(0x000000);

// 별 생성
const starGeometry = new THREE.CircleGeometry(0.05, 32); // 별의 크기 증가
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // 별 색상

const stars = new THREE.Group(); // 별들을 그룹으로 묶기
const starCount = 200; // 별의 개수

for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(
        (Math.random() - 0.5) * 100, // x 위치
        (Math.random() - 0.5) * 100, // y 위치
        (Math.random() - 0.5) * 100  // z 위치
    );
    stars.add(star);
}

scene.add(stars);

// 별이 깜빡이는 효과
setInterval(() => {
    stars.children.forEach(star => {
        star.visible = Math.random() < 0.5; // 50% 확률로 별의 가시성 토글
    });
}, 500); // 0.5초마다 깜빡임

// GLTFLoader를 사용하여 3D 모델 로드
const gltfLoader = new GLTFLoader();
const models = [];
const modelPaths = [
    'source/everyonelck.glb',
    'source/ttalkkag.glb',
    'source/oo.glb',
    'source/groomton3rd.glb',
    'path/to/model5.glb'
];

const positions = [
    { x: -5, y: 5, z: -10 },
    { x: 10, y: -6, z: -10 },
    { x: 25, y: 5, z: -10 },
    { x: 40, y: -6, z: -10 },
    { x: 55, y: 5, z: -10 }
];

const rotations = [
    { x: - Math.PI / 8, y: - Math.PI / 8, z: 0 }, // 모델 1: 15도 눕힘
    { x: - Math.PI / 8, y:   Math.PI / 8, z: 0},  // 모델 2: 22.5도 눕힘
    { x: - Math.PI / 8, y:  - Math.PI / 8, z: 0 },  // 모델 3: 30도 눕힘
    { x: - Math.PI / 8, y:   Math.PI / 8, z: 0 },  // 모델 4: 45도 눕힘
    { x: Math.PI / 10, y: 0, z: 0 }  // 모델 5: 18도 눕힘
];

const pages = [
    'no_access.html',
    'no_access.html',
    'no_access.html',
    'no_access.html',
    'no_access.html'
];

// 모델 로드
modelPaths.forEach((modelPath, index) => {
    gltfLoader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        model.position.set(positions[index].x, positions[index].y, positions[index].z);
        model.scale.set(1.2, 1.2, 1.2); // 모델 크기 조정 (1.2배)

        // 각 모델의 회전 설정
        model.rotation.set(rotations[index].x, rotations[index].y, rotations[index].z);

        model.userData.page = pages[index];
        scene.add(model);
        models.push(model);

        // 클릭 가능한 구 생성
        const sphereGeometry = new THREE.SphereGeometry(5, 32, 32); // 구의 크기
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        
        // 구의 위치 설정 (모델 위치에 맞추기)
        sphere.position.set(positions[index].x, positions[index].y + 2, positions[index].z); // 모델 위에 위치
        sphere.userData.page = pages[index]; // 페이지 정보 저장
        scene.add(sphere);

        // 구 클릭 이벤트
        sphere.callback = () => {
            window.location.href = sphere.userData.page; // 페이지 이동
        };
    }, undefined, (error) => {
        console.error('모델 로드 실패:', error);
    });
});

// 비행선 이미지 추가
const airshipTexture = new THREE.TextureLoader().load('source/똘병.jpg'); // 비행선 이미지 경로
const airshipMaterial = new THREE.SpriteMaterial({ map: airshipTexture });
const airship = new THREE.Sprite(airshipMaterial);
airship.scale.set(4, 3, 1); // 비행선의 크기 조정
airship.position.set(-15, 3, -15); // 비행선의 초기 위치 (왼쪽 끝)
scene.add(airship);

// 수평선 생성
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-14, 3.1, -15), // 시작점
    new THREE.Vector3(70, 3.1, -15)   // 끝점
]);
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// 정면에 조명 추가
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 흰색 방향광
directionalLight.position.set(0, 10, 5); // 조명 위치 조정
directionalLight.castShadow = true; // 그림자 생성을 위한 설정
scene.add(directionalLight);

// 추가적인 조명 (필요에 따라)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 환경광 추가
scene.add(ambientLight);

// 카메라 초기 위치
camera.position.z = 5;
camera.position.y = 3; // 수평선과의 적절한 위치

// 스크롤 이벤트
let scrollPosition = 0;
window.addEventListener('wheel', (event) => {
    scrollPosition += event.deltaY * 0.01; // 스크롤에 따른 위치 증가

    // 왼쪽으로 이동하지 않도록 제한
    if (scrollPosition < 0) {
        scrollPosition = 0; // 왼쪽으로는 -15까지만 이동 가능
    }

    // 오른쪽으로 이동할 때 제한
    if (scrollPosition > 85) { // 70은 선의 끝점 위치
        scrollPosition = 85; // 오른쪽으로는 선 끝까지 이동 가능
    }

    // 카메라의 x 위치 조정
    camera.position.x = scrollPosition;

    // 비행선이 수평선 위를 따라가도록 설정
    airship.position.x = -15 + scrollPosition;

    // 선의 시작점도 비행선의 위치에 맞춰 조정
    line.geometry.setFromPoints([
        new THREE.Vector3(-15 + scrollPosition, 3.1, -15), // 비행선 위치에 따라 변화
        new THREE.Vector3(70, 3.1, -15)   // 끝점은 고정
    ]);
});

// 클릭 이벤트 핸들러
window.addEventListener('click', (event) => {
    // 마우스 클릭 좌표를 normalized device coordinates로 변환
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Raycaster 생성
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 모든 객체와의 교차점 검사
    const intersects = raycaster.intersectObjects(scene.children, true);

    // 교차점이 있을 경우
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData.page) {
            window.location.href = intersectedObject.userData.page; // 해당 페이지로 이동
        }
    }
});

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    models.forEach(model => {
        model.rotation.y += 0.02; // 모델 회전
    });

    renderer.render(scene, camera);
}

animate();

// 윈도우 크기 조정 시 카메라 비율 조정
window.addEventListener('resize', () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
