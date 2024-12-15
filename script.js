// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, (error) => {
            console.log('ServiceWorker registration failed: ', error);
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const saveButton = document.getElementById('saveButton');
    const measurementsContainer = document.getElementById('measurements_container');
    const searchInput = document.getElementById('searchInput'); // Main search input
    const toggleButton = document.querySelector('.toggle-button');
    const collapsibleContent = document.querySelector('.collapsible-content');
    let editingIndex = null; // To track which measurement is being edited

    // Initialize collapsible content visibility
    collapsibleContent.style.display = 'none'; // Ensure it's hidden initially

    // Function to handle search functionality
    const handleSearch = (input) => {
        const searchTerm = input.value.toLowerCase();
        const measurementCards = document.querySelectorAll('.measurement-card');

        // Iterate through each measurement card
        measurementCards.forEach(card => {
            const clientName = card.querySelector('h3').textContent.toLowerCase();
            if (clientName.includes(searchTerm)) {
                card.style.display = ''; // Show matching card
                card.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to the card
            } else {
                card.style.display = 'none'; // Hide non-matching card
            }
        });
    };

    // Add event listeners for both search inputs
    searchInput.addEventListener('input', () => handleSearch(searchInput));
    

    // Toggle the collapsible content
    toggleButton.addEventListener('click', () => {
        if (collapsibleContent.style.display === 'none' || collapsibleContent.style.display === '') {
            collapsibleContent.style.display = 'block'; // Show the form
        } else {
            collapsibleContent.style.display = 'none'; // Hide the form
        }
    });

    // Function to generate measurement rows
    function generateMeasurementRows(measurement) {
        const measurementFields = [
            { label: 'Head', key: 'head' },
            { label: 'Shoulder to Shoulder', key: 'shoulderToShoulder' },
            { label: 'Neck', key: 'neck' },
            { label: 'Chest', key: 'chest' },
            { label: 'Waist', key: 'waist' },
            { label: 'Shoulder to Nipple', key: 'shoulderToNipple' },
            { label: 'Shoulder to Underbust', key: 'shoulderToUnderbust' },
            { label: 'Shoulder to Waist', key: 'shoulderToWaist' },
            { label: 'Nipple to Nipple', key: 'nippleToNipple' },
            { label: 'Sleeve Length', key: 'sleeveLength' },
            { label: 'Round Sleeve', key: 'roundSleeve' },
            { label: 'Hip', key: 'hip' },
            { label: 'Half Length', key: 'halfLength' },
            { label: 'Top Length', key: 'topLength' },
            { label: 'Gown Length', key: 'gownLength' },
            { label: 'Trouser Waist', key: 'trouserWaist' },
            { label: 'Crotch', key: 'crotch' },
            { label: 'Trouser Length', key: 'trouserLength' },
            { label: 'Thigh', key: 'thigh' },
            { label: 'Waist to Knee', key: 'waistToKnee' },
            { label: 'Calf', key: 'calf' },
            { label: 'Ankle', key: 'ankle' },
            { label: 'Inside Leg Seam', key: 'insideLegSeam' }
        ];

        return measurementFields.map(field => 
            `<tr><td>${field.label}:</td><td>${measurement[field.key] || 'N/A'}</td></tr>`
        ).join('');
    }

    // Load existing measurements from localStorage on page load
    function loadMeasurements() {
        // Clear existing measurements
        measurementsContainer.innerHTML = '';

        // Retrieve measurements from localStorage
        const measurements = JSON.parse(localStorage.getItem('clientMeasurements')) || [];

        // Reverse to show most recent first
        measurements.reverse().forEach((measurement, index) => {
            // Create measurement card
            const measurementCard = document.createElement('div');
            measurementCard.classList.add('measurement-card');
            
            measurementCard.innerHTML = `
                <h3><span class="label">Client:</span> <span class="value">${measurement.name}</span></h3>
                <p><strong class="label">Phone:</strong> <span class="value">${measurement.phone}</span></p>
                <p><strong>Recorded:</strong> ${measurement.timestamp}</p>
                <details>
                    <summary>View Detailed Measurements</summary>
                    <table>
                        ${generateMeasurementRows(measurement)}
                    </table>
                    ${measurement.comments ? `<p><strong>Comments:</strong> ${measurement.comments}</p>` : ''}
                </details>
                <div class="card-actions">
                    <button onclick="editMeasurement(${index})">Edit</button>
                    <button onclick="deleteMeasurement(${index})">Delete</button>
                </div>
            `;

            measurementsContainer.appendChild(measurementCard);
        });
    }

    // Save measurements function
    function saveMeasurements() {
        // Get form data
        const formData = new FormData(form);
        const measurementData = {};
        const requiredFields = ['name', 'phone'];

        for (const field of requiredFields) {
            const input = form.querySelector(`[name="${field}"]`);
            if (!input.value) {
                alert(`${field} is required.`);
                return; // Stop further execution
            }
        }

        const phoneInput = form.querySelector('[name="phone"]');
        if (phoneInput.value.length < 11) {
            alert('Phone number must be at least 11 digits long.');
            return; // Stop further execution
        }

        // Convert FormData to an object
        for (let [key, value] of formData.entries()) {
            measurementData[key] = value;
        }

        // Add timestamp
        measurementData.timestamp = new Date().toLocaleString();

        // Retrieve existing measurements from localStorage
        let measurements = JSON.parse(localStorage.getItem('clientMeasurements')) || [];

        // Check if we're editing an existing measurement
        if (editingIndex !== null) {
            // Update existing measurement
            measurements[editingIndex] = measurementData;
            editingIndex = null;
        } else {
            // Add new measurement
            measurements.push(measurementData);
        }

        // Save to localStorage
        localStorage.setItem('clientMeasurements', JSON.stringify(measurements));

        // Refresh display
        loadMeasurements();

        // Reset form
        form.reset();
    }

    // Edit measurement function
    function editMeasurement(index) {
        // Retrieve measurements from localStorage
        let measurements = JSON.parse(localStorage.getItem('clientMeasurements')) || [];
        
        // Reverse the measurements for display purposes only
        const reversedMeasurements = [...measurements].reverse();
        
        // Get the measurement to edit
        const measurementToEdit = reversedMeasurements[index];
    
        // Populate form with existing data
        for (let [key, value] of Object.entries(measurementToEdit)) {
            const formField = document.querySelector(`[name="${key}"]`);
            if (formField) {
                formField.value = value;
            }
        }
    
        // Set editing index to the original index
        editingIndex = measurements.length - 1 - index; // Calculate the original index
    
        // Optional: Scroll to top of the form
        form.scrollIntoView({ behavior: 'smooth' });
    }

    // Delete measurement function
    function deleteMeasurement(index) {
        let measurements = JSON.parse(localStorage.getItem('clientMeasurements')) || [];
        measurements.reverse().splice(index, 1);
        localStorage.setItem('clientMeasurements', JSON.stringify(measurements.reverse()));
        loadMeasurements();
    }

    
    // Add event listeners
    saveButton.addEventListener('click', saveMeasurements);

    // Load measurements on page load
    loadMeasurements();

    // Expose functions globally
    window.editMeasurement = editMeasurement;
    window.deleteMeasurement = deleteMeasurement;
});