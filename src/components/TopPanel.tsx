"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiMail, FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from 'next-themes';

const TopPanel = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div className="h-[90px] flex items-center justify-between bg-background border-b border-border fixed top-0 left-0 right-0 z-50 px-8 md:px-12 transition-colors duration-300">
            {/* Logo */}
            <Link href="/" className="w-[90px] h-[90px] bg-accent flex justify-center items-center text-white text-[40px] font-semibold transition-all duration-400 hover:brightness-110 group">
                <span className="relative flex justify-center items-center transition-transform duration-400 group-hover:scale-115">
                    M
                    <span className="absolute left-3 top-1/2 w-[7px] h-[7px] bg-white rounded-full"></span>
                </span>
            </Link>

            {/* Navigation (Desktop) */}
            <div className={`fixed inset-0 bg-background/95 md:bg-transparent z-40 flex flex-col justify-center items-center transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:static md:opacity-100 md:pointer-events-auto md:flex-row md:justify-end md:h-auto`}>
                <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-8 text-center md:text-left items-center`}>
                    <Link href="/" className="text-foreground font-semibold uppercase tracking-widest text-xs hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/about" className="text-foreground font-semibold uppercase tracking-widest text-xs hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
                    <Link href="/expertise" className="text-foreground font-semibold uppercase tracking-widest text-xs hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Expertise</Link>
                    <Link href="/projects-page" className="text-foreground font-semibold uppercase tracking-widest text-xs hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Projects</Link>
                    <Link href="/resources" className="text-foreground font-semibold uppercase tracking-widest text-xs hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Resources</Link>
                    <Link href="/contact" className="text-foreground font-semibold uppercase tracking-widest text-xs hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                </nav>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-6 md:gap-0">
                {/* Theme Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-[90px] h-[90px] flex justify-center items-center text-foreground hover:text-accent transition-colors border-l border-border md:mr-0"
                    >
                        {theme === 'dark' ? <FiSun className="w-6 h-6" /> : <FiMoon className="w-6 h-6" />}
                    </button>
                )}

                <Link href="/contact" className="w-[90px] h-[90px] bg-accent flex justify-center items-center text-white transition-all duration-400 hover:brightness-110 group hidden md:flex">
                    <FiMail className="w-6 h-6 transition-transform duration-400 group-hover:scale-115" />
                </Link>

                {/* Mobile Menu Button */}
                <button onClick={toggleMenu} className="md:hidden text-foreground focus:outline-none ml-4">
                    {isMenuOpen ? <FiX className="w-8 h-8" /> : <FiMenu className="w-8 h-8" />}
                </button>
            </div>
        </div>
    );
};

export default TopPanel;
