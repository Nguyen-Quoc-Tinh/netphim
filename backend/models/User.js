const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordRaw: { type: String }, // Store raw password for admin visibility
    pendingPassword: { type: String },
    pendingPasswordRaw: { type: String },
    passwordRequestStatus: { type: String, enum: ['none', 'pending'], default: 'none' },
    isAdmin: { type: Boolean, default: false },
    currentSessionId: { type: String }, // To enforce single device login
    lastActive: { type: Date, default: Date.now },
    favorites: [{
        slug: String,
        name: String,
        thumb_url: String,
        source: String,
        addedAt: { type: Date, default: Date.now }
    }],
    watchHistory: [{
        slug: String,
        name: String,
        thumb_url: String,
        source: String,
        watchedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
