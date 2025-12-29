#!/bin/bash
# Google Service Account Setup Script
# For macOS/Linux

echo "🚀 Norwich Event Hub - Google Service Account Setup"
echo "================================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found!"
    echo ""
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Configuration
read -p "Enter your Google Cloud Project ID (or press Enter to create new): " PROJECT_ID
SERVICE_ACCOUNT_NAME="norwich-events-bot"
SERVICE_ACCOUNT_DISPLAY="Norwich Event Hub Bot"
SHEET_ID="1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU"
KEY_FILE="google-service-account.json"

echo ""
echo "📋 Configuration:"
echo "  Service Account: $SERVICE_ACCOUNT_NAME"
echo "  Google Sheet ID: $SHEET_ID"
echo ""

# Step 1: Login to gcloud
echo "🔐 Step 1: Logging in to Google Cloud..."
gcloud auth login

if [ $? -ne 0 ]; then
    echo "❌ Login failed!"
    exit 1
fi

# Step 2: Create or select project
if [ -z "$PROJECT_ID" ]; then
    echo ""
    echo "📦 Step 2: Creating new project..."
    PROJECT_ID="norwich-event-hub-$RANDOM"
    echo "  Project ID: $PROJECT_ID"

    gcloud projects create $PROJECT_ID --name="Norwich Event Hub"

    if [ $? -ne 0 ]; then
        echo "❌ Project creation failed!"
        exit 1
    fi
fi

# Set active project
echo ""
echo "🎯 Setting active project..."
gcloud config set project $PROJECT_ID

# Step 3: Enable required APIs
echo ""
echo "⚙️  Step 3: Enabling Google APIs..."
echo "  Enabling Google Sheets API..."
gcloud services enable sheets.googleapis.com

echo "  Enabling Google Drive API..."
gcloud services enable drive.googleapis.com

if [ $? -ne 0 ]; then
    echo "❌ API enablement failed!"
    echo "⚠️  You may need to enable billing for this project"
    echo "   Go to: https://console.cloud.google.com/billing"
    exit 1
fi

# Step 4: Create service account
echo ""
echo "👤 Step 4: Creating service account..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="$SERVICE_ACCOUNT_DISPLAY" \
    --description="Automated service account for Norwich Event Hub AI aggregator"

if [ $? -ne 0 ]; then
    echo "⚠️  Service account may already exist, continuing..."
fi

# Step 5: Create and download key
echo ""
echo "🔑 Step 5: Creating service account key..."
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "  Email: $SERVICE_ACCOUNT_EMAIL"

# Delete existing key file if it exists
rm -f $KEY_FILE

gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT_EMAIL

if [ $? -ne 0 ]; then
    echo "❌ Key creation failed!"
    exit 1
fi

echo "  ✅ Key saved to: $KEY_FILE"

# Step 6: Share Google Sheet
echo ""
echo "📊 Step 6: Sharing Google Sheet with service account..."
echo "  Installing Python dependencies..."

# Create a small Python script to share the sheet
cat > share_sheet.py << EOF
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
EOF

# Run the Python script
python3 share_sheet.py

# Clean up
rm -f share_sheet.py

# Step 7: Display next steps
echo ""
echo "================================================="
echo "✅ Setup Complete!"
echo "================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add to GitHub Secrets:"
echo "   URL: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions"
echo ""
echo "   Secret: GOOGLE_SHEETS_CREDENTIALS"
echo "   Value: "
echo ""

# Read and display the JSON content
cat $KEY_FILE

echo ""
echo "2. Copy the JSON above and paste it as the secret value"
echo ""
echo "3. Also add these secrets:"
echo "   GEMINI_API_KEY - Your Gemini API key"
echo "   GOOGLE_SHEET_ID - $SHEET_ID"
echo ""
echo "4. Test the workflow:"
echo "   https://github.com/marc420-design/norwich-event-hub/actions"
echo ""
echo "📁 Credentials saved to: $KEY_FILE"
echo "🔒 Keep this file secure and never commit it to git!"
echo ""
