"use client";
import { FiCode, FiUsers, FiTrendingUp } from 'react-icons/fi';

const competencies = [
    {
        number: "01",
        icon: <FiCode className="w-12 h-12" />,
        title: "Product & Web Architecture",
        subtitle: "(AI-Driven)",
        skills: [
            "Prompt Engineering & Dev: Building complex React/Node.js web portals by leveraging AI models (ChatGPT/Gemini) to generate production-ready code.",
            "Rapid Prototyping: Moving from idea to live website in record time.",
            "Platform Management: Managing end-to-end web presence for JEC Schools, JEC Colleges, and TFM."
        ]
    },
    {
        number: "02",
        icon: <FiUsers className="w-12 h-12" />,
        title: "Operations & Leadership",
        subtitle: "",
        skills: [
            "Team Management: Hiring, onboarding, and managing Graphic Design & Social Media teams.",
            "Training & Development: Creating SOPs and training modules (MS Office, Workflow Automation) to upskill new employees.",
            "Data Systems: Managing centralized data for admissions and leads across 7+ cities."
        ]
    },
    {
        number: "03",
        icon: <FiTrendingUp className="w-12 h-12" />,
        title: "Growth & Creative Strategy",
        subtitle: "",
        skills: [
            "Paid Acquisition: Managing Google Ads & Meta Ads budgets for TFM and Aspiro Living.",
            "Content Leadership: Directing the visual strategy (Graphics/Video) and Social Media calendars.",
            "Brand Stewardship: Ensuring consistent brand voice across all ventures."
        ]
    }
];

const Competencies = () => {
    return (
        <section id="competencies" className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
            <div className="flex items-center mb-16">
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold px-8 bg-background z-10">Core Competencies</h3>
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {competencies.map((comp, index) => (
                    <div key={index} className="bg-background border border-border p-8 hover:border-accent transition-all duration-300 group">
                        <div className="text-accent text-6xl font-bold opacity-20 mb-4 group-hover:opacity-40 transition-opacity">
                            {comp.number}
                        </div>
                        <div className="text-accent mb-6 group-hover:scale-110 transition-transform">
                            {comp.icon}
                        </div>
                        <h4 className="text-xl font-bold mb-2">
                            {comp.title}
                        </h4>
                        {comp.subtitle && (
                            <p className="text-accent text-sm font-semibold mb-6">{comp.subtitle}</p>
                        )}
                        <ul className="space-y-4 text-text-soft text-sm leading-relaxed">
                            {comp.skills.map((skill, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className="text-accent mr-2 mt-1">•</span>
                                    <span>{skill}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Competencies;
