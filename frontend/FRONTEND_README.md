# Frontend Documentation

This document explains the role and function of every significant file and directory within the React frontend of the Chat Platform.

## Directory Structure

### Configuration & Root Files
- **`package.json`**: Defines the project's npm dependencies (like React, React Router, Axios) and scripts (like `npm run dev`, `npm run build`).
- **`tsconfig.json` & `tsconfig.node.json`**: Configuration files for the TypeScript compiler, ensuring type safety across the frontend.
- **`vite.config.ts`**: Configuration for Vite, the fast build tool and development server used for this project.
- **`index.html`**: The single HTML file that serves as the entry point for the React application. It contains the `<div id="root">` where the React app is injected.

### `src/` Directory (Source Code)

#### Entry Points
- **`main.tsx`**: The main JavaScript entry point. It imports the root `App` component and renders it into the DOM's `#root` element.
- **`App.tsx`**: The core application component. It handles the central routing logic (using `react-router-dom`), manages global authentication state, and configures global settings like Axios CSRF headers and base URLs.

#### Styling
- **`index.css`**: Global CSS reset and base styles applied to the entire application.
- **`App.css`**: Global layout styling specifically for the main App container.

#### `src/pages/` (Views & Routes)
- **`Login.tsx`**: The login page component. It renders the login form, handles user input, and sends a POST request to authenticate the user and retrieve a session.
- **`Signup.tsx`**: The registration page component. It renders the signup form, handles new user creation, and automatically logs the user in upon success.
- **`Auth.css`**: The stylesheet governing the aesthetic and layout of both the Login and Signup pages (cards, inputs, buttons).
- **`Chat.tsx`**: The core real-time chat interface. It fetches active conversations, displays messages for the selected conversation, handles sending new messages, and fetches the logged-in user's details.
- **`Chat.css`**: The stylesheet for the chat interface, handling the sidebar layout, message bubbles, scrollable chat windows, and responsive design.

### `public/` Directory
- Contains static assets that are served directly without being processed by Vite (e.g., favicons).
