# BBPC (Bad Boys Podcast)

A modern web application built with the T3 Stack, combining powerful technologies for a robust full-stack experience.

## ��� Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with TypeScript
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) for secure user authentication
- **Database**: [Prisma](https://prisma.io) as the ORM
- **API**: [tRPC](https://trpc.io) for end-to-end typesafe APIs
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with additional utilities:
  - Headless UI components
  - Radix UI primitives
  - Class Variance Authority
  - Tailwind Merge
  - Tailwind Animate
- **UI Components**:
  - Pure React Carousel
  - React Card Flip
  - React Icons
  - React Responsive
- **File Uploads**: Uploadthing integration
- **Form Validation**: Zod
- **Security**: Google ReCAPTCHA integration

## 🛠️ Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables
4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run postinstall` - Generate Prisma client

## 🔒 Environment Variables

Required environment variables can be found in `.env.example`. Make sure to set these up before running the application.

## 📱 Features

- Full-stack TypeScript integration
- End-to-end type safety with tRPC
- Secure authentication with NextAuth.js
- Database management with Prisma
- Responsive design with Tailwind CSS
- Modern UI components and animations
- File upload capabilities
- Form validation and security measures

## 📝 License

[Your chosen license]

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
