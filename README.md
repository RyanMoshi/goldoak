# Goldoak Insurance Agency Website

A modern, high-performing, mobile-friendly website for **GOLDOAK INSURANCE AGENCY LIMITED**, built with **Next.js 14** (App Router), **Tailwind CSS**, and **TypeScript**.

## 🎯 Features

- **Modern Design**: Clean, professional, and mobile-responsive
- **Multi-step Quote Form**: Comprehensive insurance quote request form with SMTP integration
- **Insurance Products**: Detailed product listings with categories and features
- **Partner Showcase**: Display of trusted insurance partners
- **Contact System**: Multiple contact methods with form submission
- **SEO Optimized**: Meta tags, sitemap, and performance optimization
- **Brand Colors**: Primary (#004B87) and Secondary (#C19A6B) with Google Fonts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd goldoak-insurance
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your SMTP settings in `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TO_EMAIL=info@goldoak.co.ke
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── contact/       # Contact form API
│   │   └── send-form/     # Quote form API
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── partners/          # Partners page
│   ├── products/          # Products page
│   ├── quote/             # Quote form page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── robots.ts          # Robots.txt
│   └── sitemap.ts         # Sitemap
├── components/            # React components
│   ├── Navigation.tsx    # Main navigation
│   ├── Footer.tsx        # Site footer
│   ├── Hero.tsx          # Home page hero
│   ├── Services.tsx      # Services section
│   ├── Partners.tsx      # Partners section
│   ├── Testimonials.tsx  # Testimonials
│   ├── QuoteForm.tsx     # Multi-step quote form
│   └── ...              # Other components
├── Assets/               # Brand assets
└── public/              # Static files
```

## 🎨 Design System

### Colors
- **Primary**: #004B87 (Deep Navy)
- **Secondary**: #C19A6B (Gold)
- **Background**: White with gray accents
- **Text**: Dark gray (#333) with proper contrast

### Typography
- **Font Family**: Inter, Poppins, Nunito (Google Fonts)
- **Headings**: Bold, clear hierarchy
- **Body**: Readable, accessible font sizes

### Components
- **Buttons**: Primary, secondary, and outline variants
- **Forms**: Accessible, validated inputs
- **Cards**: Consistent shadow and spacing
- **Navigation**: Responsive, mobile-friendly

## 📧 Email Integration

The website includes SMTP email integration for:
- Quote form submissions
- Contact form submissions
- Automated email confirmations

### SMTP Configuration

Configure your SMTP settings in `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TO_EMAIL=info@goldoak.co.ke
```

### Gmail Setup

For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

## 🔧 Customization

### Brand Colors
Update colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#004B87',
      secondary: '#C19A6B',
    }
  }
}
```

### Content Updates
- Update company information in components
- Modify insurance products in `/app/products/`
- Update partner information in `/app/partners/`
- Customize contact information throughout the site

## 📱 Mobile Responsiveness

The website is fully responsive with:
- Mobile-first design approach
- Touch-friendly navigation
- Optimized form inputs
- Responsive images and layouts

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The website can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted servers

## 📊 Performance

- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Optimized for production

## 🔒 Security

- **Input Validation**: Client and server-side validation
- **File Upload Security**: Type and size restrictions
- **Environment Variables**: Secure credential management
- **HTTPS**: Required for production

## 📈 SEO Features

- **Meta Tags**: Optimized for search engines
- **Structured Data**: Rich snippets support
- **Sitemap**: Automatic XML sitemap generation
- **Robots.txt**: Search engine crawling instructions
- **Open Graph**: Social media sharing optimization

## 🛠️ Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

### Testing
- Form validation testing
- Email integration testing
- Responsive design testing
- Cross-browser compatibility

## 📞 Support

For technical support or customization requests:
- Email: info@goldoak.co.ke
- Phone: +254 729 911 311
- WhatsApp: +254 729 911 311

## 📄 License

This project is proprietary software for Goldoak Insurance Agency Limited.

---

**Built with ❤️ for Goldoak Insurance Agency Limited**