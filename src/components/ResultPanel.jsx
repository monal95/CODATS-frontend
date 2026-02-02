import { AlertTriangle, AlertCircle, Info, Shield, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { useState } from 'react';

const ResultPanel = ({ results, onSelectVulnerability, selectedVulnerability }) => {
  const [expandedItems, setExpandedItems] = useState({});

  if (!results) {
    return (
      <div className="bg-accent-white dark:bg-secondary-800 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 p-6 shadow-sm transition-colors duration-200">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-secondary-100 dark:bg-secondary-700 rounded-full mb-4 transition-colors duration-200">
            <Shield className="w-8 h-8 text-secondary-500 dark:text-secondary-300" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2 transition-colors duration-200">
            No Scan Results Yet
          </h3>
          <p className="text-secondary-500 dark:text-secondary-400 text-sm max-w-xs transition-colors duration-200">
            Paste code into the editor or upload a file, then click "Scan for Vulnerabilities" to analyze.
          </p>
        </div>
      </div>
    );
  }

  const { vulnerabilities, riskScore, summary } = results;

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'High':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700';
      case 'High':
        return 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700';
      case 'Medium':
        return 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700';
      default:
        return 'text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-900 border-secondary-300 dark:border-secondary-700';
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-primary-700 dark:text-primary-400';
    if (score >= 60) return 'text-primary-600 dark:text-primary-500';
    if (score >= 40) return 'text-primary-500 dark:text-primary-400';
    if (score >= 20) return 'text-primary-600 dark:text-primary-400';
    return 'text-primary-700 dark:text-primary-400';
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Secure';
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="bg-accent-white dark:bg-secondary-800 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 overflow-hidden shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-primary-50 dark:bg-secondary-900 border-b-2 border-secondary-200 dark:border-secondary-700 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 flex items-center gap-2 transition-colors duration-200">
          <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          Scan Results
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Risk Score Card */}
        <div className="bg-primary-50 dark:bg-secondary-700 rounded-xl p-4 border-2 border-primary-200 dark:border-secondary-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-secondary-700 dark:text-secondary-300 text-sm font-medium transition-colors duration-200">Overall Risk Score</span>
            <span className={`text-sm font-medium ${getRiskColor(riskScore)} transition-colors duration-200`}>
              {getRiskLevel(riskScore)}
            </span>
          </div>
          
          {/* Risk Meter */}
          <div className="relative h-4 bg-secondary-200 dark:bg-secondary-600 rounded-full overflow-hidden transition-colors duration-200">
            <div 
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${riskScore}%`,
                background: riskScore >= 80 ? 'linear-gradient(90deg, #dc2626, #ef4444)' :
                           riskScore >= 60 ? 'linear-gradient(90deg, #ea580c, #f97316)' :
                           riskScore >= 40 ? 'linear-gradient(90deg, #d97706, #eab308)' :
                           riskScore >= 20 ? 'linear-gradient(90deg, #65a30d, #84cc16)' :
                           'linear-gradient(90deg, #059669, #10b981)'
              }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-secondary-500 dark:text-secondary-400 transition-colors duration-200">
            <span>0</span>
            <span className={`font-bold text-lg ${getRiskColor(riskScore)} transition-colors duration-200`}>{riskScore}</span>
            <span>100</span>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(summary.bySeverity).map(([severity, count]) => (
              <div 
                key={severity}
                className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-3 text-center border-2 border-secondary-200 dark:border-secondary-700 transition-colors duration-200"
              >
                <div className={`text-2xl font-bold ${
                  severity === 'Critical' ? 'text-primary-700 dark:text-primary-400' :
                  severity === 'High' ? 'text-primary-600 dark:text-primary-400' :
                  severity === 'Medium' ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-600 dark:text-secondary-300'
                } transition-colors duration-200`}>
                  {count}
                </div>
                <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1 transition-colors duration-200">{severity}</div>
              </div>
            ))}
          </div>
        )}

        {/* Vulnerabilities List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-2 transition-colors duration-200">
            <AlertTriangle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            Detected Vulnerabilities ({vulnerabilities.length})
          </h4>

          {vulnerabilities.length === 0 ? (
            <div className="bg-primary-100 dark:bg-primary-900 border-2 border-primary-300 dark:border-primary-700 rounded-lg p-4 text-center transition-colors duration-200">
              <div className="flex items-center justify-center gap-2 text-primary-700 dark:text-primary-300 transition-colors duration-200">
                <Shield className="w-5 h-5" />
                <span className="font-medium">No vulnerabilities detected!</span>
              </div>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm mt-1 transition-colors duration-200">
                Your code appears to be secure.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {vulnerabilities.map((vuln) => (
                <div
                  key={vuln.id}
                  className={`
                    bg-secondary-50 dark:bg-secondary-700 rounded-lg border-2 transition-all cursor-pointer
                    ${selectedVulnerability?.id === vuln.id 
                      ? 'border-primary-500 dark:border-primary-500 ring-1 ring-primary-500/50' 
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }
                  `}
                  onClick={() => onSelectVulnerability(vuln)}
                >
                  {/* Vulnerability Header */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`
                          flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border-2
                          ${getSeverityColor(vuln.severity)}
                        `}>
                          {getSeverityIcon(vuln.severity)}
                          {vuln.severity}
                        </span>
                        <span className="text-secondary-900 dark:text-secondary-100 font-medium text-sm transition-colors duration-200">
                          {vuln.type}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(vuln.id);
                        }}
                        className="p-1 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded transition-colors duration-200"
                      >
                        {expandedItems[vuln.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-secondary-600 dark:text-secondary-400 transition-colors duration-200">
                      <span className="flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        Line {vuln.line}
                      </span>
                      <span className="text-secondary-400 dark:text-secondary-500">•</span>
                      <span>{vuln.description}</span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItems[vuln.id] && (
                    <div className="px-3 pb-3 border-t-2 border-secondary-200 dark:border-secondary-700 pt-3 mt-1 transition-colors duration-200">
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-secondary-600 dark:text-secondary-400 uppercase tracking-wider font-semibold transition-colors duration-200">
                            Vulnerable Code
                          </span>
                          <pre className="mt-1 p-2 bg-secondary-100 dark:bg-secondary-900 rounded text-xs text-primary-700 dark:text-primary-300 overflow-x-auto border border-secondary-300 dark:border-secondary-700 transition-colors duration-200">
                            <code>{vuln.snippet}</code>
                          </pre>
                        </div>
                        
                        <div>
                          <span className="text-xs text-secondary-600 dark:text-secondary-400 uppercase tracking-wider font-semibold transition-colors duration-200">
                            Recommendation
                          </span>
                          <p className="mt-1 text-sm text-secondary-700 dark:text-secondary-300 transition-colors duration-200">
                            {vuln.fix}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;
