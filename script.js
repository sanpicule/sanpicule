// Available timezones with their IANA names
const AVAILABLE_TIMEZONES = [
    { name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
    { name: 'New York', timezone: 'America/New_York', country: 'USA' },
    { name: 'London', timezone: 'Europe/London', country: 'UK' },
    { name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
    { name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'USA' },
    { name: 'Paris', timezone: 'Europe/Paris', country: 'France' },
    { name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
    { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'China' },
    { name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' },
    { name: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India' },
    { name: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil' },
    { name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia' },
    { name: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt' },
    { name: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea' },
    { name: 'Toronto', timezone: 'America/Toronto', country: 'Canada' },
    { name: 'Mexico City', timezone: 'America/Mexico_City', country: 'Mexico' },
    { name: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand' },
    { name: 'Istanbul', timezone: 'Europe/Istanbul', country: 'Turkey' },
    { name: 'Amsterdam', timezone: 'Europe/Amsterdam', country: 'Netherlands' }
];

// State management
let activeTimezones = [];
let is24HourFormat = false;
let updateInterval = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Load default timezones
    activeTimezones = [
        AVAILABLE_TIMEZONES.find(tz => tz.name === 'Tokyo'),
        AVAILABLE_TIMEZONES.find(tz => tz.name === 'New York'),
        AVAILABLE_TIMEZONES.find(tz => tz.name === 'London'),
        AVAILABLE_TIMEZONES.find(tz => tz.name === 'Sydney'),
        AVAILABLE_TIMEZONES.find(tz => tz.name === 'Dubai')
    ];

    // Load saved preferences from localStorage
    loadPreferences();
    
    // Render initial clocks
    renderClocks();
    
    // Start clock updates
    startClockUpdates();
    
    // Setup event listeners
    setupEventListeners();
    
    // Populate timezone modal
    populateTimezoneList();
});

// Load preferences from localStorage
function loadPreferences() {
    const savedFormat = localStorage.getItem('clockFormat');
    if (savedFormat !== null) {
        is24HourFormat = savedFormat === '24';
        updateFormatButton();
    }
    
    const savedTimezones = localStorage.getItem('activeTimezones');
    if (savedTimezones) {
        try {
            const timezoneNames = JSON.parse(savedTimezones);
            const loadedTimezones = timezoneNames
                .map(name => AVAILABLE_TIMEZONES.find(tz => tz.timezone === name))
                .filter(tz => tz !== undefined);
            
            if (loadedTimezones.length > 0) {
                activeTimezones = loadedTimezones;
            }
        } catch (e) {
            console.error('Error loading saved timezones:', e);
        }
    }
}

// Save preferences to localStorage
function savePreferences() {
    localStorage.setItem('clockFormat', is24HourFormat ? '24' : '12');
    const timezoneNames = activeTimezones.map(tz => tz.timezone);
    localStorage.setItem('activeTimezones', JSON.stringify(timezoneNames));
}

// Setup event listeners
function setupEventListeners() {
    const toggleFormatBtn = document.getElementById('toggleFormat');
    const addTimezoneBtn = document.getElementById('addTimezone');
    const closeModalBtn = document.getElementById('closeModal');
    const modal = document.getElementById('timezoneModal');
    const searchInput = document.getElementById('timezoneSearch');
    
    toggleFormatBtn.addEventListener('click', toggleTimeFormat);
    addTimezoneBtn.addEventListener('click', openTimezoneModal);
    closeModalBtn.addEventListener('click', closeTimezoneModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTimezoneModal();
        }
    });
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        filterTimezones(e.target.value);
    });
}

// Toggle time format
function toggleTimeFormat() {
    is24HourFormat = !is24HourFormat;
    updateFormatButton();
    renderClocks();
    savePreferences();
}

// Update format button text
function updateFormatButton() {
    const formatText = document.getElementById('formatText');
    formatText.textContent = is24HourFormat ? '12-Hour' : '24-Hour';
}

// Open timezone modal
function openTimezoneModal() {
    const modal = document.getElementById('timezoneModal');
    modal.classList.add('active');
    document.getElementById('timezoneSearch').value = '';
    filterTimezones('');
}

// Close timezone modal
function closeTimezoneModal() {
    const modal = document.getElementById('timezoneModal');
    modal.classList.remove('active');
}

// Populate timezone list in modal
function populateTimezoneList(filteredTimezones = AVAILABLE_TIMEZONES) {
    const timezoneList = document.getElementById('timezoneList');
    timezoneList.innerHTML = '';
    
    filteredTimezones.forEach(tz => {
        // Check if timezone is already active
        const isActive = activeTimezones.some(active => active.timezone === tz.timezone);
        
        if (!isActive) {
            const option = document.createElement('div');
            option.className = 'timezone-option';
            option.innerHTML = `
                <div>
                    <div class="timezone-name">${tz.name}</div>
                    <div class="timezone-offset">${tz.country} • ${getTimezoneOffset(tz.timezone)}</div>
                </div>
            `;
            option.addEventListener('click', () => addTimezone(tz));
            timezoneList.appendChild(option);
        }
    });
    
    if (timezoneList.children.length === 0) {
        timezoneList.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px;">No timezones available</div>';
    }
}

// Filter timezones based on search
function filterTimezones(searchTerm) {
    const filtered = AVAILABLE_TIMEZONES.filter(tz => 
        tz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tz.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    populateTimezoneList(filtered);
}

// Add timezone
function addTimezone(timezone) {
    activeTimezones.push(timezone);
    renderClocks();
    closeTimezoneModal();
    savePreferences();
}

// Remove timezone
function removeTimezone(index) {
    if (activeTimezones.length > 1) {
        activeTimezones.splice(index, 1);
        renderClocks();
        savePreferences();
    } else {
        alert('You must have at least one timezone displayed.');
    }
}

// Get timezone offset string
function getTimezoneOffset(timezone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || '';
    
    // Calculate UTC offset
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate - utcDate) / (1000 * 60 * 60);
    
    const sign = offset >= 0 ? '+' : '';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.abs((offset % 1) * 60);
    
    return `UTC${sign}${offset >= 0 ? hours : -hours}${minutes > 0 ? ':' + minutes.toString().padStart(2, '0') : ''} (${timeZoneName})`;
}

// Format time
function formatTime(date, timezone) {
    const options = {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24HourFormat
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

// Get date info
function getDateInfo(date, timezone) {
    const dateOptions = {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', dateOptions).format(date);
}

// Render all clocks
function renderClocks() {
    const clocksGrid = document.getElementById('clocksGrid');
    clocksGrid.innerHTML = '';
    
    activeTimezones.forEach((tz, index) => {
        const clockCard = createClockCard(tz, index);
        clocksGrid.appendChild(clockCard);
    });
    
    updateClocks();
}

// Create clock card element
function createClockCard(timezone, index) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.dataset.index = index;
    
    const now = new Date();
    const timeString = formatTime(now, timezone.timezone);
    const dateString = getDateInfo(now, timezone.timezone);
    const offset = getTimezoneOffset(timezone.timezone);
    
    // Extract time and period (AM/PM)
    let displayTime = timeString;
    let period = '';
    
    if (!is24HourFormat) {
        const parts = timeString.split(' ');
        displayTime = parts[0];
        period = parts[1] || '';
    }
    
    card.innerHTML = `
        <div class="clock-header">
            <div class="timezone-info">
                <h2>${timezone.name}</h2>
                <div class="timezone-details">${offset}</div>
            </div>
            <button class="remove-btn" data-index="${index}">×</button>
        </div>
        <div class="time-display">
            <span class="time">${displayTime}</span>${period ? `<span class="period">${period}</span>` : ''}
        </div>
        <div class="date-display">
            <div class="day-of-week">${dateString}</div>
        </div>
    `;
    
    // Add remove button event listener
    const removeBtn = card.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => removeTimezone(index));
    
    return card;
}

// Update all clocks
function updateClocks() {
    const cards = document.querySelectorAll('.clock-card');
    
    cards.forEach(card => {
        const index = parseInt(card.dataset.index);
        const timezone = activeTimezones[index];
        
        if (timezone) {
            const now = new Date();
            const timeString = formatTime(now, timezone.timezone);
            const dateString = getDateInfo(now, timezone.timezone);
            
            // Extract time and period
            let displayTime = timeString;
            let period = '';
            
            if (!is24HourFormat) {
                const parts = timeString.split(' ');
                displayTime = parts[0];
                period = parts[1] || '';
            }
            
            // Update time
            const timeElement = card.querySelector('.time');
            const periodElement = card.querySelector('.period');
            
            if (timeElement.textContent !== displayTime) {
                timeElement.textContent = displayTime;
                timeElement.classList.add('pulse');
                setTimeout(() => timeElement.classList.remove('pulse'), 300);
            }
            
            if (periodElement) {
                periodElement.textContent = period;
            }
            
            // Update date
            const dateElement = card.querySelector('.day-of-week');
            dateElement.textContent = dateString;
        }
    });
}

// Start clock updates
function startClockUpdates() {
    // Update immediately
    updateClocks();
    
    // Update every second
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    updateInterval = setInterval(updateClocks, 1000);
}

// Stop clock updates (cleanup)
function stopClockUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', stopClockUpdates);
