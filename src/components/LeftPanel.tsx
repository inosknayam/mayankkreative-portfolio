import { FaLinkedinIn, FaGithub, FaInstagram, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';

const LeftPanel = () => {
    return (
        <div className="fixed top-[90px] left-0 bottom-0 w-[90px] border-r border-white/10 hidden md:flex flex-col justify-between items-center py-8 z-40 backdrop-blur-md bg-white/5 dark:bg-black/5">
            <div className="transform -rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-foreground mt-20">
                Mayankkreative
            </div>

            <ul className="flex flex-col gap-6">
                <li>
                    <Link href="https://linkedin.com" target="_blank" className="text-text-soft hover:text-foreground transition-colors">
                        <FaLinkedinIn />
                    </Link>
                </li>
                <li>
                    <Link href="https://github.com" target="_blank" className="text-text-soft hover:text-foreground transition-colors">
                        <FaGithub />
                    </Link>
                </li>
                <li>
                    <Link href="https://instagram.com" target="_blank" className="text-text-soft hover:text-foreground transition-colors">
                        <FaInstagram />
                    </Link>
                </li>
                <li>
                    <Link href="https://twitter.com" target="_blank" className="text-text-soft hover:text-foreground transition-colors">
                        <FaTwitter />
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default LeftPanel;
