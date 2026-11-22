# SalonBook – Salon Appointment Booking Platform

SalonBook is a modern salon appointment booking platform that allows customers to explore salon services, request appointments, manage bookings, and pay online. Administrators can manage salon services, appointments, customers, and payment transactions through a dedicated dashboard.

The platform provides a responsive and user-friendly experience with role-based access for Customers and Administrators.

## Live Website

**Frontend:** https://salonbook-virid.vercel.app/

**Backend API:** https://salonbook-server-roan.vercel.app/

## Features

### Authentication & Authorization
- User registration and login.
- Email and password authentication.
- Google authentication.
- Role-based access for Customers and Administrators.
- Protected dashboard routes.
- Persistent authentication sessions.
- User profile management.

### Customer Features
- Browse available salon services.
- Search services by name.
- Filter services by category.
- Sort services by price.
- View detailed service information.
- Submit appointment requests.
- View appointment status and history.
- Cancel eligible pending appointments.
- Pay for confirmed appointments through Stripe Checkout.
- View payment information.
- Update personal profile information.

### Admin Features
- Admin dashboard with statistics.
- Create, update, and delete salon services.
- Activate and deactivate services.
- Upload service images.
- View and manage appointment requests.
- Confirm or cancel appointments.
- View and manage registered customers.
- Block and unblock customers.
- View payment transactions.
- Manage administrator profile information.

### Payment System
- Stripe Checkout integration.
- Secure payment processing.
- Payment confirmation through verified Stripe webhooks.
- Payment status synchronization.
- Transaction records.

### Contact & Support
- Responsive Contact Us page.
- Contact form with server-side validation.
- Gmail SMTP email delivery using Nodemailer.
- Spam protection and request rate limiting.
- Frequently asked questions.

### Additional Features
- Responsive design for desktop, tablet, and mobile.
- Custom 404 Not Found page.
- Loading states and error handling.
- Toast notifications.
- Reusable UI components.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework |
| React | UI development |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Better Auth | Authentication |
| React Hook Form | Form management |
| Zod | Data validation |
| Nodemailer | Email delivery |
| Stripe | Online payments |
| ImgBB | Image hosting |
| Vercel | Frontend deployment |

**Backend technologies:** Node.js, Express.js, MongoDB Native Driver, REST API, Better Auth, JWT, and Stripe.

The backend is maintained in a separate repository.

## Project Structure

```text
salonbook/
├── public/
├── src/
│   ├── app/
│   │   ├── about/
│   │   ├── api/
│   │   │   └── contact/
│   │   ├── contact/
│   │   ├── dashboard/
│   │   ├── services/
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── contact/
│   │   ├── layout/
│   │   └── ...
│   ├── lib/
│   └── ...
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```

*This is a high-level overview. Refer to the source code for the complete project structure.*

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (LTS recommended)
- npm
- Git

### Installation

Clone the frontend repository:

```bash
git clone https://github.com/mehedi-web-dev/salonbook.git
```

Navigate to the project directory:

```bash
cd salonbook
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root.

Configure the required environment variables:

```env
# Backend API
NEXT_PUBLIC_SERVER_BASE_URL=YOUR_BACKEND_API_URL

# Gmail SMTP Configuration (Server-side only)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=YOUR_GMAIL_ADDRESS
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
CONTACT_RECEIVER_EMAIL=YOUR_CONTACT_EMAIL
```

**Important:**
- Replace placeholder values with your actual configuration.
- Keep SMTP credentials private.
- Never expose SMTP credentials using `NEXT_PUBLIC_` variables.
- Never commit `.env.local` to GitHub.
- Configure production environment variables separately in Vercel.
- Check `.env.example` and the source code for any additional required environment variables.

## Running the Project Locally

Start the development server:

```bash
npm run dev
```

Open:

http://localhost:3000

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run automated tests |

## Backend Repository

SalonBook uses a separate Express.js backend for API operations, authentication integration, database management, appointment handling, and payment processing.

**Backend GitHub Repository:**

https://github.com/mehedi-web-dev/salonbook-server

**Backend Live URL:**

https://salonbook-server-roan.vercel.app/

Refer to the backend repository README for backend installation, database configuration, and environment variables.

## Deployment

The frontend is deployed on Vercel.

To deploy your own instance:

1. Push the frontend repository to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Set the correct backend API URL.
5. Configure the Gmail SMTP variables for Contact Form email delivery.
6. Deploy the application.
7. Verify authentication, protected routes, API connectivity, and payment functionality.

## Security

- Sensitive credentials are stored in environment variables.
- SMTP credentials are restricted to server-side code.
- Protected application features use authentication and authorization.
- Contact submissions are validated on the server.
- Stripe payment status relies on verified webhook events.

## Author

**Mehedi Hasan**

WordPress & Full-Stack Web Developer

## License

This project was developed as part of Assignment 9 – Category 002.
