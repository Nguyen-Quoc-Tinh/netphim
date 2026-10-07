import React, { useEffect, useState, useRef } from 'react';
import { getHome, getLocalMovies, api } from '../utils/api';
import { getMovieImageUrl } from '../utils/image';
import MovieCard from '../components/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Heart, ChevronUp, ChevronLeft, ChevronRight, Flame, Sparkles, Star, Calendar, Clock, Film } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { HeroSkeleton, MovieCardSkeleton } from '../components/Skeleton';

const Home = () => {
    const [data, setData] = useState(null);
    const [localData, setLocalData] = useState({ movies: [], total: 0 });
    const [countryMovies, setCountryMovies] = useState({ korea: [], china: [], usuk: [] });
    const [topSeries, setTopSeries] = useState([]);
    const [theaterMovies, setTheaterMovies] = useState([]);
    const [animeMovies, setAnimeMovies] = useState([]);
    const [animeIndex, setAnimeIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [, setLoadingMore] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);
    const [isHeroPaused, setIsHeroPaused] = useState(false);
    const [progressKey, setProgressKey] = useState(0);
    const navigate = useNavigate();
    const topTenRef = React.useRef(null);

    const scrollTopTen = (direction) => {
        if (topTenRef.current) {
            const scrollAmount = topTenRef.current.offsetWidth;
            topTenRef.current.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [homeData, localMoviesRes, korea, china, usuk, series, theater, anime] = await Promise.all([
                    getHome(),
                    getLocalMovies(),
                    api.get('/quoc-gia/han-quoc'),
                    api.get('/quoc-gia/trung-quoc'),
                    api.get('/quoc-gia/au-my'),
                    api.get('/danh-sach/phim-bo'),
                    api.get('/kkphim/list/phim-chieu-rap'),
                    api.get('/the-loai/hoat-hinh')
                ]);
                setData(homeData);
                setLocalData(localMoviesRes);
                setTheaterMovies(theater?.data?.data?.items?.slice(0, 10) || []);
                setCountryMovies({
                    korea: korea?.data?.data?.items?.slice(0, 10) || [],
                    china: china?.data?.data?.items?.slice(0, 10) || [],
                    usuk: usuk?.data?.data?.items?.slice(0, 10) || []
                });
                setTopSeries(series?.data?.data?.items?.slice(0, 10) || []);
                setAnimeMovies(anime?.data?.data?.items?.slice(0, 15) || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const featuredMovies = data?.kkphim?.items?.slice(0, 8) || [];
    const currentHero = featuredMovies[heroIndex] || featuredMovies[0];

    // Autoplay slider (every 7s)
    useEffect(() => {
        if (!featuredMovies.length || isHeroPaused) return;
        const interval = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % featuredMovies.length);
            setProgressKey(prev => prev + 1);
        }, 7000);
        return () => clearInterval(interval);
    }, [featuredMovies.length, isHeroPaused, heroIndex]);

    const handleSelectHero = (idx) => {
        setHeroIndex(idx);
        setProgressKey(prev => prev + 1);
    };

    const handleNextHero = (e) => {
        e?.stopPropagation();
        if (!featuredMovies.length) return;
        setHeroIndex(prev => (prev + 1) % featuredMovies.length);
        setProgressKey(prev => prev + 1);
    };

    const handlePrevHero = (e) => {
        e?.stopPropagation();
        if (!featuredMovies.length) return;
        setHeroIndex(prev => (prev - 1 + featuredMovies.length) % featuredMovies.length);
        setProgressKey(prev => prev + 1);
    };

    const getCategoriesList = (movie) => {
        if (!movie) return [];
        if (Array.isArray(movie.category)) {
            return movie.category.map(c => (typeof c === 'string' ? c : c.name)).filter(Boolean);
        }
        return [];
    };

    const getHeroDescription = (movie) => {
        if (!movie) return '';
        if (movie.content) {
            const clean = movie.content.replace(/<[^>]*>/g, '').trim();
            if (clean.length > 30) return clean;
        }
        const cats = getCategoriesList(movie).slice(0, 3).join(', ');
        const country = movie.country?.[0]?.name || '';
        const origin = movie.origin_name ? `(${movie.origin_name})` : '';
        return `${movie.name} ${origin} là tác phẩm điện ảnh xuất sắc${country ? ` đến từ ${country}` : ''}${cats ? ` thuộc thể loại ${cats}` : ''}. Trải nghiệm ngay những thước phim lôi cuốn, kịch tính cùng chất lượng hình ảnh sắc nét và âm thanh đỉnh cao.`;
    };

    const handlePageChange = async (newPage) => {
        const totalPages = Math.ceil(localData.total / 48);
        if (newPage < 1 || newPage > totalPages) return;
        
        setLoadingMore(true);
        try {
            const res = await getLocalMovies(newPage);
            setLocalData(res);
            setCurrentPage(newPage);
            document.getElementById('local-movies-section').scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return (
            <div style={{ background: '#0a0a0c', minHeight: '100vh', paddingBottom: '5rem' }}>
                <HeroSkeleton />
                <div className="container" style={{ marginTop: '4rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2rem' }}>
                        {[...Array(12)].map((_, i) => <MovieCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Premium Cinematic Hero Slider */}
            {currentHero && (
                <section 
                    className="hero-slider-wrapper"
                    onMouseEnter={() => setIsHeroPaused(true)}
                    onMouseLeave={() => setIsHeroPaused(false)}
                    style={{
                        position: 'relative',
                        minHeight: '85vh',
                        height: '92vh',
                        overflow: 'hidden',
                        background: '#0a0a0c'
                    }}
                >
                    {/* Animated Backdrop Image with Ken Burns zoom */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentHero._id || currentHero.slug || heroIndex}
                            initial={{ scale: 1.08, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 1
                            }}
                        >
                            <img 
                                src={getMovieImageUrl(currentHero, 'thumb_url')} 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover', 
                                    objectPosition: 'center 20%',
                                    filter: 'brightness(0.85) contrast(1.08) saturate(1.05)'
                                }} 
                                alt={currentHero.name || "Hero"}
                                loading="eager"
                                fetchPriority="high"
                                onError={(e) => { e.target.src = '/placeholder.svg'; }}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Ambient Glow & Multi-layer Gradients */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        background: `
                            radial-gradient(circle at 15% 45%, rgba(139, 92, 246, 0.22) 0%, transparent 55%),
                            linear-gradient(90deg, #0a0a0c 0%, rgba(10,10,12,0.95) 28%, rgba(10,10,12,0.65) 55%, rgba(10,10,12,0.15) 80%, transparent 100%),
                            linear-gradient(to top, #0a0a0c 0%, rgba(10,10,12,0.9) 12%, transparent 40%),
                            linear-gradient(to bottom, rgba(10,10,12,0.7) 0%, transparent 20%)
                        `,
                        pointerEvents: 'none'
                    }} />

                    {/* Hero Content Container */}
                    <div className="container" style={{
                        position: 'relative',
                        zIndex: 3,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '60px',
                        paddingBottom: '40px'
                    }}>
                        {/* Left Side: Movie Information & CTA */}
                        <div style={{ maxWidth: '640px', width: '100%' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`hero-content-${currentHero._id || currentHero.slug}`}
                                    initial={{ y: 25, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                >
                                    {/* Top Trending Badge */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        background: 'rgba(252, 196, 25, 0.12)',
                                        border: '1px solid rgba(252, 196, 25, 0.35)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '0.35rem 0.9rem',
                                        borderRadius: '50px',
                                        marginBottom: '1rem',
                                        boxShadow: '0 4px 15px rgba(252, 196, 25, 0.15)'
                                    }}>
                                        <Flame size={15} color="#fcc419" />
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fcc419', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                            Thịnh Hành #{heroIndex + 1}
                                        </span>
                                    </div>

                                    {/* Main Title */}
                                    <h1 style={{
                                        fontSize: 'clamp(2.2rem, 4.8vw, 4rem)',
                                        fontWeight: 900,
                                        lineHeight: 1.08,
                                        marginBottom: '0.4rem',
                                        color: '#ffffff',
                                        textShadow: '0 4px 25px rgba(0,0,0,0.85)',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {currentHero.name}
                                    </h1>

                                    {/* Origin Title */}
                                    <h2 style={{
                                        fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
                                        fontWeight: 600,
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        marginBottom: '1.2rem',
                                        fontStyle: 'italic',
                                        textShadow: '0 2px 10px rgba(0,0,0,0.6)'
                                    }}>
                                        {currentHero.origin_name}
                                    </h2>

                                    {/* Movie Meta Badges */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '1.2rem' }}>
                                        <span style={{
                                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                            color: '#000',
                                            fontWeight: 900,
                                            fontSize: '0.75rem',
                                            padding: '3px 9px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
                                        }}>
                                            <Star size={12} fill="#000" color="#000" /> 8.8 IMDb
                                        </span>

                                        <span style={{
                                            background: 'rgba(139, 92, 246, 0.2)',
                                            color: '#c4b5fd',
                                            border: '1px solid rgba(139, 92, 246, 0.4)',
                                            fontWeight: 800,
                                            fontSize: '0.75rem',
                                            padding: '3px 9px',
                                            borderRadius: '6px'
                                        }}>
                                            {currentHero.quality || '4K Ultra HD'}
                                        </span>

                                        <span style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            padding: '3px 9px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(255, 255, 255, 0.15)'
                                        }}>
                                            {currentHero.year || '2025'}
                                        </span>

                                        <span style={{
                                            background: 'rgba(16, 185, 129, 0.15)',
                                            color: '#34d399',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            padding: '3px 9px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(16, 185, 129, 0.3)'
                                        }}>
                                            {currentHero.episode_current || 'Full HD'}
                                        </span>

                                        {currentHero.lang && (
                                            <span style={{
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                color: 'rgba(255,255,255,0.85)',
                                                fontSize: '0.75rem',
                                                padding: '3px 9px',
                                                borderRadius: '6px'
                                            }}>
                                                {currentHero.lang}
                                            </span>
                                        )}
                                    </div>

                                    {/* Dynamic Categories Tags */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.4rem' }}>
                                        {getCategoriesList(currentHero).slice(0, 4).map((tag, i) => (
                                            <span 
                                                key={i} 
                                                style={{ 
                                                    fontSize: '0.78rem', 
                                                    color: 'rgba(255,255,255,0.85)', 
                                                    background: 'rgba(255,255,255,0.06)', 
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    padding: '0.25rem 0.75rem', 
                                                    borderRadius: '20px',
                                                    backdropFilter: 'blur(6px)'
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Dynamic Description */}
                                    <p style={{
                                        color: 'rgba(255, 255, 255, 0.75)',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.65,
                                        marginBottom: '2rem',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                                        maxWidth: '580px'
                                    }}>
                                        {getHeroDescription(currentHero)}
                                    </p>

                                    {/* Action Buttons (Netflix Style) */}
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <button 
                                            onClick={() => navigate(`/movie/${currentHero.slug}?source=kkphim`)}
                                            style={{
                                                background: 'linear-gradient(135deg, var(--primary-color) 0%, #6d28d9 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                padding: '0.9rem 2rem',
                                                borderRadius: '50px',
                                                fontSize: '1rem',
                                                fontWeight: 800,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.6rem',
                                                cursor: 'pointer',
                                                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.5)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.7)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.5)';
                                            }}
                                        >
                                            <Play fill="#ffffff" size={20} />
                                            <span>Xem Ngay</span>
                                        </button>

                                        <button 
                                            onClick={() => navigate(`/movie/${currentHero.slug}?source=kkphim`)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                color: '#ffffff',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                backdropFilter: 'blur(10px)',
                                                padding: '0.9rem 1.6rem',
                                                borderRadius: '50px',
                                                fontSize: '0.95rem',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <Info size={19} />
                                            <span>Chi Tiết</span>
                                        </button>

                                        <button 
                                            title="Thêm vào danh sách yêu thích"
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                color: '#ffffff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                                                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.5)';
                                                e.currentTarget.style.color = '#fb7185';
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                                e.currentTarget.style.color = '#ffffff';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <Heart size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right Side: Modern Floating Thumbnail Dock with Autoplay Bar */}
                        <div className="hidden lg:flex" style={{
                            position: 'absolute',
                            bottom: '35px',
                            right: '4%',
                            background: 'rgba(15, 12, 21, 0.75)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: '1.2rem',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                            maxWidth: '560px',
                            flexDirection: 'column',
                            gap: '0.8rem',
                            zIndex: 4
                        }}>
                            {/* Dock Header: Title, Counter & Next/Prev Controls */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Sparkles size={16} color="var(--primary-color)" />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        Đề Cử Đặc Sắc
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                                        <b style={{ color: 'var(--primary-color)' }}>0{heroIndex + 1}</b> / 0{featuredMovies.length}
                                    </span>
                                    
                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                        <button 
                                            onClick={handlePrevHero}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: '0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button 
                                            onClick={handleNextHero}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: '0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Autoplay Progress Line */}
                            <div style={{
                                width: '100%',
                                height: '3px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '3px',
                                overflow: 'hidden'
                            }}>
                                <motion.div 
                                    key={progressKey}
                                    initial={{ width: '0%' }}
                                    animate={{ width: isHeroPaused ? '0%' : '100%' }}
                                    transition={{ duration: 7, ease: 'linear' }}
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, var(--primary-color), #fcc419)',
                                        borderRadius: '3px'
                                    }}
                                />
                            </div>

                            {/* Thumbnails Row */}
                            <div style={{
                                display: 'flex',
                                gap: '0.7rem',
                                overflowX: 'auto',
                                scrollbarWidth: 'none',
                                padding: '4px 0'
                            }}>
                                {featuredMovies.map((m, idx) => {
                                    const isActive = heroIndex === idx;
                                    return (
                                        <div 
                                            key={m._id || m.slug || idx}
                                            onClick={() => handleSelectHero(idx)}
                                            style={{
                                                minWidth: '85px',
                                                maxWidth: '85px',
                                                height: '56px',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                border: isActive ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.12)',
                                                transform: isActive ? 'scale(1.06)' : 'scale(1)',
                                                boxShadow: isActive ? '0 8px 20px rgba(139, 92, 246, 0.4)' : 'none',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                            onMouseOver={(e) => {
                                                if (!isActive) e.currentTarget.style.transform = 'translateY(-3px)';
                                            }}
                                            onMouseOut={(e) => {
                                                if (!isActive) e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                            }}
                                        >
                                            <img 
                                                src={getMovieImageUrl(m, 'thumb_url')} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                alt={m?.name || "thumb"}
                                                onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                            />
                                            {isActive && (
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'rgba(139, 92, 246, 0.25)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Play size={16} fill="#ffffff" color="#ffffff" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                {/* Trending (Now on top) */}
                <section style={{ marginBottom: '4rem' }}>
                    <h3 className="gradient-text" style={{ marginBottom: '1.5rem' }}>Phim Mới Cập Nhật</h3>
                    <div className="movie-grid">
                        {data?.kkphim?.items?.slice(6, 54).map((item) => (
                            <MovieCard key={item._id} movie={item} source="kkphim" />
                        ))}
                    </div>
                </section>

                <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Bạn đang quan tâm gì?</h2>

                {/* Theme Cards Section */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: '0.8rem',
                    marginBottom: '4rem'
                }}>
                    {[
                        { title: 'Viễn Tưởng', color: 'linear-gradient(135deg, #b91d1d, #450a0a)', link: '/category/vien-tuong' },
                        { title: 'Thái Lan', color: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)', link: '/country/thai-lan' },
                        { title: 'Chiếu Rạp', color: 'linear-gradient(135deg, #7e22ce, #db2777)', link: '/category/chieu-rap' },
                        { title: 'Kinh Dị', color: 'linear-gradient(135deg, #c2410c, #7c2d12)', link: '/category/kinh-di' },
                        { title: 'Cổ Trang', color: 'linear-gradient(135deg, #be123c, #4c0519)', link: '/category/co-trang' },
                        { title: 'Chiến Tranh', color: 'linear-gradient(135deg, #db2777, #701a75)', link: '/category/chien-tranh' }
                    ].map((theme, i) => (
                        <div 
                            key={i} 
                            onClick={() => navigate(theme.link)}
                            style={{ 
                                background: theme.color, 
                                padding: '1.5rem', 
                                borderRadius: '24px', 
                                height: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: '0.3s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = `0 15px 30px rgba(0,0,0,0.5)`;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {theme.title}
                            </h4>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                                Xem chủ đề <span style={{ fontSize: '1rem' }}>›</span>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Country Movie Rows */}
                {[
                    { label: 'Hàn Quốc', movies: countryMovies.korea, slug: 'han-quoc' },
                    { label: 'Trung Quốc', movies: countryMovies.china, slug: 'trung-quoc' },
                    { label: 'US-UK', movies: countryMovies.usuk, slug: 'au-my' }
                ].map((row, idx) => (
                    <div key={idx} className="flex flex-col md:grid md:grid-cols-[250px_1fr] gap-4 md:gap-8 mb-16 items-start" style={{ minWidth: 0 }}>
                        {/* Title Section (Left) */}
                        <div style={{ paddingTop: '1rem' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
                                Phim <span style={{ color: 'var(--primary-color)' }}>{row.label}</span> mới
                            </h3>
                            <Link to={`/country/${row.slug}`} style={{ fontSize: '0.85rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Xem toàn bộ <span style={{ fontSize: '1.2rem' }}>›</span>
                            </Link>
                        </div>

                        {/* Movies List (Right - Horizontal Scroll) */}
                        <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', width: '100%', maxWidth: '100%', minWidth: 0, overscrollBehaviorX: 'contain' }}>
                            {row.movies.map(m => (
                                <div key={m._id} style={{ minWidth: 'min(220px, 68vw)', maxWidth: '220px', cursor: 'pointer' }} onClick={() => navigate(`/movie/${m.slug}?source=kkphim`)}>
                                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/10', marginBottom: '0.8rem' }}>
                                        <img 
                                            src={getMovieImageUrl(m, 'thumb_url')} 
                                            referrerPolicy="no-referrer"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            alt={m.name} 
                                            onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                        />
                                        <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                            PD. {m.episode_current?.replace('Tập ', '') || 'HD'}
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</h4>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.origin_name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Top 10 Phim Bộ */}
                <section style={{ marginBottom: '5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Top 10 phim bộ hôm nay</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                onClick={() => scrollTopTen('left')}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={() => scrollTopTen('right')}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        </div>
                    </div>

                    <div 
                        ref={topTenRef}
                        style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            overflowX: 'hidden', 
                            scrollBehavior: 'smooth',
                            paddingBottom: '1rem',
                            width: '100%',
                            maxWidth: '100%',
                            minWidth: 0
                        }}
                    >
                        {topSeries.map((m, index) => (
                            <div key={m._id} style={{ minWidth: 'min(220px, 70%)', display: 'flex', flexDirection: 'column' }}>
                                <div 
                                    style={{ 
                                        position: 'relative', 
                                        borderRadius: '12px', 
                                        overflow: 'hidden', 
                                        aspectRatio: '2/3',
                                        marginBottom: '1rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}
                                    onClick={() => navigate(`/movie/${m.slug}?source=kkphim`)}
                                >
                                    <img 
                                        src={getMovieImageUrl(m, 'thumb_url')} 
                                        referrerPolicy="no-referrer"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        alt={m.name} 
                                        onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                    />
                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                        {m.episode_current || 'HD'}
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <span style={{ 
                                        fontSize: '3.5rem', 
                                        fontWeight: 900, 
                                        color: '#fcc419', 
                                        lineHeight: 0.8,
                                        fontStyle: 'italic',
                                        WebkitTextStroke: '1px rgba(255,255,255,0.1)'
                                    }}>
                                        {index + 1}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {m.name}
                                        </h4>
                                        <p style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '4px' }}>{m.origin_name}</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>T16</span>
                                            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>• Phần 1</span>
                                            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>• {m.episode_current}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mãn Nhãn với Phim Chiếu Rạp */}
                <section style={{ marginBottom: '5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Mãn Nhãn với Phim Chiếu Rạp</h3>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/list/phim-chieu-rap')}>
                            <span style={{ fontSize: '1.2rem', marginLeft: '2px', opacity: 0.8 }}>›</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none', width: '100%', maxWidth: '100%', minWidth: 0, overscrollBehaviorX: 'contain' }}>
                        {theaterMovies.map(m => (
                            <div key={m._id} style={{ minWidth: 'min(400px, 85%)', cursor: 'pointer' }} onClick={() => navigate(`/movie/${m.slug}?source=kkphim`)}>
                                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', marginBottom: '1.2rem' }}>
                                    <img 
                                        src={getMovieImageUrl(m, 'thumb_url')} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        alt={m.name} 
                                        onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}></div>
                                    
                                    {/* Thumbnail overlay like screenshot */}
                                    <div style={{ position: 'absolute', bottom: '15px', left: '15px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                        <div style={{ width: '70px', height: '100px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <img src={getMovieImageUrl(m, 'poster_url')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="poster" onError={(e) => { e.target.src = '/placeholder.svg'; }} />
                                        </div>
                                        <div style={{ background: '#fff', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', marginBottom: '5px' }}>
                                            Sáp chiếu
                                        </div>
                                    </div>
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{m.name}</h4>
                                <p style={{ fontSize: '0.85rem', opacity: 0.5, marginBottom: '6px' }}>{m.origin_name}</p>
                                <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', fontWeight: 600, opacity: 0.6 }}>
                                    <span>T16</span>
                                    <span>• 2024</span>
                                    <span>• 1h 45m</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Kho Tàng Anime Section (New) */}
                <section style={{ marginBottom: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Kho Tàng Anime Mới Nhất</h3>
                        <div 
                            style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} 
                            onClick={() => navigate('/category/hoat-hinh')}
                        >
                            <span style={{ fontSize: '1.2rem', marginLeft: '2px', opacity: 0.8 }}>›</span>
                        </div>
                    </div>

                    <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        minHeight: '550px',
                        height: 'auto', 
                        borderRadius: '24px', 
                        overflow: 'hidden',
                        background: '#1a1a1d',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
                    }}>
                        {/* Backdrop with Transition */}
                        <AnimatePresence mode="wait">
                            {animeMovies[animeIndex] && (
                                <motion.div
                                    key={animeMovies[animeIndex]._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{ position: 'absolute', inset: 0 }}
                                >
                                    <img 
                                        src={getMovieImageUrl(animeMovies[animeIndex], 'thumb_url')} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} 
                                        alt="backdrop" 
                                        onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0d0d0f 20%, transparent 80%)' }}></div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d0d0f 10%, transparent 40%)' }}></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Content Overlay */}
                        <div style={{ position: 'relative', zIndex: 2, height: '100%', padding: '3rem 2rem 10rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '800px' }}>
                            {animeMovies[animeIndex] && (
                                <motion.div
                                    key={`content-${animeMovies[animeIndex]._id}`}
                                    initial={{ x: -30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.1 }}>
                                        {animeMovies[animeIndex]?.name}
                                    </h2>
                                    <p style={{ fontSize: '1.1rem', opacity: 0.6, marginBottom: '1.5rem', fontWeight: 600 }}>
                                        {animeMovies[animeIndex]?.origin_name}
                                    </p>
                                    
                                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ background: '#f8d448', color: '#000', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>IMDb 9.0</span>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>T16</span>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>{animeMovies[animeIndex]?.year}</span>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>Phần 1</span>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>{animeMovies[animeIndex]?.episode_current}</span>
                                    </div>

                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.05)', 
                                        padding: '4px 12px', 
                                        borderRadius: '6px', 
                                        fontSize: '0.75rem', 
                                        color: 'var(--primary-color)',
                                        display: 'inline-block',
                                        marginBottom: '1.5rem',
                                        fontWeight: 700
                                    }}>
                                        Hoạt hình
                                    </div>

                                    <p style={{ 
                                        fontSize: '0.95rem', 
                                        opacity: 0.7, 
                                        lineHeight: 1.6, 
                                        marginBottom: '2.5rem',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {animeMovies[animeIndex]?.content?.replace(/<[^>]*>/g, '') || "Chào mừng bạn đến với thế giới anime đầy màu sắc và những cuộc phiêu lưu kịch tính..."}
                                    </p>

                                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => navigate(`/movie/${animeMovies[animeIndex]?.slug}?source=ophim`)}
                                            style={{ 
                                                width: '64px', 
                                                height: '64px', 
                                                borderRadius: '50%', 
                                                background: 'var(--primary-color)', 
                                                border: 'none', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 10px 25px rgba(248, 212, 72, 0.4)'
                                            }}
                                        >
                                            <Play fill="black" size={32} />
                                        </button>
                                        <button className="btn btn-glass btn-circle" style={{ width: '56px', height: '56px' }}><Heart size={24} /></button>
                                        <button className="btn btn-glass btn-circle" style={{ width: '56px', height: '56px' }}><Info size={24} /></button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Interactive Thumbnails at bottom */}
                        <div style={{ 
                            position: 'absolute', 
                            bottom: '30px', 
                            right: '30px', 
                            left: '30px', 
                            zIndex: 3,
                            display: 'flex',
                            gap: '1rem',
                            overflowX: 'auto',
                            maxWidth: '100%',
                            minWidth: 0,
                            overscrollBehaviorX: 'contain',
                            scrollbarWidth: 'none',
                            padding: '10px'
                        }}>
                            {animeMovies.slice(0, 15).map((m, idx) => (
                                <div 
                                    key={m._id}
                                    onClick={() => setAnimeIndex(idx)}
                                    style={{
                                        minWidth: '70px',
                                        height: '100px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: animeIndex === idx ? '3px solid var(--primary-color)' : '2px solid rgba(255,255,255,0.2)',
                                        transform: animeIndex === idx ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.3s ease',
                                        boxShadow: animeIndex === idx ? '0 10px 20px rgba(0,0,0,0.5)' : 'none'
                                    }}
                                >
                                    <img 
                                        src={getMovieImageUrl(m, 'thumb_url')} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        alt="anime-thumb" 
                                        onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {localData.movies.length > 0 && (
                    <section id="local-movies-section" style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px' }}>Kho Phim Của Tôi</h2>
                            <span style={{ 
                                background: '#e50914', 
                                color: '#ffffff', 
                                padding: '6px 16px', 
                                borderRadius: '50px', 
                                fontSize: '0.95rem', 
                                fontWeight: '900',
                                boxShadow: '0 4px 10px rgba(229, 9, 20, 0.4)'
                            }}>
                                {localData.total?.toLocaleString() || '...'} Phim
                            </span>
                        </div>
                        <div className="movie-grid">
                            {localData.movies.map((item) => (
                                <MovieCard key={item._id} movie={item} source="local" />
                            ))}
                        </div>
                        
                        {/* Modern Premium Pagination for Home */}
                        {localData.total > 48 && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                gap: '1rem', 
                                marginTop: '4rem',
                                paddingBottom: '2rem'
                            }}>
                                {/* Previous Button */}
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        borderRadius: '50%', 
                                        border: 'none', 
                                        background: 'rgba(255,255,255,0.08)', 
                                        color: '#fff', 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        opacity: currentPage === 1 ? 0.3 : 1
                                    }}
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                {/* Page Indicator Pill */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    padding: '6px 20px',
                                    borderRadius: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 500, opacity: 0.9 }}>Trang</span>
                                    <input 
                                        type="number"
                                        value={currentPage}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            const totalPages = Math.ceil(localData.total / 48);
                                            if (val >= 1 && val <= totalPages) {
                                                handlePageChange(val);
                                            }
                                        }}
                                        style={{
                                            width: '60px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'var(--primary-color)',
                                            textAlign: 'center',
                                            padding: '4px 0',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            outline: 'none'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.95rem', opacity: 0.6 }}>/ {Math.ceil(localData.total / 48)}</span>
                                </div>

                                {/* Next Button */}
                                <button 
                                    disabled={currentPage === Math.ceil(localData.total / 48)}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        borderRadius: '50%', 
                                        border: 'none', 
                                        background: 'rgba(255,255,255,0.08)', 
                                        color: '#fff', 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: currentPage === Math.ceil(localData.total / 48) ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        opacity: currentPage === Math.ceil(localData.total / 48) ? 0.3 : 1
                                    }}
                                >
                                    <ChevronLeft size={24} style={{ transform: 'rotate(180deg)' }} />
                                </button>
                            </div>
                        )}

                    </section>
                )}
            </div>

            {/* Scroll to Top */}
            <button 
                onClick={scrollToTop}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'white',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    zIndex: 100
                }}
            >
                <ChevronUp size={24} />
            </button>

        </div>
    );
};

export default Home;
