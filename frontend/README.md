# Civic Event

## About the Project

Web app I created to help people find and attend community events, called Civic Event. This application allows users to make registrations, view events, sign up for activities, get notifications and view promotional videos. Administrators can also control the platform and monitor activities of users.

## Features

The primary features I developed were:

Sign Up and Login: Users can register for an account and log in to use the application.
Users are able to see events that are available and read details about them.
Users are able to register for an event they wish to attend.
Feedback: Users can give feedback about events.
Admin can post announcements (which can be audio).
- Promotional Videos: Users are able to view promotional videos about coming events.
Users can be alerted to key information.
Administrators can do administration for various sections of the application.
Users can access & maintain their personal details with User Profile.

## How to Run Locally

To run the project on your computer follow these steps:

### 1. Set Up the Database

The application data are stored in a PostgreSQL database. I made and hosted my online Postgres DB with Neon.

To set up the database:

Install PostgreSQL locally or create an online PostgreSQL database with Neon.
2. Develop an application's database.
If you are using Neon, open the Neon SQL Editor.
Open the file `backend/migrations/001_create_tables.sql` from the project.
Run the following SQL commands in the SQL Editor to create the tables you need.

### 2. Start the Backend

Open the project in VS Code.
2. Open the terminal.
Go to the folder of the backend (3).
Install the necessary packages:

   ```bash
   npm install
   ```

6. Put up a `.env` file and include your database settings.
7. Run the back-end server:

   ```bash
   npm run dev
   ```

The backend is on at `http://localhost:4000`.

### 3. Start the Frontend

Open the project in VS Code.
3. Change to the `frontend` directory.
3. Find `login.html`.
RIGHT CLICK on the file and choose **Open with Live Server**.

The app needs to start at:

`http://127.0.0.1:5500/frontend/login.html`

Before use the application, be sure the backend is running.

## Environment Variables

The following environment variables are required to be set in the back-end for accessing the database and authentication.

Add the following file: .env (in the 'backend' folder):

```env
DB_USER=your_database_user
DB_PASS=your_database_password
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=your_database_name
JWT_SECRET=your_secret_key
PGSSLMODE=require
```

To be able to connect to an online database like Neon, the option PGSSLMODE=require must be added. In the case of a local PostgreSQL database, you can omit it.

Change the example values to the actual values for your database. Never post your actual JWT secret/password on GitHub.

## Connecting to the Backend

Frontend fetches data from the back end using API calls.

The back end base URL is:

```text
http://localhost:4000
```

This URL is set in `frontend/js/config.js`. The backend server has to be running to allow the frontend to communicate with it.

## User Roles

The application has two main roles:

### Admin

Access to admin dashboard for administrators. They can:

- Create, edit and delete events.
- Create, edit and delete announcements.
- Design, modify and eliminate promotional material.
- View event registrations.
- View user feedback.
- Delete notifications.
Add or remove users.

### Regular User

Regular users can:

To register and log in.
- View available events.
- Register for events.
- Be notified with announcements and notifications.
- Watch promotional videos.
- Submit feedback.
- Manage their profiles.

To obtain an admin account, follow the instructions below:

If a person registers for the system, a "normal" user account is automatically generated.

To give a user administrator access, run the following SQL command in your database:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your_email';
```

Change your_email to the email address of the account that you want to make an administrator.

Once you have made the change to your role, log out and log in again to access the admin dashboard.

## Known Limitations

A few improvements can be made for future versions:

- If a user has cancelled a registration for an event, they may not be able to register for the same event again.
- Application requires an active back end server and database to function.
The frontend is currently local, and is powered by Live Server.

These are places I want to enhance as I continue to work on the project.