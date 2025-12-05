"use client";
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowDown } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LiquidChrome from './LiquidChrome';

const Hero = () => {
    const [scrollRotation, setScrollRotation] = useState(0);
    const [liquidChromeEnabled, setLiquidChromeEnabled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const position = window.scrollY;
            setScrollRotation(position * 0.2);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'site');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setLiquidChromeEnabled(docSnap.data().liquidChromeEnabled ?? false);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                setLiquidChromeEnabled(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <section className="relative pt-[100px] pb-0 flex flex-col items-center text-center px-4 overflow-hidden min-h-screen">
            {/* Liquid Chrome Background - Absolute to Hero section only */}
            {liquidChromeEnabled && (
                <div className="absolute inset-0 z-0">
                    <LiquidChrome
                        baseColor={[0.2, 0.1, 0.3]}
                        speed={0.2}
                        amplitude={0.4}
                        frequencyX={2}
                        frequencyY={2}
                        interactive={true}
                    />
                </div>
            )}

            {/* Content - pointer-events-none on container, auto on interactive elements */}
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center pointer-events-none">
                <div className="uppercase text-xs font-semibold tracking-[2px] text-white/80 mb-5 animate-fade-in-up" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)' }}>
                    Digital Product Manager & Operations Lead
                </div>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8 text-white animate-fade-in-up delay-100" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.5)' }}>
                    Orchestrating Digital Growth:<br />
                    <span className="text-accent" style={{ textShadow: '0 4px 20px rgba(127, 54, 244, 0.5), 0 0 40px rgba(127, 54, 244, 0.3)' }}>From AI-Driven Development</span><br />
                    to Operational Scale
                </h1>

                <p className="text-sm md:text-base text-white/90 max-w-3xl mx-auto leading-relaxed mb-5 animate-fade-in-up delay-200" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4)' }}>
                    I leverage AI to build full-stack web solutions, lead creative teams, and optimize business processes for EdTech, Hospitality, and Entertainment sectors.
                </p>

                {/* Oval Frame - enable pointer events for interactive elements */}
                <div className="relative w-[150px] h-[400px] bg-[#e5e5e5] dark:bg-[#202124] rounded-[100px] flex flex-col justify-between items-center pt-5 mt-5 overflow-hidden animate-fade-in-up delay-300 shadow-xl border border-border pointer-events-auto">
                    {/* Circular Text Animation */}
                    <div className="relative w-[150px] h-[150px] flex justify-center items-center">
                        <svg viewBox="0 0 300 300" className="absolute w-full h-full top-0 left-0" style={{ transform: `rotate(${scrollRotation}deg)`, transition: 'transform 0.1s linear' }}>
                            <defs>
                                <path id="circlePath" d="M 150, 150 m -95, 0 a 95,95 0 0,1 190,0 a 95,95 0 0,1 -190,0 " />
                            </defs>
                            <text fill="currentColor" className="text-foreground text-[23px] tracking-[8px] uppercase font-semibold font-outfit">
                                <textPath xlinkHref="#circlePath">Scroll down - Scroll down - </textPath>
                            </text>
                        </svg>
                        <div className="z-10 w-[50px] h-[50px] bg-[#202124] dark:bg-white rounded-full flex justify-center items-center text-white dark:text-black text-xl">
                            <FiArrowDown />
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="w-[110px] h-[110px] rounded-full overflow-hidden mb-[25px] z-10 border-4 border-background">
                        <Image
                            src="/img/person/avatar.jpg"
                            alt="Mayank Soni"
                            width={110}
                            height={110}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
