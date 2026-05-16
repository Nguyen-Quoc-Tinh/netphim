import React, { useState, useEffect } from 'react';
import { api, getUsers, adminChangePassword, approvePasswordRequest, rejectPasswordRequest, deleteUser } from '../utils/api';
import { UserPlus, Trash2, Users, Shield, Clock, ShieldCheck, Check, X, Key, AlertCircle, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUsername, setNewUsername] = useState('');
    const [newIsAdmin, setNewIsAdmin] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [directNewPassword, setDirectNewPassword] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchUsers();
            const interval = setInterval(fetchUsers, 30000);
            return () => clearInterval(interval);
        }
    }, [authLoading, user]);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            // Using existing axios-based create logic for consistency with previous setup 
            // but updated to use proper messaging
            const res = await api.post('/admin/users', { 
                username: newUsername, 
                isAdmin: newIsAdmin 
            });
            setMessage({ 
                type: 'success', 
                text: `Tạo tài khoản thành công! Mật khẩu là: ${res.data.password}` 
            });
            setNewUsername('');
            setNewIsAdmin(false);
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi tạo tài khoản' });
        }
    };

    const handleDeleteUser = async (id, username) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa user "${username}"?`)) return;
        try {
            await deleteUser(id);
            fetchUsers();
            setMessage({ type: 'success', text: 'Đã xóa người dùng' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi khi xóa người dùng' });
        }
    };

    const handleApprove = async (userId) => {
        setActionLoading(userId);
        try {
            await approvePasswordRequest(userId);
            setMessage({ type: 'success', text: 'Đã phê duyệt mật khẩu mới' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi khi phê duyệt' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId) => {
        setActionLoading(userId);
        try {
            await rejectPasswordRequest(userId);
            setMessage({ type: 'success', text: 'Đã từ chối yêu cầu' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi khi từ chối' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDirectChange = async (e) => {
        e.preventDefault();
        if (!selectedUser || !directNewPassword) return;
        
        setActionLoading(selectedUser._id);
        try {
            await adminChangePassword(selectedUser._id, directNewPassword);
            setMessage({ type: 'success', text: `Đã đổi mật khẩu cho ${selectedUser.username}` });
            setSelectedUser(null);
            setDirectNewPassword('');
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi khi đổi mật khẩu' });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading || authLoading) return <div className="container" style={{ paddingTop: '150px' }}><div className="loader"></div></div>;
    if (!user || !user.isAdmin) return null;

    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Quản lý Hệ thống</h1>
                    <p style={{ opacity: 0.6 }}>Quản lý tài khoản, phê duyệt mật khẩu và giám sát trạng thái</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Tổng người dùng</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-color)' }}>{users.length}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem' }}>
                {/* Left Column: Create User */}
                <div>
                    <div style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '24px', 
                        padding: '2rem',
                        position: 'sticky',
                        top: '120px'
                    }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800 }}>
                            <UserPlus size={20} color="var(--primary-color)" /> Cấp tài khoản mới
                        </h3>

                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ 
                                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                    color: message.type === 'success' ? '#4ade80' : '#f87171',
                                    padding: '0.8rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem',
                                    border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{ flex: 1 }}>{message.text}</span>
                                {message.type === 'success' && message.text.includes('Mật khẩu là:') && (
                                    <button 
                                        onClick={() => {
                                            const pwd = message.text.split('Mật khẩu là: ')[1];
                                            navigator.clipboard.writeText(pwd.trim());
                                            alert('Đã sao chép mật khẩu vào bộ nhớ tạm!');
                                        }}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.1)', 
                                            border: 'none', 
                                            color: 'white', 
                                            padding: '0.4rem', 
                                            borderRadius: '8px', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                        title="Sao chép mật khẩu"
                                    >
                                        <Copy size={14} />
                                    </button>
                                )}
                            </motion.div>
                        )}

                        <form onSubmit={handleCreateUser}>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Tên đăng nhập (Username)</label>
                                <input 
                                    type="text" 
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập..."
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.7rem', color: '#fff', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.2rem', padding: '1rem', background: 'rgba(255, 183, 0, 0.05)', borderRadius: '10px', border: '1px dashed rgba(255, 183, 0, 0.2)' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)', margin: 0 }}>Hệ thống sẽ tự động tạo mật khẩu ngẫu nhiên cho tài khoản này.</p>
                            </div>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="isAdminCheck"
                                    checked={newIsAdmin}
                                    onChange={(e) => setNewIsAdmin(e.target.checked)}
                                />
                                <label htmlFor="isAdminCheck" style={{ fontSize: '0.85rem', opacity: 0.8, cursor: 'pointer' }}>Quyền Quản trị viên (Admin)</label>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', fontWeight: '900' }}>Tạo tài khoản</button>
                        </form>
                    </div>
                </div>

                {/* Right Column: User Table */}
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1.2rem 1rem', fontSize: '0.75rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Người dùng</th>
                                <th style={{ padding: '1.2rem 1rem', fontSize: '0.75rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Vai trò</th>
                                <th style={{ padding: '1.2rem 1rem', fontSize: '0.75rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Mật khẩu</th>
                                <th style={{ padding: '1.2rem 1rem', fontSize: '0.75rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Trạng thái</th>
                                <th style={{ padding: '1.2rem 1rem', fontSize: '0.75rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.2s' }} className="user-row">
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ 
                                                width: '36px', height: '36px', borderRadius: '10px', 
                                                background: u.isAdmin ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: u.isAdmin ? 'black' : 'white'
                                            }}>
                                                <Users size={18} />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{u.username}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        {u.isAdmin ? (
                                            <span style={{ fontSize: '0.7rem', background: 'rgba(255, 183, 0, 0.1)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(255, 183, 0, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Shield size={10} /> Admin
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>User</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', flex: 1 }}>
                                                    {u.passwordRaw || '********'}
                                                </code>
                                                {u.passwordRaw && (
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(u.passwordRaw.trim());
                                                            alert('Đã sao chép mật khẩu!');
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px' }}
                                                        title="Sao chép"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            {u.passwordRequestStatus === 'pending' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--primary-color)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
                                                        <AlertCircle size={10} /> Chờ duyệt: {u.pendingPasswordRaw}
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(u.pendingPasswordRaw.trim());
                                                            alert('Đã sao chép mật khẩu chờ duyệt!');
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', opacity: 0.6, cursor: 'pointer', padding: '2px' }}
                                                        title="Sao chép mật khẩu chờ duyệt"
                                                    >
                                                        <Copy size={10} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        {u.isOnline ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.8rem' }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></span> Trực tuyến
                                            </span>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span> Ngoại tuyến
                                                </span>
                                                <span style={{ fontSize: '0.65rem', opacity: 0.3, marginTop: '0.2rem' }}>{new Date(u.lastActive).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            {u.passwordRequestStatus === 'pending' ? (
                                                <>
                                                    <button 
                                                        className="action-btn success"
                                                        onClick={() => handleApprove(u._id)}
                                                        disabled={actionLoading === u._id}
                                                        title="Phê duyệt mật khẩu"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button 
                                                        className="action-btn danger"
                                                        onClick={() => handleReject(u._id)}
                                                        disabled={actionLoading === u._id}
                                                        title="Từ chối"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    className="action-btn glass"
                                                    onClick={() => setSelectedUser(u)}
                                                    title="Đổi mật khẩu trực tiếp"
                                                >
                                                    <Key size={14} />
                                                </button>
                                            )}

                                            {!u.isAdmin && (
                                                <button 
                                                    className="action-btn danger-text"
                                                    onClick={() => handleDeleteUser(u._id, u.username)}
                                                    title="Xóa tài khoản"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Direct Change Password Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div style={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                    }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ 
                                background: '#1a1a1e', padding: '2.5rem', borderRadius: '24px', 
                                width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Đổi mật khẩu</h2>
                            <p style={{ opacity: 0.5, marginBottom: '2rem' }}>Thay đổi mật khẩu cho user <b>{selectedUser.username}</b></p>
                            <form onSubmit={handleDirectChange}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.5rem' }}>Mật khẩu mới</label>
                                    <input 
                                        type="text" 
                                        value={directNewPassword}
                                        onChange={(e) => setDirectNewPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới..."
                                        autoFocus
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" className="btn btn-glass" style={{ flex: 1 }} onClick={() => setSelectedUser(null)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={actionLoading === selectedUser._id}>Cập nhật</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .user-row:hover { background: rgba(255,255,255,0.03) !important; }
                .action-btn {
                    width: 32px; height: 32px; border-radius: 8px; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.2s;
                }
                .action-btn.success { background: #22c55e; color: black; }
                .action-btn.danger { background: #ef4444; color: white; }
                .action-btn.glass { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }
                .action-btn.danger-text { background: transparent; color: #ef4444; opacity: 0.6; }
                .action-btn:hover { transform: scale(1.1); opacity: 1; }
                .btn-glass {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: white; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer;
                }
                .btn-primary {
                    background: var(--primary-color); color: black; border: none;
                    padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 900; cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
