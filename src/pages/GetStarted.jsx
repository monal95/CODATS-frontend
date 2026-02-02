import React, { useState } from 'react';

export default function GetStarted({ onOpenLogin, onOpenSignup }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-white dark:bg-secondary-900 transition-colors duration-200">
      <div className="max-w-3xl text-center p-10 rounded-2xl bg-primary-50 dark:bg-secondary-800 border-2 border-primary-200 dark:border-primary-700 shadow-lg transition-colors duration-200">
        <h2 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4 transition-colors duration-200">CODATS — AI-Powered Code Security</h2>
        <p className="text-secondary-600 dark:text-secondary-300 mb-6 transition-colors duration-200">
          CODATS helps you detect security vulnerabilities across your codebase using a combination of
          rule-based analysis and AI-generated recommendations. Scan JavaScript, TypeScript, Python, Java
          and more — get prioritized findings and suggested fixes so you can remediate issues more faster.
        </p>

        <ul className="text-left text-secondary-600 dark:text-secondary-300 mb-8 space-y-2 transition-colors duration-200">
          <li>• Fast, rule-based static scanning for common vulnerabilities (SQLi, XSS, command injection)</li>
          <li>• AI-powered fix recommendations to help you patch vulnerabilities</li>
          <li>• Upload single files or scan code snippets directly in the editor</li>
          <li>• Secure user accounts to save your activity and personalize settings</li>
        </ul>

        {!showOptions ? (
          <button onClick={() => setShowOptions(true)} className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-lg font-semibold transition-colors duration-200 shadow-md">Get Started</button>
        ) : (
          <div className="flex justify-center gap-4">
            <button onClick={onOpenLogin} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-md">Login</button>
            <button onClick={onOpenSignup} className="px-6 py-3 bg-accent-white dark:bg-secondary-700 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-secondary-600 font-semibold transition-colors duration-200">Sign Up</button>
          </div>
        )}
      </div>
    </div>
  );
}
