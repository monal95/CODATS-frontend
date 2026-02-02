import { useState } from 'react';
import { Sparkles, Check, Copy, RefreshCw, AlertCircle, X, Code, Lightbulb } from 'lucide-react';

const FixPanel = ({ 
  vulnerability, 
  aiAnalysis, 
  onApplyFix, 
  onClose,
  isLoadingFix 
}) => {
  const [copied, setCopied] = useState(false);

  if (!vulnerability) {
    return (
      <div className="bg-accent-white dark:bg-secondary-800 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 p-6 shadow-sm transition-colors duration-200">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-secondary-100 dark:bg-secondary-700 rounded-full mb-4 transition-colors duration-200">
            <Sparkles className="w-8 h-8 text-secondary-500 dark:text-secondary-300" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2 transition-colors duration-200">
            AI Fix Assistant
          </h3>
          <p className="text-secondary-500 dark:text-secondary-400 text-sm max-w-xs transition-colors duration-200">
            Select a vulnerability from the results panel to get AI-powered fix recommendations.
          </p>
        </div>
      </div>
    );
  }

  // Find the AI analysis for this vulnerability
  const analysis = aiAnalysis?.find(a => a.vulnerabilityId === vulnerability.id) || {
    explanation: vulnerability.description || 'No detailed explanation available.',
    fix: vulnerability.fix || 'Please review the vulnerable code and apply security best practices.',
    confidence: 0.7
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.fix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900';
    if (confidence >= 0.6) return 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900';
    return 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-accent-white dark:bg-secondary-800 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 overflow-hidden shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-primary-50 dark:bg-secondary-900 border-b-2 border-secondary-200 dark:border-secondary-700 flex items-center justify-between transition-colors duration-200">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 flex items-center gap-2 transition-colors duration-200">
          <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          AI Fix Assistant
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-lg transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Vulnerability Info */}
        <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4 border-2 border-secondary-200 dark:border-secondary-700 transition-colors duration-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border
                ${vulnerability.severity === 'Critical' ? 'text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700' :
                  vulnerability.severity === 'High' ? 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700' :
                  vulnerability.severity === 'Medium' ? 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700' :
                  'text-secondary-600 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 border-secondary-300 dark:border-secondary-700'}
              `}>
                <AlertCircle className="w-3 h-3" />
                {vulnerability.severity}
              </span>
              <h4 className="text-secondary-900 dark:text-secondary-100 font-medium mt-2 transition-colors duration-200">{vulnerability.type}</h4>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm mt-1 transition-colors duration-200">Line {vulnerability.line}</p>
            </div>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(analysis.confidence)} transition-colors duration-200`}>
              {getConfidenceLabel(analysis.confidence)} ({Math.round(analysis.confidence * 100)}%)
            </span>
          </div>

          {/* Vulnerable Code */}
          <div className="mt-4">
            <span className="text-xs text-secondary-600 dark:text-secondary-400 uppercase tracking-wider flex items-center gap-1 font-semibold transition-colors duration-200">
              <Code className="w-3 h-3" />
              Vulnerable Code
            </span>
            <pre className="mt-2 p-3 bg-primary-100 dark:bg-primary-900 border-2 border-primary-300 dark:border-primary-700 rounded-lg text-sm text-primary-700 dark:text-primary-300 overflow-x-auto transition-colors duration-200">
              <code>{vulnerability.snippet}</code>
            </pre>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4 border-2 border-secondary-200 dark:border-secondary-700 transition-colors duration-200">
          <h4 className="text-secondary-900 dark:text-secondary-100 font-medium flex items-center gap-2 mb-3 transition-colors duration-200">
            <Lightbulb className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            Why This Is Dangerous
          </h4>
          <p className="text-secondary-700 dark:text-secondary-300 text-sm leading-relaxed transition-colors duration-200">
            {analysis.explanation}
          </p>
        </div>

        {/* Secure Fix */}
        <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4 border-2 border-secondary-200 dark:border-secondary-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-secondary-900 dark:text-secondary-100 font-medium flex items-center gap-2 transition-colors duration-200">
              <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Secure Fix
            </h4>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded transition-colors duration-200"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  <span className="text-primary-600 dark:text-primary-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          
          <pre className="p-3 bg-primary-100 dark:bg-primary-900 border-2 border-primary-300 dark:border-primary-700 rounded-lg text-sm text-primary-700 dark:text-primary-300 overflow-x-auto whitespace-pre-wrap transition-colors duration-200">
            <code>{analysis.fix}</code>
          </pre>
        </div>

        {/* Apply Fix Button */}
        <button
          onClick={() => onApplyFix(vulnerability, analysis.fix)}
          disabled={isLoadingFix}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md"
        >
          {isLoadingFix ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Applying Fix...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Apply Secure Fix
            </>
          )}
        </button>

        <p className="text-center text-secondary-600 dark:text-secondary-400 text-xs transition-colors duration-200">
          Review the fix before applying. AI-generated fixes should be tested.
        </p>
      </div>
    </div>
  );
};

export default FixPanel;
