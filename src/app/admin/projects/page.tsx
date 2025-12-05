"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowLeft, FaEye } from 'react-icons/fa';
import Link from 'next/link';

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
    createdAt: any;
}

const ProjectsAdmin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        heading1: '',
        heading2: '',
        category: '',
        description: '',
        imageUrl: '',
        slug: '',
        detailedContent: '',
        technologies: '',
        challenges: '',
        solutions: '',
        results: ''
    });

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'mayank_admin_2025') {
            setIsAuthenticated(true);
            fetchProjects();
        } else {
            window.location.href = '/admin';
        }
    }, []);

    const fetchProjects = async () => {
        setIsLoading(true);
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
            toast.error('Failed to fetch projects');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const projectData = {
                heading1: formData.heading1,
                heading2: formData.heading2,
                category: formData.category,
                description: formData.description,
                imageUrl: formData.imageUrl,
                slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
                detailedContent: formData.detailedContent,
                technologies: formData.technologies ? formData.technologies.split(',').map(t => t.trim()) : [],
                challenges: formData.challenges,
                solutions: formData.solutions,
                results: formData.results,
                updatedAt: serverTimestamp()
            };

            if (editingProject) {
                await updateDoc(doc(db, 'projects', editingProject.id), projectData);
                toast.success('Project updated successfully!');
            } else {
                await addDoc(collection(db, 'projects'), {
                    ...projectData,
                    createdAt: serverTimestamp()
                });
                toast.success('Project added successfully!');
            }

            resetForm();
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error('Failed to save project');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setFormData({
            heading1: project.heading1,
            heading2: project.heading2,
            category: project.category,
            description: project.description,
            imageUrl: project.imageUrl,
            slug: project.slug,
            detailedContent: project.detailedContent || '',
            technologies: project.technologies?.join(', ') || '',
            challenges: project.challenges || '',
            solutions: project.solutions || '',
            results: project.results || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await deleteDoc(doc(db, 'projects', id));
            toast.success('Project deleted successfully');
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
        }
    };

    const resetForm = () => {
        setFormData({
            heading1: '',
            heading2: '',
            category: '',
            description: '',
            imageUrl: '',
            slug: '',
            detailedContent: '',
            technologies: '',
            challenges: '',
            solutions: '',
            results: ''
        });
        setEditingProject(null);
        setIsEditing(false);
    };

    if (!isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-white">Redirecting...</div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-white hover:text-purple-300 transition-colors">
                                <FaArrowLeft className="text-xl" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Projects Management</h1>
                                <p className="text-gray-300 text-sm">Manage featured projects</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                            {isEditing ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Project</>}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Add/Edit Form */}
                {isEditing && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingProject ? 'Edit Project' : 'Add New Project'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Heading 1 (Role/Position)
                                    </label>
                                    <input
                                        type="text"
                                        name="heading1"
                                        value={formData.heading1}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., Digital Product Lead"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Heading 2 (Company Name)
                                    </label>
                                    <input
                                        type="text"
                                        name="heading2"
                                        value={formData.heading2}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., Jain Education Consultancy"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., EdTech, Entertainment, Hospitality"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        URL Slug
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g., jain-education-consultancy"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="/img/portfolio/project-image.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Short Description (for portfolio grid)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Brief description for the portfolio grid..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Detailed Content (for project page)
                                </label>
                                <textarea
                                    name="detailedContent"
                                    value={formData.detailedContent}
                                    onChange={handleInputChange}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Full project description, background, objectives..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Technologies (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    name="technologies"
                                    value={formData.technologies}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="React, Node.js, Firebase, Tailwind CSS"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Challenges
                                </label>
                                <textarea
                                    name="challenges"
                                    value={formData.challenges}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="What challenges did you face in this project?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Solutions
                                </label>
                                <textarea
                                    name="solutions"
                                    value={formData.solutions}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="How did you solve these challenges?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Results & Impact
                                </label>
                                <textarea
                                    name="results"
                                    value={formData.results}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="What were the outcomes and impact of this project?"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                                >
                                    <FaSave /> {editingProject ? 'Update Project' : 'Add Project'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Projects List */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/20">
                        <h2 className="text-xl font-bold text-white">All Projects ({projects.length})</h2>
                    </div>

                    {isLoading && !isEditing ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-purple-600"></div>
                            <p className="text-gray-300 mt-4">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-300">No projects yet. Add your first project!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {projects.map((project) => (
                                <div key={project.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-purple-500 transition-all">
                                    <div className="relative h-48 bg-gray-800">
                                        {project.imageUrl && (
                                            <img
                                                src={project.imageUrl}
                                                alt={project.heading2}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                                                {project.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-purple-400 text-xs font-semibold uppercase mb-1">
                                            {project.heading1}
                                        </p>
                                        <h3 className="text-white font-bold text-lg mb-2">
                                            {project.heading2}
                                        </h3>
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                target="_blank"
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                            >
                                                <FaEye /> View
                                            </Link>
                                            <button
                                                onClick={() => handleEdit(project)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProjectsAdmin;
