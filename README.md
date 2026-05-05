# Web-based Student Information System (WebSSIS)

The final and most complete version of the Student Information System — rebuilt as a full-stack web application with a **Flask + React** architecture, **PostgreSQL** database, and **Supabase** for cloud-based student photo storage.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|------------|
| Language | Python |
| Framework | Flask |
| Database | PostgreSQL |
| File Storage | Supabase |
| Auth | Custom JWT (auth_utils) |
| Dependency Manager | Pipenv |

### Frontend
| Layer | Technology |
|-------|------------|
| Language | JavaScript |
| Framework | React |
| Routing | React Router (ProtectedRoute) |
| HTTP Client | Fetch API / Axios |
| Styling | Bootstrap |
| Supabase Client | `supabaseClient.js` |

---

## Features

- **Student Management** — Full CRUDL with photo upload to Supabase
- **Program Management** — Manage academic programs linked to colleges
- **College Management** — Manage college entities
- **User Authentication** — Login system with protected routes
- **Search** — Search across students, programs, and colleges
- **Sorting** — Sort any table column
- **Pagination** — Navigate large datasets with ease
- **Photo Upload** — Student photos stored and served via Supabase Storage
- **Pre-populated Data** — Database seeded with 300+ students and 30+ programs

---

## Database Schema

### Student Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR | Format: `YYYY-NNNN` (e.g., 2023-0001) |
| `firstname` | VARCHAR | Student's first name |
| `lastname` | VARCHAR | Student's last name |
| `course` | VARCHAR | FK → Program `code` |
| `year` | INT | Year level |
| `gender` | VARCHAR | Gender |
| `photo` | VARCHAR | Supabase storage URL (optional) |

### Program Table
| Column | Type | Description |
|--------|------|-------------|
| `code` | VARCHAR | Program code (e.g., BSCS) |
| `name` | VARCHAR | Full name (e.g., Bachelor of Science in Computer Science) |
| `college` | VARCHAR | FK → College `code` |

### College Table
| Column | Type | Description |
|--------|------|-------------|
| `code` | VARCHAR | College code (e.g., CCS) |
| `name` | VARCHAR | Full name (e.g., College of Computer Studies) |

---

## Getting Started

### Prerequisites
- Python 3.x + Pipenv
- PostgreSQL
- Node.js + npm
- Supabase account

### Backend Setup

```bash
cd backend

# Install Python dependencies
pipenv install
pipenv shell

# Configure environment variables
cp .env.example .env
# Fill in your DATABASE_URL, SUPABASE_URL, SUPABASE_KEY in .env

# Initialize the database
python init_db.py

# Run the Flask server
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Add your REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to .env

# Start the React dev server
npm start
```

Frontend runs on `http://localhost:3000`

---

## Project Structure

```
webssis/
├── backend/
│   ├── routes/
│   │   ├── college_routes.py      # College CRUDL API endpoints
│   │   ├── program_routes.py      # Program CRUDL API endpoints
│   │   ├── student_routes.py      # Student CRUDL API endpoints
│   │   └── user_routes.py         # Auth/user API endpoints
│   ├── services/
│   │   ├── college_service.py     # College business logic
│   │   ├── program_service.py     # Program business logic
│   │   ├── student_service.py     # Student business logic
│   │   └── user_service.py        # User/auth business logic
│   ├── app.py                     # Flask app entry point
│   ├── auth_utils.py              # JWT authentication utilities
│   ├── db_connection.py           # PostgreSQL connection setup
│   ├── init_db.py                 # Database initialization & seeding
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Environment variables (not committed)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Modal.jsx           # Reusable modal component
    │   │   ├── ProtectedRoute.js   # Auth-protected route wrapper
    │   │   ├── sidebar.js          # Navigation sidebar
    │   │   └── Toast.jsx           # Notification toasts
    │   ├── pages/
    │   │   ├── login.js            # Login page
    │   │   ├── manage_student.js   # Student list & management
    │   │   ├── add_student.js      # Add student form
    │   │   ├── update_student.js   # Edit student form
    │   │   ├── manage_program.js   # Program list & management
    │   │   ├── add_program.js      # Add program form
    │   │   ├── update_program.js   # Edit program form
    │   │   ├── manage_college.js   # College list & management
    │   │   ├── add_college.js      # Add college form
    │   │   └── update_college.js   # Edit college form
    │   ├── styles/                 # CSS stylesheets
    │   ├── supabaseClient.js       # Supabase client configuration
    │   ├── App.js                  # Root React component & routing
    │   └── index.js                # React entry point
    ├── package.json
    └── .env                        # Frontend environment variables
```

---

## Environment Variables

### Backend `.env`
```env
DATABASE_URL=postgresql://username:password@localhost/ssis_db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SECRET_KEY=your-flask-secret-key
```

### Frontend `.env`
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
REACT_APP_API_URL=http://localhost:5000
```

---

## Notes

- Student photos are stored in **Supabase Storage** — not locally
- Database is pre-seeded with at least **300 students** and **30 programs**
- This is the **final version** of the SSIS series
- See [SSIS_V1](https://github.com/aeron-j/SSIS_V1) — CSV-based desktop version
- See [SSIS_V2](https://github.com/aeron-j/SSIS_V2) — MySQL-based desktop version

---

## Author

**Aeron Dale** — [@aeron-j](https://github.com/aeron-j)
