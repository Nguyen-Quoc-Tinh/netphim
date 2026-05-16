import React, { useState, useEffect } from 'react';
import { getUsers, adminChangePassword, approvePasswordRequest, rejectPasswordRequest, deleteUser } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Key, Check, X, Trash2, Shield, User as UserIcon, Clock, Mail } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

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
        if (!selectedUser || !newPassword) return;
        
        setActionLoading(selectedUser._id);
        try {
            await adminChangePassword(selectedUser._id, newPassword);
            setMessage({ type: 'success', text: `Đã đổi mật khẩu cho ${selectedUser.username}` });
            setSelectedUser(null);
            setNewPassword('');
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi khi đổi mật khẩu' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId, username) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa user "${username}"?`)) return;
        
        setActionLoading(userId);
        try {
            await deleteUser(userId);
            setMessage({ type: 'success', text: 'Đã xóa người dùng' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi khi xóa' });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    return (
        <div style={{ padding: '2rem', paddingTop: '120px', maxWidth: '1400px', margin: '0 auto', color: 'white', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Quản lý Người dùng</h1>
                    <p style={{ opacity: 0.6 }}>Quản lý tài khoản, phân quyền và phê duyệt mật khẩu</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Tổng số người dùng</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-color)' }}>{users.length}</div>
                </div>
            </div>

            {message && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        padding: '1rem 1.5rem', 
                        borderRadius: '12px', 
                        marginBottom: '2rem',
                        background: message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
                        color: message.type === 'success' ? '#4ade80' : '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>{message.text}</span>
                    <X size={18} onClick={() => setMessage(null)} style={{ cursor: 'pointer' }} />
                </motion.div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Người dùng</th>
                            <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Vai trò</th>
                            <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Mật khẩu</th>
                            <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Trạng thái</th>
                            <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Hoạt động</th>
                            <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.8rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((u) => (
                                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.2s' }} className="user-row">
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ 
                                                width: '40px', height: '40px', borderRadius: '12px', 
                                                background: u.isAdmin ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: u.isAdmin ? 'black' : 'white'
                                            }}>
                                                {u.isAdmin ? <Shield size={20} /> : <UserIcon size={20} />}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{u.username}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            padding: '0.3rem 0.8rem', 
                                            borderRadius: '20px',
                                            background: u.isAdmin ? 'rgba(248, 212, 72, 0.1)' : 'rgba(255,255,255,0.05)',
                                            color: u.isAdmin ? 'var(--primary-color)' : 'rgba(255,255,255,0.6)',
                                            border: `1px solid ${u.isAdmin ? 'rgba(248, 212, 72, 0.2)' : 'rgba(255,255,255,0.1)'}`
                                        }}>
                                            {u.isAdmin ? 'Quản trị' : 'Thành viên'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                                            {u.passwordRaw || '********'}
                                        </code>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        {u.isOnline ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontSize: '0.85rem' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></span>
                                                Trực tuyến
                                            </span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></span>
                                                Ngoại tuyến
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', opacity: 0.5 }}>
                                        {new Date(u.lastActive).toLocaleString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            {u.passwordRequestStatus === 'pending' ? (
                                                <div style={{ 
                                                    background: 'rgba(248, 212, 72, 0.05)', 
                                                    padding: '0.4rem', 
                                                    borderRadius: '12px',
                                                    border: '1px dashed var(--primary-color)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginRight: '0.5rem'
                                                }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', padding: '0 0.5rem' }}>YÊU CẦU: {u.pendingPasswordRaw}</span>
                                                    <button 
                                                        className="btn-action success" 
                                                        onClick={() => handleApprove(u._id)}
                                                        disabled={actionLoading === u._id}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button 
                                                        className="btn-action danger" 
                                                        onClick={() => handleReject(u._id)}
                                                        disabled={actionLoading === u._id}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className="btn-icon" 
                                                    onClick={() => setSelectedUser(u)}
                                                    title="Đổi mật khẩu"
                                                >
                                                    <Key size={18} />
                                                </button>
                                            )}

                                            {!u.isAdmin && (
                                                <button 
                                                    className="btn-icon danger"
                                                    onClick={() => handleDelete(u._id, u.username)}
                                                    title="Xóa người dùng"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                    Không có người dùng nào được tìm thấy
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selectedUser && (
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(0,0,0,0.85)', 
                        backdropFilter: 'blur(10px)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 1100
                    }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ 
                                background: '#1a1a1e', 
                                padding: '2.5rem', 
                                borderRadius: '24px', 
                                width: '100%', 
                                maxWidth: '400px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
                            }}
                        >
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Đổi mật khẩu</h2>
                            <p style={{ opacity: 0.5, marginBottom: '2rem' }}>Thay đổi mật khẩu cho user <b>{selectedUser.username}</b></p>
                            
                            <form onSubmit={handleDirectChange}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.5rem' }}>Mật khẩu mới</label>
                                    <input 
                                        type="text" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới..."
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        type="button" 
                                        className="btn-glass" 
                                        style={{ flex: 1 }}
                                        onClick={() => setSelectedUser(null)}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-primary" 
                                        style={{ flex: 1 }}
                                        disabled={actionLoading === selectedUser._id}
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .user-row:hover {
                    background: rgba(255,255,255,0.04) !important;
                }
                .btn-icon {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-icon:hover {
                    background: rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                }
                .btn-icon.danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }
                .btn-action {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-action.success {
                    background: #22c55e;
                    color: black;
                }
                .btn-action.danger {
                    background: #ef4444;
                    color: white;
                }
                .btn-action:hover {
                    transform: scale(1.1);
                }
                .btn-glass {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .btn-primary {
                    background: var(--primary-color);
                    color: black;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: 0.3s;
                }
            `}</style>
        </div>
    );
};

export default AdminUsers;
