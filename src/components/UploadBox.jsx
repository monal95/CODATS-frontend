import { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';

const UploadBox = ({ onFileUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.php', '.go', '.rb', '.c', '.cpp', '.cs'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      return `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return 'File too large. Maximum size is 5MB.';
    }
    
    return null;
  };

  const handleFile = useCallback((file) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-accent-white dark:bg-secondary-800 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 p-4 shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 transition-colors duration-200">Upload File</h3>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${dragActive 
            ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/30' 
            : 'border-secondary-300 dark:border-secondary-700 hover:border-primary-400 dark:hover:border-primary-600 bg-secondary-50 dark:bg-secondary-900/50 dark:hover:bg-secondary-900/70'}
          }
        `}
      >
        <input
          type="file"
          accept={allowedExtensions.join(',')}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`
            p-3 rounded-full transition-colors
            ${dragActive ? 'bg-primary-200 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300'}
          `}>
            <Upload className="w-6 h-6" />
          </div>
          
          <div>
            <p className="text-secondary-900 dark:text-secondary-100 font-medium transition-colors duration-200">
              {dragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-secondary-500 dark:text-secondary-400 text-sm mt-1 transition-colors duration-200">
              Supported: {allowedExtensions.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-primary-100 dark:bg-primary-900 border border-primary-300 dark:border-primary-700 rounded-lg transition-colors duration-200">
          <AlertCircle className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <p className="text-primary-700 dark:text-primary-300 text-sm transition-colors duration-200">{error}</p>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && !error && (
        <div className="mt-4 p-3 bg-secondary-100 dark:bg-secondary-700 rounded-lg border border-secondary-300 dark:border-secondary-600 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-200 dark:bg-primary-900 rounded-lg transition-colors duration-200">
                <File className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-secondary-900 dark:text-secondary-100 font-medium text-sm truncate max-w-[200px] transition-colors duration-200">
                  {selectedFile.name}
                </p>
                <p className="text-secondary-500 dark:text-secondary-400 text-xs transition-colors duration-200">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <button
              onClick={clearSelection}
              className="p-1.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Scan File
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
