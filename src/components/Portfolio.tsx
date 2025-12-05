"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

interface Project {
    id: string;
    heading1: string;
    heading2: string;
    category: string;
    description: string;
    imageUrl: string;
    slug: string;
}

const Portfolio = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'projects'));
                const projectsData: Project[] = [];
                querySnapshot.forEach((doc) => {
                    projectsData.push({
                        id: doc.id,
                        ...doc.data()
                    } as Project);
                });
                setProjects(projectsData);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <section id="portfolio" className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
            <div className="flex items-center mb-12">
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
                <h3 className="text-2xl font-bold px-8 bg-background z-10">Featured Projects</h3>
                <div className="h-[1px] bg-border flex-grow relative">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent"></div>
                    <p className="text-text-soft mt-4">Loading projects...</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-text-soft">No projects available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project) => (
                        <div key={project.id} className="group relative overflow-hidden border border-border bg-background">
                            <div className="relative h-[300px] w-full overflow-hidden">
                                <Image
                                    src={project.imageUrl}
                                    alt={project.heading2}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center">
                                    <Link href={`/projects/${project.slug}`} className="w-16 h-16 bg-accent text-white rounded-full flex justify-center items-center hover:scale-110 transition-transform">
                                        <FiArrowRight className="w-6 h-6" />
                                    </Link>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">
                                    {project.heading1}
                                </div>
                                <h4 className="text-xl font-bold mb-2">{project.heading2}</h4>
                                <div className="text-text-soft text-xs uppercase tracking-wider mb-4">
                                    {project.category}
                                </div>
                                <p className="text-text-soft text-sm leading-relaxed">{project.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Portfolio;

