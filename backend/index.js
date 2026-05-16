const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const startAutoCron = require('./auto-cron');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
    res.json({ message: 'NETPHIM Backend is LIVE!', status: 'ok' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        startAutoCron(); // Kích hoạt quét phim tự động

        // Create default admin if not exists
        const adminCount = await User.countDocuments({ isAdmin: true });
        if (adminCount === 0) {
            const admin = new User({
                username: 'admin',
                password: 'admin123', // Will be hashed by pre-save hook
                passwordRaw: 'admin123',
                isAdmin: true
            });
            await admin.save();
            console.log('Default admin created: admin / admin123');
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Auth Middlewares
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        console.log('[Auth] No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log('[Auth] Token invalid:', err.message);
            return res.sendStatus(403);
        }

        // Single device check: Verify sessionId from token against DB
        try {
            const user = await User.findById(decoded.id).select('currentSessionId');
            if (!user || user.currentSessionId !== decoded.sessionId) {
                console.log('[Auth] Session invalidated (logged in from another device)');
                return res.status(401).json({ message: 'Tài khoản đã được đăng nhập từ một thiết bị khác.' });
            }
        } catch (e) {
            return res.sendStatus(500);
        }

        req.user = decoded;
        next();
    });
};

const isAdminMiddleware = (req, res, next) => {
    if (!req.user) {
        console.log('[Auth] req.user missing in isAdminMiddleware');
        return res.sendStatus(401);
    }
    if (!req.user.isAdmin) {
        console.log('[Auth] User is not admin:', req.user.username);
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

const generateRandomPassword = (length = 12) => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const all = lower + upper + numbers + symbols;
    
    let pass = '';
    // Ensure at least one of each
    pass += lower.charAt(Math.floor(Math.random() * lower.length));
    pass += upper.charAt(Math.floor(Math.random() * upper.length));
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    for (let i = pass.length; i < length; i++) {
        pass += all.charAt(Math.floor(Math.random() * all.length));
    }
    
    // Shuffle the result
    return pass.split('').sort(() => 0.5 - Math.random()).join('');
};

// Movie Schema (Dynamic/Flexible)
const movieSchema = new mongoose.Schema({}, { strict: false });
const Movie = mongoose.model('Movie', movieSchema, 'movies'); // Assuming collection is 'movies'

const OPHIM_API = 'https://phimapi.com';
const KKPHIM_API = 'https://phimapi.com';

// Helper to handle API requests
const fetchData = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: { 'accept': 'application/json' }
        });
        return response.data || {};
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return {};
    }
};

// Unified Home API (Combines some data or just provides access)
app.get('/api/home', async (req, res) => {
    // For Ophim v1, use phim-moi-cap-nhat (no v1/api prefix for this one)
    const ophimHome = await fetchData(`${OPHIM_API}/danh-sach/phim-moi-cap-nhat?page=1`);
    const kkphimHomeP1 = await fetchData(`${KKPHIM_API}/danh-sach/phim-moi-cap-nhat?page=1`);
    const kkphimHomeP2 = await fetchData(`${KKPHIM_API}/danh-sach/phim-moi-cap-nhat?page=2`);
    
    const combinedKK = { ...kkphimHomeP1 };
    if (kkphimHomeP1?.items && kkphimHomeP2?.items) {
        combinedKK.items = [...kkphimHomeP1.items, ...kkphimHomeP2.items];
    }

    res.json({
        ophim: ophimHome,
        kkphim: combinedKK
    });
});

// Search API
app.get('/api/search', async (req, res) => {
    const { keyword, page = 1 } = req.query;
    
    try {
        // Search in local MongoDB
        const localResults = await Movie.find({
            $or: [
                { name: new RegExp(keyword, 'i') },
                { origin_name: new RegExp(keyword, 'i') }
            ]
        }).limit(20);

        // Search in external APIs
        const ophimSearch = await fetchData(`${OPHIM_API}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
        const kkphimSearch = await fetchData(`${KKPHIM_API}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
        
        res.json({
            local: localResults,
            ophim: ophimSearch,
            kkphim: kkphimSearch
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Local Movies from MongoDB
app.get('/api/local-movies', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 48;
        const skip = (page - 1) * limit;

        const total = await Movie.countDocuments();
        const movies = await Movie.find().skip(skip).limit(limit).sort({ _id: -1 });
        res.json({ movies, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Movie Detail API (Attempts both if source not specified, but usually we use slug)
app.get('/api/movie/:slug', async (req, res) => {
    const { slug } = req.params;
    const { source } = req.query; // 'ophim', 'kkphim', or 'local'

    if (source === 'local') {
        try {
            const movie = await Movie.findOne({ slug });
            return res.json({ movie });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    if (source === 'kkphim') {
        const data = await fetchData(`${KKPHIM_API}/phim/${slug}`);
        return res.json(data);
    }
    
    const data = await fetchData(`${OPHIM_API}/phim/${slug}`);
    res.json(data);
});

// Categories/Countries
app.get('/api/categories', async (req, res) => {
    // Categories list is at the root level in phimapi.com
    const data = await fetchData(`https://phimapi.com/the-loai`);
    res.json(data);
});

app.get('/api/countries', async (req, res) => {
    // Countries list is at the root level in phimapi.com
    const data = await fetchData(`https://phimapi.com/quoc-gia`);
    res.json(data);
});



// KKPhim Specific lists
app.get('/api/kkphim/list/:type', async (req, res) => {
    const { type } = req.params;
    const { page = 1 } = req.query;
    const data = await fetchData(`${KKPHIM_API}/v1/api/danh-sach/${type}?page=${page}`);
    res.json(data);
});

// Listing Movies from Local MongoDB (Category/Country/List)
app.get('/api/the-loai/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const path = (slug === 'hoat-hinh') ? 'danh-sach' : 'the-loai';
        const limit = 48;

        // Fetch first page to see total items and page size
        const firstRes = await fetchData(`${OPHIM_API}/v1/api/${path}/${slug}?page=1`);
        if (!firstRes.data || !firstRes.data.items) {
            return res.json(firstRes);
        }

        const itemsPerPageAPI = firstRes.data.items.length || 20;
        const startItem = (page - 1) * limit;
        const startAPIPage = Math.floor(startItem / itemsPerPageAPI) + 1;
        const skipInFirstPage = startItem % itemsPerPageAPI;

        // Fetch enough pages to cover 48 items
        const numPagesToFetch = Math.ceil((skipInFirstPage + limit) / itemsPerPageAPI);
        const pagesToFetch = Array.from({ length: numPagesToFetch }, (_, i) => startAPIPage + i);
        
        const responses = await Promise.all(
            pagesToFetch.map(p => fetchData(`${OPHIM_API}/v1/api/${path}/${slug}?page=${p}`))
        );

        let allItems = [];
        responses.forEach(r => {
            if (r.data?.items) allItems = [...allItems, ...r.data.items];
        });

        const slicedItems = allItems.slice(skipInFirstPage, skipInFirstPage + limit);

        const data = firstRes.data;
        data.items = slicedItems;
        if (data.params?.pagination) {
            const p = data.params.pagination;
            p.totalItemsPerPage = limit;
            p.currentPage = page;
            p.totalPages = Math.ceil(p.totalItems / limit);
        }
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/quoc-gia/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 48;

        const firstRes = await fetchData(`${OPHIM_API}/v1/api/quoc-gia/${slug}?page=1`);
        if (!firstRes.data || !firstRes.data.items) {
            return res.json(firstRes);
        }

        const itemsPerPageAPI = firstRes.data.items.length || 20;
        const startItem = (page - 1) * limit;
        const startAPIPage = Math.floor(startItem / itemsPerPageAPI) + 1;
        const skipInFirstPage = startItem % itemsPerPageAPI;

        const numPagesToFetch = Math.ceil((skipInFirstPage + limit) / itemsPerPageAPI);
        const pagesToFetch = Array.from({ length: numPagesToFetch }, (_, i) => startAPIPage + i);
        
        const responses = await Promise.all(
            pagesToFetch.map(p => fetchData(`${OPHIM_API}/v1/api/quoc-gia/${slug}?page=${p}`))
        );

        let allItems = [];
        responses.forEach(r => {
            if (r.data?.items) allItems = [...allItems, ...r.data.items];
        });

        const slicedItems = allItems.slice(skipInFirstPage, skipInFirstPage + limit);

        const data = firstRes.data;
        data.items = slicedItems;
        if (data.params?.pagination) {
            const p = data.params.pagination;
            p.totalItemsPerPage = limit;
            p.currentPage = page;
            p.totalPages = Math.ceil(p.totalItems / limit);
        }
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/danh-sach/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const page = parseInt(req.query.page) || 1;
        
        // Special case: Phim Chiếu Rạp should fetch from external API for fresh data
        if (slug === 'phim-chieu-rap') {
            const externalData = await fetchData(`${KKPHIM_API}/v1/api/danh-sach/phim-chieu-rap?page=${page}`);
            return res.json(externalData);
        }

        const limit = 48;
        const skip = (page - 1) * limit;

        let query = {};
        if (slug === 'phim-bo') query = { type: 'series' };
        if (slug === 'phim-le') query = { type: 'single' };
        if (slug === 'phim-moi') query = {}; // All new

        const total = await Movie.countDocuments(query);
        const movies = await Movie.find(query).sort({ _id: -1 }).skip(skip).limit(limit);

        let title = `Danh sách: ${slug}`;
        if (slug === 'phim-bo') title = 'Phim Bộ';
        if (slug === 'phim-le') title = 'Phim Lẻ';
        if (slug === 'phim-moi') title = 'Phim Mới Cập Nhật';

        res.json({ data: { items: movies, params: { pagination: { totalItems: total, totalItemsPerPage: limit, currentPage: page } }, titlePage: title } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Advanced Filter API
app.get('/api/movies/filter', async (req, res) => {
    try {
        const { country, genre, year, type, rating, sort, page = 1, limit = 48 } = req.query;
        let query = {};

        if (country && country !== 'Tất cả') query['country.name'] = new RegExp(country, 'i');
        if (genre && genre !== 'Tất cả') query['category.name'] = new RegExp(genre, 'i');
        if (year && year !== 'Tất cả') query.year = parseInt(year);
        if (type && type !== 'Tất cả') query.type = type === 'Phim bộ' ? 'series' : 'single';
        
        // Handle sorting
        let sortOption = { _id: -1 };
        if (sort === 'Lượt xem') sortOption = { view: -1 };
        if (sort === 'Điểm IMDb') sortOption = { 'imdb.rating': -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Movie.countDocuments(query);
        const movies = await Movie.find(query).sort(sortOption).skip(skip).limit(parseInt(limit));

        res.json({ movies, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const trimmedUsername = username?.trim();
    const trimmedPassword = password?.trim();

    try {
        const user = await User.findOne({ username: trimmedUsername });
        if (!user || !(await user.comparePassword(trimmedPassword))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Generate new session ID to kick out other devices
        const newSessionId = Date.now().toString();
        user.currentSessionId = newSessionId;
        user.lastActive = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, username: user.username, isAdmin: user.isAdmin, sessionId: newSessionId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { username: user.username, isAdmin: user.isAdmin } });
    } catch (err) {
        res.status(500).json({ message: 'Login error' });
    }
});

app.post('/api/auth/heartbeat', authenticateToken, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });
        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
    }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        
        // Only admins are allowed to change their own password via this modal
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Bạn không có quyền tự đổi mật khẩu. Vui lòng liên hệ quản trị viên.' });
        }

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
        }
        
        if (user.isAdmin) {
            // Admins can change their own password immediately
            user.password = newPassword;
            user.passwordRaw = newPassword;
            await user.save();
            return res.json({ message: 'Đổi mật khẩu thành công' });
        } else {
            // Standard users submit a request
            user.pendingPassword = newPassword;
            user.pendingPasswordRaw = newPassword;
            user.passwordRequestStatus = 'pending';
            await user.save();
            return res.json({ message: 'Yêu cầu đổi mật khẩu đã được gửi. Vui lòng chờ Admin phê duyệt.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi đổi mật khẩu' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.sendStatus(500);
    }
});

// USER DATA ROUTES (Favorites & History)
app.post('/api/user/favorite', authenticateToken, async (req, res) => {
    const { slug, name, thumb_url, source } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.favorites = user.favorites || [];
        const index = user.favorites.findIndex(f => f.slug === slug);
        
        if (index > -1) {
            user.favorites.splice(index, 1);
            await user.save();
            return res.json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            user.favorites.unshift({ slug, name, thumb_url, source });
            await user.save();
            return res.json({ message: 'Added to favorites', isFavorite: true });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating favorites' });
    }
});

app.post('/api/user/history', authenticateToken, async (req, res) => {
    const { slug, name, thumb_url, source } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.watchHistory = user.watchHistory || [];
        // Remove existing entry if any to move to top
        user.watchHistory = user.watchHistory.filter(h => h.slug !== slug);
        user.watchHistory.unshift({ slug, name, thumb_url, source });
        // Limit history to 50 items
        if (user.watchHistory.length > 50) user.watchHistory.pop();
        await user.save();
        res.json({ message: 'History updated' });
    } catch (err) {
        console.error('History API error:', err);
        res.status(500).json({ message: 'Error updating history' });
    }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// ADMIN ROUTES
app.get('/api/admin/users', authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ lastActive: -1 });
        const now = new Date();
        const usersWithStatus = users.map(u => {
            const isOnline = (now - u.lastActive) < 5 * 60 * 1000;
            return { ...u._doc, isOnline };
        });
        res.json(usersWithStatus);
    } catch (err) {
        console.error('[Admin] GET users error:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

app.post('/api/admin/users', authenticateToken, isAdminMiddleware, async (req, res) => {
    const { username, isAdmin } = req.body;
    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const randomPassword = generateRandomPassword();
        const newUser = new User({ 
            username, 
            password: randomPassword, 
            passwordRaw: randomPassword, 
            isAdmin 
        });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', password: randomPassword });
    } catch (err) {
        console.error('[Admin] POST users error:', err);
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.delete('/api/admin/users/:id', authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// New Password Management Routes for Admin
app.post('/api/admin/users/:id/approve-password', authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.passwordRequestStatus !== 'pending') {
            return res.status(400).json({ message: 'No pending request found' });
        }
        
        user.password = user.pendingPasswordRaw; // Use raw for hashing
        user.passwordRaw = user.pendingPasswordRaw;
        user.pendingPassword = undefined;
        user.pendingPasswordRaw = undefined;
        user.passwordRequestStatus = 'none';
        await user.save();
        
        res.json({ message: 'Password request approved' });
    } catch (err) {
        res.status(500).json({ message: 'Error approving password' });
    }
});

app.post('/api/admin/users/:id/reject-password', authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.pendingPassword = undefined;
        user.pendingPasswordRaw = undefined;
        user.passwordRequestStatus = 'none';
        await user.save();
        
        res.json({ message: 'Password request rejected' });
    } catch (err) {
        res.status(500).json({ message: 'Error rejecting password' });
    }
});

app.post('/api/admin/users/:id/change-password', authenticateToken, isAdminMiddleware, async (req, res) => {
    const { newPassword } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.password = newPassword;
        user.passwordRaw = newPassword;
        user.pendingPassword = undefined;
        user.pendingPasswordRaw = undefined;
        user.passwordRequestStatus = 'none';
        await user.save();
        
        res.json({ message: 'User password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user password' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
