# Google Service Account Setup Script
# Run this in PowerShell as Administrator

Write-Host "🚀 Norwich Event Hub - Google Service Account Setup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Google Cloud CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "Or run: winget install Google.CloudSDK" -ForegroundColor Yellow
    exit 1
}

# Configuration
$PROJECT_ID = Read-Host "Enter your Google Cloud Project ID (or press Enter to create new)"
$SERVICE_ACCOUNT_NAME = "norwich-events-bot"
$SERVICE_ACCOUNT_DISPLAY = "Norwich Event Hub Bot"
$SHEET_ID = "1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU"
$KEY_FILE = "google-service-account.json"

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Green
Write-Host "  Service Account: $SERVICE_ACCOUNT_NAME" -ForegroundColor Gray
Write-Host "  Google Sheet ID: $SHEET_ID" -ForegroundColor Gray
Write-Host ""

# Step 1: Login to gcloud
Write-Host "🔐 Step 1: Logging in to Google Cloud..." -ForegroundColor Yellow
gcloud auth login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Create or select project
if ([string]::IsNullOrWhiteSpace($PROJECT_ID)) {
    Write-Host ""
    Write-Host "📦 Step 2: Creating new project..." -ForegroundColor Yellow
    $PROJECT_ID = "norwich-event-hub-" + (Get-Random -Minimum 1000 -Maximum 9999)
    Write-Host "  Project ID: $PROJECT_ID" -ForegroundColor Gray

    gcloud projects create $PROJECT_ID --name="Norwich Event Hub"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Project creation failed!" -ForegroundColor Red
        exit 1
    }
}

# Set active project
Write-Host ""
Write-Host "🎯 Setting active project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Step 3: Enable required APIs
Write-Host ""
Write-Host "⚙️  Step 3: Enabling Google APIs..." -ForegroundColor Yellow
Write-Host "  Enabling Google Sheets API..." -ForegroundColor Gray
gcloud services enable sheets.googleapis.com

Write-Host "  Enabling Google Drive API..." -ForegroundColor Gray
gcloud services enable drive.googleapis.com

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API enablement failed!" -ForegroundColor Red
    Write-Host "⚠️  You may need to enable billing for this project" -ForegroundColor Yellow
    Write-Host "   Go to: https://console.cloud.google.com/billing" -ForegroundColor Yellow
    exit 1
}

# Step 4: Create service account
Write-Host ""
Write-Host "👤 Step 4: Creating service account..." -ForegroundColor Yellow
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME `
    --display-name="$SERVICE_ACCOUNT_DISPLAY" `
    --description="Automated service account for Norwich Event Hub AI aggregator"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Service account may already exist, continuing..." -ForegroundColor Yellow
}

# Step 5: Create and download key
Write-Host ""
Write-Host "🔑 Step 5: Creating service account key..." -ForegroundColor Yellow
$SERVICE_ACCOUNT_EMAIL = "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
Write-Host "  Email: $SERVICE_ACCOUNT_EMAIL" -ForegroundColor Gray

# Delete existing key file if it exists
if (Test-Path $KEY_FILE) {
    Remove-Item $KEY_FILE -Force
}

gcloud iam service-accounts keys create $KEY_FILE `
    --iam-account=$SERVICE_ACCOUNT_EMAIL

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Key creation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Key saved to: $KEY_FILE" -ForegroundColor Green

# Step 6: Share Google Sheet
Write-Host ""
Write-Host "📊 Step 6: Sharing Google Sheet with service account..." -ForegroundColor Yellow
Write-Host "  Installing Python dependencies..." -ForegroundColor Gray

# Create a small Python script to share the sheet
$PythonScript = @"
import json
import sys
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    print('❌ Missing dependencies. Installing...')
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'google-auth', 'google-api-python-client'])
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

# Load service account credentials
with open('$KEY_FILE', 'r') as f:
    creds_data = json.load(f)

credentials = service_account.Credentials.from_service_account_file(
    '$KEY_FILE',
    scopes=['https://www.googleapis.com/auth/drive']
)

# Build the Drive API service
service = build('drive', 'v3', credentials=credentials)

# Share the sheet
permission = {
    'type': 'user',
    'role': 'writer',
    'emailAddress': '$SERVICE_ACCOUNT_EMAIL'
}

try:
    service.permissions().create(
        fileId='$SHEET_ID',
        body=permission,
        sendNotificationEmail=False
    ).execute()
    print('✅ Google Sheet shared successfully!')
except Exception as e:
    print(f'❌ Error sharing sheet: {e}')
    print('')
    print('⚠️  You can share it manually:')
    print('   1. Open: https://docs.google.com/spreadsheets/d/$SHEET_ID')
    print('   2. Click Share')
    print('   3. Add: $SERVICE_ACCOUNT_EMAIL')
    print('   4. Set permission: Editor')
    sys.exit(1)
"@

Set-Content -Path "share_sheet.py" -Value $PythonScript

# Run the Python script
python share_sheet.py

# Clean up
Remove-Item "share_sheet.py" -Force

# Step 7: Display next steps
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Add to GitHub Secrets:" -ForegroundColor White
Write-Host "   URL: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions" -ForegroundColor Gray
Write-Host ""
Write-Host "   Secret: GOOGLE_SHEETS_CREDENTIALS" -ForegroundColor Cyan
Write-Host "   Value: " -ForegroundColor Cyan
Write-Host ""

# Read and display the JSON content
$jsonContent = Get-Content $KEY_FILE -Raw
Write-Host $jsonContent -ForegroundColor DarkGray

Write-Host ""
Write-Host "2. Copy the JSON above and paste it as the secret value" -ForegroundColor White
Write-Host ""
Write-Host "3. Also add these secrets:" -ForegroundColor White
Write-Host "   GEMINI_API_KEY - Your Gemini API key" -ForegroundColor Gray
Write-Host "   GOOGLE_SHEET_ID - $SHEET_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test the workflow:" -ForegroundColor White
Write-Host "   https://github.com/marc420-design/norwich-event-hub/actions" -ForegroundColor Gray
Write-Host ""
Write-Host "📁 Credentials saved to: $KEY_FILE" -ForegroundColor Yellow
Write-Host "🔒 Keep this file secure and never commit it to git!" -ForegroundColor Red
Write-Host ""
