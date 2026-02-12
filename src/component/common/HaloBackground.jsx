import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ThreeGlow = () => {
	const mountRef = useRef(null);

	useEffect(() => {
		// 1. Get colors from your CSS variables
		const style = getComputedStyle(document.documentElement);
		const primColor = new THREE.Color(
			style.getPropertyValue("--color-prim").trim() || "#8956fc",
		);
		const highColor = new THREE.Color(
			style.getPropertyValue("--color-high").trim() || "#0ea5e9",
		);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		mountRef.current.appendChild(renderer.domElement);

		const vertexShader = `
      varying vec2 vUv;
      varying float vZ;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 newPos = position;
        newPos.z += sin(newPos.x * 1.5 + uTime) * 0.8;
        newPos.z += cos(newPos.y * 1.2 + uTime) * 0.8;
        vZ = newPos.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `;

		const fragmentShader = `
      varying vec2 vUv;
      varying float vZ;
      uniform float uTime;
      uniform vec3 uColorPrim;
      uniform vec3 uColorHigh;

      void main() {
        // Use the colors passed from your Tailwind theme
        vec3 finalColor = mix(uColorPrim, uColorHigh, vUv.y + vZ * 0.4);
        
        // Soft edges for the "ribbon" look
        float alpha = smoothstep(0.0, 0.4, vUv.x) * smoothstep(1.0, 0.6, vUv.x);
        gl_FragColor = vec4(finalColor, alpha * 0.5);
      }
    `;

		const geometry = new THREE.PlaneGeometry(20, 12, 128, 128);
		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uColorPrim: { value: primColor },
				uColorHigh: { value: highColor },
			},
			transparent: true,
			side: THREE.DoubleSide,
		});

		const mesh = new THREE.Mesh(geometry, material);
		mesh.rotation.x = -Math.PI / 4;
		mesh.position.y = 2;
		scene.add(mesh);

		camera.position.z = 10;

		// --- Animations ---
		const clock = new THREE.Clock();

		// Scroll-linked rotation and zoom
		gsap.to(mesh.rotation, {
			z: Math.PI * 0.5,
			x: -Math.PI / 8,
			scrollTrigger: {
				trigger: document.body,
				start: "top top",
				end: "bottom bottom",
				scrub: 2,
			},
		});

		const animate = () => {
			material.uniforms.uTime.value = clock.getElapsedTime() * 0.4;
			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		};

		animate();

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			mountRef.current?.removeChild(renderer.domElement);
		};
	}, []);

	return (
		<div
			ref={mountRef}
			className="fixed inset-0 -z-50 pointer-events-none"
		/>
	);
};

export default ThreeGlow;
