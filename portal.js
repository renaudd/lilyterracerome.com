// Portal Data & Logic Engine for Gigliopad / Lily Terrace
// Manages Members, Calendar (Sept 2026 - Aug 2028), Requests, Admin, and Guestbook

const STORAGE_KEY = 'roma_portal_db_v1';
const SESSION_KEY = 'roma_portal_session_v1';

// Initial Seed Data
const INITIAL_DB = {
    users: [
        {
            id: 'admin_1',
            username: 'admin',
            password: 'password',
            name: 'Property Administrator',
            email: 'admin@gigliopad.com',
            phone: '+39 06 6880 1234',
            role: 'admin',
            joinedDate: '2026-01-01',
            notes: 'System administrator and host manager'
        },
        {
            id: 'user_1',
            username: 'elena',
            password: 'password',
            name: 'Elena Rostova',
            email: 'elena.rostova@example.com',
            phone: '+39 340 555 0192',
            role: 'member',
            joinedDate: '2026-02-15',
            notes: 'Art historian, frequent guest. Loves the morning light.'
        },
        {
            id: 'user_2',
            username: 'marco',
            password: 'password',
            name: 'Marco Bellini',
            email: 'marco.bellini@example.com',
            phone: '+39 333 444 8821',
            role: 'member',
            joinedDate: '2026-03-10',
            notes: 'Architect from Milan. Prefers longer spring stays.'
        },
        {
            id: 'user_3',
            username: 'sophie',
            password: 'password',
            name: 'Sophie Laurent',
            email: 'sophie.laurent@example.com',
            phone: '+33 6 12 34 56 78',
            role: 'member',
            joinedDate: '2026-04-01',
            notes: 'Parisian writer working on a Roman novel.'
        },
        {
            id: 'user_4',
            username: 'guest1',
            password: 'password',
            name: 'Julian Sterling',
            email: 'julian.sterling@example.com',
            phone: '+1 (415) 890-2341',
            role: 'member',
            joinedDate: '2026-05-12',
            notes: 'San Francisco collector and patron.'
        }
    ],
    events: [
        {
            id: 'evt_1',
            userId: 'user_1',
            username: 'elena',
            guestName: 'Elena Rostova',
            startDate: '2026-10-12',
            endDate: '2026-10-18',
            status: 'reserved',
            guestCount: 2,
            notes: 'Autumn art research in Campo Marzio.',
            createdAt: '2026-08-01 10:30',
            adminNotes: 'Approved by Admin'
        },
        {
            id: 'evt_2',
            userId: 'admin_block',
            username: 'admin',
            guestName: 'Owner Stay / Maintenance',
            startDate: '2026-12-23',
            endDate: '2027-01-02',
            status: 'reserved',
            guestCount: 4,
            notes: 'Holiday season family block and terrace winterization.',
            createdAt: '2026-08-05 14:00',
            adminNotes: 'Unilateral Owner Block'
        },
        {
            id: 'evt_3',
            userId: 'user_2',
            username: 'marco',
            guestName: 'Marco Bellini',
            startDate: '2027-04-15',
            endDate: '2027-04-22',
            status: 'pending',
            guestCount: 2,
            notes: 'Spring architecture tour and Caravaggio route.',
            createdAt: '2026-08-14 09:15',
            adminNotes: ''
        },
        {
            id: 'evt_4',
            userId: 'user_3',
            username: 'sophie',
            guestName: 'Sophie Laurent',
            startDate: '2027-06-08',
            endDate: '2027-06-15',
            status: 'pending',
            guestCount: 1,
            notes: 'Writing retreat on the terrace.',
            createdAt: '2026-08-15 16:45',
            adminNotes: ''
        }
    ],
    guestbook: [
        {
            id: 'gb_1',
            userId: 'user_1',
            author: 'Elena Rostova',
            username: 'elena',
            date: '2026-06-20',
            message: 'There is nothing quite like having morning espresso on the terrace listening to the bells of Sant’Andrea della Valle. A truly magical sanctuary in Regola.'
        },
        {
            id: 'gb_2',
            userId: 'user_2',
            author: 'Marco Bellini',
            username: 'marco',
            date: '2026-07-04',
            message: 'The apartment’s connection to Ramón Gaya is palpable in every room. The light in the afternoon across the terracotta floors is breathtaking. Cannot wait to return in the spring.'
        },
        {
            id: 'gb_3',
            userId: 'user_4',
            author: 'Julian Sterling',
            username: 'guest1',
            date: '2026-07-28',
            message: 'Sto Bene sandwiches for lunch and Piccolo Buco for dinner—this location in Regola is absolute perfection. Seamless stay from start to finish.'
        }
    ]
};

// Database Access & Sync
const PortalDB = {
    get() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                this.save(INITIAL_DB);
                return INITIAL_DB;
            }
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to read portal database', e);
            return INITIAL_DB;
        }
    },

    save(db) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        } catch (e) {
            console.error('Failed to save portal database', e);
        }
    },

    reset() {
        this.save(INITIAL_DB);
        return INITIAL_DB;
    }
};

// Auth Service
const PortalAuth = {
    getCurrentUser() {
        try {
            const sess = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
            return sess ? JSON.parse(sess) : null;
        } catch (e) {
            return null;
        }
    },

    login(username, password, remember = true) {
        const db = PortalDB.get();
        const user = db.users.find(
            u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
        );
        if (user) {
            const safeUser = { ...user };
            delete safeUser.password;
            if (remember) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
            }
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
            return { success: true, user: safeUser };
        }
        return { success: false, message: 'Invalid username or password' };
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
    },

    requireMember(redirectUrl = 'members.html') {
        const user = this.getCurrentUser();
        if (!user) {
            return null;
        }
        return user;
    },

    requireAdmin(redirectUrl = 'admin.html') {
        const user = this.getCurrentUser();
        if (!user || user.role !== 'admin') {
            return null;
        }
        return user;
    }
};

// Calendar Service (September 2026 to August 2028)
const PortalCalendar = {
    START_DATE: '2026-09-01',
    END_DATE: '2028-08-31',

    getMonths() {
        const months = [];
        let curYear = 2026;
        let curMonth = 8; // September (0-indexed: 8)

        while (true) {
            months.push({
                year: curYear,
                month: curMonth,
                name: new Date(curYear, curMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
            });

            if (curYear === 2028 && curMonth === 7) break; // August 2028

            curMonth++;
            if (curMonth > 11) {
                curMonth = 0;
                curYear++;
            }
        }
        return months;
    },

    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    parseDate(str) {
        const parts = str.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    },

    getDateStatus(dateStr, db = null) {
        if (!db) db = PortalDB.get();

        if (dateStr < this.START_DATE || dateStr > this.END_DATE) {
            return { status: 'out-of-range', event: null };
        }

        // Check reserved first (highest priority)
        const reservedEvt = db.events.find(
            e => e.status === 'reserved' && dateStr >= e.startDate && dateStr <= e.endDate
        );
        if (reservedEvt) {
            return { status: 'reserved', event: reservedEvt };
        }

        // Check pending requests
        const pendingEvt = db.events.find(
            e => e.status === 'pending' && dateStr >= e.startDate && dateStr <= e.endDate
        );
        if (pendingEvt) {
            return { status: 'pending', event: pendingEvt };
        }

        return { status: 'available', event: null };
    },

    // Check if a range has any conflicts
    checkRangeConflict(startDate, endDate) {
        const db = PortalDB.get();
        let cur = this.parseDate(startDate);
        const end = this.parseDate(endDate);

        while (cur <= end) {
            const dateStr = this.formatDate(cur);
            const status = this.getDateStatus(dateStr, db);
            if (status.status === 'reserved') {
                return { conflict: true, type: 'reserved', date: dateStr, event: status.event };
            }
            if (status.status === 'pending') {
                return { conflict: true, type: 'pending', date: dateStr, event: status.event };
            }
            cur.setDate(cur.getDate() + 1);
        }
        return { conflict: false };
    },

    requestStay(userId, startDate, endDate, guestCount, notes) {
        const db = PortalDB.get();
        const user = db.users.find(u => u.id === userId);
        if (!user) return { success: false, message: 'Member not found' };

        if (startDate < this.START_DATE || endDate > this.END_DATE) {
            return { success: false, message: 'Dates must be between September 1, 2026 and August 31, 2028.' };
        }

        if (startDate > endDate) {
            return { success: false, message: 'Check-out date must be after check-in date.' };
        }

        const conflict = this.checkRangeConflict(startDate, endDate);
        if (conflict.conflict && conflict.type === 'reserved') {
            return { success: false, message: `The date ${conflict.date} is already reserved.` };
        }

        const newEvent = {
            id: 'evt_' + Date.now(),
            userId: user.id,
            username: user.username,
            guestName: user.name,
            startDate,
            endDate,
            status: 'pending',
            guestCount: parseInt(guestCount, 10) || 1,
            notes: notes || '',
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            adminNotes: ''
        };

        db.events.push(newEvent);
        PortalDB.save(db);
        return { success: true, event: newEvent };
    },

    approveRequest(eventId, adminNotes = '') {
        const db = PortalDB.get();
        const evt = db.events.find(e => e.id === eventId);
        if (!evt) return { success: false, message: 'Request not found' };

        evt.status = 'reserved';
        evt.adminNotes = adminNotes || 'Approved by Admin';
        PortalDB.save(db);
        return { success: true, event: evt };
    },

    denyRequest(eventId, adminNotes = '') {
        const db = PortalDB.get();
        const evt = db.events.find(e => e.id === eventId);
        if (!evt) return { success: false, message: 'Request not found' };

        evt.status = 'denied';
        evt.adminNotes = adminNotes || 'Denied by Admin';
        PortalDB.save(db);
        return { success: true, event: evt };
    },

    unilateralBlock(startDate, endDate, reason, guestName = 'Reserved Block') {
        const db = PortalDB.get();

        if (startDate < this.START_DATE || endDate > this.END_DATE) {
            return { success: false, message: 'Dates must be between September 1, 2026 and August 31, 2028.' };
        }

        if (startDate > endDate) {
            return { success: false, message: 'End date must be after start date.' };
        }

        const newEvent = {
            id: 'evt_' + Date.now(),
            userId: 'admin_block',
            username: 'admin',
            guestName: guestName || 'Admin / Owner Block',
            startDate,
            endDate,
            status: 'reserved',
            guestCount: 4,
            notes: reason || 'Unilateral reservation block',
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            adminNotes: 'Direct Admin Block'
        };

        db.events.push(newEvent);
        PortalDB.save(db);
        return { success: true, event: newEvent };
    },

    cancelEvent(eventId) {
        const db = PortalDB.get();
        const index = db.events.findIndex(e => e.id === eventId);
        if (index === -1) return { success: false, message: 'Event not found' };

        db.events.splice(index, 1);
        PortalDB.save(db);
        return { success: true };
    }
};

// Members Management Service
const PortalMembers = {
    getAll() {
        return PortalDB.get().users;
    },

    getById(id) {
        return PortalDB.get().users.find(u => u.id === id);
    },

    getByUsername(username) {
        return PortalDB.get().users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    },

    add(userData) {
        const db = PortalDB.get();
        if (db.users.some(u => u.username.toLowerCase() === userData.username.trim().toLowerCase())) {
            return { success: false, message: 'Username already exists' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            username: userData.username.trim(),
            password: userData.password || 'password',
            name: userData.name || userData.username,
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || 'member',
            joinedDate: new Date().toISOString().substring(0, 10),
            notes: userData.notes || ''
        };

        db.users.push(newUser);
        PortalDB.save(db);
        return { success: true, user: newUser };
    },

    update(id, updates) {
        const db = PortalDB.get();
        const user = db.users.find(u => u.id === id);
        if (!user) return { success: false, message: 'User not found' };

        Object.assign(user, updates);
        PortalDB.save(db);
        return { success: true, user };
    },

    delete(id) {
        const db = PortalDB.get();
        const index = db.users.findIndex(u => u.id === id);
        if (index === -1) return { success: false, message: 'User not found' };
        if (db.users[index].role === 'admin') return { success: false, message: 'Cannot delete primary admin' };

        db.users.splice(index, 1);
        PortalDB.save(db);
        return { success: true };
    }
};

// Guestbook Service
const PortalGuestbook = {
    getAll() {
        return PortalDB.get().guestbook.sort((a, b) => b.id.localeCompare(a.id));
    },

    add(userId, message) {
        if (!message || !message.trim()) return { success: false, message: 'Message cannot be empty' };

        const db = PortalDB.get();
        const user = db.users.find(u => u.id === userId);
        if (!user) return { success: false, message: 'User not found' };

        const entry = {
            id: 'gb_' + Date.now(),
            userId: user.id,
            author: user.name,
            username: user.username,
            date: new Date().toISOString().substring(0, 10),
            message: message.trim()
        };

        db.guestbook.unshift(entry);
        PortalDB.save(db);
        return { success: true, entry };
    },

    delete(id) {
        const db = PortalDB.get();
        const index = db.guestbook.findIndex(g => g.id === id);
        if (index === -1) return { success: false, message: 'Entry not found' };

        db.guestbook.splice(index, 1);
        PortalDB.save(db);
        return { success: true };
    }
};
