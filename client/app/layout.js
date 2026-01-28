import '@/styles/globals.css';

export const metadata = {
  title: 'Mini-LOS | Loan Origination System',
  description: 'A simple loan origination system for processing loan applications',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-lg">M</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Mini-LOS</span>
                </a>
                <nav className="flex items-center gap-4">
                  <a 
                    href="/loan/apply" 
                    className="text-gray-600 hover:text-primary-600 font-medium"
                  >
                    Apply for Loan
                  </a>
                  <a 
                    href="/admin" 
                    className="text-gray-600 hover:text-primary-600 font-medium"
                  >
                    Admin
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Mini-LOS. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
