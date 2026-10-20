import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Heart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMovieImageUrl } from '../utils/image';
import { useAuth } from '../context/AuthContext';
import { toggleFavorite } from '../utils/api';

const MovieCard = ({ movie, source = 'ophim' }) => {
    const effectiveSource = movie?.source || source;
    const [isFavorite, setIsFavorite] = useState(false);
    const [isPopping, setIsPopping] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Check if movie is already in user favorites
    useEffect(() => {
        if (user?.favorites && movie?.slug) {
            const found = user.favorites.some(f => f.slug === movie.slug);
            setIsFavorite(found);
        }
    }, [user, movie?.slug]);

    const getImageUrl = () => {
        return getMovieImageUrl(movie, 'thumb_url');
    };

    const handlePlayClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/movie/${movie?.slug}?source=${effectiveSource}`);
    };

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            navigate('/login');
            return;
        }

        // Trigger popping animation immediately for snappy feedback
        setIsPopping(true);
        setTimeout(() => setIsPopping(false), 500);

        try {
            const res = await toggleFavorite({
                slug: movie?.slug,
                name: movie?.name,
                thumb_url: movie?.thumb_url,
                source: effectiveSource
            });
            setIsFavorite(res.isFavorite);
        } catch (err) {
            console.error('Lỗi lưu phim yêu thích:', err);
        }
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{ position: 'relative', borderRadius: '14px' }}
        >
            <Link to={`/movie/${movie?.slug}?source=${effectiveSource}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="movie-card-container" style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    background: '#13111a',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                    cursor: 'pointer'
                }}>
                    {/* Poster Image with Zoom */}
                    <img 
                        src={getImageUrl()} 
                        alt={movie?.name || 'Movie'}
                        loading="lazy"
                        decoding="async"
                        className="movie-poster-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                            if (movie?.thumb_url && typeof movie.thumb_url === 'string' && !movie.thumb_url.startsWith('http') && !e.target.src.includes('img.phimapi.com')) {
                                e.target.src = `https://img.phimapi.com/upload/poster/${movie.thumb_url}`;
                            } else {
                                e.target.src = '/placeholder.svg';
                            }
                        }}
                    />

                    {/* Glossy Light Sheen Sweep Effect */}
                    <div className="card-sheen" />

                    {/* Top Right Badges (Episode / Trailer) */}
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        zIndex: 3
                    }}>
                        {(movie.episode_current?.toLowerCase().includes('trailer') || movie.status === 'trailer') ? (
                            <span style={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 900,
                                padding: '4px 9px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
                                letterSpacing: '0.5px'
                            }}>
                                Trailer
                            </span>
                        ) : movie.episode_current && movie.episode_current !== 'Full' ? (
                            <span style={{
                                background: 'rgba(15, 12, 21, 0.78)',
                                color: '#e2e8f0',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.18)',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                            }}>
                                {movie.episode_current}
                            </span>
                        ) : null}
                    </div>

                    {/* Bottom Gradient & Information */}
                    <div className="card-meta-gradient">
                        <h3 className="card-title">
                            {movie.name}
                        </h3>
                        {movie.origin_name && (
                            <p style={{
                                fontSize: '0.72rem',
                                opacity: 0.65,
                                margin: '2px 0 0 0',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                color: '#cbd5e1'
                            }}>
                                {movie.origin_name}
                            </p>
                        )}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.6rem', 
                            marginTop: '0.35rem',
                            fontSize: '0.75rem',
                            opacity: 0.85
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
                                <Calendar size={12} opacity={0.7} /> {movie.year || new Date().getFullYear()}
                            </span>
                            {movie.quality && (
                                <span style={{ 
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(99, 102, 241, 0.8))', 
                                    color: '#fff', 
                                    padding: '2px 7px', 
                                    borderRadius: '5px', 
                                    fontWeight: '800',
                                    fontSize: '0.65rem',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    {movie.quality}
                                </span>
                            )}
                        </div>

                        {/* Bottom Actions Row: Nút Xem Ngay + Nút Yêu Thích hình vuông */}
                        <div className="card-actions-row">
                            <button 
                                onClick={handlePlayClick}
                                className="card-watch-btn"
                            >
                                <Play size={13} fill="white" stroke="white" />
                                <span>Xem Ngay</span>
                            </button>

                            <button
                                onClick={handleToggleFavorite}
                                className={`card-fav-square-btn ${isFavorite ? 'active' : ''} ${isPopping ? 'heart-popping' : ''}`}
                                title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                            >
                                <Heart 
                                    size={17} 
                                    fill={isFavorite ? '#ef4444' : 'none'} 
                                    stroke={isFavorite ? '#ef4444' : '#ffffff'} 
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </Link>

            <style>{`
                .movie-card-container {
                    transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
                }
                .movie-card-container:hover {
                    border-color: rgba(167, 139, 250, 0.65);
                    box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.8), 0 0 24px rgba(139, 92, 246, 0.35);
                }
                .movie-poster-img {
                    transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .movie-card-container:hover .movie-poster-img {
                    transform: scale(1.07);
                }
                .card-sheen {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.15) 50%, transparent 80%);
                    transform: translateX(-150%);
                    transition: transform 0.7s ease;
                    pointer-events: none;
                    z-index: 2;
                }
                .movie-card-container:hover .card-sheen {
                    transform: translateX(150%);
                }

                /* Gradient thông tin bên dưới */
                .card-meta-gradient {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(10, 8, 16, 0.98) 0%, rgba(10, 8, 16, 0.85) 65%, transparent 100%);
                    display: flex;
                    flex-direction: column;
                    justifyContent: flex-end;
                    padding: 0.9rem;
                    z-index: 4;
                    transition: all 0.3s ease;
                }
                .card-title {
                    font-size: 0.92rem;
                    font-weight: 700;
                    margin: 0;
                    color: #fff;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.35;
                    transition: color 0.3s ease;
                }
                .movie-card-container:hover .card-title {
                    color: #c4b5fd;
                }

                /* Hàng nút bấm phía dưới (Xem Ngay + Yêu Thích) */
                .card-actions-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 0.65rem;
                    opacity: 0;
                    max-height: 0;
                    transform: translateY(8px);
                    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                    overflow: hidden;
                }
                .movie-card-container:hover .card-actions-row {
                    opacity: 1;
                    max-height: 44px;
                    transform: translateY(0);
                }

                /* Nút Xem Ngay */
                .card-watch-btn {
                    flex: 1;
                    height: 36px;
                    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(109, 40, 217, 0.4);
                    transition: all 0.2s ease;
                }
                .card-watch-btn:hover {
                    background: linear-gradient(135deg, #9333ea, #7c3aed);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.6);
                }

                /* Nút Yêu Thích hình vuông */
                .card-fav-square-btn {
                    width: 36px;
                    height: 36px;
                    flex-shrink: 0;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .card-fav-square-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.5);
                    transform: translateY(-1px);
                }
                .card-fav-square-btn.active {
                    background: rgba(239, 68, 68, 0.25);
                    border-color: rgba(239, 68, 68, 0.6);
                }

                /* Hiệu ứng nảy tim sống động khi bấm */
                @keyframes heartPulse {
                    0% { transform: scale(1); }
                    25% { transform: scale(1.45) rotate(-10deg); }
                    50% { transform: scale(0.85) rotate(6deg); }
                    75% { transform: scale(1.2) rotate(-3deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                .heart-popping {
                    animation: heartPulse 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 0 16px rgba(239, 68, 68, 0.8) !important;
                    background: rgba(239, 68, 68, 0.35) !important;
                }

                @media (max-width: 768px) {
                    .card-actions-row {
                        opacity: 1;
                        max-height: 44px;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default MovieCard;
