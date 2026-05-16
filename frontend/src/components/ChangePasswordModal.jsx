import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { X, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.trim() !== confirmPassword.trim()) {
            return setError('Mật khẩu xác nhận không khớp');
        }
        if (newPassword.length < 6) {
            return setError('Mật khẩu mới phải từ 6 ký tự trở lên');
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/change-password', {
                currentPassword: currentPassword.trim(),
                newPassword: newPassword.trim()
            });
            setSuccessMessage(res.data.message);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{ 
                            position: 'relative', 
                            width: '100%', 
                            maxWidth: '400px', 
                            background: '#16161e', 
                            borderRadius: '24px', 
                            padding: '2.5rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#fff', opacity: 0.5, cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '50px', height: '50px', background: 'rgba(255, 183, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Lock size={24} color="var(--primary-color)" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Đổi mật khẩu</h2>
                        </div>

                        {success ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={48} color="#4ade80" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: '#4ade80', fontWeight: 500, lineHeight: 1.5 }}>{successMessage}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.8rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.5rem' }}>Mật khẩu hiện tại</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type={showCurrent ? "text" : "password"} 
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.8rem 3rem 0.8rem 1rem', color: '#fff', outline: 'none' }}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.5rem' }}>Mật khẩu mới</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type={showNew ? "text" : "password"} 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.8rem 3rem 0.8rem 1rem', color: '#fff', outline: 'none' }}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.5rem' }}>Xác nhận mật khẩu mới</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type={showConfirm ? "text" : "password"} 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.8rem 3rem 0.8rem 1rem', color: '#fff', outline: 'none' }}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    disabled={loading}
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 'bold' }}
                                >
                                    {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChangePasswordModal;
