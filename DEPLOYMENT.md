# Deployment Guide - Norwich Event Hub

## Quick Start

### 1. Test Locally
```bash
# Option 1: Use Python's built-in server
python -m http.server 8000

# Option 2: Use Node.js serve
npx serve .

# Option 3: Use VS Code Live Server extension
# Right-click index.html > Open with Live Server
```

Visit: `http://localhost:8000`

### 2. Deploy to Cloudflare Pages

#### Method A: Git Integration (Recommended)
1. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to GitHub/GitLab/Bitbucket

3. In Cloudflare Dashboard:
   - Go to Pages > Create a project
   - Connect your repository
   - Build settings:
     - Build command: (leave empty)
     - Output directory: `/` (root)
     - Root directory: `/` (root)
   - Click "Save and Deploy"

#### Method B: Direct Upload
1. Zip the project folder (excluding node_modules, .git)
2. In Cloudflare Pages, select "Upload assets"
3. Upload the zip file
4. Deploy

### 3. Configure Custom Domain

1. In Cloudflare Pages project settings:
   - Go to "Custom domains"
   - Add `norwicheventshub.com`
   - Add `www.norwicheventshub.com`

2. Update DNS records:
   - Add CNAME: `www` → `your-pages-project.pages.dev`
   - Add CNAME: `@` → `your-pages-project.pages.dev`

3. SSL/TLS will be automatically configured

### 4. Environment Variables

In Cloudflare Pages settings, add:
- `GOOGLE_APPS_SCRIPT_URL` - Your Google Apps Script Web App URL
- `GOOGLE_SHEETS_API_KEY` - (Optional) For direct API access
- `GOOGLE_SHEET_ID` - (Optional) Your Google Sheet ID

Update `scripts/api.js` to use environment variables:
```javascript
const API_CONFIG = {
    SUBMISSION_URL: process.env.GOOGLE_APPS_SCRIPT_URL || 'YOUR_URL',
    // ...
};
```

## Pre-Deployment Checklist

- [ ] Test all pages locally
- [ ] Verify form submission works
- [ ] Check mobile responsiveness
- [ ] Test event filtering
- [ ] Verify all links work
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Verify favicon displays correctly
- [ ] Check meta tags for social sharing
- [ ] Test 404 page

## Post-Deployment Checklist

- [ ] Verify site loads correctly
- [ ] Test form submission end-to-end
- [ ] Check Google Analytics (if configured)
- [ ] Verify sitemap.xml is accessible
- [ ] Test robots.txt
- [ ] Check SSL certificate is active
- [ ] Verify custom domain works
- [ ] Test social media sharing previews
- [ ] Submit sitemap to Google Search Console

## Google Search Console Setup

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://norwicheventshub.com`
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://norwicheventshub.com/sitemap.xml`

## Performance Optimization

### Before Deployment
- [ ] Optimize images (use WebP format)
- [ ] Minify CSS and JavaScript (optional)
- [ ] Enable Cloudflare caching
- [ ] Set up CDN for assets

### Cloudflare Settings
- Enable Auto Minify (HTML, CSS, JS)
- Enable Brotli compression
- Set cache level: Standard
- Browser Cache TTL: 4 hours

## Monitoring

### Analytics
- Set up Google Analytics 4
- Configure Plausible Analytics (privacy-friendly alternative)
- Track key events (form submissions, event views)

### Error Tracking
- Set up error logging (Sentry, LogRocket, etc.)
- Monitor form submission failures
- Track API errors

### Uptime Monitoring
- Use Cloudflare's built-in monitoring
- Set up external monitoring (UptimeRobot, Pingdom)
- Configure alerts for downtime

## Maintenance

### Regular Tasks
- [ ] Weekly: Review event submissions
- [ ] Weekly: Check for broken links
- [ ] Monthly: Update sitemap
- [ ] Monthly: Review analytics
- [ ] Quarterly: Update dependencies

### Updates
- Keep dependencies updated
- Monitor security advisories
- Update content regularly
- Refresh sample events

## Troubleshooting

### Common Issues

**Form submissions not working:**
- Check Google Apps Script is deployed
- Verify Web App URL is correct
- Check CORS settings in Apps Script
- Review browser console for errors

**Events not loading:**
- Verify API configuration
- Check Google Sheets permissions
- Review network tab for failed requests
- Test API endpoint directly

**Styling issues:**
- Clear browser cache
- Check CSS file paths
- Verify fonts are loading
- Test in incognito mode

## Support

For deployment issues:
- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Google Apps Script docs: https://developers.google.com/apps-script
- Project README: See README.md

