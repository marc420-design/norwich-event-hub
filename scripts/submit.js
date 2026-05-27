// Event Submission Form JavaScript with real-time validation.

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('eventSubmissionForm');
    const formMessage = document.getElementById('formMessage');

    if (!form || !formMessage) {
        return;
    }

    const startDateInput = document.getElementById('eventDate');
    const endDateInput = document.getElementById('eventEndDate');

    if (startDateInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.setAttribute('min', today);

        if (endDateInput) {
            endDateInput.setAttribute('min', startDateInput.value || today);
            startDateInput.addEventListener('change', function() {
                endDateInput.setAttribute('min', this.value || today);
                if (endDateInput.value && this.value && makeLocalDate(endDateInput.value) < makeLocalDate(this.value)) {
                    endDateInput.value = '';
                    validateField(endDateInput, false, 'End date cannot be before the start date');
                }
            });
        }
    }

    setupRealTimeValidation();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const flyer = formData.get('eventFlyer');
        const eventData = {
            name: valueOf(formData, 'eventName'),
            date: valueOf(formData, 'eventDate'),
            startDate: valueOf(formData, 'eventDate'),
            endDate: valueOf(formData, 'eventEndDate'),
            time: valueOf(formData, 'eventTime'),
            openingTimes: valueOf(formData, 'openingTimes'),
            location: valueOf(formData, 'eventLocation'),
            category: valueOf(formData, 'eventCategory'),
            description: valueOf(formData, 'eventDescription'),
            ticketLink: valueOf(formData, 'ticketLink'),
            price: valueOf(formData, 'eventPrice'),
            vibe: valueOf(formData, 'eventVibe'),
            crowdType: valueOf(formData, 'crowdType'),
            bestFor: valueOf(formData, 'bestFor'),
            promoterName: valueOf(formData, 'promoterName'),
            promoterEmail: valueOf(formData, 'promoterEmail'),
            promoterPhone: valueOf(formData, 'promoterPhone'),
            flyerName: flyer && flyer.name ? flyer.name : '',
            flyerType: flyer && flyer.type ? flyer.type : '',
            flyerSize: flyer && flyer.size ? flyer.size : ''
        };

        if (!validateForm(eventData)) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        try {
            const result = await submitEvent(eventData);

            if (result && result.success === false) {
                throw new Error(result.message || 'Submission failed');
            }

            showFormMessage('success', 'Thank you! Your event has been submitted successfully. You will receive a confirmation email shortly.');
            form.reset();
            clearAllFieldStates(form);
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            showFormMessage('error', 'There was an error submitting your event. Please try again or email submit@norwicheventshub.com');
            console.error('Submission error:', error);
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
});

function valueOf(formData, key) {
    const value = formData.get(key);
    return typeof value === 'string' ? value.trim() : '';
}

function makeLocalDate(value) {
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function showFormMessage(type, message) {
    const formMessage = document.getElementById('formMessage');
    formMessage.className = `form-message ${type}`;
    formMessage.textContent = message;
    formMessage.style.display = 'block';
}

function validateForm(data) {
    if (!data.name || !data.date || !data.location || !data.category || !data.description || !data.price || !data.promoterName || !data.promoterEmail) {
        showFormMessage('error', 'Please fill in all required fields.');
        return false;
    }

    const startDate = makeLocalDate(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
        showFormMessage('error', 'Event start date cannot be in the past.');
        return false;
    }

    if (data.endDate && makeLocalDate(data.endDate) < startDate) {
        showFormMessage('error', 'Event end date cannot be before the start date.');
        return false;
    }

    if (data.ticketLink && !isValidUrl(data.ticketLink)) {
        showFormMessage('error', 'Please enter a valid website, ticket, or info link.');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.promoterEmail)) {
        showFormMessage('error', 'Please enter a valid email address.');
        return false;
    }

    return true;
}

async function submitEvent(eventData) {
    if (typeof submitEventToAPI !== 'undefined') {
        return await submitEventToAPI(eventData);
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Event submitted:', eventData);
            resolve({ success: true, eventId: Date.now() });
        }, 1000);
    });
}

function setupRealTimeValidation() {
    const eventName = document.getElementById('eventName');
    if (eventName) {
        eventName.addEventListener('blur', function() {
            validateField(this, this.value.trim().length >= 3, 'Event name must be at least 3 characters');
        });
    }

    const eventDate = document.getElementById('eventDate');
    if (eventDate) {
        eventDate.addEventListener('change', function() {
            const eventDateVal = makeLocalDate(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            validateField(this, eventDateVal >= today, 'Event start date cannot be in the past');
        });
    }

    const eventEndDate = document.getElementById('eventEndDate');
    if (eventEndDate) {
        eventEndDate.addEventListener('change', function() {
            const startValue = document.getElementById('eventDate').value;
            const isValid = !this.value || !startValue || makeLocalDate(this.value) >= makeLocalDate(startValue);
            validateField(this, isValid, 'End date cannot be before the start date');
        });
    }

    const eventLocation = document.getElementById('eventLocation');
    if (eventLocation) {
        eventLocation.addEventListener('blur', function() {
            validateField(this, this.value.trim().length >= 3, 'Please enter a valid location');
        });
    }

    const eventCategory = document.getElementById('eventCategory');
    if (eventCategory) {
        eventCategory.addEventListener('change', function() {
            validateField(this, this.value !== '', 'Please select a category');
        });
    }

    const eventDescription = document.getElementById('eventDescription');
    if (eventDescription) {
        eventDescription.addEventListener('blur', function() {
            validateField(this, this.value.trim().length >= 10, 'Description must be at least 10 characters');
        });
    }

    const eventPrice = document.getElementById('eventPrice');
    if (eventPrice) {
        eventPrice.addEventListener(eventPrice.tagName === 'SELECT' ? 'change' : 'blur', function() {
            validateField(this, this.value.trim().length > 0, 'Please enter the entry price, Free, Donation, or TBC');
        });
    }

    const promoterEmail = document.getElementById('promoterEmail');
    if (promoterEmail) {
        promoterEmail.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            validateField(this, emailRegex.test(this.value), 'Please enter a valid email address');
        });
    }

    const promoterPhone = document.getElementById('promoterPhone');
    if (promoterPhone) {
        promoterPhone.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                const phoneRegex = /^[\d\s\-+()]{10,}$/;
                validateField(this, phoneRegex.test(this.value), 'Please enter a valid phone number');
            } else {
                clearFieldError(this);
            }
        });
    }

    const eventFlyer = document.getElementById('eventFlyer');
    if (eventFlyer) {
        eventFlyer.addEventListener('change', function() {
            if (this.files.length > 0) {
                const file = this.files[0];
                const maxSize = 5 * 1024 * 1024;
                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
                const extension = file.name.split('.').pop().toLowerCase();

                if (file.size > maxSize) {
                    validateField(this, false, 'File size must be less than 5MB');
                    this.value = '';
                } else if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
                    validateField(this, false, 'Only JPG, JPEG, PNG, and WEBP files are allowed');
                    this.value = '';
                } else {
                    validateField(this, true, '');
                }
            }
        });
    }

    const ticketLink = document.getElementById('ticketLink');
    if (ticketLink) {
        ticketLink.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                validateField(this, isValidUrl(this.value), 'Please enter a valid URL (e.g., https://example.com)');
            } else {
                clearFieldError(this);
            }
        });
    }
}

function isValidUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function validateField(field, isValid, errorMessage) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) {
        return;
    }

    let errorDiv = formGroup.querySelector('.field-error');
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

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    const errorDiv = formGroup ? formGroup.querySelector('.field-error') : null;

    field.classList.remove('error');
    field.classList.remove('valid');

    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function clearAllFieldStates(form) {
    form.querySelectorAll('.error, .valid').forEach(field => field.classList.remove('error', 'valid'));
    form.querySelectorAll('.field-error').forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
}
