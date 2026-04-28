import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ConvexClient } from 'convex/browser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const CONVEX_URL = process.env.VITE_CONVEX_URL;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Convex client for database operations
const convex = new ConvexClient(CONVEX_URL);

// In-memory staff store (replace with Convex queries later)
const staffUsers = new Map();

// Helper: Verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ========== AUTH ENDPOINTS ==========

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    const staff = staffUsers.get(email);
    if (!staff) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, staff.passwordHash);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { email: staff.email, name: staff.name, role: staff.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        token,
        user: { name: staff.name, email: staff.email, role: staff.role }
    });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const staff = staffUsers.get(req.user.email);
    if (!staff) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ name: staff.name, email: staff.email, role: staff.role });
});

// ========== STAFF ENDPOINTS ==========

// Enroll new staff (with enrollment code)
app.post('/api/staff/enroll', async (req, res) => {
    const { name, email, password, role, enrollmentCode } = req.body;
    const ENROLLMENT_CODE = process.env.ENROLLMENT_CODE || 'diven45-2026';

    if (enrollmentCode !== ENROLLMENT_CODE) {
        return res.status(400).json({ error: 'Invalid enrollment code' });
    }

    if (staffUsers.has(email)) {
        return res.status(400).json({ error: 'Staff already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    staffUsers.set(email, { name, email, role: role || 'staff', passwordHash });

    res.json({ id: email, name, email, role: role || 'staff' });
});

// List staff (requires enrollment code)
app.get('/api/staff/list', (req, res) => {
    const { code } = req.query;
    const ENROLLMENT_CODE = process.env.ENROLLMENT_CODE || 'diven45-2026';

    if (code !== ENROLLMENT_CODE) {
        return res.status(401).json({ error: 'Invalid enrollment code' });
    }

    const staff = Array.from(staffUsers.values()).map(({ passwordHash, ...s }) => s);
    res.json(staff);
});

// Delete staff
app.delete('/api/staff/delete', async (req, res) => {
    const { id, enrollmentCode } = req.body;
    const ENROLLMENT_CODE = process.env.ENROLLMENT_CODE || 'diven45-2026';

    if (enrollmentCode !== ENROLLMENT_CODE) {
        return res.status(400).json({ error: 'Invalid enrollment code' });
    }

    staffUsers.delete(id);
    res.json({ success: true });
});

// ========== MESSAGES ENDPOINTS ==========

const messages = [];

// List messages
app.get('/api/messages/list', authenticateToken, (req, res) => {
    const messagesWithNames = messages.map(msg => {
        const staff = staffUsers.get(msg.authorEmail);
        return {
            ...msg,
            author: staff ? staff.name : (msg.authorEmail ? msg.authorEmail.split('@')[0] : 'Unknown')
        };
    });
    res.json(messagesWithNames.reverse().slice(0, 50));
});

// Send message
app.post('/api/messages/send', authenticateToken, (req, res) => {
    const { body } = req.body;
    const { email, name } = req.user;

    const message = {
        _id: Date.now().toString(),
        body,
        author: name,
        authorEmail: email,
        timestamp: Date.now()
    };

    messages.push(message);
    res.json(message);
});

// Clear messages (admin)
app.delete('/api/messages/clear', authenticateToken, (req, res) => {
    messages.length = 0;
    res.json({ success: true });
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
