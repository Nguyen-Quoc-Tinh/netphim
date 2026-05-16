import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, toggleFavorite, addToHistory, getUserProfile } from '../utils/api';
import { 
    Play, Calendar, Clock, Globe, Tag, Star, Share2, List, 
    ChevronLeft, Heart, Plus, SkipForward, AlertCircle, MessageSquare, 
    User, ExternalLink, Info, Bell, Send, Flag, Monitor, Settings, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MovieDetails = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const source = (searchParams.get('source') || 'ophim').toLowerCase();
    const navigate = useNavigate();
    
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [cinemaMode, setCinemaMode] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await getMovieDetails(slug, source);
                const movieData = res.movie || res.data?.item || res;
                let episodesData = res.episodes || res.data?.item?.episodes || movieData.episodes || [];
                
                // Ensure episodesData is always an array
                if (episodesData && !Array.isArray(episodesData)) {
                    episodesData = [episodesData];
                }

                if (source === 'local' && movieData.link_embed && episodesData.length === 0) {
                    episodesData = [{
                        server_name: "Local Server",
                        server_data: [{ name: "1", link_embed: movieData.link_embed }]
                    }];
                }
                
                setMovie({ ...movieData, episodes: episodesData });
                
                // Auto-select first episode if available
                if (episodesData?.[0]?.server_data?.[0]) {
                    setCurrentEpisode(episodesData[0].server_data[0]);
                } else if (movieData.trailer_url) {
                    // If no episodes but has trailer, prepare for trailer mode
                    console.log("No episodes found, but trailer is available.");
                }

                // Add to history
                addToHistory({
                    slug,
                    name: movieData.name,
                    thumb_url: movieData.thumb_url,
                    source
                }).catch(e => console.error('History error', e));

                // Check favorite status
                const profile = await getUserProfile();
                setIsFavorite(profile.favorites?.some(f => f.slug === slug));

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [slug, source]);

    const handleFavorite = async () => {
        try {
            const res = await toggleFavorite({
                slug,
                name: movie.name,
                thumb_url: movie.thumb_url,
                source
            });
            setIsFavorite(res.isFavorite);
        } catch (err) {
            console.error('Favorite error', err);
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;
    if (!movie) return <div className="container" style={{ paddingTop: '150px' }}>Không tìm thấy thông tin phim.</div>;

    const isTrailer = movie.episode_current?.toLowerCase().includes('trailer') || movie.status === 'trailer';
    const videoUrl = isTrailer && movie.trailer_url 
        ? movie.trailer_url.replace('watch?v=', 'embed/') 
        : currentEpisode?.link_embed;

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-primary)', paddingTop: '80px', position: cinemaMode ? 'static' : 'relative' }}>
            
            {/* Cinema Mode Overlay */}
            <AnimatePresence>
                {cinemaMode && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCinemaMode(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.9)',
                            zIndex: 900,
                            cursor: 'pointer'
                        }}
                    />
                )}
            </AnimatePresence>

            <div style={{ 
                width: '100%', 
                background: '#000', 
                position: 'relative', 
                zIndex: cinemaMode ? 1001 : 1,
                transition: 'all 0.5s ease',
                padding: cinemaMode ? '0 10%' : '0'
            }}>
                <div className={`w-full relative bg-black ${cinemaMode ? 'aspect-video shadow-[0_0_100px_rgba(139,92,246,0.2)]' : 'aspect-video md:aspect-[21/9]'}`}>
                    {(() => {
                        let finalUrl = currentEpisode?.link_embed;
                        const isTrailerMode = !currentEpisode && movie.trailer_url;
                        
                        if (isTrailerMode || (movie.episode_current?.toLowerCase().includes('trailer') && movie.trailer_url)) {
                            finalUrl = movie.trailer_url;
                            if (finalUrl.includes('watch?v=')) finalUrl = finalUrl.replace('watch?v=', 'embed/');
                            else if (finalUrl.includes('youtu.be/')) finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');
                        }

                        if (finalUrl) {
                            return (
                                <iframe 
                                    src={finalUrl} 
                                    style={{ width: '100%', height: '100%', border: 'none' }} 
                                    allowFullScreen
                                    title="Movie Player"
                                ></iframe>
                            );
                        }

                        return (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'radial-gradient(circle, #1a1a2e 0%, #000 100%)' }}>
                                <AlertCircle size={48} color="var(--primary-color)" style={{ opacity: 0.5 }} />
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>Phim chưa có bản chính thức</p>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>Nguồn phim đang cập nhật, vui lòng quay lại sau.</p>
                                </div>
                                <button 
                                    onClick={() => navigate(-1)}
                                    style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                    Quay lại
                                </button>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* 2. PLAYER ACTION BAR (Simplified) */}
            <div style={{ 
                background: 'var(--surface-color)', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                padding: '0.8rem 0',
                position: 'relative',
                zIndex: cinemaMode ? 1001 : 1
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '2rem' }}>
                    <button 
                        onClick={handleFavorite}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: isFavorite ? 'var(--primary-color)' : 'var(--text-primary)', 
                            fontSize: '0.8rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            cursor: 'pointer', 
                            opacity: isFavorite ? 1 : 0.8,
                            fontWeight: isFavorite ? 700 : 500
                        }}
                    >
                        <Heart size={16} fill={isFavorite ? 'var(--primary-color)' : 'none'} /> 
                        {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                    </button>
                    <div 
                        onClick={() => setCinemaMode(!cinemaMode)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8, cursor: 'pointer' }}
                    >
                        Rạp phim <span style={{ background: cinemaMode ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', color: cinemaMode ? '#000' : '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>{cinemaMode ? 'ON' : 'OFF'}</span>
                    </div>
                </div>
            </div>

            {/* 3. INFO & EPISODES SECTION */}
            <div className="container" style={{ marginTop: '2rem', paddingBottom: '100px', opacity: cinemaMode ? 0.1 : 1, transition: '0.5s' }}>
                <div className="flex flex-col md:grid md:grid-cols-[1fr_300px] gap-8 md:gap-12">
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{movie.name}</h1>
                        <p style={{ opacity: 0.6, fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>{movie.origin_name} ({movie.year})</p>
                        
                        {/* Server/Episodes List */}
                        {Array.isArray(movie.episodes) && movie.episodes.map((server, sIdx) => (
                            <div key={sIdx} style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                    <Monitor size={18} /> {server.server_name}
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                    {server.server_data?.map((ep, eIdx) => (
                                        <button
                                            key={eIdx}
                                            onClick={() => setCurrentEpisode(ep)}
                                            style={{
                                                padding: '0.6rem 1.2rem',
                                                minWidth: '60px',
                                                borderRadius: '8px',
                                                border: '1px solid',
                                                borderColor: currentEpisode?.link_embed === ep.link_embed ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                                background: currentEpisode?.link_embed === ep.link_embed ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                                color: currentEpisode?.link_embed === ep.link_embed ? '#000' : 'var(--text-primary)',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {ep.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '3rem' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Nội dung phim</h3>
                            <div style={{ lineHeight: 1.8, opacity: 0.7, fontSize: '1.05rem', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: movie.content }}></div>
                        </div>
                    </div>

                    <aside>
                        <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <img src={movie.thumb_url?.startsWith('http') ? movie.thumb_url : `https://phimimg.com/${movie.thumb_url}`} style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem' }} alt="poster" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.5, color: 'var(--text-secondary)' }}>Trạng thái</span><span>{movie.episode_current}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.5, color: 'var(--text-secondary)' }}>Thời lượng</span><span>{movie.time}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.5, color: 'var(--text-secondary)' }}>Quốc gia</span><span>{movie.country?.[0]?.name}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.5, color: 'var(--text-secondary)' }}>Chất lượng</span><span>{movie.quality}</span></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
