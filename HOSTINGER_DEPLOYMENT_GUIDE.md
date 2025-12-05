# Hostinger Deployment Guide for Next.js Portfolio

## ✅ Build Status
Your Next.js application has been successfully built! The production-ready files are located in the `.next` folder.

## 📋 Deployment Options for Hostinger

Hostinger offers several hosting options. Here are the recommended approaches:

### Option 1: Hostinger VPS (Recommended for Next.js)

Next.js is a full-stack framework that requires Node.js runtime. If you have a **Hostinger VPS**, follow these steps:

#### Prerequisites:
- Hostinger VPS with SSH access
- Node.js 18+ installed on the VPS
- PM2 or similar process manager (recommended)

#### Deployment Steps:

1. **Prepare Your Files for Upload**
   - Your project is already built (`.next` folder exists)
   - You need to upload these files/folders to your VPS:
     - `.next/` (build output)
     - `public/` (static assets)
     - `node_modules/` (or run `npm install` on server)
     - `package.json`
     - `package-lock.json`
     - `next.config.ts`
     - Any other config files

2. **Connect to Your VPS via SSH**
   ```bash
   ssh root@your-vps-ip
   ```

3. **Install Node.js (if not already installed)**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

5. **Upload Your Project**
   - Use SFTP, SCP, or Git to upload your project
   - Example using SCP from your local machine:
   ```bash
   scp -r c:\Users\Mayank\Downloads\mayankkreative\New\mayankkreative-portfolio root@your-vps-ip:/var/www/portfolio
   ```

6. **On the VPS, Navigate to Your Project**
   ```bash
   cd /var/www/portfolio
   ```

7. **Install Dependencies (if you didn't upload node_modules)**
   ```bash
   npm install --production
   ```

8. **Start the Application with PM2**
   ```bash
   pm2 start npm --name "portfolio" -- start
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx as Reverse Proxy**
   Create a new Nginx configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/portfolio
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Set Up SSL with Let's Encrypt (Optional but Recommended)**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```

---

### Option 2: Hostinger Shared Hosting (Static Export)

If you have **Hostinger Shared Hosting** (not VPS), you need to export your Next.js app as a static site.

#### Important Notes:
- This only works if your app doesn't use server-side features (API routes, server components with dynamic data, etc.)
- Your app appears to use Firebase and may have dynamic features

#### Steps to Create Static Export:

1. **Update `next.config.ts`**
   Add the output configuration:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };

   export default nextConfig;
   ```

2. **Rebuild the Project**
   ```bash
   npm run build
   ```

3. **Upload the `out` Folder**
   - After building with `output: 'export'`, Next.js creates an `out` folder
   - Upload the contents of the `out` folder to your Hostinger public_html directory
   - Use Hostinger's File Manager or FTP client

---

### Option 3: Deploy to Vercel (Easiest - Free Tier Available)

Since this is a Next.js project, the easiest deployment is to Vercel (made by Next.js creators):

1. **Push Your Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and deploy

3. **Connect Custom Domain**
   - In Vercel dashboard, go to your project settings
   - Add your Hostinger domain
   - Update DNS records in Hostinger to point to Vercel

---

## 🔧 Current Build Information

- **Framework**: Next.js 16.0.7
- **Build Status**: ✅ Successful
- **Build Output**: `.next` folder
- **Dependencies**: All production dependencies are listed in `package.json`

## 📝 Important Files for Deployment

```
mayankkreative-portfolio/
├── .next/                  # Build output (required)
├── public/                 # Static assets (required)
├── src/                    # Source code (not needed on server if built)
├── node_modules/           # Dependencies (install on server)
├── package.json            # Required
├── package-lock.json       # Required
├── next.config.ts          # Required
└── tsconfig.json           # Required for TypeScript
```

## 🚀 Quick Deployment Checklist

- [ ] Choose deployment method (VPS, Shared Hosting, or Vercel)
- [ ] Ensure Node.js 18+ is available (for VPS/local server)
- [ ] Upload necessary files
- [ ] Install dependencies (`npm install --production`)
- [ ] Configure environment variables if needed
- [ ] Start the application
- [ ] Configure domain/DNS
- [ ] Set up SSL certificate
- [ ] Test the deployment

## 🔐 Environment Variables

If your app uses environment variables (like Firebase config), create a `.env.local` file on the server with your production values.

## 📞 Need Help?

If you need specific help with any of these deployment methods, let me know which Hostinger plan you have:
- **VPS Hosting** → Use Option 1
- **Shared Hosting** → Use Option 2 (static export)
- **Want easiest solution** → Use Option 3 (Vercel)

---

**Build completed on**: 2025-12-06
**Next.js Version**: 16.0.7
