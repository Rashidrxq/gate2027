# 🚀 Deployment Guide - GATE 2027 Platform

## Quick Deploy (Recommended - Free)

### Option 1: Vercel (Frontend) + Render (Backend)

#### **Step 1: Deploy Backend to Render**
1. Go to https://render.com and sign up
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository: `Rashidrxq/gate2027`
4. Select the `render.yaml` file
5. Click "Apply"
6. Your backend will deploy at: `https://gate2027-api.onrender.com`

**Environment Variables (auto-configured in render.yaml):**
- `NODE_ENV=production`
- `PORT=5000`
- `JWT_SECRET` (auto-generated)
- `CORS_ORIGIN=https://gate2027.vercel.app`

---

#### **Step 2: Deploy Frontend to Vercel**
1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repo: `Rashidrxq/gate2027`
4. Framework Preset: **Other**
5. Root Directory: `frontend`
6. Build Command: Leave empty
7. Output Directory: Leave empty
8. Click "Deploy"
9. Your frontend will be at: `https://gate2027.vercel.app`

---

#### **Step 3: Update API URL**
After deploying backend, update `frontend/api-config.js`:

```javascript
const API_BASE_URL = 'https://gate2027-api.onrender.com/api';
```

Commit and push the change.

---

### Option 2: Netlify (Frontend) + Railway (Backend)

#### **Backend on Railway**
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Rashidrxq/gate2027`
4. Railway auto-detects Node.js
5. Set start command: `cd backend && npm start`
6. Add environment variables:
   ```
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ```
7. Deploy!

#### **Frontend on Netlify**
1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select `Rashidrxq/gate2027`
4. Base directory: `frontend`
5. Build command: Leave empty
6. Publish directory: `frontend`
7. Deploy!

---

## Testing Locally Before Deploy

### Run Backend:
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Run Frontend:
```bash
cd frontend
python -m http.server 8080
# Runs on http://localhost:8080/home.html
```

---

## After Deployment Checklist

✅ Update `API_BASE_URL` in `frontend/api-config.js` to production URL  
✅ Test login/signup functionality  
✅ Test note upload/download  
✅ Verify CORS settings in backend  
✅ Check all contact links work  
✅ Test on mobile devices  

---

## Custom Domain (Optional)

### For Vercel:
1. Go to Project Settings → Domains
2. Add your domain: `gate2027.com`
3. Update DNS records as shown

### For Render:
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS CNAME record

---

## Monitoring & Logs

- **Vercel**: Dashboard → Activity tab
- **Render**: Dashboard → Logs tab
- **Railway**: Project → Deployments → View Logs

---

## Support Contact

If you need help:
- WhatsApp: +91 97453 93044
- Email: muhammerashid12345@gmail.com
- LinkedIn: /in/rashidxxmhd
- GitHub: Rashidrxq

---

## Notes

- Render free tier: 750 hours/month (always-on)
- Vercel free tier: Unlimited deployments
- Railway free tier: $5 credit/month
- Keep `.env` files out of Git (already in .gitignore)
