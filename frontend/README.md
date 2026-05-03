# Dynblath Web PM - React Client

Modern React-based frontend for the Dynblath task management platform.

## Project Structure

```
client-react/
├── public/                 # Static files
├── src/
│   ├── services/          # API service layer
│   │   └── api.js         # API client with Axios-like fetch wrapper
│   ├── context/           # React Context for global state
│   │   └── AuthContext.jsx # Authentication state & helpers
│   ├── pages/             # Page components
│   │   └── auth/
│   │       └── AuthPage.jsx   # Login + Register (tab-based)
│   ├── components/        # Reusable components
│   │   └── ui/
│   │       └── LoadingSpinner.jsx
│   ├── App.jsx            # Router & protected routes
│   ├── main.jsx           # React entry point
│   └── index.css          # Tailwind + global styles
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
└── package.json           # Dependencies & scripts
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Environment

Make sure your backend API is running on `http://localhost:5054`

## Authentication Flow

1. User visits `/` → redirected to login if not authenticated
2. Sign in/up sends credentials to `/auth/signin` or `/auth/signup`
3. JWT token stored in localStorage
4. Protected routes require `isAuthenticated` to be true
5. Expired tokens trigger automatic redirect to login

## API Integration

The `ApiService` class provides methods for all backend endpoints:

```javascript
// Workspaces
ApiService.getWorkspaces()
ApiService.createWorkspace(data)

// Projects
ApiService.getProjects(workspaceId)
ApiService.createProject(workspaceId, data)

// Tasks
ApiService.getTasks(workspaceId, projectId)
ApiService.createTask(workspaceId, projectId, data)
```

## Styling

Uses **Tailwind CSS** for utility-first styling. All CSS classes are available out of the box.

## Next Steps

1. Create dashboard page at `src/pages/Dashboard.jsx`
2. Create project list component at `src/components/ProjectList.jsx`
3. Create task management components
4. Implement protected routes for each section
5. Connect to backend API endpoints

## Tech Stack

- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **PostCSS** - CSS processing
