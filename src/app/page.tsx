"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Competencies from "@/components/Competencies";
import Portfolio from "@/components/Portfolio";
import Tools from "@/components/Tools";
import Contact from "@/components/Contact";
import BlobCursor from "@/components/BlobCursor";

export default function Home() {
  const [blobCursorEnabled, setBlobCursorEnabled] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBlobCursorEnabled(docSnap.data().blobCursorEnabled ?? true);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Default to enabled on error
        setBlobCursorEnabled(true);
      }
    };

    fetchSettings();
  }, []);

  return (
    <Layout>
      {blobCursorEnabled && (
        <BlobCursor
          blobType="circle"
          fillColor="#7f36f4"
          trailCount={3}
          sizes={[60, 125, 75]}
          innerSizes={[20, 35, 25]}
          innerColor="rgba(255,255,255,0.8)"
          opacities={[0.6, 0.6, 0.6]}
          shadowColor="rgba(0,0,0,0.75)"
          shadowBlur={5}
          shadowOffsetX={10}
          shadowOffsetY={10}
          filterStdDeviation={30}
          useFilter={true}
          fastDuration={0.1}
          slowDuration={0.3}
          zIndex={9999}
        />
      )}
      <Hero />
      <About />
      <Competencies />
      <Portfolio />
      <Tools />
      <Contact />
    </Layout>
  );
}


