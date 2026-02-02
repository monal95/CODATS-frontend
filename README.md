# Frontend - Code Vulnerability Scanner

A modern React-based web interface for the Code Vulnerability Scanner. Built with Vite, Tailwind CSS, and PostCSS, it provides an intuitive user experience for analyzing and fixing code vulnerabilities.

## Features

- **Code Editor**: Built-in code editor for writing and pasting code
- **Real-time Scanning**: Submit code for vulnerability analysis
- **Interactive Results**: View and analyze scanning results with detailed information
- **Fix Panel**: Get AI-powered suggestions for fixing vulnerabilities
- **User Authentication**: Secure login and signup functionality
- **Dark Mode Support**: Theme toggle for light and dark modes
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Technologies

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS
- **API Communication**: Axios/Fetch
- **State Management**: React Hooks

## Project Structure

```
frontend/
├── index.html           # Main HTML entry point
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── package.json         # Dependencies
├── public/              # Static assets
├── src/
│   ├── main.jsx         # React entry point
│   ├── App.jsx          # Root component
│   ├── index.css        # Global styles
│   ├── components/      # Reusable components
│   │   ├── CodeEditor.jsx      # Code input component
│   │   ├── FixPanel.jsx        # Fix suggestions component
│   │   ├── ResultPanel.jsx     # Results display component
│   │   ├── ThemeToggle.jsx     # Dark mode toggle
│   │   ├── UploadBox.jsx       # File upload component
│   │   └── index.js            # Component exports
│   ├── pages/           # Page components
│   │   ├── GetStarted.jsx      # Getting started page
│   │   ├── Login.jsx           # Login page
│   │   └── Signup.jsx          # Signup page
│   └── services/        # API services
│       └── api.js               # Backend API calls
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the development server with hot module reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another available port).

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Component Overview

- **CodeEditor**: Allows users to input code for vulnerability scanning
- **ResultPanel**: Displays scan results with vulnerability details
- **FixPanel**: Shows AI-powered suggestions for fixing vulnerabilities
- **ThemeToggle**: Switch between light and dark themes
- **UploadBox**: Upload code files for scanning
- **Login/Signup**: User authentication pages
- **GetStarted**: Onboarding page for new users

## API Integration

The frontend communicates with the backend API through the `services/api.js` file. Update the API base URL in this file to match your backend server.

## Environment Configuration

Create a `.env` file in the frontend directory if needed for environment-specific configurations:

```
VITE_API_URL=http://localhost:5000/api
```

## Development Tips

- Run `npm run dev` for local development with hot reloading
- Use `npm run build` to test production build locally
- Check `tailwind.config.js` for styling customizations
- Components are located in `src/components/` for easy organization

## License

MIT
