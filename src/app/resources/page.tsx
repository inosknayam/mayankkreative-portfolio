"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Layout from "@/components/Layout";
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';

interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    category: string;
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'resources'));
                const resourcesData: Resource[] = [];
                querySnapshot.forEach((doc) => {
                    resourcesData.push({
                        id: doc.id,
                        ...doc.data()
                    } as Resource);
                });
                setResources(resourcesData);
            } catch (error) {
                console.error('Error fetching resources:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResources();
    }, []);

    const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];
    const filteredResources = selectedCategory === 'all'
        ? resources
        : resources.filter(r => r.category === selectedCategory);

    const groupedResources = filteredResources.reduce((acc, resource) => {
        if (!acc[resource.category]) {
            acc[resource.category] = [];
        }
        acc[resource.category].push(resource);
        return acc;
    }, {} as Record<string, Resource[]>);

    return (
        <Layout>
            <div className="pt-[90px]">
                <section className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-16">
                        <div className="uppercase text-xs font-semibold tracking-[2px] text-accent mb-4">
                            Curated Collection
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-8 max-w-3xl">
                            Resources & Tools
                        </h1>
                        <p className="text-text-soft text-lg max-w-2xl">
                            A handpicked collection of the best AI websites, graphic design tools, and utilities I use daily to build amazing products.
                        </p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === category
                                        ? 'bg-accent text-white'
                                        : 'bg-background border border-border text-foreground hover:border-accent'
                                    }`}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Resources */}
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent"></div>
                            <p className="text-text-soft mt-4">Loading resources...</p>
                        </div>
                    ) : Object.keys(groupedResources).length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-soft">No resources available yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {Object.entries(groupedResources).map(([category, categoryResources]) => (
                                <div key={category}>
                                    <div className="flex items-center mb-8">
                                        <div className="h-[1px] bg-border flex-grow relative">
                                            <span className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                                        </div>
                                        <h2 className="text-2xl font-bold px-8 bg-background z-10 capitalize">
                                            {category}
                                        </h2>
                                        <div className="h-[1px] bg-border flex-grow relative">
                                            <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[7px] h-[7px] bg-accent rounded-full"></span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {categoryResources.map((resource) => (
                                            <a
                                                key={resource.id}
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group bg-background border border-border p-6 rounded-lg hover:border-accent transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                                                        {resource.title}
                                                    </h3>
                                                    <FiExternalLink className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <p className="text-text-soft text-sm leading-relaxed">
                                                    {resource.description}
                                                </p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
