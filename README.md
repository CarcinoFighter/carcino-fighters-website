![Hero](./readme-hero.svg)
<div align="center">

### Breaking Down Cancer for Anyone and Everyone

[![Live Site](https://img.shields.io/badge/live-thecarcinofoundation.org-blue?style=for-the-badge)](https://thecarcinofoundation.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-93.8%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Educating the next generation about cancer through accessible, student-led content.**

[Visit Website](https://thecarcinofoundation.org) • [Report Bug](https://github.com/CarcinoFighter/carcino-fighters-website/issues) • [Request Feature](https://github.com/CarcinoFighter/carcino-fighters-website/issues)

</div>

---

## Mission Statement

At the Carcino Foundation, we believe everyone should be able to learn about one of the leading causes of human mortality, but in a way everyone can understand. We're a student-led initiative dedicated to breaking down complex medical information into accessible, accurate content that empowers our generation to understand and combat cancer.

---

## Technical Architecture

### Core Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **[Next.js](https://nextjs.org/)** | Latest | React framework with App Router for optimal performance |
| **[TypeScript](https://www.typescriptlang.org/)** | 93.8% | Type-safe development and enhanced DX |
| **[React](https://react.dev/)** | 18+ | Component-based UI architecture |
| **[Tailwind CSS](https://tailwindcss.com/)** | 3.0+ | Utility-first styling framework |
| **[shadcn/ui](https://ui.shadcn.com/)** | Latest | Accessible component primitives |

### Development Tools

```json
{
  "linting": "ESLint",
  "formatting": "Prettier",
  "package_manager": "npm",
  "ide_config": "VSCode settings included"
}
```

### Project Structure

```
carcino-fighters-website/
├── .github/
│   └── workflows/          # CI/CD automation
├── .idea/                  # JetBrains IDE configuration
├── .vscode/                # VSCode settings
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── about/              # About page
│   ├── article/            # Articles listing
│   ├── leadership/         # Team information
│   └── internship/         # Internship opportunities
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Custom components
├── lib/                    # Utility functions
├── public/                 # Static assets
│   ├── logo-w.svg          # White logo
│   ├── logo-outline.png    # Outlined logo
│   ├── ribbon_phone.png    # Awareness ribbon
│   └── landing/            # Landing page assets
├── .env.example            # Environment variables template
├── components.json         # shadcn/ui configuration
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.cjs     # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

---

## Key Features

### 1. Article Management System

**Dynamic Content Loading**
- Server-side rendering for optimal SEO
- Real-time article fetching with loading states
- Categorized content for easy navigation

**Content Features**
- Verified research from medical pioneers.
- Up-to-date articles with current facts and studies.
- Simplified language for universal accessibility.
- Student-written and peer-reviewed content.

### 2. Responsive Design

**Mobile-First Approach**
- Fully responsive across all devices
- Touch-friendly navigation
- Optimized images with Next.js Image component
- Adaptive layouts using Tailwind breakpoints

### 3. Navigation Structure

```typescript
// Primary Routes
/                  → Homepage with hero and featured articles
/about            → Foundation mission and values
/article          → Complete articles archive
/leadership       → Meet the team
/internship       → Opportunities to contribute
  ├── /writer     → Writing team positions
  └── /tech       → Dev/Design positions
```

### 4. Performance Optimizations

**Next.js Features**
- App Router for improved routing performance
- Automatic code splitting
- Server components for reduced client-side JavaScript
- Image optimization with next/image
- Font optimization with next/font

**Build Optimizations**
- TypeScript for compile-time error catching
- ESLint for code quality
- Tree shaking for minimal bundle size
- Production-ready static generation

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

Clone the repository:
```bash
git clone https://github.com/CarcinoFighter/carcino-fighters-website.git
cd carcino-fighters-website
```

Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Environment Setup

Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

Configure your environment variables as needed.

### Development Server

Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

Create an optimized production build:
```bash
npm run build
npm start
```

---

## Configuration Files

### TypeScript Configuration

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Tailwind Configuration

```javascript
// tailwind.config.cjs
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // Custom theme extensions
    }
  },
  plugins: []
}
```

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add image domains as needed
  }
}
```

---

## Component Architecture

### UI Components

Built with shadcn/ui for consistency and accessibility:
- Buttons with variants
- Cards for article display
- Navigation components
- Form elements
- Typography system

### Custom Components

```typescript
// Example: Article Card Component
interface ArticleCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
}

export function ArticleCard({
  title,
  excerpt,
  author,
  date,
  slug
}: ArticleCardProps) {
  // Component implementation
}
```

---

## Deployment

### Recommended Platform

The site is optimized for deployment on:
- **Vercel** (recommended for Next.js)
- Netlify
- AWS Amplify
- Self-hosted with Node.js

### Deployment Steps (Vercel)

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with automatic CI/CD

```bash
# Or deploy manually
npm run build
vercel deploy --prod
```

---

## Code Quality

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

### Code Style

The project follows:
- ESLint recommended rules
- TypeScript strict mode
- Consistent file naming conventions
- Component-based architecture

---

## Contributing

We welcome contributions from developers and designers who share our mission!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow TypeScript best practices
   - Maintain consistent code style
   - Add comments for complex logic
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

**Code Standards**
- Use TypeScript for all new files.
- Follow component composition patterns.
- Implement responsive design for all features.
- Test across multiple devices and browsers.

**Commit Messages**
- Use clear, descriptive commit messages.
- Reference issue numbers when applicable.
- Follow conventional commits format.

**Testing**
- Manually test all changes.
- Verify responsive behavior.
- Check accessibility with screen readers.
- Ensure cross-browser compatibility.

---

## Internship Opportunities

### Writing Team

Help create accessible cancer education content:
- Research and write articles
- Review and edit submissions
- Collaborate with medical advisors
- Ensure accuracy and readability

[Apply for Writing Team](/internship/writer)

### Tech & Design Team

Contribute to the platform development:
- Frontend development (React/Next.js)
- UI/UX design
- Performance optimization
- Accessibility improvements

[Apply for Tech/Design](/internship/tech)

---

## Team

**Founder & Managing Director**
> "The human spirit was built to outlast despair. So, live life to the fullest and don't think about things too much."
> 
> — Rajannya Das

[Meet the Full Team](/leadership)

---

## Repository Statistics

- **Contributors**: 3 developers
- **Commits**: 124+ commits
- **Stars**: 4
- **Forks**: 2
- **Primary Language**: TypeScript (93.8%)
- **CSS**: 5.8%
- **JavaScript**: 0.4%

---

## License

This project is open source and available for educational purposes. Please see the repository for specific license details.

---

## Contact

**The Carcino Foundation**

- **Email**: [inquiries@thecarcinofoundation.org](mailto:inquiries@thecarcinofoundation.org)
- **Website**: [thecarcinofoundation.org](https://thecarcinofoundation.org)
- **GitHub**: [@CarcinoFighter](https://github.com/CarcinoFighter)

---

## Acknowledgments

Built by students, for students, with the goal of making cancer education accessible to everyone. Special thanks to:

- Medical advisors and researchers who verify our content.
- The writing team creating accessible educational material.
- Open source contributors improving the platform.
- The Next.js and React communities for excellent documentation.

---

<div align="center">

**Let's change the world together**

[Home](https://thecarcinofoundation.org) • [About](https://thecarcinofoundation.org/about) • [Articles](https://thecarcinofoundation.org/article) • [Contribute](https://thecarcinofoundation.org/internship)

Made with dedication by The Carcino Foundation Team

</div>
