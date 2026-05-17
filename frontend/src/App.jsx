import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';

// --- ANIMATION COMPONENT: Live AI Typing Effect ---
const TypewriterText = ({ text }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const cleanText = text.replace(/\*\*/g, '').replace(/\$/g, '');
    const timer = setInterval(() => {
      setDisplayed(cleanText.slice(0, i));
      i++;
      if (i > cleanText.length) clearInterval(timer);
    }, 15);
    return () => clearInterval(timer);
  }, [text]);

  return <div className="whitespace-pre-wrap">{displayed}</div>;
};

// --- 3D COMPONENT: Targeted Satellite Lock-on Scanner ---
const TargetScanner = () => {
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 2;
      ring1Ref.current.rotation.y += delta * 2.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -= delta * 1.5;
      ring2Ref.current.rotation.z += delta * 3;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} color="#ef4444" intensity={3} />
      <Sphere args={[1.2, 32, 32]}>
        <meshStandardMaterial color="#020617" wireframe={true} emissive="#ef4444" emissiveIntensity={0.8} />
      </Sphere>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.6, 0.02, 16, 100]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.01, 16, 100]} />
        <meshBasicMaterial color="#f87171" />
      </mesh>
    </group>
  );
};

// --- 3D COMPONENT: High-Performance GPU Swarm ---
const SatelliteSwarm = ({ targets }) => {
  const safeMeshRef = useRef();
  const dangerMeshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 1. Initialize mutable physics data ONCE. No React state means NO re-renders.
  const physicsData = useMemo(() => {
    return targets.map((t, idx) => {
      const scale = 2500;
      return {
        pos: new THREE.Vector3(t.position_x / scale, t.position_y / scale, t.position_z / scale),
        vel: new THREE.Vector3(
          (idx % 2 === 0 ? 0.76 : -0.76) / scale,
          (idx % 3 === 0 ? 0.54 : -0.54) / scale,
          (idx % 5 === 0 ? 0.32 : -0.32) / scale
        ),
        isDanger: t.collision_probability > 50
      };
    });
  }, [targets]);

  const safeParticles = useMemo(() => physicsData.filter(p => !p.isDanger), [physicsData]);
  const dangerParticles = useMemo(() => physicsData.filter(p => p.isDanger), [physicsData]);

  // 2. Pure WebGL loop. Bypasses React entirely for massive performance.
  useFrame((state, delta) => {
    const speedMultiplier = 15;

    if (safeMeshRef.current) {
      safeParticles.forEach((p, i) => {
        p.pos.addScaledVector(p.vel, delta * speedMultiplier);
        dummy.position.copy(p.pos);
        dummy.updateMatrix();
        safeMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      safeMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (dangerMeshRef.current) {
      dangerParticles.forEach((p, i) => {
        p.pos.addScaledVector(p.vel, delta * speedMultiplier);
        dummy.position.copy(p.pos);
        dummy.scale.set(1.5, 1.5, 1.5);
        dummy.updateMatrix();
        dangerMeshRef.current.setMatrixAt(i, dummy.matrix);
        dummy.scale.set(1, 1, 1);
      });
      dangerMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Replaced heavy transparent spheres with high-performance solid Low-Poly Icosahedrons */}
      {safeParticles.length > 0 && (
        <instancedMesh ref={safeMeshRef} args={[null, null, safeParticles.length]}>
          <icosahedronGeometry args={[0.025, 1]} />
          <meshBasicMaterial color="#047857" />
        </instancedMesh>
      )}
      {dangerParticles.length > 0 && (
        <instancedMesh ref={dangerMeshRef} args={[null, null, dangerParticles.length]}>
          <icosahedronGeometry args={[0.04, 2]} />
          <meshBasicMaterial color="#ef4444" />
        </instancedMesh>
      )}
    </group>
  );
};

// --- 3D COMPONENT: Tactical Globe ---
const TacticalGlobe = ({ targets }) => {
  const globeGroup = useRef();
  const earthRef = useRef();
  const cloudsRef = useRef();

  // Clean, single animation loop for the entire planet assembly
  useFrame(({ clock }, delta) => {
    if (globeGroup.current) {
      // Replaces the expensive <Float> component with a simple Math.sin hover
      globeGroup.current.position.y = Math.sin(clock.getElapsedTime()) * 0.1;
    }
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={globeGroup}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[20, 10, -10]} intensity={3} color="#60a5fa" />
      <directionalLight position={[-20, -10, 10]} intensity={1} color="#3b82f6" />

      <Sphere args={[2.15, 64, 64]}>
        <meshStandardMaterial color="#020617" roughness={1} />
      </Sphere>

      <Sphere ref={earthRef} args={[2.2, 64, 64]}>
        <meshStandardMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.15} emissive="#1d4ed8" emissiveIntensity={0.5} />
      </Sphere>

      <Sphere ref={cloudsRef} args={[2.25, 32, 32]}>
        <meshStandardMaterial color="#93c5fd" wireframe={true} transparent={true} opacity={0.05} />
      </Sphere>

      {targets && targets.length > 0 && <SatelliteSwarm targets={targets} />}
    </group>
  );
};

// --- MAIN APP DASHBOARD ---
function App() {
  const [orbitData, setOrbitData] = useState(null);
  const [liveTargets, setLiveTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchConjunctions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/conjunctions');
        setOrbitData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to connect to API", err);
        setError(true);
        setLoading(false);
      }
    };
    fetchConjunctions();
  }, []);

  // Update HTML DOM every 250ms (Separate from 3D logic to prevent stutter)
  useEffect(() => {
    if (!orbitData || !orbitData.targets) return;

    setLiveTargets(orbitData.targets.slice(0, 100)); // Cap at 100 to save HTML rendering cost

    const ticker = setInterval(() => {
      setLiveTargets(prev => prev.map((target, idx) => {
        const dirX = idx % 2 === 0 ? 0.76 : -0.76;
        const dirY = idx % 3 === 0 ? 0.54 : -0.54;
        const dirZ = idx % 5 === 0 ? 0.32 : -0.32;

        return {
          ...target,
          position_x: (parseFloat(target.position_x) + dirX).toFixed(2),
          position_y: (parseFloat(target.position_y) + dirY).toFixed(2),
          position_z: (parseFloat(target.position_z) + dirZ).toFixed(2)
        };
      }));
    }, 250);

    return () => clearInterval(ticker);
  }, [orbitData]);

  return (
    <div className="relative min-h-[200vh] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden bg-[#020617]">

      {/* 3D Canvas Layer with performance hint */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <Canvas gl={{ powerPreference: "high-performance", antialias: false }} camera={{ position: [0, 0, 7.5], fov: 45 }}>
          {/* Notice we pass orbitData.targets so the 3D globe ONLY renders once! */}
          <TacticalGlobe targets={orbitData?.targets} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* --- PAGE 1: HERO SECTION --- */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-center">
          <div className="border border-blue-500/30 bg-blue-500/10 text-blue-400 px-4 py-1 rounded-full text-xs font-mono tracking-widest mb-6 uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Lambda Architecture Active
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-linear-to-br from-white to-slate-500 drop-shadow-lg">
            <>
              Orbital
              <span className="text-blue-500">Mind</span>{"  "}{" "}
              <span className="text-shadow-red-600">SGP4</span>
            </>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light mb-12 drop-shadow-md">
            Autonomous aerospace traffic control. Powered by PySpark Big Data, SQLite, & Google Gemini.
          </p>
          <div className="animate-bounce flex flex-col items-center gap-2 opacity-70 mt-12">
            <p className="text-sm tracking-widest uppercase font-mono text-white">Scroll to Initiate</p>
            <div className="w-px h-12 bg-linear-to-b from-white to-transparent"></div>
          </div>
        </motion.div>
      </div>

      {/* --- PAGE 2: DASHBOARD SECTION --- */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        // Removed CSS Blur. Using a flat, fast opacity layer over the WebGL canvas.
        className="relative z-20 min-h-screen bg-[#060c1c]/95 border-t border-blue-500/20 shadow-[0_-10px_50px_rgba(0,0,0,0.9)]"
      >
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col">

          <div className="flex items-center justify-between border-b border-slate-700/50 pb-6 mb-12">
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-md">Command Center</h2>
              <div className="h-6 w-px bg-slate-700"></div>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest animate-pulse">Live Dead-Reckoning Active</p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-950/30 px-5 py-2.5 rounded-sm border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="font-mono text-sm text-emerald-400 uppercase tracking-widest font-bold">Telemetry Sync</p>
            </div>
          </div>

          {loading && (
            <div className="h-64 flex items-center justify-center">
              <p className="text-blue-400 font-mono animate-pulse text-lg tracking-widest">Querying Databanks...</p>
            </div>
          )}

          {error && (
            <div className="h-64 flex items-center justify-center">
              <p className="text-red-400 font-mono bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                Connection Failed. Ensure FastAPI is running.
              </p>
            </div>
          )}

          {orbitData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* LEFT: AI COMMAND TERMINAL */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0b1121] border border-red-500/40 rounded-xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden group">
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-20 opacity-50"></div>
                  <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/20 transition-all duration-700"></div>

                  <div className="relative z-10 flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-red-500 font-mono uppercase tracking-widest text-xs mb-1 font-bold flex items-center gap-2">
                        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span> Critical Threat
                      </h3>
                      <h4 className="text-5xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{orbitData.ai_analysis.target}</h4>
                    </div>
                    <div className="text-right font-mono text-xs text-slate-500 opacity-60">
                      <p>SYS_ID: 0x8F9A</p>
                      <p>OP_MODE: AUTO</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="flex-1 bg-black/80 rounded-md p-6 font-mono text-sm text-emerald-400 border border-slate-800 leading-relaxed shadow-inner">
                      <p className="text-slate-600 mb-4 select-none border-b border-slate-800 pb-2 inline-block">root@vanguard:~$ ./ai_commander --generate-maneuver</p>
                      <div className="mt-2 text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
                        <TypewriterText text={orbitData.ai_analysis.directive} />
                      </div>
                      <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse mt-4"></span>
                    </div>

                    <div className="w-full md:w-64 h-64 border border-red-500/30 rounded-md bg-black/60 relative overflow-hidden flex items-center justify-center shadow-inner">
                      <div className="absolute top-3 left-3 text-[10px] font-mono font-bold text-red-500 animate-pulse z-10 tracking-widest uppercase">
                        [ TARGET LOCK ]
                      </div>
                      <Canvas camera={{ position: [0, 0, 3] }}>
                        <TargetScanner />
                      </Canvas>
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                        <div className="w-full h-px bg-red-500 absolute"></div>
                        <div className="h-full w-px bg-red-500 absolute"></div>
                        <div className="w-32 h-32 border border-red-500 rounded-full absolute"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: TARGET RADAR LIST */}
              <div className="space-y-4 max-h-150 overflow-y-auto pr-3 custom-scrollbar">
                <div className="flex justify-between items-center px-1 mb-2">
                  <h3 className="text-slate-400 font-mono uppercase tracking-widest text-xs font-bold">Priority Spacecraft</h3>
                  <span className="text-xs font-mono text-slate-600">{liveTargets.length} OBJS DISPLAYED</span>
                </div>

                {liveTargets.map((target, idx) => {
                  const isHighRisk = target.collision_probability > 50;
                  return (
                    <div key={idx} className={`relative bg-[#0b1121]/80 border border-slate-800 rounded-r-lg p-5 transition-all duration-300 hover:translate-x-2 cursor-pointer border-l-4 ${isHighRisk ? 'border-l-red-500 hover:bg-red-950/20 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'border-l-emerald-500 hover:bg-emerald-950/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-bold text-base text-white w-32 truncate uppercase tracking-wide" title={target.satellite}>{target.satellite}</p>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${isHighRisk ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                          {target.collision_probability}% RISK
                        </div>
                      </div>

                      <div className="w-full bg-slate-900 h-1 rounded-full mb-4 overflow-hidden">
                        <div className={`h-full ${isHighRisk ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} style={{ width: `${target.collision_probability}%` }}></div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400">
                        <div className="bg-black/50 p-1.5 rounded-sm text-center border border-slate-800/50 truncate"><span className="text-slate-600">X:</span>{target.position_x}</div>
                        <div className="bg-black/50 p-1.5 rounded-sm text-center border border-slate-800/50 truncate"><span className="text-slate-600">Y:</span>{target.position_y}</div>
                        <div className="bg-black/50 p-1.5 rounded-sm text-center border border-slate-800/50 truncate"><span className="text-slate-600">Z:</span>{target.position_z}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default App;