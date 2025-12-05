"use client";
import Link from 'next/link';
import { FaLinkedinIn, FaGithub, FaInstagram, FaTwitter } from 'react-icons/fa';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "contacts"), {
                ...formData,
                createdAt: serverTimestamp()
            });
            toast.success("Message sent successfully!");
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error("Error adding document: ", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
                <div className="uppercase text-xs font-semibold tracking-[2px] text-accent mb-4">
                    Let's Build Something Together
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-8 max-w-3xl">
                    Ready to bring your ideas to life? I'm here to help.
                </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Contact Info */}
                <div className="w-full md:w-1/3 space-y-8">
                    <div>
                        <h6 className="text-sm font-bold uppercase tracking-widest mb-2">Phone</h6>
                        <p className="text-text-soft">+91 9560748680</p>
                    </div>
                    <div>
                        <h6 className="text-sm font-bold uppercase tracking-widest mb-2">Email</h6>
                        <p className="text-text-soft">hi@mayankkreative.com</p>
                    </div>
                    <div>
                        <h6 className="text-sm font-bold uppercase tracking-widest mb-2">Location</h6>
                        <p className="text-text-soft">Delhi, India</p>
                    </div>
                    <div className="flex gap-6 pt-4">
                        <Link href="https://linkedin.com" target="_blank" className="hover:text-accent transition-colors"><FaLinkedinIn size={20} /></Link>
                        <Link href="https://github.com" target="_blank" className="hover:text-accent transition-colors"><FaGithub size={20} /></Link>
                        <Link href="https://instagram.com" target="_blank" className="hover:text-accent transition-colors"><FaInstagram size={20} /></Link>
                        <Link href="https://twitter.com" target="_blank" className="hover:text-accent transition-colors"><FaTwitter size={20} /></Link>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="w-full md:w-2/3 bg-background border border-border p-8 rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest mb-2">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent transition-colors"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent transition-colors"
                                    placeholder="Your Email"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest mb-2">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent transition-colors"
                                placeholder="Your Phone Number"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest mb-2">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent transition-colors resize-none"
                                placeholder="Tell me about your project..."
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center items-center h-[50px] px-8 bg-accent text-white text-xs font-semibold uppercase tracking-[2px] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>

            <footer className="mt-24 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-text-soft text-sm">
                <p>© 2025 MayankKreative. All rights reserved.</p>
            </footer>
        </section>
    );
};

export default Contact;
