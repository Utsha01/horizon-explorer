import * as THREE from 'three';
import './style.css';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9db5ae, 0.006);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 900);
camera.position.set(0, 4.6, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
document.querySelector('#game').appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xc8e0dc, 0x263a32, 2.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a1, 3.4); sun.position.set(-80, 110, 40); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
const world = new THREE.Group(); scene.add(world);
const rng = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const wave = (x,z) => Math.sin(x*.035)*2.1 + Math.sin(z*.018+x*.012)*3.2 + Math.sin((x+z)*.08)*.35;
const roadY = (z) => .5 + Math.sin(z*.008)*.18;

// Vast stylized terrain tiles
const groundMat = new THREE.MeshStandardMaterial({ color: 0x536f5b, roughness: 1 });
for (let tile = -2; tile < 4; tile++) {
  const geo = new THREE.PlaneGeometry(260, 120, 70, 35); geo.rotateX(-Math.PI/2);
  const p = geo.attributes.position; for (let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i)+tile*120; p.setY(i, wave(x,z)-roadY(z)); }
  geo.computeVertexNormals(); const mesh = new THREE.Mesh(geo,groundMat); mesh.position.z=tile*120; mesh.receiveShadow=true; world.add(mesh);
}
// Road ribbon with gentle bends
const roadMat = new THREE.MeshStandardMaterial({ color: 0x344b4a, roughness: .85 });
const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x9c9a78, roughness: 1 });
function makeRibbon(width, material, yOffset=0){ const verts=[], inds=[], seg=420; for(let i=0;i<=seg;i++){ const z=20-i*3; const cx=Math.sin(z*.012)*8+Math.sin(z*.031)*2; const y=roadY(z)+yOffset; verts.push(cx-width/2,y,z,cx+width/2,y,z); if(i<seg) {const n=i*2; inds.push(n,n+1,n+2,n+1,n+3,n+2);} } const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(inds);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.receiveShadow=true;world.add(m);return m; }
makeRibbon(11, shoulderMat,-.06); makeRibbon(8, roadMat,0);
const lineMat = new THREE.MeshBasicMaterial({color:0xd6bd75});
for(let i=0;i<120;i++){ const z=16-i*3; const cx=Math.sin(z*.012)*8+Math.sin(z*.031)*2; const dash=new THREE.Mesh(new THREE.BoxGeometry(.18,.025,1.25),lineMat);dash.position.set(cx,roadY(z)+.04,z); world.add(dash); }

function tree(x,z,scale=1){ const g=new THREE.Group(); const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,2.2,6),new THREE.MeshStandardMaterial({color:0x4b3d32}));trunk.position.y=1.1;trunk.castShadow=true;g.add(trunk); for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.ConeGeometry((1.3-i*.2)*scale,2.5*scale,7),new THREE.MeshStandardMaterial({color:i===0?0x385b4a:0x46745b,roughness:1}));crown.position.y=2.3+i*.65;crown.castShadow=true;g.add(crown);}g.position.set(x,wave(x,z),z);world.add(g); }
for(let i=0;i<180;i++){const z=18-rng(i*2)*580,x=(rng(i*2+1)-.5)*150; const roadx=Math.sin(z*.012)*8+Math.sin(z*.031)*2;if(Math.abs(x-roadx)>10)tree(x,z,.65+rng(i+4)*.9);}
function rock(x,z,s=1){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),new THREE.MeshStandardMaterial({color:0x66736b,roughness:1}));m.scale.y=.6;m.position.set(x,wave(x,z)+s*.3,z);m.rotation.set(rng(z)*2,rng(z+2)*3,0);m.castShadow=true;world.add(m);}
for(let i=0;i<70;i++)rock((rng(i+90)-.5)*130,10-rng(i+91)*570,.3+rng(i+92)*1.5);
// Landmarks and fireflies
const discoveries=[['Moonstone Arch',-27,-105],['Windglass Meadow',24,-260],['Solace Observatory',-30,-440]];
for(const [name,x,z] of discoveries){const arch=new THREE.Group();for(const sx of [-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.7,1,8,8),new THREE.MeshStandardMaterial({color:0xb6c8bd,emissive:0x182d2a}));p.position.set(sx*4,4,z);arch.add(p);}const top=new THREE.Mesh(new THREE.TorusGeometry(4,0.7,8,18,Math.PI),new THREE.MeshStandardMaterial({color:0xd8e9dd,emissive:0x355c4b,emissiveIntensity:.7}));top.rotation.z=Math.PI/2;top.position.set(0,8,z);arch.add(top);world.add(arch);}
const fireflies=new THREE.Group();const fgeo=new THREE.SphereGeometry(.06,5,5);const fmat=new THREE.MeshBasicMaterial({color:0xcdf7b0});for(let i=0;i<120;i++){const m=new THREE.Mesh(fgeo,fmat);m.position.set((rng(i)-.5)*90,1+rng(i+1)*6,10-rng(i+2)*540);fireflies.add(m);}world.add(fireflies);

// Player vehicle: original compact electric rover
const car=new THREE.Group(); const bodyMat=new THREE.MeshStandardMaterial({color:0xd47858,metalness:.15,roughness:.35}); const darkMat=new THREE.MeshStandardMaterial({color:0x16252a,roughness:.25});
const body=new THREE.Mesh(new THREE.BoxGeometry(2.4,.65,4),bodyMat);body.position.y=1;body.castShadow=true;car.add(body);const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.8,.65,1.8),darkMat);cabin.position.set(0,1.55,-.15);cabin.castShadow=true;car.add(cabin);const glow=new THREE.Mesh(new THREE.BoxGeometry(1.7,.12,.08),new THREE.MeshBasicMaterial({color:0xb8f5d0}));glow.position.set(0,1.15,-2.01);car.add(glow);for(const x of [-1.15,1.15])for(const z of [-1.35,1.35]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.28,16),darkMat);w.rotation.z=Math.PI/2;w.position.set(x,.55,z);w.castShadow=true;car.add(w);}car.position.set(0,roadY(20)+.25,20);scene.add(car);

const keys={}; addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyR')reset();if(e.code==='KeyF')togglePhoto();});addEventListener('keyup',e=>keys[e.code]=false);
let started=false, photo=false, distance=0, speed=0, last=performance.now(), discoveryIndex=0;
const clock=new THREE.Clock();
function reset(){car.position.set(0,roadY(20)+.25,20);car.rotation.set(0,0,0);speed=0;distance=0;}
function togglePhoto(){photo=!photo;document.querySelector('#photo-ui').classList.toggle('hidden',!photo);document.querySelector('.crosshair').classList.toggle('hidden',photo);}
document.querySelector('#start').onclick=()=>{started=true;document.querySelector('#start-screen').classList.add('hidden');};document.querySelector('#capture').onclick=()=>{const a=document.createElement('a');a.download='horizon-explorer.png';a.href=renderer.domElement.toDataURL('image/png');a.click();};
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;if(started&&!photo){const throttle=(keys.KeyW?1:0)-(keys.KeyS?.65:0);speed+=(throttle*18-speed)*dt*1.8;speed*=Math.pow(.985,dt*60);if(keys.Space)speed*=Math.pow(.82,dt*60);const steer=(keys.KeyA?1:0)-(keys.KeyD?1:0);car.rotation.y+=steer*dt*(.8+Math.abs(speed)*.025);car.position.x+=Math.sin(car.rotation.y)*speed*dt;car.position.z-=Math.cos(car.rotation.y)*speed*dt;car.position.y=roadY(car.position.z)+.25;distance+=Math.abs(speed*dt);car.position.x=THREE.MathUtils.clamp(car.position.x,-65,65);}
  const follow=new THREE.Vector3(car.position.x,car.position.y+4.2,car.position.z+9.5);camera.position.lerp(follow,.08);camera.lookAt(car.position.x,car.position.y+1,car.position.z-12); fireflies.rotation.y=clock.elapsedTime*.025;
  const near=Math.abs(car.position.z-discoveries[discoveryIndex]?.[2]);if(near<7){document.querySelector('#discovery-name').textContent=discoveries[discoveryIndex][0];document.querySelector('#discovery').classList.remove('hidden');setTimeout(()=>document.querySelector('#discovery').classList.add('hidden'),3800);discoveryIndex=Math.min(discoveryIndex+1,discoveries.length-1);}
  document.querySelector('#speed').textContent=`${Math.round(Math.abs(speed)*4)} km/h`;document.querySelector('#distance').textContent=`${(distance/100).toFixed(1)} km`;document.querySelector('#biome').textContent=car.position.z<-330?'TWILIGHT DESERT':car.position.z<-180?'WINDGLASS MEADOW':'VERDANT REACH';renderer.render(scene,camera);}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
