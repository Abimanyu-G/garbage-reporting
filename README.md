# Garbage Reporting System - Frontend

A modern, responsive web application for reporting and managing garbage complaints in your city.

## Features

### User Features
- User registration and authentication
- Submit garbage complaints with description, location, and image upload
- View personal complaints with real-time status tracking
- Status indicators:
  - **Pending** (Yellow) - Complaint submitted, awaiting review
  - **In Process** (Blue) - Authorities working on the issue
  - **Cleaned** (Green) - Issue resolved

### Admin Features
- View all complaints from all users
- Filter complaints by status
- Update complaint status via dropdown
- Dashboard with statistics

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx           # Navigation bar
│   ├── ComplaintCard.jsx    # Complaint display card
│   ├── ProtectedRoute.jsx   # Route protection HOC
│   └── Loading.jsx          # Loading indicator
├── pages/
│   ├── Home.jsx             # Landing page
│   ├── Register.jsx         # User registration
│   ├── Login.jsx            # User login
│   ├── UserDashboard.jsx    # User dashboard
│   └── AdminDashboard.jsx   # Admin dashboard
├── services/
│   └── api.js               # Axios configuration & API calls
├── utils/
│   └── auth.js              # Authentication utilities
├── App.tsx                  # Main app component with routing
├── main.tsx                 # App entry point
└── index.css                # Global styles
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Configure your backend API URL in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## API Integration

The app expects a backend API with the following endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Complaints
- `POST /api/complaints` - Create new complaint (user)
- `GET /api/complaints/user` - Get user's complaints (user)
- `GET /api/complaints` - Get all complaints (admin)
- `PATCH /api/complaints/:id/status` - Update complaint status (admin)

### Expected Response Format

**Register/Login Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user" // or "admin"
  }
}
```

**Complaints Response:**
```json
{
  "complaints": [
    {
      "id": "complaint-id",
      "description": "Garbage pile near park",
      "location": "Central Park, Street 5",
      "status": "pending",
      "image": "image-url",
      "userName": "Reporter Name",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Authentication Flow

1. User registers or logs in
2. JWT token and user data stored in localStorage
3. Token automatically attached to all API requests via Axios interceptor
4. Protected routes check authentication status
5. Admin routes verify user role

## Features in Detail

### Protected Routes
- `/dashboard` - Requires authentication
- `/admin` - Requires authentication + admin role

### Status Colors
The app uses color coding for complaint status:
- Pending: Yellow background
- In Process: Blue background
- Cleaned: Green background

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly UI elements

### Loading States
- Loading indicators during API calls
- Disabled buttons during form submission
- Skeleton screens for data loading

### Error Handling
- Form validation
- API error messages
- User-friendly error displays

## Color Scheme

The app uses a shuttle green color palette (emerald tones):
- Primary: `emerald-600` (#059669)
- Primary Dark: `emerald-700` (#047857)
- Primary Light: `emerald-50` (#ECFDF5)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Real-time notifications
- Image upload to cloud storage
- Geolocation integration
- Email notifications
- Analytics dashboard
- Export complaints to CSV/PDF

## License

MIT
