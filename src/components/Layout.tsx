import Header from './Header';
import LeftPanel from './LeftPanel';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen text-foreground font-sans">
            <Header />
            <LeftPanel />

            <main className="pt-[90px] md:pl-[90px] min-h-screen transition-all duration-500">
                <div className="w-full">
                    {children}
                </div>
            </main>

            {/* Back to Top Button could go here */}
        </div>
    );
};

export default Layout;
