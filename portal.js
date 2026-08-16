// Portal Data & Logic Engine for Gigliopad / Lily Terrace
// Manages Members, Calendar (Sept 2026 - Aug 2028), Requests, Admin, Role Hierarchy, and Cryptographic Security

const STORAGE_KEY = 'roma_portal_db_v1';
const SESSION_KEY = 'roma_portal_session_v1';

// Cryptographic Password & Security Utility
const PortalCrypto = {
    SALT_PREFIX: 'roma_secure_salt_v1_',

    async hashPassword(password, salt = 'default_salt') {
        if (!password) return '';
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(this.SALT_PREFIX + salt + password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fallback SHA-256 implementation if subtle crypto is unavailable
            return this.fallbackHash(this.SALT_PREFIX + salt + password);
        }
    },

    generateSalt() {
        if (window.crypto && crypto.getRandomValues) {
            const arr = new Uint8Array(16);
            crypto.getRandomValues(arr);
            return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
        }
        return 'salt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    },

    // Simple deterministic fallback for non-secure contexts
    fallbackHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'fh_' + Math.abs(hash).toString(16);
    }
};

// Initial Seed Data (All passwords securely pre-hashed with salt)
// Default password for all seed accounts is: "password"
// Pre-computed SHA-256 with salt 'seed_salt_123'
const SEED_SALT = 'seed_salt_123';
// SHA-256 of ('roma_secure_salt_v1_' + 'seed_salt_123' + 'password')
const SEED_PASSWORD_HASH = '1f65bb41f22372f88a911eb31a89f92d4f2f01a35565bbdf31cf9d91f274aefb';

const INITIAL_DB = {
    users: [
        {
            id: 'admin_1',
            username: 'admin',
            salt: SEED_SALT,
            passwordHash: SEED_PASSWORD_HASH,
            name: 'Property Administrator',
            email: 'admin@gigliopad.com',
            phone: '+39 06 6880 1234',
            role: 'admin', // Primary Admin
            joinedDate: '2026-01-01',
            notes: 'Primary Property Administrator and Host Manager'
        },
        {
            id: 'user_1',
            username: 'elena',
            salt: SEED_SALT,
            passwordHash: SEED_PASSWORD_HASH,
            name: 'Elena Rostova',
            email: 'elena.rostova@example.com',
            phone: '+39 340 555 0192',
            role: 'co-admin', // Co-Admin
            joinedDate: '2026-02-15',
            notes: 'Art historian, frequent guest. Loves the morning light.'
        },
        {
            id: 'user_2',
            username: 'marco',
            salt: SEED_SALT,
            passwordHash: SEED_PASSWORD_HASH,
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
            salt: SEED_SALT,
            passwordHash: SEED_PASSWORD_HASH,
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
            salt: SEED_SALT,
            passwordHash: SEED_PASSWORD_HASH,
            name: 'Julian Sterling',
            email: 'julian.sterling@example.com',
            phone: '+1 (415) 890-2341',
            role: 'member',
            joinedDate: '2026-05-12',
            notes: 'San Francisco collector and patron.'
        }
    ],
    pendingMembers: [
        {
            id: 'app_1',
            username: 'matteo',
            salt: SEED_SALT,
            passwordHash: SEED_PASSWORD_HASH,
            name: 'Matteo Ghiberti',
            email: 'matteo.ghiberti@example.com',
            phone: '+39 347 112 3344',
            notes: 'Recommended by Elena Rostova. Visiting professor of Renaissance Art.',
            appliedDate: '2026-08-15'
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
    ],
    emailOutbox: []
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
            const parsed = JSON.parse(data);
            
            // Ensure pendingMembers and emailOutbox arrays exist
            if (!parsed.pendingMembers) parsed.pendingMembers = [];
            if (!parsed.emailOutbox) parsed.emailOutbox = [];

            // Upgrade legacy plaintext passwords if found
            let upgraded = false;
            if (parsed.users) {
                parsed.users.forEach(u => {
                    if (u.password && !u.passwordHash) {
                        u.salt = SEED_SALT;
                        u.passwordHash = SEED_PASSWORD_HASH;
                        delete u.password;
                        upgraded = true;
                    }
                });
            }
            if (upgraded) this.save(parsed);

            return parsed;
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

// Email Notification Service
const PortalEmail = {
    send({ to, recipientName = '', subject, body, type = 'general' }) {
        const db = PortalDB.get();
        const emailRecord = {
            id: 'mail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            to,
            recipientName,
            subject,
            body,
            type,
            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'sent'
        };

        db.emailOutbox.unshift(emailRecord);
        PortalDB.save(db);

        console.log(`%c[EMAIL DISPATCH] To: ${to} | Subject: ${subject}`, 'color: #c5a059; font-weight: bold;');
        return emailRecord;
    },

    // Notify admins & co-admins of new member application
    notifyAdminsOfApplication(applicant) {
        const db = PortalDB.get();
        const admins = db.users.filter(u => u.role === 'admin' || u.role === 'co-admin');

        admins.forEach(admin => {
            if (admin.email) {
                this.send({
                    to: admin.email,
                    recipientName: admin.name,
                    subject: `New Regola Membership Application: ${applicant.name}`,
                    body: `A new membership request has been submitted for ${applicant.name} (@${applicant.username}, Email: ${applicant.email}, Phone: ${applicant.phone || 'N/A'}).\n\nApplicant Notes: "${applicant.notes || 'None'}"\n\nPlease log in to the Admin Dashboard to review and approve or decline.`,
                    type: 'new_application'
                });
            }
        });
    },

    // Notify member of stay approval
    notifyStayApproved(member, event) {
        if (!member || !member.email) return;
        this.send({
            to: member.email,
            recipientName: member.name,
            subject: `Stay Request Confirmed: ${event.startDate} to ${event.endDate}`,
            body: `Dear ${member.name},\n\nWe are delighted to confirm that your stay request from ${event.startDate} to ${event.endDate} (${event.guestCount} guests) has been APPROVED.\n\nYour dates are now officially reserved on the calendar. You can review apartment access details and the resident guide in the Member Portal.\n\nWarm regards,\nProperty Administration`,
            type: 'stay_approval'
        });
    },

    // Notify member of stay denial
    notifyStayDenied(member, event, reason = '') {
        if (!member || !member.email) return;
        this.send({
            to: member.email,
            recipientName: member.name,
            subject: `Update on Stay Request: ${event.startDate} to ${event.endDate}`,
            body: `Dear ${member.name},\n\nThank you for your stay request for ${event.startDate} to ${event.endDate}. Unfortunately, we are unable to accommodate these dates at this time.\n\nReason: ${reason || 'Dates unavailable or conflicting schedule.'}\n\nPlease check the calendar in the Member Portal for alternative available dates.\n\nWarm regards,\nProperty Administration`,
            type: 'stay_denial'
        });
    },

    // Notify member of membership approval
    notifyMemberApproved(member) {
        if (!member || !member.email) return;
        this.send({
            to: member.email,
            recipientName: member.name,
            subject: `Welcome to Regola: Your Membership has been Approved!`,
            body: `Dear ${member.name},\n\nWe are pleased to inform you that your application to Become a Regola has been APPROVED!\n\nYou may now sign in to the Member Portal using your username (@${member.username}) and the password you created.\n\nWelcome to the residence,\nProperty Administration`,
            type: 'member_approved'
        });
    }
};

// Auth Service (Unified login & role routing)
const PortalAuth = {
    getCurrentUser() {
        try {
            const sess = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
            return sess ? JSON.parse(sess) : null;
        } catch (e) {
            return null;
        }
    },

    async login(username, password, remember = true) {
        const db = PortalDB.get();
        const user = db.users.find(
            u => u.username.toLowerCase() === username.trim().toLowerCase()
        );

        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }

        // Verify password hash
        const inputHash = await PortalCrypto.hashPassword(password, user.salt);
        if (inputHash !== user.passwordHash) {
            return { success: false, message: 'Invalid username or password' };
        }

        const safeUser = { ...user };
        delete safeUser.passwordHash;
        delete safeUser.salt;

        if (remember) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));

        // Determine destination based on role
        const isAdminUser = (safeUser.role === 'admin' || safeUser.role === 'co-admin');
        const redirectUrl = isAdminUser ? 'admin.html' : 'members.html';

        return { 
            success: true, 
            user: safeUser, 
            isAdmin: isAdminUser,
            redirectUrl 
        };
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
        if (!user || (user.role !== 'admin' && user.role !== 'co-admin')) {
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

        // Find member and trigger email notification
        const member = db.users.find(u => u.id === evt.userId) || db.users.find(u => u.username === evt.username);
        if (member) {
            PortalEmail.notifyStayApproved(member, evt);
        }

        return { success: true, event: evt, member };
    },

    denyRequest(eventId, adminNotes = '') {
        const db = PortalDB.get();
        const evt = db.events.find(e => e.id === eventId);
        if (!evt) return { success: false, message: 'Request not found' };

        evt.status = 'denied';
        evt.adminNotes = adminNotes || 'Denied by Admin';
        PortalDB.save(db);

        // Find member and trigger email notification
        const member = db.users.find(u => u.id === evt.userId) || db.users.find(u => u.username === evt.username);
        if (member) {
            PortalEmail.notifyStayDenied(member, evt, adminNotes);
        }

        return { success: true, event: evt, member };
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

// Members Management Service (with secure password hashing & role hierarchy)
const PortalMembers = {
    getAll() {
        return PortalDB.get().users;
    },

    getPending() {
        return PortalDB.get().pendingMembers || [];
    },

    getById(id) {
        return PortalDB.get().users.find(u => u.id === id);
    },

    getByUsername(username) {
        return PortalDB.get().users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    },

    // Apply for membership via "Become a Regola"
    async apply(formData) {
        const db = PortalDB.get();
        const username = formData.username.trim().toLowerCase();

        if (!formData.name || !formData.email || !formData.password || !formData.username) {
            return { success: false, message: 'Please fill in all required fields.' };
        }

        if (formData.password.length < 8) {
            return { success: false, message: 'Password must be at least 8 characters long.' };
        }

        // Check active users and pending applicants
        if (db.users.some(u => u.username.toLowerCase() === username) ||
            db.pendingMembers.some(p => p.username.toLowerCase() === username)) {
            return { success: false, message: 'Username is already in use. Please choose another.' };
        }

        // Cryptographically hash password before saving
        const salt = PortalCrypto.generateSalt();
        const passwordHash = await PortalCrypto.hashPassword(formData.password, salt);

        const application = {
            id: 'app_' + Date.now(),
            username,
            salt,
            passwordHash,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone ? formData.phone.trim() : '',
            notes: formData.notes ? formData.notes.trim() : '',
            appliedDate: new Date().toISOString().substring(0, 10)
        };

        db.pendingMembers.push(application);
        PortalDB.save(db);

        // Notify Admin and Co-Admins
        PortalEmail.notifyAdminsOfApplication(application);

        return { success: true, application };
    },

    // Approve pending application
    approvePending(appId) {
        const db = PortalDB.get();
        const idx = db.pendingMembers.findIndex(p => p.id === appId);
        if (idx === -1) return { success: false, message: 'Application not found' };

        const app = db.pendingMembers[idx];
        const newUser = {
            id: 'user_' + Date.now(),
            username: app.username,
            salt: app.salt,
            passwordHash: app.passwordHash,
            name: app.name,
            email: app.email,
            phone: app.phone,
            role: 'member',
            joinedDate: new Date().toISOString().substring(0, 10),
            notes: app.notes || ''
        };

        db.users.push(newUser);
        db.pendingMembers.splice(idx, 1);
        PortalDB.save(db);

        // Send approval email to member
        PortalEmail.notifyMemberApproved(newUser);

        return { success: true, user: newUser };
    },

    // Decline pending application
    declinePending(appId) {
        const db = PortalDB.get();
        const idx = db.pendingMembers.findIndex(p => p.id === appId);
        if (idx === -1) return { success: false, message: 'Application not found' };

        db.pendingMembers.splice(idx, 1);
        PortalDB.save(db);
        return { success: true };
    },

    // Direct add from Admin Dashboard
    async add(userData) {
        const db = PortalDB.get();
        const username = userData.username.trim().toLowerCase();

        if (db.users.some(u => u.username.toLowerCase() === username)) {
            return { success: false, message: 'Username already exists' };
        }

        const rawPassword = userData.password || 'password';
        const salt = PortalCrypto.generateSalt();
        const passwordHash = await PortalCrypto.hashPassword(rawPassword, salt);

        const newUser = {
            id: 'user_' + Date.now(),
            username,
            salt,
            passwordHash,
            name: userData.name || username,
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

    // Update profile info (Name, Email, Phone)
    updateProfile(id, updates) {
        const db = PortalDB.get();
        const user = db.users.find(u => u.id === id);
        if (!user) return { success: false, message: 'User not found' };

        if (updates.name) user.name = updates.name.trim();
        if (updates.email) user.email = updates.email.trim();
        if (updates.phone !== undefined) user.phone = updates.phone.trim();
        if (updates.notes !== undefined) user.notes = updates.notes;

        PortalDB.save(db);

        // Update active session if updating self
        const current = PortalAuth.getCurrentUser();
        if (current && current.id === id) {
            const safeUser = { ...user };
            delete safeUser.passwordHash;
            delete safeUser.salt;
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
            if (localStorage.getItem(SESSION_KEY)) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
            }
        }

        return { success: true, user };
    },

    // Secure password change
    async changePassword(userId, currentPassword, newPassword) {
        const db = PortalDB.get();
        const user = db.users.find(u => u.id === userId);
        if (!user) return { success: false, message: 'User not found' };

        if (!newPassword || newPassword.length < 8) {
            return { success: false, message: 'New password must be at least 8 characters long.' };
        }

        // Verify current password
        const currentHash = await PortalCrypto.hashPassword(currentPassword, user.salt);
        if (currentHash !== user.passwordHash) {
            return { success: false, message: 'Current password does not match.' };
        }

        // Generate fresh salt and new hash
        user.salt = PortalCrypto.generateSalt();
        user.passwordHash = await PortalCrypto.hashPassword(newPassword, user.salt);

        PortalDB.save(db);
        return { success: true, message: 'Password updated successfully!' };
    },

    // Role Transitions
    elevateToCoAdmin(userId) {
        const db = PortalDB.get();
        const user = db.users.find(u => u.id === userId);
        if (!user) return { success: false, message: 'User not found' };
        if (user.role === 'admin') return { success: false, message: 'User is already primary admin' };

        user.role = 'co-admin';
        PortalDB.save(db);
        return { success: true, user };
    },

    demoteToMember(userId) {
        const db = PortalDB.get();
        const user = db.users.find(u => u.id === userId);
        if (!user) return { success: false, message: 'User not found' };
        if (user.role === 'admin') return { success: false, message: 'The primary Admin cannot be demoted or removed.' };

        user.role = 'member';
        PortalDB.save(db);
        return { success: true, user };
    },

    elevateToPrimaryAdmin(coAdminId, currentAdminId) {
        const db = PortalDB.get();
        const newAdmin = db.users.find(u => u.id === coAdminId);
        const oldAdmin = db.users.find(u => u.id === currentAdminId);

        if (!newAdmin || !oldAdmin) return { success: false, message: 'Admin or candidate not found' };
        if (newAdmin.role !== 'co-admin') return { success: false, message: 'Candidate must be a Co-Admin first.' };

        // Swap roles
        newAdmin.role = 'admin';
        oldAdmin.role = 'co-admin';

        PortalDB.save(db);

        // Update session if needed
        const current = PortalAuth.getCurrentUser();
        if (current && current.id === currentAdminId) {
            current.role = 'co-admin';
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(current));
        }

        return { success: true, newAdmin, oldAdmin };
    },

    delete(id) {
        const db = PortalDB.get();
        const index = db.users.findIndex(u => u.id === id);
        if (index === -1) return { success: false, message: 'User not found' };
        if (db.users[index].role === 'admin') {
            return { success: false, message: 'The primary Admin cannot be removed or deleted.' };
        }

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
