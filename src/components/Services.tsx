import Link from 'next/link';
import { FiArrowRight, FiMonitor, FiCpu, FiPenTool } from 'react-icons/fi';

const services = [
    {
        icon: <FiPenTool className="w-8 h-8" />,
        title: "Creative & Branding",
        description: "Graphic Design, Video Editing, Social Media Management & Content Strategy.",
        link: "#contact"
    },
    {
        icon: <FiMonitor className="w-8 h-8" />,
        title: "Web Development & Tech",
        description: "Frontend (React.js), Backend (Node.js, SQLite), Website Architecture & Maintenance.",
        link: "#contact"
    },
    {
        icon: <FiCpu className="w-8 h-8" />,
        title: "Operations & Automation",
        description: "WhatsApp Automation, API Integration, Data Management, Paid Advertising.",
        link: "#contact"
    }
];

const Services = () => {
    return (
        <section id="services" className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
            <div className="flex items-center mb-12">
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
                <h3 className="text-2xl font-bold px-8 bg-background z-10">My Services / Expertise</h3>
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <div key={index} className="bg-background border border-border p-8 text-center hover:border-accent transition-colors group">
                        <div className="text-accent mb-6 flex justify-center group-hover:scale-110 transition-transform">
                            {service.icon}
                        </div>
                        <h5 className="text-xl font-bold mb-4">{service.title}</h5>
                        <p className="text-text-soft mb-6">{service.description}</p>
                        <div className="flex justify-center">
                            <Link href={service.link} className="w-10 h-10 bg-accent text-white rounded-full flex justify-center items-center hover:brightness-110 transition-all">
                                <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Services;
