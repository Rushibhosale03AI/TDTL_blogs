# Blog Frontend

A React frontend application for the Blog project with authentication.

## Features

- User authentication (Login/Register)
- View blog posts
- Create, edit, and delete blog posts (authenticated users only)
- Responsive design
- Token-based authentication

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

The frontend is configured to connect to the Django backend running on `http://localhost:8000`. 

Make sure your Django backend is running before starting the frontend.

## Running the Application

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Home.js          # Main blog posts view
│   │   ├── Login.js         # Login component
│   │   ├── Register.js      # Registration component
│   │   └── Navbar.js        # Navigation bar
│   ├── context/
│   │   └── AuthContext.js   # Authentication context
│   ├── App.js               # Main app component
│   ├── index.js             # App entry point
│   └── index.css            # Global styles
├── package.json
└── README.md
```

## API Integration

The frontend integrates with the following Django REST API endpoints:

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/user/` - Get current user info
- `GET /api/posts/` - Get all blog posts
- `POST /api/posts/` - Create new post (authenticated)
- `PUT /api/posts/{id}/` - Update post (author only)
- `DELETE /api/posts/{id}/` - Delete post (author only)

## Authentication Flow

1. User registers or logs in
2. JWT token is stored in localStorage
3. Token is included in Authorization header for protected requests
4. User context manages authentication state throughout the app

## Technologies Used

- React 18
- React Router for navigation
- Axios for HTTP requests
- CSS for styling
- JWT token authentication
