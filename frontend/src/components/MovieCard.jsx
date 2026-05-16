import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieCard = ({ movie, source = 'ophim' }) => {
    // Determine the source if not provided
    const effectiveSource = movie.source || source;
    
    // Smart Image Fallback
    const getImageUrl = () => {
        if (!movie.thumb_url) return '/placeholder.png';
        if (movie.thumb_url.startsWith('http')) return movie.thumb_url;
        
        // Use phimimg.com for Ophim as it's the most reliable for v1
        if (effectiveSource === 'ophim' || effectiveSource === 'kkphim') {
            return `https://phimimg.com/${movie.thumb_url}`;
        }
        return `https://phimimg.com/${movie.thumb_url}`;
    };

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}
        >
            <Link to={`/movie/${movie.slug}?source=${effectiveSource}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="movie-card-container" style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    background: '#1a1a1d',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                    cursor: 'pointer'
                }}>
                    {/* Poster Image */}
                    <img 
                        src={getImageUrl()} 
                        alt={movie.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            // Only try fallback if thumb_url is not already a full URL
                            if (!movie.thumb_url.startsWith('http') && !e.target.src.includes('img.phimapi.com')) {
                                e.target.src = `https://img.phimapi.com/upload/poster/${movie.thumb_url}`;
                            }
                        }}
                    />

                    {/* Trailer / Coming Soon Badge */}
                    {(movie.episode_current?.toLowerCase().includes('trailer') || movie.status === 'trailer') && (
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#3b82f6',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            padding: '4px 10px',
                            borderRadius: '4px',
                            zIndex: 2,
                            textTransform: 'uppercase',
                            boxShadow: '0 2px 10px rgba(59, 130, 246, 0.5)'
                        }}>
                            Trailer
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '45%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '1rem'
                    }}>
                        <h3 style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '600', 
                            margin: 0, 
                            color: '#fff',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.4',
                            letterSpacing: '0.01em',
                            wordSpacing: '0.02em'
                        }}>
                            {movie.name}
                        </h3>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.8rem', 
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            opacity: 0.8
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Calendar size={12} /> {movie.year || '2024'}
                            </span>
                            {movie.quality && (
                                <span style={{ 
                                    background: 'var(--primary-color)', 
                                    color: '#000', 
                                    padding: '1px 5px', 
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '0.65rem'
                                }}>
                                    {movie.quality}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Hover Play Button Overlay */}
                    <div className="hover-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(139, 92, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        backdropFilter: 'blur(2px)'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'var(--primary-color)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
                        }}>
                            <Play fill="white" color="white" size={24} style={{ marginLeft: '4px' }} />
                        </div>
                    </div>

                    {/* Top Right Badges */}
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                    }}>
                        {movie.episode_current && movie.episode_current !== 'Full' && (
                            <span style={{
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)'
                            }}>
                                {movie.episode_current}
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            <style>{`
                .movie-card-container:hover .hover-overlay {
                    opacity: 1 !important;
                }
            `}</style>
        </motion.div>
    );
};

export default MovieCard;
