// Newsletter Signup Handler

document.addEventListener('DOMContentLoaded', function() {
    const newsletterForms = document.querySelectorAll('#newsletterForm');

    newsletterForms.forEach(form => {
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const submitButton = form.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();

            // Validate email
            if (!isValidEmail(email)) {
                showMessage(form, 'Please enter a valid email address', 'error');
                return;
            }

            // Show loading state
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Subscribing...';
            submitButton.disabled = true;

            try {
                // TODO: Replace with actual newsletter service integration
                // Options: Mailchimp, ConvertKit, Sendinblue, etc.
                await subscribeToNewsletter(email);

                // Show success message
                showMessage(form, '🎉 Thanks for subscribing! Check your email for confirmation.', 'success');

                // Clear form
                emailInput.value = '';

                // Track subscription (if analytics is available)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'newsletter_subscription', {
                        'event_category': 'engagement',
                        'event_label': 'footer_signup'
                    });
                }

            } catch (error) {
                console.error('Newsletter subscription error:', error);
                showMessage(form, 'Something went wrong. Please try again later.', 'error');
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    });
});

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Newsletter subscription function
async function subscribeToNewsletter(email) {
    // INTEGRATION GUIDE:
    //
    // MAILCHIMP:
    // 1. Create a Mailchimp account and list
    // 2. Get your API key and Audience ID
    // 3. Use server-side endpoint or Mailchimp's embedded form
    //
    // CONVERTKIT:
    // 1. Create a ConvertKit account and form
    // 2. Get your Form ID
    // 3. POST to: https://api.convertkit.com/v3/forms/{form_id}/subscribe
    //
    // SENDINBLUE/BREVO:
    // 1. Create account and get API key
    // 2. POST to: https://api.sendinblue.com/v3/contacts
    //
    // For now, we'll simulate the subscription and log it
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Newsletter subscription:', email);

            // Simulate success
            // In production, this would be an actual API call
            resolve({
                success: true,
                email: email,
                message: 'Subscription successful'
            });

            // Example Mailchimp integration (server-side):
            // fetch('/api/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email })
            // }).then(res => res.json())

        }, 1000);
    });
}

// Show message to user
function showMessage(form, message, type) {
    // Remove existing message
    const existingMessage = form.parentElement.querySelector('.newsletter-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `newsletter-message newsletter-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm);
        border-radius: 4px;
        font-size: 0.9rem;
        animation: slideDown 0.3s ease-out;
        ${type === 'success' ? 'background: #28a745; color: white;' : 'background: #dc3545; color: white;'}
    `;

    form.parentElement.appendChild(messageDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => messageDiv.remove(), 500);
    }, 5000);
}
