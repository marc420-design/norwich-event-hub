/**
 * Form Validation with Real-Time Feedback
 * Provides visual feedback for form fields as users type
 */

(function () {
    console.log('📝 Form Validation: Initializing...');

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // URL validation regex
    const urlRegex = /^https?:\/\/.+/;

    // Phone validation regex (UK format)
    const phoneRegex = /^(\+44|0)[0-9]{10}$/;

    /**
     * Add validation to an input field
     */
    function addValidation(input, validationFn, errorMessage) {
        const fieldGroup = input.closest('.form-group') || input.parentElement;

        // Create error message element if it doesn't exist
        let errorEl = fieldGroup.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.style.cssText = 'color: #E53935; font-size: 0.875rem; margin-top: 0.25rem; display: none;';
            fieldGroup.appendChild(errorEl);
        }

        // Create success icon if it doesn't exist
        let successEl = fieldGroup.querySelector('.field-success');
        if (!successEl) {
            successEl = document.createElement('span');
            successEl.className = 'field-success';
            successEl.innerHTML = '✓';
            successEl.style.cssText = 'color: #2B7A47; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 1.25rem; font-weight: bold; display: none;';

            // Make parent position relative
            if (fieldGroup.style.position !== 'absolute') {
                fieldGroup.style.position = 'relative';
            }

            fieldGroup.appendChild(successEl);
        }

        // Validate on input (real-time)
        input.addEventListener('input', function () {
            validate();
        });

        // Validate on blur (when field loses focus)
        input.addEventListener('blur', function () {
            validate();
        });

        function validate() {
            const value = input.value.trim();
            const isRequired = input.hasAttribute('required');

            // Empty field handling
            if (isRequired && !value) {
                showError('This field is required');
                return false;
            }

            if (!value && !isRequired) {
                clearValidation();
                return true;
            }

            // Run custom validation
            const isValid = validationFn(value);

            if (isValid) {
                showSuccess();
                return true;
            } else {
                showError(errorMessage);
                return false;
            }
        }

        function showError(message) {
            input.classList.add('field-invalid');
            input.classList.remove('field-valid');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            successEl.style.display = 'none';

            // Add red border
            input.style.borderColor = '#E53935';
        }

        function showSuccess() {
            input.classList.remove('field-invalid');
            input.classList.add('field-valid');
            errorEl.style.display = 'none';
            successEl.style.display = 'block';

            // Add green border
            input.style.borderColor = '#2B7A47';
        }

        function clearValidation() {
            input.classList.remove('field-invalid', 'field-valid');
            errorEl.style.display = 'none';
            successEl.style.display = 'none';
            input.style.borderColor = '';
        }

        // Return validate function so form can check all fields
        return validate;
    }

    /**
     * Initialize validation for submit form
     */
    const submitForm = document.getElementById('eventSubmitForm') || document.querySelector('form[action*="submit"]');

    if (submitForm) {
        const validators = [];

        // Event Name validation
        const eventNameInput = submitForm.querySelector('input[name="name"]');
        if (eventNameInput) {
            validators.push(addValidation(
                eventNameInput,
                (value) => value.length >= 3,
                'Event name must be at least 3 characters'
            ));
        }

        // Email validation
        const emailInputs = submitForm.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            validators.push(addValidation(
                input,
                (value) => emailRegex.test(value),
                'Please enter a valid email address'
            ));
        });

        // URL validation (ticket link)
        const urlInputs = submitForm.querySelectorAll('input[name="ticketLink"]');
        urlInputs.forEach(input => {
            validators.push(addValidation(
                input,
                (value) => urlRegex.test(value),
                'Please enter a valid URL (must start with http:// or https://)'
            ));
        });

        // Phone validation (optional)
        const phoneInputs = submitForm.querySelectorAll('input[type="tel"], input[name="phone"]');
        phoneInputs.forEach(input => {
            if (!input.hasAttribute('required')) {
                validators.push(addValidation(
                    input,
                    (value) => !value || phoneRegex.test(value.replace(/\s/g, '')),
                    'Please enter a valid UK phone number'
                ));
            }
        });

        // Location validation
        const locationInput = submitForm.querySelector('input[name="location"]');
        if (locationInput) {
            validators.push(addValidation(
                locationInput,
                (value) => value.length >= 3,
                'Location must be at least 3 characters'
            ));
        }

        // Description validation
        const descriptionInput = submitForm.querySelector('textarea[name="description"]');
        if (descriptionInput) {
            // Add character counter
            const counterEl = document.createElement('div');
            counterEl.className = 'char-counter';
            counterEl.style.cssText = 'text-align: right; font-size: 0.875rem; color: #666; margin-top: 0.25rem;';
            descriptionInput.parentElement.appendChild(counterEl);

            const minLength = 20;
            const maxLength = 1000;

            descriptionInput.addEventListener('input', function () {
                const length = this.value.length;
                counterEl.textContent = `${length}/${maxLength} characters`;

                if (length > maxLength) {
                    counterEl.style.color = '#E53935';
                } else if (length < minLength) {
                    counterEl.style.color = '#666';
                } else {
                    counterEl.style.color = '#2B7A47';
                }
            });

            validators.push(addValidation(
                descriptionInput,
                (value) => value.length >= minLength && value.length <= maxLength,
                `Description must be between ${minLength} and ${maxLength} characters`
            ));
        }

        // Prevent form submission if validation fails
        submitForm.addEventListener('submit', function (e) {
            let allValid = true;

            // Run all validators
            validators.forEach(validate => {
                if (!validate()) {
                    allValid = false;
                }
            });

            // Check required fields
            const requiredFields = submitForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    allValid = false;

                    // Highlight field
                    field.style.borderColor = '#E53935';
                    field.focus();
                }
            });

            if (!allValid) {
                e.preventDefault();

                // Scroll to first error
                const firstError = submitForm.querySelector('.field-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }

                // Show error message
                alert('Please fix the errors in the form before submitting.');
            }
        });

        console.log('✅ Form Validation: Initialized with real-time feedback');
    }

    /**
     * Initialize validation for newsletter form
     */
    const newsletterForm = document.getElementById('newsletterForm');

    if (newsletterForm) {
        const emailInput = newsletterForm.querySelector('input[type="email"]');

        if (emailInput) {
            const validator = addValidation(
                emailInput,
                (value) => emailRegex.test(value),
                'Please enter a valid email address'
            );

            newsletterForm.addEventListener('submit', function (e) {
                if (!validator()) {
                    e.preventDefault();
                    emailInput.focus();
                }
            });
        }

        console.log('✅ Newsletter Validation: Initialized');
    }

})();
