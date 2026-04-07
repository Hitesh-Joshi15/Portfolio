// ===================================
// THREE.JS 3D SCENE
// ===================================

class ThreeScene {
    constructor() {
        this.container = document.getElementById('threeScene');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.geometry = null;
        
        this.init();
    }
    
    init() {
        if (!this.container || typeof THREE === 'undefined') {
            console.warn('Three.js not loaded or container not found');
            return;
        }
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Create particle system
        this.createParticles();
        
        // Create geometric shapes
        this.createShapes();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
        
        // Mouse interaction
        this.mouse = { x: 0, y: 0 };
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });

        // Pause when tab is hidden
        this.isVisible = true;
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) this.animate();
        });
        
        // Start animation
        this.animate();
    }
    
    createParticles() {
        const particleCount = 1000;
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            // Position
            positions[i] = (Math.random() - 0.5) * 10;
            positions[i + 1] = (Math.random() - 0.5) * 10;
            positions[i + 2] = (Math.random() - 0.5) * 10;
            
            // Color (cyan to purple gradient)
            const t = Math.random();
            colors[i] = 0 + t * 0.32; // R
            colors[i + 1] = 0.94 - t * 0.94; // G
            colors[i + 2] = 1; // B
        }
        
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(this.geometry, material);
        this.scene.add(this.particles);
    }
    
    createShapes() {
        // Create torus
        const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
        this.torus.position.set(-2, 0, 0);
        this.scene.add(this.torus);
        
        // Create icosahedron
        const icoGeometry = new THREE.IcosahedronGeometry(0.8, 0);
        const icoMaterial = new THREE.MeshBasicMaterial({
            color: 0x5200ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
        this.icosahedron.position.set(2, 1, 0);
        this.scene.add(this.icosahedron);
        
        // Create octahedron
        const octaGeometry = new THREE.OctahedronGeometry(0.6, 0);
        const octaMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
        this.octahedron.position.set(0, -1.5, 0);
        this.scene.add(this.octahedron);
    }
    
    onResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    animate() {
        if (!this.isVisible) return;
        requestAnimationFrame(() => this.animate());
        
        // Rotate particles
        if (this.particles) {
            this.particles.rotation.x += 0.0005;
            this.particles.rotation.y += 0.001;
        }
        
        // Rotate shapes
        if (this.torus) {
            this.torus.rotation.x += 0.01;
            this.torus.rotation.y += 0.005;
        }
        
        if (this.icosahedron) {
            this.icosahedron.rotation.x += 0.008;
            this.icosahedron.rotation.y += 0.012;
        }
        
        if (this.octahedron) {
            this.octahedron.rotation.x += 0.012;
            this.octahedron.rotation.y += 0.008;
        }
        
        // Mouse interaction
        if (this.camera) {
            this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize Three.js scene when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to load
    setTimeout(() => {
        new ThreeScene();
    }, 100);
});
