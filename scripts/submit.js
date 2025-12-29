// Event Submission Form JavaScript with Real-Time Validation

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('eventSubmissionForm');
    const formMessage = document.getElementById('formMessage');

    // Set minimum date to today
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // Real-time validation for each field
    setupRealTimeValidation();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const eventData = {
            name: formData.get('eventName'),
            date: formData.get('eventDate'),
            time: formData.get('eventTime'),
            location: formData.get('eventLocation'),
            category: formData.get('eventCategory'),
            description: formData.get('eventDescription'),
            ticketLink: formData.get('ticketLink'),
            promoterName: formData.get('promoterName'),
            promoterEmail: formData.get('promoterEmail'),
            promoterPhone: formData.get('promoterPhone'),
            flyer: formData.get('eventFlyer')
        };
        
        // Validate form
        if (!validateForm(eventData)) {
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        try {
            // In production, this would submit to Google Sheets API or backend
            // For now, we'll simulate submission
            await submitEvent(eventData);
            
            // Show success message
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Thank you! Your event has been submitted successfully. You will receive a confirmation email shortly.';
            formMessage.style.display = 'block';
            
            // Reset form
            form.reset();
            
            // Scroll to message
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        } catch (error) {
            // Show error message
            formMessage.className = 'form-message error';
            formMessage.textContent = 'There was an error submitting your event. Please try again or email submit@norwicheventshub.com';
            formMessage.style.display = 'block';
            
            console.error('Submission error:', error);
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
});

function validateForm(data) {
    const formMessage = document.getElementById('formMessage');
    
    // Basic validation
    if (!data.name || !data.date || !data.time || !data.location || !data.category || !data.description) {
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Please fill in all required fields.';
        formMessage.style.display = 'block';
        return false;
    }
    
    // Validate date is not in the past
    const eventDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Event date cannot be in the past.';
        formMessage.style.display = 'block';
        return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.promoterEmail)) {
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Please enter a valid email address.';
        formMessage.style.display = 'block';
        return false;
    }
    
    return true;
}

async function submitEvent(eventData) {
    // Use API function if available, otherwise fallback to local storage
    if (typeof submitEventToAPI !== 'undefined') {
        return await submitEventToAPI(eventData);
    }

    // Fallback simulation
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Event submitted:', eventData);
            resolve({ success: true, eventId: Date.now() });
        }, 1000);
    });
}

// Real-time validation setup
function setupRealTimeValidation() {
    // Event name validation
    const eventName = document.getElementById('eventName');
    eventName.addEventListener('blur', function() {
        validateField(this, this.value.trim().length >= 3, 'Event name must be at least 3 characters');
    });

    // Date validation
    const eventDate = document.getElementById('eventDate');
    eventDate.addEventListener('change', function() {
        const eventDateVal = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        validateField(this, eventDateVal >= today, 'Event date cannot be in the past');
    });

    // Location validation
    const eventLocation = document.getElementById('eventLocation');
    eventLocation.addEventListener('blur', function() {
        validateField(this, this.value.trim().length >= 3, 'Please enter a valid location');
    });

    // Category validation
    const eventCategory = document.getElementById('eventCategory');
    eventCategory.addEventListener('change', function() {
        validateField(this, this.value !== '', 'Please select a category');
    });

    // Description validation
    const eventDescription = document.getElementById('eventDescription');
    eventDescription.addEventListener('blur', function() {
        validateField(this, this.value.trim().length >= 10, 'Description must be at least 10 characters');
    });

    // Email validation
    const promoterEmail = document.getElementById('promoterEmail');
    promoterEmail.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validateField(this, emailRegex.test(this.value), 'Please enter a valid email address');
    });

    // Phone validation (optional but if provided must be valid)
    const promoterPhone = document.getElementById('promoterPhone');
    promoterPhone.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
            const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            validateField(this, phoneRegex.test(this.value), 'Please enter a valid phone number');
        } else {
            clearFieldError(this);
        }
    });

    // File size validation
    const eventFlyer = document.getElementById('eventFlyer');
    eventFlyer.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

            if (file.size > maxSize) {
                validateField(this, false, 'File size must be less than 5MB');
                this.value = ''; // Clear the file input
            } else if (!validTypes.includes(file.type)) {
                validateField(this, false, 'Only JPG and PNG files are allowed');
                this.value = '';
            } else {
                validateField(this, true, '');
            }
        }
    });

    // Ticket link validation (optional but if provided must be valid URL)
    const ticketLink = document.getElementById('ticketLink');
    ticketLink.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
            try {
                new URL(this.value);
                validateField(this, true, '');
            } catch {
                validateField(this, false, 'Please enter a valid URL (e.g., https://example.com)');
            }
        } else {
            clearFieldError(this);
        }
    });
}

// Validate individual field and show inline error
function validateField(field, isValid, errorMessage) {
    const formGroup = field.closest('.form-group');
    let errorDiv = formGroup.querySelector('.field-error');

    // Create error div if it doesn't exist
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        formGroup.appendChild(errorDiv);
    }

    if (!isValid) {
        field.classList.add('error');
        field.classList.remove('valid');
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
    } else {
        field.classList.remove('error');
        field.classList.add('valid');
        errorDiv.style.display = 'none';
    }
}

// Clear field error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    const errorDiv = formGroup.querySelector('.field-error');

    field.classList.remove('error');
    field.classList.remove('valid');

    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

