# Git Repository Setup

Your project has been initialized with Git! Here's how to push it to GitHub.

## ✅ Already Completed

- [x] Git repository initialized
- [x] Initial commit created
- [x] All project files committed

## 📤 Push to GitHub

### Option 1: Create New Repository on GitHub (Recommended)

1. **Go to GitHub** and create a new repository:
   - Go to https://github.com/new
   - Repository name: `norwich-event-hub`
   - Description: "Independent event listing platform for Norwich - nightlife, culture, community events, and more"
   - Visibility: Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Add GitHub as remote and push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/norwich-event-hub.git
   git branch -M main
   git push -u origin main
   ```

3. **Done!** Your code is now on GitHub.

### Option 2: Use GitHub Desktop (Easier)

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. Click "Add" > "Add Existing Repository"
4. Browse to: `C:\Users\marc\Desktop\new company`
5. Click "Publish repository"
6. Choose repository name and visibility
7. Click "Publish"

## 🔗 Next Steps After Pushing to GitHub

### 1. Connect to Cloudflare Pages

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/)
2. Click "Create a project"
3. Click "Connect to Git"
4. Authorize Cloudflare to access your GitHub
5. Select `norwich-event-hub` repository
6. Configure build:
   - Build command: (leave empty)
   - Build output directory: `/`
   - Root directory: `/`
7. Click "Save and Deploy"
8. Wait 2-3 minutes for deployment
9. Your site will be live at: `[random-name].pages.dev`

### 2. Add Custom Domain

1. In Cloudflare Pages project:
   - Go to "Custom domains"
   - Click "Set up a custom domain"
   - Enter: `norwicheventshub.com`
   - Click "Continue"
2. Cloudflare will automatically configure DNS
3. Wait for SSL certificate (usually instant)
4. Site will be live at: `https://norwicheventshub.com`

### 3. Add Environment Variables (Optional)

In Cloudflare Pages settings:
1. Go to "Settings" > "Environment variables"
2. Add:
   - `GOOGLE_APPS_SCRIPT_URL`: Your Web App URL
   - `SITE_URL`: `https://norwicheventshub.com`

## 📊 Repository Information

- **Current branch**: main
- **Initial commit**: bf188c6
- **Files committed**: 40
- **Lines of code**: 5,757

## 🔄 Future Git Workflow

### Making Changes

```bash
# 1. Make your changes to files

# 2. Check what changed
git status

# 3. Stage changes
git add .

# 4. Commit with message
git commit -m "Description of changes"

# 5. Push to GitHub
git push
```

### Best Practices

- Commit often with clear messages
- Pull before pushing if working in a team: `git pull`
- Use branches for major features: `git checkout -b feature-name`
- Never commit sensitive data (API keys, passwords)
  - These are already in `.gitignore`

## 🔐 Protected Files

The following files are gitignored (won't be committed):

- `scripts/config.js` - API configuration
- `.env` files - Environment variables
- `node_modules/` - Dependencies
- `.vscode/`, `.idea/` - IDE settings

When deploying, you'll need to:
1. Manually create `scripts/config.js` on server, OR
2. Use environment variables in Cloudflare Pages

## ✅ Verification

Verify your setup:

```bash
# Check remote is set
git remote -v

# Check current branch
git branch

# View commit history
git log --oneline

# Check repository status
git status
```

## 🆘 Troubleshooting

### "Permission denied (publickey)"
- You need to set up SSH keys or use HTTPS
- GitHub Guide: https://docs.github.com/en/authentication

### "Repository not found"
- Check the remote URL: `git remote -v`
- Verify repository exists on GitHub
- Update remote: `git remote set-url origin NEW_URL`

### "Failed to push"
- Pull first: `git pull origin main`
- Then push: `git push origin main`

## 📝 Commit Message Guidelines

Good commit messages:
- `Add event filtering feature`
- `Fix mobile navigation menu bug`
- `Update social media templates`
- `Improve Google Sheets integration`

Bad commit messages:
- `Update`
- `Fix stuff`
- `Changes`

## 🚀 Ready to Deploy!

Your project is now version controlled and ready to deploy to Cloudflare Pages!

Next steps:
1. Push to GitHub (see above)
2. Connect to Cloudflare Pages
3. Configure custom domain
4. Set up Google Sheets backend
5. Launch! 🎉
