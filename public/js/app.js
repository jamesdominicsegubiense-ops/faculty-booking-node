(function () {
    const SCHEDULES = window.SCHEDULES || {};
    const DAY_INDEX = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };

    function nextDateFor(dayName) {
        const target = DAY_INDEX[dayName];
        if (target === undefined) return null;
        const today = new Date(); today.setHours(0,0,0,0);
        let diff = (target - today.getDay() + 7) % 7;
        if (diff === 0) diff = 7;
        const d = new Date(today); d.setDate(today.getDate() + diff);
        return d;
    }
    function toISO(d) {
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
    function fmtTime(t) { return String(t).slice(0,5); }

    document.addEventListener('click', function (ev) {
        const btn = ev.target.closest('.js-book');
        if (!btn) return;
        ev.preventDefault();

        const card = btn.closest('.faculty-card');
        const id = card.getAttribute('data-faculty-id');
        const name = card.getAttribute('data-faculty-name');

        document.getElementById('facultyId').value = id;
        document.getElementById('scheduleId').value = '';
        document.getElementById('modalFaculty').textContent = name;
        document.getElementById('formMsg').textContent = '';
        document.getElementById('formMsg').className = 'form-msg';
        document.getElementById('bookingForm').reset();
        document.getElementById('facultyId').value = id;

        const slotList = document.getElementById('slotList');
        slotList.innerHTML = '';
        const slots = SCHEDULES[id] || [];

        if (!slots.length) {
            slotList.innerHTML = '<p class="empty-slots">No published consultation hours yet.</p>';
        } else {
            slots.forEach(function (s) {
                const d = s.slot_date ? new Date(s.slot_date + 'T00:00:00') : nextDateFor(s.day_of_week);
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'slot-btn';
                btn.setAttribute('data-schedule-id', s.id);
                btn.setAttribute('data-date', d ? toISO(d) : '');
                const label = s.slot_date
                    ? new Date(s.slot_date + 'T00:00:00').toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' })
                    : s.day_of_week;
                btn.innerHTML = '<span class="slot-day">' + label + '</span>' +
                    '<span class="slot-time">' + fmtTime(s.start_time) + ' – ' + fmtTime(s.end_time) + '</span>';
                slotList.appendChild(btn);
            });
        }

        document.getElementById('bookingModal').style.display = 'grid';
        document.body.classList.add('modal-open');
    });

    document.addEventListener('click', function (ev) {
        const slotBtn = ev.target.closest('.slot-btn');
        if (!slotBtn) return;
        const slotList = document.getElementById('slotList');
        slotList.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('is-selected'));
        slotBtn.classList.add('is-selected');
        document.getElementById('scheduleId').value = slotBtn.getAttribute('data-schedule-id');
        document.getElementById('bookingDate').value = slotBtn.getAttribute('data-date');
    });

    window.closeBookingModal = function () {
        document.getElementById('bookingModal').style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') window.closeBookingModal();
    });

    window.submitBooking = function (ev) {
        ev.preventDefault();
        const scheduleId = document.getElementById('scheduleId').value;
        const msgBox = document.getElementById('formMsg');

        if (!scheduleId) {
            msgBox.textContent = 'Please pick a time slot first.';
            msgBox.className = 'form-msg is-error';
            return false;
        }

        const submitBtn = document.getElementById('submitBtn');
        const original = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
        msgBox.textContent = '';

        const formData = new FormData(document.getElementById('bookingForm'));

        fetch('/book-action', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                msgBox.textContent = data.message;
                msgBox.className = 'form-msg ' + (data.ok ? 'is-success' : 'is-error');
                if (data.ok) {
                    document.querySelector('input[name="purpose"]').value = '';
                    document.querySelector('textarea[name="notes"]').value = '';
                }
            })
            .catch(() => {
                msgBox.textContent = 'Network error. Please try again.';
                msgBox.className = 'form-msg is-error';
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = original;
            });

        return false;
    };
})();

function togglePassword(id, btn) {
    const inp = document.getElementById(id);
    if (!inp) return;
    if (inp.type === 'password') {
        inp.type = 'text';
        btn.classList.add('is-visible');
    } else {
        inp.type = 'password';
        btn.classList.remove('is-visible');
    }
}