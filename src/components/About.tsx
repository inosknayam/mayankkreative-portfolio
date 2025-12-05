import Image from 'next/image';
import { FaQuoteLeft } from 'react-icons/fa';

const About = () => {
    return (
        <section id="about" className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Image */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full overflow-hidden border-4 border-border">
                        <Image
                            src="/img/person/avatar.jpg"
                            alt="Mayank Soni"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>


                {/* Content */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <div className="uppercase text-xs font-semibold tracking-[2px] text-accent mb-4">
                        The Architect Behind the Systems
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">
                        I define myself as a Problem Solver.
                    </h2>

                    <div className="text-accent text-2xl mb-8 flex justify-center md:justify-start">
                        <FaQuoteLeft />
                    </div>

                    <p className="text-text-soft text-lg leading-relaxed mb-6">
                        My background isn't in traditional software engineering—it's in <strong className="text-foreground">getting things done</strong>.
                    </p>

                    <p className="text-text-soft text-lg leading-relaxed mb-6">
                        I specialize in <strong className="text-accent">AI-Augmented Development</strong>. Using advanced Prompt Engineering and AI tools, I architect and deploy complex <strong className="text-foreground">Full-Stack (MERN) applications</strong> from scratch for Jain Education Consultancy and The Funny Mouse, and utilize efficient site-builders for projects like Aspiro Living.
                    </p>

                    <p className="text-text-soft text-lg leading-relaxed mb-8">
                        But code is just one tool. I oversee the <strong className="text-foreground">entire lifecycle of a business unit</strong>: from hiring and training the creative team to managing data pipelines and running profitable Google Ad campaigns. I don't just build the product; I build the team and the marketing engine that drives it.
                    </p>

                    <div className="relative w-[150px] h-[60px] mx-auto md:mx-0">
                        <Image
                            src="/img/person/sign.png"
                            alt="Signature"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
