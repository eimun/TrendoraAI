import Sidebar from './Sidebar';


function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <Sidebar />
            {/* Main content area — ml matches sidebar width, shifts when sidebar collapses via CSS */}
            <main className="ml-[72px] lg:ml-[240px] transition-all duration-200">
                {children}
            </main>
        </div>
    );
}

export default AppLayout;
