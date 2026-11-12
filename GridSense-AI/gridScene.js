/**
 * GridSense AI - 3D Visualizer Engine
 */

export class MicrogridScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.isColorblind = false;
    this.lastTime = performance.now();

    // Scene, Camera, WebGL Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Camera Viewpoint
    this.camera.position.set(0, 26, 28);

    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
      this.controls.target.set(0, 0, 1);
      this.controls.update();
    } else {
      this.camera.lookAt(0, 0, 1);
    }

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.dirLight.position.set(12, 25, 12);
    this.scene.add(this.dirLight);

    this.createGround();

    // GLTF Model Loader Setup
    this.loader = new THREE.GLTFLoader();

    const posSolar = new THREE.Vector3(-10, 0, -2);
    const posBess = new THREE.Vector3(0, 0, -2);
    const posClinic = new THREE.Vector3(10, 0, -2);
    const posAgri = new THREE.Vector3(5, 0, 6);

    // Load Models
    this.loadModel('./solar_panels.glb', posSolar.x, posSolar.y, posSolar.z, 6.0, (model) => { this.solarNode = model; });
    this.loadModel('./bess_container.glb', posBess.x, posBess.y, posBess.z, 5.0, (model) => { this.batteryNode = model; });
    this.loadModel('./clinic_house.glb', posClinic.x, posClinic.y, posClinic.z, 6.0, (model) => { this.clinicNode = model; });
    this.loadModel('./agri_mill.glb', posAgri.x, posAgri.y, posAgri.z, 5.5, (model) => { this.agriNode = model; });

    // Floating 3D Text Labels
    this.solarLabel = this.createLabel('SOLAR ARRAY', posSolar.x, 4.5, posSolar.z, '#fbbb21');
    this.bessLabel = this.createLabel('BATTERY STORAGE (BSS)', posBess.x, 4.5, posBess.z, '#3b82f6');
    this.clinicLabel = this.createLabel('ESSENTIAL CLINIC', posClinic.x, 4.5, posClinic.z, '#10b981');
    this.agriLabel = this.createLabel('AGRI PROCESSING', posAgri.x, 4.2, posAgri.z, '#a855f7');

    // Energy Paths
    this.solarPath = [new THREE.Vector3(posSolar.x, 0.8, posSolar.z), new THREE.Vector3(posBess.x, 0.8, posBess.z)];
    this.clinicPath = [new THREE.Vector3(posBess.x, 0.8, posBess.z), new THREE.Vector3(posClinic.x, 0.8, posClinic.z)];
    this.agriPath = [new THREE.Vector3(posBess.x, 0.8, posBess.z), new THREE.Vector3(posAgri.x, 0.8, posAgri.z)];

    this.solarLine = this.createPowerLine(this.solarPath, 0xfbbb21);
    this.clinicLine = this.createPowerLine(this.clinicPath, 0x10b981);
    this.agriLine = this.createPowerLine(this.agriPath, 0xa855f7);

    // Particle Flow Simulation
    this.solarParticles = this.createParticleGroup(this.solarPath, 0xfbbb21, 7);
    this.clinicParticles = this.createParticleGroup(this.clinicPath, 0x10b981, 7);
    this.agriParticles = this.createParticleGroup(this.agriPath, 0xa855f7, 7);

    this.currentSolarKW = 50;
    this.currentSecondaryActive = true;
    this.currentEssentialActive = true;

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  createLabel(text, x, y, z, accentHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Dark Pill Frame
    ctx.fillStyle = 'rgba(14, 16, 23, 0.9)';
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 96, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 26px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x, y, z);
    sprite.scale.set(6, 1.5, 1);
    this.scene.add(sprite);
    return sprite;
  }

  loadModel(path, x, y, z, targetSize, callback) {
    this.loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        if (maxDim > 0) {
          const scale = targetSize / maxDim;
          model.scale.set(scale, scale, scale);
        }

        box.setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(x - (center.x - x), y - box.min.y, z - (center.z - z));

        this.scene.add(model);
        if (callback) callback(model);
      },
      undefined,
      (error) => {
        const fallback = this.createFallbackNode(x, y + 1.25, z, 0x3b82f6);
        if (callback) callback(fallback);
      }
    );
  }

  createFallbackNode(x, y, z, colorHex) {
    const geo = new THREE.BoxGeometry(3.5, 2.5, 3.5);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  }

  createGround() {
    const geo = new THREE.PlaneGeometry(38, 28);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x06070a, roughness: 0.9 });
    const plane = new THREE.Mesh(geo, groundMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    this.scene.add(plane);

    const grid = new THREE.GridHelper(38, 38, 0x272a36, 0x12141a);
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  createPowerLine(points, colorHex) {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: colorHex,
      linewidth: 3,
      dashSize: 0.5,
      gapSize: 0.3,
      opacity: 0.5,
      transparent: true
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    this.scene.add(line);
    return line;
  }

  createParticleGroup(pathPoints, colorHex, count) {
    const group = [];
    const pGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const pMat = new THREE.MeshBasicMaterial({ color: colorHex });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.visible = false;
      this.scene.add(mesh);
      group.push({
        mesh: mesh,
        progress: i / count,
        start: pathPoints[0],
        end: pathPoints[1]
      });
    }
    return group;
  }

  updateParticles(group, speedMultiplier, active, deltaSeconds) {
    const baseSpeed = 0.5;
    const effectiveSpeed = baseSpeed * speedMultiplier;

    group.forEach(p => {
      p.mesh.visible = active && speedMultiplier > 0;
      if (!p.mesh.visible) return;

      p.progress += effectiveSpeed * deltaSeconds;
      if (p.progress > 1) p.progress -= 1;

      p.mesh.position.lerpVectors(p.start, p.end, p.progress);
    });
  }

  setColorblindMode(isEnabled) {
    this.isColorblind = isEnabled;
    const solarColor = isEnabled ? 0x38bdf8 : 0xfbbb21;
    const clinicColor = isEnabled ? 0xf59e0b : 0x10b981;

    this.solarLine.material.color.setHex(solarColor);
    this.clinicLine.material.color.setHex(clinicColor);

    this.solarParticles.forEach(p => p.mesh.material.color.setHex(solarColor));
    this.clinicParticles.forEach(p => p.mesh.material.color.setHex(clinicColor));
  }

  updateVisuals(solarKW, batterySoC, secondaryActive, essentialActive) {
    this.currentSolarKW = solarKW;
    this.currentSecondaryActive = secondaryActive;
    this.currentEssentialActive = essentialActive;

    const dayRatio = Math.max(0.2, solarKW / 100);
    this.dirLight.intensity = dayRatio * 1.4;

    this.clinicLine.visible = essentialActive;
    this.agriLine.visible = secondaryActive && essentialActive;
  }

  animate(now) {
    requestAnimationFrame(this.animate);

    const deltaSeconds = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.controls) this.controls.update();

    const solarSpeedFactor = Math.max(0.3, this.currentSolarKW / 50);
    this.updateParticles(this.solarParticles, solarSpeedFactor, this.currentSolarKW > 0, deltaSeconds);
    this.updateParticles(this.clinicParticles, 1.0, this.currentEssentialActive, deltaSeconds);
    this.updateParticles(this.agriParticles, 1.0, this.currentSecondaryActive && this.currentEssentialActive, deltaSeconds);

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
}