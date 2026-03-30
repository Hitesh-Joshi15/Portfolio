// ===================================
// WEBGL SHADER BACKGROUND
// ===================================

class ShaderBackground {
    constructor() {
        this.canvas = document.getElementById('shaderCanvas');
        if (!this.canvas) return;
        
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.warn('WebGL not supported');
            return;
        }
        
        this.time = 0;
        this.mouse = { x: 0.5, y: 0.5 };
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Track mouse for interactive shader
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX / window.innerWidth;
            this.mouse.y = 1.0 - (e.clientY / window.innerHeight);
        });
        
        this.createShaderProgram();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    createShaderProgram() {
        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;
        
        // Fragment shader with futuristic effects
        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            
            // Noise function
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                vec2 mouse = u_mouse;
                
                // Create flowing waves
                float wave1 = sin(st.x * 10.0 + u_time * 0.5) * 0.1;
                float wave2 = cos(st.y * 8.0 - u_time * 0.3) * 0.1;
                
                // Add noise layers
                float n1 = noise(st * 3.0 + u_time * 0.1);
                float n2 = noise(st * 5.0 - u_time * 0.15);
                
                // Mouse interaction
                float dist = length(st - mouse);
                float mouseEffect = smoothstep(0.5, 0.0, dist) * 0.3;
                
                // Combine effects
                float pattern = wave1 + wave2 + n1 * 0.3 + n2 * 0.2 + mouseEffect;
                
                // Futuristic color scheme (cyan to purple)
                vec3 color1 = vec3(0.0, 0.94, 1.0); // Cyan
                vec3 color2 = vec3(0.32, 0.0, 1.0); // Purple
                vec3 color3 = vec3(1.0, 0.0, 1.0); // Magenta
                
                // Mix colors based on pattern
                vec3 finalColor = mix(color1, color2, st.x + pattern * 0.5);
                finalColor = mix(finalColor, color3, st.y * 0.3);
                
                // Add scanlines
                float scanline = sin(st.y * 800.0 + u_time * 2.0) * 0.05;
                finalColor += scanline;
                
                // Vignette effect
                float vignette = smoothstep(0.8, 0.2, dist);
                finalColor *= vignette;
                
                // Final opacity for dark mode
                gl_FragColor = vec4(finalColor, 0.15);
            }
        `;
        
        // Compile shaders
        const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        
        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
        
        // Create buffer
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        // Set attributes
        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Get uniform locations
        this.timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse');
    }
    
    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    animate() {
        this.time += 0.01;
        
        // Update uniforms
        this.gl.uniform1f(this.timeLocation, this.time);
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.mouseLocation, this.mouse.x, this.mouse.y);
        
        // Enable blending for transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize shader background
document.addEventListener('DOMContentLoaded', () => {
    new ShaderBackground();
});
