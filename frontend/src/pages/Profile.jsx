import React, { useEffect, useState } from 'react';
import { getUserProfile, clearHistory, deleteHistoryItem } from '../utils/api';
import { Link } from 'react-router-dom';
import { Heart, Clock, User, Film, ChevronRight, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('favorites');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setProfile(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;

    const MovieGrid = ({ movies }) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {movies?.map((movie, idx) => (
                <Link 
                    key={idx} 
                    to={`/movie/${movie.slug}?source=${movie.source || 'ophim'}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <motion.div 
                        whileHover={{ y: -10 }}
                        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <div style={{ aspectRatio: '2/3', position: 'relative' }}>
                            <img 
                                src={movie.thumb_url?.startsWith('http') ? movie.thumb_url : `https://phimimg.com/${movie.thumb_url}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                alt={movie.name} 
                            />
                        </div>
                        <div style={{ padding: '0.8rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{movie.name}</h4>
                        </div>
                    </motion.div>
                </Link>
            ))}
            {!movies?.length && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                    <Film size={48} style={{ marginBottom: '1rem' }} />
                    <p>Danh sách trống</p>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ background: '#0a0a0c', minHeight: '100vh', color: '#fff', paddingTop: '120px' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '4rem', background: 'linear-gradient(to right, rgba(248, 212, 72, 0.1), transparent)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(248, 212, 72, 0.05)' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                        <User size={48} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{profile.username}</h1>
                        <p style={{ opacity: 0.5 }}>Thành viên của NETPHIM</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button 
                        onClick={() => setActiveTab('favorites')}
                        style={{ 
                            background: 'none', border: 'none', color: activeTab === 'favorites' ? 'var(--primary-color)' : '#fff', 
                            padding: '1rem 2rem', cursor: 'pointer', fontWeight: 700, borderBottom: activeTab === 'favorites' ? '2px solid var(--primary-color)' : '2px solid transparent',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.3s'
                        }}
                    >
                        <Heart size={18} fill={activeTab === 'favorites' ? 'var(--primary-color)' : 'none'} /> Phim Yêu Thích
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        style={{ 
                            background: 'none', border: 'none', color: activeTab === 'history' ? 'var(--primary-color)' : '#fff', 
                            padding: '1rem 2rem', cursor: 'pointer', fontWeight: 700, borderBottom: activeTab === 'history' ? '2px solid var(--primary-color)' : '2px solid transparent',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.3s'
                        }}
                    >
                        <Clock size={18} /> Lịch Sử Xem
                    </button>
                </div>

                <div style={{ marginBottom: '100px' }}>
                    {activeTab === 'favorites' ? (
                        <MovieGrid movies={profile.favorites} />
                    ) : (
                        <div>
                            {profile.watchHistory?.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                    <button 
                                        onClick={async () => {
                                            if (window.confirm('Xóa sạch lịch sử xem phim?')) {
                                                await clearHistory();
                                                setProfile({ ...profile, watchHistory: [] });
                                            }
                                        }}
                                        style={{ 
                                            background: 'rgba(248, 113, 113, 0.1)', 
                                            border: '1px solid rgba(248, 113, 113, 0.2)',
                                            color: '#f87171',
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Trash2 size={16} /> Xóa tất cả
                                    </button>
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                                {profile.watchHistory?.map((movie, idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                        <Link 
                                            to={`/movie/${movie.slug}?source=${movie.source || 'ophim'}`}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <motion.div 
                                                whileHover={{ y: -10 }}
                                                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
                                            >
                                                <div style={{ aspectRatio: '2/3', position: 'relative' }}>
                                                    <img 
                                                        src={movie.thumb_url?.startsWith('http') ? movie.thumb_url : `https://phimimg.com/${movie.thumb_url}`} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        alt={movie.name} 
                                                    />
                                                </div>
                                                <div style={{ padding: '0.8rem' }}>
                                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{movie.name}</h4>
                                                </div>
                                            </motion.div>
                                        </Link>
                                        <button 
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                await deleteHistoryItem(movie.slug);
                                                setProfile({
                                                    ...profile,
                                                    watchHistory: profile.watchHistory.filter(h => h.slug !== movie.slug)
                                                });
                                            }}
                                            style={{ 
                                                position: 'absolute', top: '8px', right: '8px', 
                                                background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', 
                                                width: '28px', height: '28px', borderRadius: '50%', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                cursor: 'pointer', zIndex: 2, backdropFilter: 'blur(4px)'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {!profile.watchHistory?.length && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                                        <Film size={48} style={{ marginBottom: '1rem' }} />
                                        <p>Lịch sử trống</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
