import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Shield, Menu, X, Zap, Lock, Eye, Code2, LogOut } from 'lucide-react';
import { CodeEditor, UploadBox, ResultPanel, FixPanel } from './components';
import ThemeToggle from './components/ThemeToggle';
import { scanCode, scanFile } from './services/api';

// Auth pages
import GetStarted from './pages/GetStarted';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Main app state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [isLoadingFix, setIsLoadingFix] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (token && u) {
      try { setUser(JSON.parse(u)); } catch(e) { localStorage.removeItem('user'); }
    }
  }, []);

  // Prevent page scrolling when showing the landing page (not authenticated)
  useEffect(() => {
    if (!user) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [user]);

  // Define all hooks unconditionally at the top level (required by React Rules of Hooks)
  const handleScan = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to scan');
      return;
    }

    setIsScanning(true);
    setSelectedVulnerability(null);
    setScanResults(null);

    try {
      const results = await scanCode(code, language);
      setScanResults(results);
      
      if (results.vulnerabilities?.length > 0) {
        toast.error(`Found ${results.vulnerabilities.length} security issues!`, {
          icon: '⚠️',
          duration: 4000
        });
      } else {
        toast.success('No vulnerabilities detected!', {
          icon: '🛡️',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.error || 'Failed to scan code. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, [code, language]);

  const handleFileUpload = useCallback(async (file) => {
    setIsScanning(true);
    setSelectedVulnerability(null);
    setScanResults(null);

    try {
      const results = await scanFile(file);
      setScanResults(results);
      
      // Read file content and update editor
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);

      // Detect language from file extension
      const ext = file.name.split('.').pop().toLowerCase();
      const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'php': 'php',
        'go': 'go',
        'rb': 'ruby'
      };
      setLanguage(langMap[ext] || 'javascript');

      if (results.vulnerabilities?.length > 0) {
        toast.error(`Found ${results.vulnerabilities.length} security issues in ${file.name}!`, {
          icon: '⚠️',
          duration: 4000
        });
      } else {
        toast.success('No vulnerabilities detected!', {
          icon: '🛡️',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('File scan error:', error);
      toast.error(error.error || 'Failed to scan file. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleSelectVulnerability = useCallback((vuln) => {
    setSelectedVulnerability(vuln);
  }, []);

  const handleApplyFix = useCallback((vulnerability, fix) => {
  if (!fix || !vulnerability) return;

  setIsLoadingFix(true);

  try {
    console.log('🔧 Applying fix for:', vulnerability.type);
    console.log('📝 Fix content:', fix);
    
    // Extract the corrected code from the AI response
    let correctedCode = '';
    
    // Try multiple extraction patterns
    const patterns = [
      // Pattern 1: Code block with language
      new RegExp(`CORRECTED_CODE:\\s*\`\`\`(?:java)?\\s*([\\s\\S]*?)\`\`\``, 'i'),
      // Pattern 2: Any code block after CORRECTED_CODE
      /CORRECTED_CODE:\s*```[\s\S]*?\n([\s\S]*?)```/i,
      // Pattern 3: Any code block
      /```[\s\S]*?\n([\s\S]*?)```/,
      // Pattern 4: If fix is already clean code
      /^([\s\S]*)$/
    ];
    
    for (const pattern of patterns) {
      const match = fix.match(pattern);
      if (match && match[1] && match[1].trim().length > 50) {
        correctedCode = match[1].trim();
        console.log('✅ Extracted corrected code length:', correctedCode.length);
        break;
      }
    }
    
    // If no match found, use the fix as-is
    if (!correctedCode || correctedCode.length < 50) {
      correctedCode = fix.trim();
    }
    
    // Clean up the code
    correctedCode = correctedCode
      .replace(/\/\/.*$/gm, '')  // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
      .trim();
    
    // Get the original code lines
    const lines = code.split('\n');
    const lineIndex = vulnerability.line - 1;
    
    // Find the vulnerable function in original code
    let functionStart = lineIndex;
    let functionEnd = lineIndex;
    let braceCount = 0;
    let foundStart = false;
    
    // Look for the beginning of the function
    for (let i = lineIndex; i >= 0; i--) {
      if (lines[i].includes('public ') || lines[i].includes('private ') || 
          lines[i].includes('protected ') || lines[i].includes('void ') ||
          lines[i].includes('function ') || lines[i].includes('def ')) {
        
        // Check if this looks like a function declaration
        if (lines[i].includes('(') || lines[i+1]?.includes('(')) {
          functionStart = i;
          foundStart = true;
          break;
        }
      }
    }
    
    // If we didn't find a clear start, use 5 lines before as buffer
    if (!foundStart) {
      functionStart = Math.max(0, lineIndex - 5);
    }
    
    // Find the end of the function (matching braces)
    for (let i = functionStart; i < lines.length; i++) {
      // Count opening braces
      const openBraces = (lines[i].match(/{/g) || []).length;
      const closeBraces = (lines[i].match(/}/g) || []).length;
      
      braceCount += openBraces - closeBraces;
      
      // If we've closed all braces and we're back to zero, this is the end
      if (braceCount === 0 && i > functionStart) {
        functionEnd = i;
        break;
      }
    }
    
    // If we couldn't find the end, use the next 20 lines
    if (functionEnd === lineIndex) {
      functionEnd = Math.min(lines.length - 1, lineIndex + 20);
    }
    
    console.log(`📊 Replacing lines ${functionStart + 1} to ${functionEnd + 1}`);
    console.log(`📏 Original function length: ${functionEnd - functionStart + 1} lines`);
    console.log(`📏 New function length: ${correctedCode.split('\n').length} lines`);
    
    // Replace the entire function with the corrected code
    lines.splice(functionStart, functionEnd - functionStart + 1, correctedCode);
    
    const updatedCode = lines.join('\n');
    setCode(updatedCode);
    
    // Remove the fixed vulnerability from results
    if (scanResults) {
      const updatedVulns = scanResults.vulnerabilities.filter(v => v.id !== vulnerability.id);
      const updatedAiAnalysis = scanResults.aiAnalysis?.filter(a => a.vulnerabilityId !== vulnerability.id) || [];
      
      setScanResults({
        ...scanResults,
        vulnerabilities: updatedVulns,
        aiAnalysis: updatedAiAnalysis,
        totalVulnerabilities: updatedVulns.length
      });
    }

    setSelectedVulnerability(null);
    toast.success('Fix applied successfully! ✅', {
      icon: '✅',
      duration: 3000
    });
    
  } catch (error) {
    console.error('❌ Apply fix error:', error);
    toast.error('Failed to apply fix. Please try manually.', {
      icon: '❌'
    });
  } finally {
    setIsLoadingFix(false);
  }
}, [code, scanResults]);

  const handleCloseFix = useCallback(() => {
    setSelectedVulnerability(null);
  }, []);

  return (
    <div className="min-h-screen bg-accent-white dark:bg-secondary-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 4000
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-accent-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">CODATS</h1>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 hidden sm:block">Code Analysis & Threat Scanner</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">Features</a>
              <a href="#demo" className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">Demo</a>

              {/* Theme Toggle */}
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Hi, <strong className="text-primary-600 dark:text-primary-400">{user.firstName}</strong></div>
                  <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }} className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowLogin(true)} className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">Login</button>
                  <button onClick={() => setShowSignup(true)} className="px-3 py-1 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-50 dark:hover:bg-secondary-800 transition-colors">Sign Up</button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-primary-50 dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700 transition-colors duration-200">
            <nav className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
              <a href="#demo" className="block text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Demo</a>

              <div className="flex items-center justify-between pt-2">
                <span className="text-secondary-600 dark:text-secondary-300">Theme:</span>
                <ThemeToggle />
              </div>

              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Hi, <strong className="text-primary-600 dark:text-primary-400">{user.firstName}</strong></div>
                  <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }} className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowLogin(true)} className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">Login</button>
                  <button onClick={() => setShowSignup(true)} className="px-3 py-1 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-50 dark:hover:bg-secondary-800 transition-colors">Sign Up</button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* If not authenticated, show Get Started landing */}
      {!user ? (
        <GetStarted onOpenLogin={() => setShowLogin(true)} onOpenSignup={() => setShowSignup(true)} />
      ) : (
        <> 
          {/* Hero Section */}
          <section className="relative py-12 lg:py-20 overflow-hidden bg-accent-white dark:bg-secondary-900 transition-colors duration-200">
            <div className="absolute inset-0 bg-primary-600/5 dark:bg-primary-600/10 hidden dark:block" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900 border border-primary-300 dark:border-primary-700 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 transition-colors duration-200">
                <Zap className="w-4 h-4" />
                AI-Powered Security Analysis
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 dark:text-primary-50 mb-6 leading-tight transition-colors duration-200">
                Detect Security Vulnerabilities
                <br />
                <span className="text-primary-600 dark:text-primary-400">Before They Become Threats</span>
              </h1>
              
              <p className="text-secondary-600 dark:text-secondary-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 transition-colors duration-200">
                CODATS scans your source code for security vulnerabilities using advanced 
                rule-based analysis and AI-powered fix recommendations.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <span className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-full text-secondary-700 dark:text-secondary-300 text-sm transition-colors duration-200">
                  <Lock className="w-4 h-4 text-primary-600" />
                  SQL Injection
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-full text-secondary-700 dark:text-secondary-300 text-sm transition-colors duration-200">
                  <Code2 className="w-4 h-4 text-primary-600" />
                  XSS Detection
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-full text-secondary-700 dark:text-secondary-300 text-sm transition-colors duration-200">
                  <Eye className="w-4 h-4 text-primary-600" />
                  Hardcoded Secrets
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-full text-secondary-700 dark:text-secondary-300 text-sm transition-colors duration-200">
                  <Shield className="w-4 h-4 text-primary-600" />
                  Command Injection
                </span>
              </div>
            </div>
          </section>
        </>
      )}


      {/* Main Content */}
      <main id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 shadow-2xl text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
                <Shield className="absolute inset-0 m-auto w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Scanning Code...</h3>
              <p className="text-dark-400">Analyzing for security vulnerabilities</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Editor */}
          <div className="space-y-6">
            <div className="h-[600px]">
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                vulnerabilities={scanResults?.vulnerabilities || []}
                onScan={handleScan}
              />
            </div>
            
            <UploadBox 
              onFileUpload={handleFileUpload}
              isLoading={isScanning}
            />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <ResultPanel
              results={scanResults}
              onSelectVulnerability={handleSelectVulnerability}
              selectedVulnerability={selectedVulnerability}
            />
            
            <FixPanel
              vulnerability={selectedVulnerability}
              aiAnalysis={scanResults?.aiAnalysis}
              onApplyFix={handleApplyFix}
              onClose={handleCloseFix}
              isLoadingFix={isLoadingFix}
            />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-800/50 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Security Features</h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Comprehensive vulnerability detection for multiple programming languages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-red-500/20 rounded-xl w-fit mb-4">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">SQL Injection Detection</h3>
              <p className="text-dark-400 text-sm">
                Identifies SQL injection vulnerabilities from string concatenation and template literals in database queries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-orange-500/20 rounded-xl w-fit mb-4">
                <Code2 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">XSS Prevention</h3>
              <p className="text-dark-400 text-sm">
                Detects cross-site scripting vulnerabilities from innerHTML, document.write, and unsafe DOM manipulation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-yellow-500/20 rounded-xl w-fit mb-4">
                <Eye className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secret Detection</h3>
              <p className="text-dark-400 text-sm">
                Finds hardcoded passwords, API keys, tokens, and connection strings that should be in environment variables.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Command Injection</h3>
              <p className="text-dark-400 text-sm">
                Identifies dangerous system command execution patterns that could allow arbitrary command execution.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-primary-500/20 rounded-xl w-fit mb-4">
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Fixes</h3>
              <p className="text-dark-400 text-sm">
                Get intelligent fix recommendations powered by Gemini/Groq AI with confidence scores and explanations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-primary-500/20 rounded-xl w-fit mb-4">
                <Code2 className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Language Support</h3>
              <p className="text-dark-400 text-sm">
                Supports JavaScript, TypeScript, Python, Java, PHP, Go, Ruby, and more programming languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-dark-300 font-medium">CODATS</span>
            </div>
            
            <p className="text-dark-500 text-sm">
              © 2026 CODATS. Code Analysis & Threat Scanning System.
            </p>

            <div className="flex items-center gap-4">
              <span className="text-dark-500 text-sm">Version 1.0</span>
            </div>
          </div>
        </div>
      </footer>
      {/* Auth Modals */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onAuthSuccess={(u) => setUser(u)}
        />
      )}
      {showSignup && (
        <Signup 
          onClose={() => setShowSignup(false)} 
          onAuthSuccess={(u) => setUser(u)}
          onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
        />
      )}
    </div>
  );
}

export default App;
