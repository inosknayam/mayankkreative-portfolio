"use client";
import { useEffect, useState } from 'react';

const Skills = () => {
    // Animation state
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        setAnimated(true);
    }, []);

    const softSkills = [
        { name: "Development", value: 90 },
        { name: "Design", value: 85 },
        { name: "Operations", value: 95 },
        { name: "Marketing", value: 80 },
    ];

    const hardSkills = [
        { name: "React.js / Next.js", value: 90 },
        { name: "Tailwind CSS", value: 95 },
        { name: "Firebase / Node.js", value: 85 },
        { name: "Figma / Photoshop", value: 80 },
        { name: "WhatsApp Automation", value: 90 },
        { name: "Google/Meta Ads", value: 75 },
    ];

    return (
        <section className="py-24 px-4 md:px-12 max-w-7xl mx-auto">

            {/* Soft Skills (Circular) */}
            <div className="flex items-center mb-12">
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
                <h3 className="text-2xl font-bold px-8 bg-background z-10">Core Competencies</h3>
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
                {softSkills.map((skill, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="relative w-[120px] h-[120px] mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-border"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={339.292}
                                    strokeDashoffset={339.292 - (339.292 * skill.value) / 100}
                                    className="text-accent transition-all duration-1000 ease-out"
                                    style={{ opacity: animated ? 1 : 0 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                                {skill.value}%
                            </div>
                        </div>
                        <h6 className="font-bold uppercase tracking-widest text-sm">{skill.name}</h6>
                    </div>
                ))}
            </div>

            {/* Hard Skills (Linear) */}
            <div className="flex items-center mb-12">
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
                <h3 className="text-2xl font-bold px-8 bg-background z-10">Technical Skills</h3>
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {hardSkills.map((skill, index) => (
                    <div key={index}>
                        <div className="flex justify-between mb-2">
                            <h6 className="font-bold uppercase tracking-widest text-sm">{skill.name}</h6>
                            <span className="text-text-soft text-sm">{skill.value}%</span>
                        </div>
                        <div className="h-1 bg-border w-full">
                            <div
                                className="h-full bg-accent transition-all duration-1000 ease-out"
                                style={{ width: animated ? `${skill.value}%` : '0%' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default Skills;
