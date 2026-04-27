#!/usr/bin/env python3
"""
Real-Time Data Verification Script
Checks if Norwich Event Hub is properly configured for real-time data
"""

import requests
import json
import sys
from datetime import datetime

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_section(title):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{title}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def print_success(message):
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message):
    print(f"{RED}✗ {message}{RESET}")

def print_warning(message):
    print(f"{YELLOW}⚠ {message}{RESET}")

def check_config():
    """Check config.js settings"""
    print_section("1. Checking Configuration")

    try:
        with open('scripts/config.js', 'r') as f:
            config_content = f.read()

        # Check USE_LOCAL_STORAGE setting
        if 'USE_LOCAL_STORAGE: false' in config_content:
            print_success("USE_LOCAL_STORAGE is set to false (real-time mode)")
        else:
            print_error("USE_LOCAL_STORAGE should be false for real-time data")
            print("  Fix: Set USE_LOCAL_STORAGE: false in scripts/config.js")
            return False

        # Extract API URL
        import re
        url_match = re.search(r"GOOGLE_APPS_SCRIPT_URL: '(.*?)'", config_content)
        if url_match:
            api_url = url_match.group(1)
            print_success(f"API URL configured: {api_url[:50]}...")
            return api_url
        else:
            print_error("GOOGLE_APPS_SCRIPT_URL not found in config")
            return False

    except FileNotFoundError:
        print_error("config.js not found")
        return False

def check_api(api_url):
    """Check if API returns data"""
    print_section("2. Checking Google Apps Script API")

    try:
        print(f"Testing API: {api_url}")
        response = requests.get(api_url, timeout=10)

        if response.status_code == 200:
            print_success(f"API responded with status 200")

            try:
                data = response.json()

                if data.get('success'):
                    print_success("API returned success=true")

                    events = data.get('events', [])
                    event_count = len(events)

                    print_success(f"API returned {event_count} events")

                    if event_count > 0:
                        print(f"\n  Sample event:")
                        sample = events[0]
                        print(f"    Name: {sample.get('name', 'N/A')}")
                        print(f"    Date: {sample.get('date', 'N/A')}")
                        print(f"    Location: {sample.get('location', 'N/A')}")
                        print(f"    Status: {sample.get('status', 'N/A')}")
                        return True
                    else:
                        print_warning("API returned 0 events")
                        print("  This could mean:")
                        print("    - No events in Google Sheets")
                        print("    - No approved events (all pending/rejected)")
                        print("    - Events need to be scraped")
                        return None
                else:
                    print_error(f"API returned success=false: {data.get('message', 'Unknown error')}")
                    return False

            except json.JSONDecodeError:
                print_error("API response is not valid JSON")
                print(f"Response: {response.text[:200]}")
                return False
        else:
            print_error(f"API returned status {response.status_code}")
            return False

    except requests.Timeout:
        print_error("API request timed out (>10 seconds)")
        return False
    except requests.RequestException as e:
        print_error(f"API request failed: {e}")
        return False

def check_local_json():
    """Check local JSON file"""
    print_section("3. Checking Local JSON Fallback")

    try:
        with open('data/sample-events.json', 'r') as f:
            data = json.load(f)

        events = data.get('events', [])
        timestamp = data.get('timestamp', 'Unknown')

        print_success(f"Local JSON file exists with {len(events)} events")
        print(f"  Last updated: {timestamp}")

        if len(events) > 0:
            sample = events[0]
            print(f"\n  Sample event:")
            print(f"    Name: {sample.get('name', 'N/A')}")
            print(f"    Date: {sample.get('date', 'N/A')}")

        print_warning("Local JSON is only used as fallback in development mode")
        print("  For production, data should come from Google Sheets API")

        return True
    except FileNotFoundError:
        print_error("Local JSON file not found at data/sample-events.json")
        return False
    except json.JSONDecodeError:
        print_error("Local JSON file is not valid JSON")
        return False

def check_github_action():
    """Check if GitHub Action exists"""
    print_section("4. Checking Automated Scraping")

    try:
        with open('.github/workflows/scrape-events.yml', 'r') as f:
            workflow_content = f.read()

        print_success("GitHub Action workflow found: scrape-events.yml")

        if 'cron' in workflow_content:
            print_success("Scheduled to run automatically (cron job)")

        if 'workflow_dispatch' in workflow_content:
            print_success("Can be triggered manually from GitHub Actions tab")

        print("\n  To enable automated scraping:")
        print("    1. Commit and push this workflow to GitHub")
        print("    2. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions")
        print("    3. Click 'Scrape Real-Time Events'")
        print("    4. Click 'Run workflow'")

        return True
    except FileNotFoundError:
        print_error("GitHub Action not found at .github/workflows/scrape-events.yml")
        return False

def main():
    print(f"\n{BLUE}{'='*60}")
    print("Norwich Event Hub - Real-Time Data Verification")
    print(f"{'='*60}{RESET}\n")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    results = []

    # Check 1: Config
    api_url = check_config()
    results.append(('Configuration', bool(api_url)))

    # Check 2: API
    if api_url:
        api_result = check_api(api_url)
        results.append(('Google Apps Script API', api_result is not False))
    else:
        results.append(('Google Apps Script API', False))

    # Check 3: Local JSON
    local_result = check_local_json()
    results.append(('Local JSON Fallback', local_result))

    # Check 4: GitHub Action
    github_result = check_github_action()
    results.append(('Automated Scraping', github_result))

    # Summary
    print_section("Summary")

    all_passed = all(result for _, result in results)

    for check_name, passed in results:
        if passed:
            print_success(f"{check_name}: OK")
        else:
            print_error(f"{check_name}: FAILED")

    print("\n" + "="*60)
    if all_passed:
        print_success("✅ All checks passed! Real-time data should be working.")
        print("\nNext steps:")
        print("  1. Run the scraper: python automation/real-time-scraper.py")
        print("  2. Or use the quick script: run-scraper.bat")
        print("  3. Check admin dashboard: https://norwicheventshub.com/admin")
        print("  4. Approve scraped events")
        print("  5. Events will appear on website in real-time")
    else:
        print_error("❌ Some checks failed. Fix the issues above.")
        print("\nCommon fixes:")
        print("  - Set USE_LOCAL_STORAGE: false in scripts/config.js")
        print("  - Ensure Google Apps Script is deployed correctly")
        print("  - Run the scraper to add events to Google Sheets")
    print("="*60 + "\n")

    sys.exit(0 if all_passed else 1)

if __name__ == '__main__':
    main()
