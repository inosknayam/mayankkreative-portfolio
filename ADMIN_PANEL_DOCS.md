# Admin Panel Documentation

## Overview
The Admin Panel is a secure dashboard for Mayank to view and manage contact form submissions from the portfolio website.

## Access Information

### URL
```
http://localhost:3000/admin
```
(For production: `https://yourdomain.com/admin`)

### Login Credentials
**Password:** `Mayank@Admin2025`

> ⚠️ **Security Note:** This password is stored in the code. For production, consider using environment variables or Firebase Authentication for better security.

## Features

### 1. **Secure Login**
- Password-protected access
- Session-based authentication (stays logged in during browser session)
- Clean, modern login interface

### 2. **Dashboard Statistics**
The dashboard displays three key metrics:
- **Total Inquiries:** All-time contact form submissions
- **Today:** Inquiries received today
- **This Week:** Inquiries from the last 7 days

### 3. **Inquiries Table**
View all contact submissions in a sortable table with:
- Name (with avatar initial)
- Email address
- Message preview (truncated)
- Submission date and time
- Delete action

### 4. **Detailed View**
Click on any inquiry to see full details:
- Complete name
- Email address
- Full message
- Exact submission timestamp
- Quick "Reply via Email" button (opens default email client)
- Delete option

### 5. **Management Actions**
- **Refresh:** Reload inquiries from database
- **Delete:** Remove individual inquiries (with confirmation)
- **Logout:** End admin session

## How to Use

### Accessing the Admin Panel
1. Navigate to `/admin` route
2. Enter the password: `Mayank@Admin2025`
3. Click "Login"

### Viewing Inquiries
- All inquiries are displayed in the main table
- Click on any row to see full details
- Use the "Refresh" button to get latest data

### Responding to Inquiries
1. Click on an inquiry to open details
2. Click "Reply via Email" button
3. Your default email client will open with the recipient's email pre-filled

### Deleting Inquiries
1. Click the trash icon in the table, OR
2. Open the inquiry details and click "Delete"
3. Confirm the deletion

### Logging Out
- Click the "Logout" button in the top-right corner
- You'll be redirected to the login screen

## Technical Details

### Database Structure
Contact submissions are stored in Firebase Firestore:
- **Collection:** `contacts`
- **Fields:**
  - `name` (string)
  - `email` (string)
  - `message` (string)
  - `createdAt` (timestamp)

### Authentication
- Uses `sessionStorage` for session management
- Password check is performed client-side
- Session persists until browser is closed

### Styling
- Built with Tailwind CSS
- Glassmorphism design with backdrop blur
- Gradient backgrounds (purple to pink theme)
- Fully responsive design

## Security Recommendations

For production deployment, consider:

1. **Environment Variables:**
   ```javascript
   const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
   ```

2. **Firebase Authentication:**
   - Implement proper Firebase Auth
   - Use email/password or Google Sign-In
   - Add admin role verification

3. **API Routes:**
   - Move data fetching to Next.js API routes
   - Implement server-side authentication
   - Add rate limiting

4. **HTTPS:**
   - Always use HTTPS in production
   - Enable Firebase security rules

## Troubleshooting

### Can't Login
- Ensure password is exactly: `Mayank@Admin2025` (case-sensitive)
- Clear browser cache and try again
- Check browser console for errors

### No Inquiries Showing
- Click the "Refresh" button
- Check Firebase console to verify data exists
- Ensure Firebase configuration is correct

### Delete Not Working
- Check Firebase security rules
- Verify internet connection
- Check browser console for errors

## Future Enhancements

Potential features to add:
- Export inquiries to CSV/Excel
- Mark inquiries as "read" or "replied"
- Search and filter functionality
- Email notifications for new inquiries
- Multi-admin support with different roles
- Bulk delete option
- Reply directly from admin panel

## Support

For issues or questions, contact: hi@mayankkreative.com
