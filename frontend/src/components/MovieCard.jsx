import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMovieImageUrl } from '../utils/image';

const MovieCard = ({ movie, source = 'ophim' }) => {
    // Determine the source if not provided
    const effectiveSource = movie?.source || source;
    
    // Smart Image Fallback
    const getImageUrl = () => {
        return getMovieImageUrl(movie, 'thumb_url');
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

                    {/* Trailer / Coming Soon Badge */}
                    {(movie.episode_current?.toLowerCase().includes('trailer') || movie.status === 'trailer') && (
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            padding: '4px 9px',
                            borderRadius: '6px',
                            zIndex: 3,
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
                            letterSpacing: '0.5px'
                        }}>
                            Trailer
                        </div>
                    )}

                    {/* Top Right Badges */}
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        zIndex: 2
                    }}>
                        {movie.episode_current && !movie.episode_current.toLowerCase().includes('trailer') && movie.episode_current !== 'Full' && (
                            <span style={{
                                background: 'rgba(15, 12, 21, 0.75)',
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
                        )}
                    </div>

                    {/* Floating Center Glassmorphic Play Button on Hover */}
                    <div className="card-play-action">
                        <div className="card-play-btn">
                            <Play fill="white" color="white" size={22} style={{ marginLeft: '3px' }} />
                        </div>
                        <span className="card-play-text">Xem Ngay</span>
                    </div>

                    {/* Bottom Gradient & Title Metadata */}
                    <div className="card-meta-gradient">
                        <h3 className="card-title">
                            {movie.name}
                        </h3>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.6rem', 
                            marginTop: '0.4rem',
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
                    </div>
                </div>
            </Link>

            <style>{`
                .movie-card-container {
                    transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
                }
                .movie-card-container:hover {
                    border-color: rgba(167, 139, 250, 0.55);
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
                    z-index: 3;
                }
                .movie-card-container:hover .card-sheen {
                    transform: translateX(150%);
                }
                .card-play-action {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justifyContent: center;
                    gap: 0.6rem;
                    z-index: 4;
                    pointer-events: none;
                    opacity: 0;
                    transform: scale(0.85);
                    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .movie-card-container:hover .card-play-action {
                    opacity: 1;
                    transform: scale(1);
                }
                .card-play-btn {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #a78bfa, #7c3aed);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.65), 0 0 0 4px rgba(255, 255, 255, 0.18);
                    transition: transform 0.2s ease;
                }
                .card-play-text {
                    color: #fff;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    background: rgba(15, 12, 21, 0.75);
                    padding: 3px 12px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.2);
                    backdrop-filter: blur(6px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                }
                .card-meta-gradient {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 50%;
                    background: linear-gradient(to top, rgba(10, 8, 16, 0.98) 0%, rgba(10, 8, 16, 0.7) 60%, transparent 100%);
                    display: flex;
                    flex-direction: column;
                    justifyContent: flex-end;
                    padding: 1rem;
                    z-index: 2;
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
                    transition: color 0.3s ease, transform 0.3s ease;
                }
                .movie-card-container:hover .card-title {
                    color: #c4b5fd;
                    transform: translateY(-2px);
                }
            `}</style>
        </motion.div>
    );
};

export default MovieCard;
