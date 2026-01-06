/**
 * Newsletter Signup Handler
 * Config-based implementation with spam protection
 */

(function() {
    'use strict';

    // Rate limiting: max 2 signups per day per device
    const RATE_LIMIT_KEY = 'newsletter_signups';
    const MAX_SIGNUPS_PER_DAY = 2;

    document.addEventListener('DOMContentLoaded', function() {
        const newsletterForms = document.querySelectorAll('#newsletterForm, .newsletter-form');

        newsletterForms.forEach(form => {
            if (!form) return;

            // Add honeypot field for spam protection
            addHoneypot(form);

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const emailInput = form.querySelector('input[type="email"]');
                const submitButton = form.querySelector('button[type="submit"]');
                const email = emailInput.value.trim();
                const honeypot = form.querySelector('input[name="website"]');

                // Check honeypot (bots will fill this)
                if (honeypot && honeypot.value !== '') {
                    console.log('Spam detected via honeypot');
                    showMessage(form, 'Subscription successful!', 'success'); // Fake success for bots
                    emailInput.value = '';
                    return;
                }

                // Validate email
                if (!isValidEmail(email)) {
                    showMessage(form, 'Please enter a valid email address', 'error');
                    return;
                }

                // Check rate limit
                if (!checkRateLimit()) {
                    showMessage(form, 'You\'ve reached the maximum signups for today. Please try again tomorrow.', 'error');
                    return;
                }

                // Show loading state
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Subscribing...';
                submitButton.disabled = true;

                try {
                    await subscribeToNewsletter(email);

                    // Update rate limit
                    updateRateLimit();

                    // Show success message
                    showMessage(form, '🎉 Thanks for subscribing! Check your email for confirmation.', 'success');

                    // Clear form
                    emailInput.value = '';

                    // Track subscription (if analytics is available)
                    if (typeof window.trackEvent === 'function') {
                        window.trackEvent('newsletter_subscription', {
                            'event_category': 'engagement',
                            'event_label': 'footer_signup'
                        });
                    }

                } catch (error) {
                    console.error('Newsletter subscription error:', error);
                    showMessage(form, error.message || 'Something went wrong. Please try again later.', 'error');
                } finally {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
            });
        });
    });

    // Add honeypot field (hidden from users, visible to bots)
    function addHoneypot(form) {
        if (form.querySelector('input[name="website"]')) return; // Already added

        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.autocomplete = 'off';
        honeypot.tabIndex = -1;
        honeypot.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
        honeypot.setAttribute('aria-hidden', 'true');
        form.appendChild(honeypot);
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Rate limiting functions
    function checkRateLimit() {
        try {
            const data = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
            const today = new Date().toDateString();
            
            if (data.date !== today) {
                return true; // New day, allow signup
            }
            
            return (data.count || 0) < MAX_SIGNUPS_PER_DAY;
        } catch (error) {
            console.error('Rate limit check error:', error);
            return true; // Allow on error
        }
    }

    function updateRateLimit() {
        try {
            const today = new Date().toDateString();
            const data = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
            
            if (data.date !== today) {
                localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: today, count: 1 }));
            } else {
                data.count = (data.count || 0) + 1;
                localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
            }
        } catch (error) {
            console.error('Rate limit update error:', error);
        }
    }

    // Newsletter subscription function
    async function subscribeToNewsletter(email) {
        // Get newsletter endpoint from config
        const endpoint = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.NEWSLETTER_ENDPOINT) 
            ? APP_CONFIG.NEWSLETTER_ENDPOINT 
            : null;

        if (!endpoint) {
            // No endpoint configured - show friendly message
            throw new Error('Newsletter signup coming soon! We\'re still setting up our mailing list.');
        }

        // Make the actual API call
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Subscription failed. Please try again.');
        }

        return await response.json();
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
            margin-top: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            animation: slideDown 0.3s ease-out;
            ${type === 'success' ? 'background: rgba(40, 167, 69, 0.9); color: white;' : 'background: rgba(220, 53, 69, 0.9); color: white;'}
        `;

        form.parentElement.appendChild(messageDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => messageDiv.remove(), 500);
        }, 5000);
    }

})();
