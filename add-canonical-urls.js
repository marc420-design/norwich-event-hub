const fs = require('fs');
const path = require('path');

// Pages to add canonical URLs (without .html extension for clean URLs)
const pages = [
    { file: 'this-weekend.html', canonical: 'https://norwicheventshub.com/this-weekend' },
    { file: 'directory.html', canonical: 'https://norwicheventshub.com/directory' },
    { file: 'venues.html', canonical: 'https://norwicheventshub.com/venues' },
    { file: 'submit.html', canonical: 'https://norwicheventshub.com/submit' },
    { file: 'about.html', canonical: 'https://norwicheventshub.com/about' },
    { file: 'contact.html', canonical: 'https://norwicheventshub.com/contact' },
    { file: 'event-detail.html', canonical: 'https://norwicheventshub.com/event-detail' },
    { file: 'venue-detail.html', canonical: 'https://norwicheventshub.com/venue-detail' },
    { file: 'admin.html', canonical: 'https://norwicheventshub.com/admin' }
];

pages.forEach(({ file, canonical }) => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if canonical already exists
    if (content.includes('<link rel="canonical"')) {
        console.log(`⚠️  ${file} already has canonical URL`);
        return;
    }

    // Find the closing </head> tag or theme color meta tag
    const themeColorPattern = /(\s*<meta name="theme-color"[^>]*>\s*)/;
    const canonicalTag = `\n    <!-- Canonical URL -->\n    <link rel="canonical" href="${canonical}">\n`;

    if (themeColorPattern.test(content)) {
        // Add after theme color
        content = content.replace(themeColorPattern, `$1${canonicalTag}`);
    } else {
        // Add before first stylesheet link
        const stylesheetPattern = /(\s*<link rel="stylesheet")/;
        if (stylesheetPattern.test(content)) {
            content = content.replace(stylesheetPattern, `${canonicalTag}$1`);
        } else {
            // Fallback: add before </head>
            content = content.replace('</head>', `${canonicalTag}</head>`);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added canonical URL to ${file}: ${canonical}`);
});

console.log('\n✨ Canonical URLs added successfully!');
