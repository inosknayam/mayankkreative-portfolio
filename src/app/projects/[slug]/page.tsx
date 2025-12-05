"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import { useParams } from 'next/navigation';

interface Project {
    id: string;
    heading1: string;
    heading2: string;
    category: string;
    description: string;
    imageUrl: string;
    slug: string;
    detailedContent?: string;
    technologies?: string[];
    challenges?: string;
    solutions?: string;
    results?: string;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (!slug) return;

            setIsLoading(true);
            try {
                const q = query(collection(db, 'projects'), where('slug', '==', slug));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setProject({
                        id: doc.id,
                        ...doc.data()
                    } as Project);
                }
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProject();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent"></div>
                    <p className="text-text-soft mt-4">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Project Not Found</h1>
                    <p className="text-text-soft mb-8">The project you're looking for doesn't exist.</p>
                    <Link href="/#portfolio" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:brightness-110 transition-all">
                        <FaArrowLeft /> Back to Portfolio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link href="/#portfolio" className="inline-flex items-center gap-2 text-text-soft hover:text-accent transition-colors">
                        <FaArrowLeft /> Back to Portfolio
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[400px] md:h-[500px] overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={project.imageUrl}
                        alt={project.heading2}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
                </div>
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16">
                    <div className="inline-block mb-4">
                        <span className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-full">
                            {project.category}
                        </span>
                    </div>
                    <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-2">
                        {project.heading1}
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        {project.heading2}
                    </h1>
                    <p className="text-xl text-gray-200 max-w-3xl">
                        {project.description}
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Overview */}
                {project.detailedContent && (
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-6">Project Overview</h2>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-text-soft text-lg leading-relaxed whitespace-pre-wrap">
                                {project.detailedContent}
                            </p>
                        </div>
                    </section>
                )}

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-6">Technologies Used</h2>
                        <div className="flex flex-wrap gap-3">
                            {project.technologies.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-accent/10 border border-accent text-accent rounded-lg font-medium"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Challenges, Solutions, Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {project.challenges && (
                        <div className="bg-background border border-border p-8 rounded-lg">
                            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Challenges</h3>
                            <p className="text-text-soft leading-relaxed whitespace-pre-wrap">
                                {project.challenges}
                            </p>
                        </div>
                    )}

                    {project.solutions && (
                        <div className="bg-background border border-border p-8 rounded-lg">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">💡</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Solutions</h3>
                            <p className="text-text-soft leading-relaxed whitespace-pre-wrap">
                                {project.solutions}
                            </p>
                        </div>
                    )}

                    {project.results && (
                        <div className="bg-background border border-border p-8 rounded-lg">
                            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">📈</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Results & Impact</h3>
                            <p className="text-text-soft leading-relaxed whitespace-pre-wrap">
                                {project.results}
                            </p>
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-12 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        Interested in Similar Work?
                    </h2>
                    <p className="text-text-soft text-lg mb-8 max-w-2xl mx-auto">
                        I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/#contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:brightness-110 transition-all"
                        >
                            Get In Touch
                        </Link>
                        <Link
                            href="/#portfolio"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-background border border-border text-foreground font-semibold rounded-lg hover:border-accent transition-all"
                        >
                            View More Projects
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-24 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-soft text-sm">
                    <p>© 2025 MayankKreative. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
