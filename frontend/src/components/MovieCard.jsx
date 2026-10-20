import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star, Calendar, Heart, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMovieImageUrl } from '../utils/image';
import { useAuth } from '../context/AuthContext';
import { toggleFavorite } from '../utils/api';

const MovieCard = ({ movie, source = 'ophim' }) => {
    const effectiveSource = movie?.source || source;
    const [isHovered, setIsHovered] = useState(false);
    const [popupAlign, setPopupAlign] = useState('center');
    const [isFavorite, setIsFavorite] = useState(false);
    const hoverTimeout = useRef(null);
    const containerRef = useRef(null);
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

    const getBackdropUrl = () => {
        return getMovieImageUrl(movie, 'poster_url');
    };

    const handleMouseEnter = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                if (rect.left < 160) {
                    setPopupAlign('left');
                } else if (windowWidth - rect.right < 160) {
                    setPopupAlign('right');
                } else {
                    setPopupAlign('center');
                }
            }
            setIsHovered(true);
        }, 260); // 260ms intentional delay like Netflix
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setIsHovered(false);
    };

    const handlePlayClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/movie/${movie?.slug}?source=${effectiveSource}`);
    };

    const handleDetailsClick = (e) => {
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
        try {
            const res = await toggleFavorite({
                slug: movie?.slug,
                name: movie?.name,
                thumb_url: movie?.thumb_url,
                source: effectiveSource
            });
            setIsFavorite(res.isFavorite);
        } catch (err) {
            console.error('Toggle favorite error:', err);
        }
    };

    // Calculate rating score
    const ratingScore = movie.imdb?.rating || 
        (movie.tmdb?.vote_average ? Number(movie.tmdb.vote_average).toFixed(1) : (movie.rate || '7.5'));

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative', borderRadius: '12px' }}
        >
            {/* Base Card */}
            <Link to={`/movie/${movie?.slug}?source=${effectiveSource}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="movie-card-container" style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    background: '#13111a',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 8px 18px rgba(0,0,0,0.4)',
                    cursor: 'pointer'
                }}>
                    {/* Poster Image */}
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

                    {/* Top Right Badges */}
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        zIndex: 2
                    }}>
                        {movie.episode_current && (
                            <span style={{
                                background: 'rgba(15, 12, 21, 0.78)',
                                color: '#e2e8f0',
                                padding: '3px 7px',
                                borderRadius: '5px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.18)',
                                backdropFilter: 'blur(6px)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                            }}>
                                {movie.episode_current}
                            </span>
                        )}
                    </div>

                    {/* Bottom Metadata Overlay */}
                    <div className="card-meta-gradient">
                        <h3 className="card-title">
                            {movie.name}
                        </h3>
                        {movie.origin_name && (
                            <p style={{
                                fontSize: '0.72rem',
                                opacity: 0.6,
                                margin: '2px 0 0 0',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {movie.origin_name}
                            </p>
                        )}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.6rem', 
                            marginTop: '0.4rem',
                            fontSize: '0.72rem',
                            opacity: 0.85
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#cbd5e1' }}>
                                <Calendar size={11} opacity={0.7} /> {movie.year || new Date().getFullYear()}
                            </span>
                            {movie.quality && (
                                <span style={{ 
                                    background: 'rgba(139, 92, 246, 0.25)', 
                                    color: '#c4b5fd', 
                                    padding: '1px 6px', 
                                    borderRadius: '4px', 
                                    fontWeight: '800',
                                    fontSize: '0.62rem',
                                    border: '1px solid rgba(139, 92, 246, 0.4)'
                                }}>
                                    {movie.quality}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            {/* Netflix-style Expandable Popover on Hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className={`netflix-popup netflix-popup-${popupAlign}`}
                        onClick={handlePlayClick}
                    >
                        {/* Top 16:9 Backdrop Image Banner */}
                        <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden', background: '#111' }}>
                            <img 
                                src={getBackdropUrl()}
                                alt={movie?.name || 'Movie'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={(e) => {
                                    e.target.src = getImageUrl();
                                }}
                            />
                            {/* Smooth gradient blend into card body */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, #1e2029 0%, rgba(30, 32, 41, 0.4) 45%, transparent 100%)'
                            }} />
                            {/* Episode badge top-right */}
                            {movie.episode_current && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(0,0,0,0.75)',
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(6px)'
                                }}>
                                    {movie.episode_current}
                                </div>
                            )}
                        </div>

                        {/* Popover Details Content */}
                        <div style={{ padding: '0.9rem 1.1rem 1.2rem 1.1rem', background: '#1e2029' }}>
                            {/* Movie Titles */}
                            <h4 style={{ 
                                fontSize: '1.05rem', 
                                fontWeight: 800, 
                                color: '#fff', 
                                margin: 0,
                                lineHeight: '1.3',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {movie.name}
                            </h4>
                            {movie.origin_name && (
                                <p style={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 600, 
                                    color: '#f5c518', 
                                    margin: '3px 0 12px 0',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {movie.origin_name}
                                </p>
                            )}

                            {/* Action Buttons Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                {/* Xem phim / trailer button */}
                                <button 
                                    onClick={handlePlayClick}
                                    style={{
                                        background: '#f5c518',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '7px 14px',
                                        fontSize: '0.82rem',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(245, 197, 24, 0.35)',
                                        transition: 'transform 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Play size={14} fill="black" stroke="black" />
                                    {movie.episode_current?.toLowerCase().includes('trailer') ? 'Xem trailer' : 'Xem ngay'}
                                </button>

                                {/* Favorite button */}
                                <button 
                                    onClick={handleToggleFavorite}
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        color: isFavorite ? '#ef4444' : '#fff',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '8px',
                                        padding: '7px 11px',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                >
                                    <Heart size={14} fill={isFavorite ? '#ef4444' : 'none'} stroke={isFavorite ? '#ef4444' : 'white'} />
                                    {isFavorite ? 'Đã thích' : 'Thích'}
                                </button>

                                {/* Info button */}
                                <button 
                                    onClick={handleDetailsClick}
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '8px',
                                        padding: '7px 11px',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                >
                                    <Info size={14} />
                                    Chi tiết
                                </button>
                            </div>

                            {/* Metadata Badges Row: IMDb, Rating, Year, Duration */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f5c518', padding: '1px 5px', borderRadius: '4px' }}>
                                    <span style={{ color: '#000', fontWeight: 900, fontSize: '0.65rem' }}>IMDb</span>
                                    <span style={{ color: '#000', fontWeight: 800, fontSize: '0.72rem' }}>
                                        {ratingScore}
                                    </span>
                                </div>

                                <span style={{ 
                                    border: '1px solid rgba(255,255,255,0.28)', 
                                    color: '#fff', 
                                    padding: '1px 5px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.68rem', 
                                    fontWeight: 700 
                                }}>
                                    P
                                </span>

                                <span>{movie.year || new Date().getFullYear()}</span>

                                <span>•</span>

                                <span>{movie.time || (movie.episode_total ? `${movie.episode_total} tập` : 'Full HD')}</span>
                            </div>

                            {/* Genre line */}
                            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 500 }}>
                                {movie.category?.map(c => c.name).join(', ') || (movie.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ')}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .movie-card-container {
                    transition: border-color 0.25s ease, box-shadow 0.25s ease;
                }
                .movie-card-container:hover {
                    border-color: rgba(245, 197, 24, 0.4);
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
                }
                .card-meta-gradient {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 52%;
                    background: linear-gradient(to top, rgba(10, 8, 16, 0.98) 0%, rgba(10, 8, 16, 0.7) 60%, transparent 100%);
                    display: flex;
                    flex-direction: column;
                    justifyContent: flex-end;
                    padding: 0.9rem;
                    z-index: 2;
                }
                .card-title {
                    font-size: 0.88rem;
                    font-weight: 700;
                    margin: 0;
                    color: #fff;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.35;
                }
                .netflix-popup {
                    position: absolute;
                    top: -24px;
                    width: 320px;
                    background: #1e2029;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    z-index: 999;
                    cursor: pointer;
                }
                .netflix-popup-center {
                    left: 50%;
                    transform: translateX(-50%);
                }
                .netflix-popup-left {
                    left: -8px;
                }
                .netflix-popup-right {
                    right: -8px;
                    left: auto;
                }
                @media (max-width: 640px) {
                    .netflix-popup {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MovieCard;
