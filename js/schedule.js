/**
 * Flemington Footy Academy – schedule.js
 * Interactive calendar with time-slot booking
 */

(function () {
  'use strict';

  /* ── Data ────────────────────────────────────────────────── */
  // Available time windows (hour in 24h). Edit these to change operating hours.
  const AVAILABLE_HOURS = [8, 9, 10, 11, 13, 14, 15, 16, 17];

  // Available days of week (0=Sun, 1=Mon … 6=Sat). Currently Mon–Sat.
  const AVAILABLE_DAYS = [1, 2, 3, 4, 5, 6];

  const SERVICES = [
    { id: 'speed',      name: 'Speed & Agility',          price: '$50/hr' },
    { id: 'sport',      name: 'Sport Specific Training',   price: '$70/hr' },
    { id: 'group2',     name: 'Small Group (2 people)',    price: '$120/hr' },
    { id: 'group3',     name: 'Small Group (3 people)',    price: '$180/hr' },
  ];

  const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  /**
   * Fake "booked" slots stored in sessionStorage so they persist within the
   * browsing session but reset on page reload (suitable for demo / offline use).
   * Key: "YYYY-MM-DD_HH" → value: true
   */
  function getBookedKey(date, hour) {
    return `booked_${date}_${hour}`;
  }
  function isBooked(date, hour) {
    return sessionStorage.getItem(getBookedKey(date, hour)) === 'true';
  }
  function markBooked(date, hour) {
    sessionStorage.setItem(getBookedKey(date, hour), 'true');
  }

  /* ── State ───────────────────────────────────────────────── */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;
  let selectedHour  = null;
  let selectedService = SERVICES[0];

  /* ── Helpers ─────────────────────────────────────────────── */
  function toDateStr(year, month, day) {
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  }

  function formatTime(hour) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${suffix}`;
  }

  function dayHasAvailableSlots(year, month, day) {
    const dt = new Date(year, month, day);
    if (!AVAILABLE_DAYS.includes(dt.getDay())) return false;
    const dt2 = new Date(year, month, day);
    dt2.setHours(0,0,0,0);
    if (dt2 < today) return false;
    const dateStr = toDateStr(year, month, day);
    return AVAILABLE_HOURS.some(h => !isBooked(dateStr, h));
  }

  /* ── Render Calendar ─────────────────────────────────────── */
  function renderCalendar() {
    const titleEl  = document.getElementById('calMonthYear');
    const daysEl   = document.getElementById('calDays');
    if (!titleEl || !daysEl) return;

    titleEl.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    daysEl.innerHTML = '';

    const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day other-month';
      daysEl.appendChild(blank);
    }

    for (let d = 1; d <= totalDays; d++) {
      const cell = document.createElement('div');
      const dateStr = toDateStr(viewYear, viewMonth, d);
      const dt = new Date(viewYear, viewMonth, d);
      dt.setHours(0,0,0,0);
      const isPast = dt < today;
      const isToday = dt.getTime() === today.getTime();
      const hasSlots = dayHasAvailableSlots(viewYear, viewMonth, d);

      let classes = ['cal-day'];
      if (isPast)      classes.push('past');
      if (isToday)     classes.push('today');
      if (hasSlots && !isPast) classes.push('has-slots');
      if (selectedDate === dateStr) classes.push('selected');

      cell.className = classes.join(' ');
      cell.textContent = d;
      cell.dataset.date = dateStr;

      if (hasSlots && !isPast) {
        cell.addEventListener('click', () => selectDate(dateStr));
      }

      daysEl.appendChild(cell);
    }
  }

  /* ── Select a Date ───────────────────────────────────────── */
  function selectDate(dateStr) {
    selectedDate = dateStr;
    selectedHour = null;
    renderCalendar();
    renderSlots();
  }

  /* ── Render Time Slots ───────────────────────────────────── */
  function renderSlots() {
    const panel = document.getElementById('slotsPanel');
    const dateEl = document.getElementById('slotsDate');
    const countEl = document.getElementById('slotsCount');
    const bodyEl  = document.getElementById('slotsBody');
    if (!panel || !bodyEl) return;

    if (!selectedDate) {
      panel.style.display = 'none';
      return;
    }

    panel.style.display = 'block';

    if (dateEl) dateEl.textContent = formatDate(selectedDate);

    const availableSlots = AVAILABLE_HOURS.filter(h => !isBooked(selectedDate, h));
    if (countEl) countEl.textContent = `${availableSlots.length} slot${availableSlots.length !== 1 ? 's' : ''} available`;

    if (availableSlots.length === 0) {
      bodyEl.innerHTML = `
        <div class="no-slots-msg">
          <div class="no-slots-icon">📅</div>
          <p>No available slots on this day.<br>Please select another date.</p>
        </div>`;
      return;
    }

    bodyEl.innerHTML = '';
    AVAILABLE_HOURS.forEach(hour => {
      const booked = isBooked(selectedDate, hour);
      const slot = document.createElement('div');
      slot.className = `time-slot${booked ? ' booked' : ''}`;

      slot.innerHTML = `
        <div>
          <div class="slot-time">${formatTime(hour)} – ${formatTime(hour + 1)}</div>
          <div class="slot-type">${selectedService.name}</div>
        </div>
        <span class="slot-status ${booked ? 'booked' : 'available'}">
          ${booked ? 'Booked' : 'Available'}
        </span>`;

      if (!booked) {
        slot.addEventListener('click', () => openBookingModal(selectedDate, hour));
      }

      bodyEl.appendChild(slot);
    });
  }

  /* ── Booking Modal ───────────────────────────────────────── */
  function openBookingModal(dateStr, hour) {
    selectedHour = hour;

    const overlay = document.getElementById('bookingModal');
    const dateDisp = document.getElementById('modalDate');
    const timeDisp = document.getElementById('modalTime');
    const svcDisp  = document.getElementById('modalService');
    const priceDisp = document.getElementById('modalPrice');

    if (dateDisp)  dateDisp.textContent  = formatDate(dateStr);
    if (timeDisp)  timeDisp.textContent  = `${formatTime(hour)} – ${formatTime(hour + 1)}`;
    if (svcDisp)   svcDisp.textContent   = selectedService.name;
    if (priceDisp) priceDisp.textContent = selectedService.price;

    // Make sure the booking form is visible and success screen is hidden
    const formEl    = document.getElementById('bookingForm');
    const successEl = document.getElementById('bookingSuccess');
    if (formEl)    formEl.style.display = '';
    if (successEl) successEl.style.display = 'none';

    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeBookingModal() {
    const overlay = document.getElementById('bookingModal');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /* ── Submit Booking ──────────────────────────────────────── */
  function submitBooking(e) {
    e.preventDefault();

    const btn = document.getElementById('confirmBookingBtn');
    if (btn) { btn.textContent = 'Confirming…'; btn.disabled = true; }

    setTimeout(() => {
      // Mark the slot as booked
      markBooked(selectedDate, selectedHour);

      // Fill success screen
      const succName    = document.getElementById('succName');
      const succDate    = document.getElementById('succDate');
      const succTime    = document.getElementById('succTime');
      const succService = document.getElementById('succService');
      const succPrice   = document.getElementById('succPrice');
      const nameInput   = document.getElementById('bookingName');

      if (succName && nameInput) succName.textContent = nameInput.value;
      if (succDate)    succDate.textContent    = formatDate(selectedDate);
      if (succTime)    succTime.textContent    = `${formatTime(selectedHour)} – ${formatTime(selectedHour + 1)}`;
      if (succService) succService.textContent = selectedService.name;
      if (succPrice)   succPrice.textContent   = selectedService.price;

      const formEl    = document.getElementById('bookingForm');
      const successEl = document.getElementById('bookingSuccess');
      if (formEl)    formEl.style.display = 'none';
      if (successEl) successEl.style.display = 'block';

      if (btn) { btn.textContent = 'Confirm Booking'; btn.disabled = false; }

      // Refresh calendar and slots
      renderCalendar();
      renderSlots();
    }, 1000);
  }

  /* ── Service Selector ────────────────────────────────────── */
  function initServiceSelector() {
    document.querySelectorAll('.service-select-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.service-select-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const id = opt.dataset.service;
        selectedService = SERVICES.find(s => s.id === id) || SERVICES[0];
        renderSlots();
      });
    });

    // Set first as active
    const first = document.querySelector('.service-select-option');
    if (first) first.classList.add('active');
  }

  /* ── Navigation Buttons ──────────────────────────────────── */
  function initNavButtons() {
    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        viewMonth--;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        viewMonth++;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        renderCalendar();
      });
    }
  }

  /* ── Modal Events ────────────────────────────────────────── */
  function initModal() {
    const overlay = document.getElementById('bookingModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const cancelBtn = document.getElementById('cancelBookingBtn');
    const bookingFormEl = document.getElementById('bookingFormEl');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    if (closeBtn)  closeBtn.addEventListener('click', closeBookingModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeBookingModal);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeBookingModal);

    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) closeBookingModal();
      });
    }

    if (bookingFormEl) bookingFormEl.addEventListener('submit', submitBooking);
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    const slotsPanel = document.getElementById('slotsPanel');
    if (slotsPanel) slotsPanel.style.display = 'none';

    initNavButtons();
    initServiceSelector();
    initModal();
    renderCalendar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
