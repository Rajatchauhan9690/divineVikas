import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import Hero from "../components/Hero";
import LifeSection from "../components/LifeSection";
import TransForm from "../components/Transform";
import LifeWorkshop from "../components/LifeWorkshop";
import Personal from "../components/Personal";
import WorkShop from "../components/WorkShop";
import Testimonial from "../components/Testimonial";
import FAQ from "../components/FAQ";
import StickyOffer from "../components/StickyOffer";

import AkashicTunnel from "../components/AkashicTunnel";

export default function LandingPage3D() {
  return (
    <div className="w-screen h-screen bg-mesh overflow-hidden fixed inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", antialias: false }}
        camera={{ position: [0, 0, 5], fov: 60 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          color="#f97316"
        />

        <ScrollControls pages={9} damping={0.2} distance={1.2}>
          <Scroll>
            <AkashicTunnel />
          </Scroll>

          <Scroll html style={{ width: "100%" }}>
            <div className="holographic-overlay text-slate-800">
              <Hero />
              <LifeSection />
              <TransForm />
              <LifeWorkshop />
              <Personal />
              <WorkShop />
              <Testimonial />
              <FAQ />
            </div>
          </Scroll>
        </ScrollControls>

        <EffectComposer disableNormalPass>
          {/* ✅ FIX: Removed the invalid resolution prop */}
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={1}
          />
        </EffectComposer>
      </Canvas>

      <StickyOffer />
    </div>
  );
}
