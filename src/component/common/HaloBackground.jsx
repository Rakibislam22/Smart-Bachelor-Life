import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HaloBackground = () => {
	const mountRef = useRef(null);

	useEffect(() => {

		/* -------------------- SAFE REF CAPTURE -------------------- */
		const mount = mountRef.current;
		if (!mount) return;

		/* -------------------- COLORS FROM CSS -------------------- */
		const style = getComputedStyle(document.documentElement);

		const primColor = new THREE.Color(
			style.getPropertyValue("--color-prim").trim() || "#8956fc"
		);

		const highColor = new THREE.Color(
			style.getPropertyValue("--color-high").trim() || "#0ea5e9"
		);

		/* -------------------- SCENE -------------------- */
		const scene = new THREE.Scene();

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance",
		});

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		mount.appendChild(renderer.domElement);

		/* -------------------- SHADERS -------------------- */
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

				vec3 finalColor = mix(uColorPrim, uColorHigh, vUv.y + vZ * 0.4);

				float alpha =
					smoothstep(0.0, 0.4, vUv.x) *
					smoothstep(1.0, 0.6, vUv.x);

				gl_FragColor = vec4(finalColor, alpha * 0.5);
			}
		`;

		/* -------------------- GEOMETRY -------------------- */
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

		/* -------------------- ANIMATION -------------------- */
		const clock = new THREE.Clock();
		let animationId;

		const animate = () => {
			material.uniforms.uTime.value = clock.getElapsedTime() * 0.4;
			renderer.render(scene, camera);
			animationId = requestAnimationFrame(animate);
		};

		animate();

		/* -------------------- SCROLL ANIMATION -------------------- */
		const scrollTween = gsap.to(mesh.rotation, {
			z: Math.PI * 0.5,
			x: -Math.PI / 8,
			ease: "none",
			scrollTrigger: {
				trigger: document.documentElement,
				start: "top top",
				end: "bottom bottom",
				scrub: 2,
			},
		});

		// Fix SPA height calculation
		setTimeout(() => ScrollTrigger.refresh(), 100);

		/* -------------------- RESIZE -------------------- */
		const handleResize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};

		window.addEventListener("resize", handleResize);

		/* -------------------- CLEANUP (VERY IMPORTANT) -------------------- */
		return () => {

			window.removeEventListener("resize", handleResize);

			// stop animation loop
			cancelAnimationFrame(animationId);

			// kill GSAP + ScrollTrigger
			scrollTween.kill();
			ScrollTrigger.getAll().forEach(trigger => trigger.kill());

			// remove canvas safely
			if (mount.contains(renderer.domElement)) {
				mount.removeChild(renderer.domElement);
			}

			// dispose GPU resources
			geometry.dispose();
			material.dispose();
			renderer.dispose();

		};

	}, []);

	return (
		<div
			ref={mountRef}
			className="fixed inset-0 -z-50 pointer-events-none"
		/>
	);
};

export default HaloBackground;
