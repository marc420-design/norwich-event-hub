// Event Submission Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('eventSubmissionForm');
    const formMessage = document.getElementById('formMessage');
    
    // Set minimum date to today
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
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

