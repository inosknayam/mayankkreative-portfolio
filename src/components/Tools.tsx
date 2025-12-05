"use client";
import { FaReact, FaNode, FaDatabase, FaPaintBrush, FaMicrosoft, FaRobot } from 'react-icons/fa';
import { SiTailwindcss, SiFirebase, SiAdobephotoshop, SiAdobepremierepro, SiAdobeillustrator, SiAdobeaftereffects, SiFigma, SiNotion, SiTrello, SiOpenai } from 'react-icons/si';

const toolCategories = [
    {
        title: "Development",
        tools: [
            { name: "React.js", icon: <FaReact className="w-6 h-6" /> },
            { name: "Node.js", icon: <FaNode className="w-6 h-6" /> },
            { name: "Tailwind CSS", icon: <SiTailwindcss className="w-6 h-6" /> },
            { name: "Firebase", icon: <SiFirebase className="w-6 h-6" /> },
            { name: "SQLite", icon: <FaDatabase className="w-6 h-6" /> },
        ]
    },
    {
        title: "Design",
        tools: [
            { name: "Photoshop", icon: <SiAdobephotoshop className="w-6 h-6" /> },
            { name: "Illustrator", icon: <SiAdobeillustrator className="w-6 h-6" /> },
            { name: "After Effects", icon: <SiAdobeaftereffects className="w-6 h-6" /> },
            { name: "Premiere Pro", icon: <SiAdobepremierepro className="w-6 h-6" /> },
            { name: "Figma", icon: <SiFigma className="w-6 h-6" /> },
        ]
    },
    {
        title: "Management",
        tools: [
            { name: "MS Office", icon: <FaMicrosoft className="w-6 h-6" /> },
            { name: "Notion", icon: <SiNotion className="w-6 h-6" /> },
            { name: "Trello", icon: <SiTrello className="w-6 h-6" /> },
        ]
    },
    {
        title: "AI Apps",
        tools: [
            { name: "ChatGPT", icon: <SiOpenai className="w-6 h-6" /> },
            { name: "Gemini", icon: <FaRobot className="w-6 h-6" /> },
            { name: "Antigravity", icon: <FaRobot className="w-6 h-6" /> },
            { name: "Claude", icon: <FaRobot className="w-6 h-6" /> },
        ]
    }
];

const Tools = () => {
    return (
        <section id="tools" className="py-24 px-4 md:px-12 max-w-7xl mx-auto bg-gradient-to-b from-transparent via-accent/5 to-transparent">
            <div className="flex items-center mb-16">
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold px-8 bg-background z-10">Tools & Technologies</h3>
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {toolCategories.map((category, index) => (
                    <div key={index} className="bg-background border border-border p-6 hover:border-accent transition-all duration-300">
                        <h4 className="text-lg font-bold mb-6 text-accent uppercase tracking-wider text-center">
                            {category.title}
                        </h4>
                        <div className="space-y-4">
                            {category.tools.map((tool, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-text-soft hover:text-foreground transition-colors">
                                    <div className="text-accent">
                                        {tool.icon}
                                    </div>
                                    <span className="text-sm font-medium">{tool.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Highlight AI Specialty */}
            <div className="mt-12 text-center">
                <div className="inline-block bg-accent/10 border border-accent px-8 py-4 rounded-lg">
                    <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
                        Core Specialty
                    </p>
                    <p className="text-foreground text-lg font-bold">
                        Advanced Prompt Engineering & AI Workflow Automation
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Tools;

