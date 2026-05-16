import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Play, Menu, X, ChevronDown, User } from 'lucide-react';
import { getCategories, getCountries, searchMovies } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [countries, setCountries] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const searchRef = useRef(null);
    const timeoutRef = useRef(null);
    const debounceTimer = useRef(null);
    const { user, logout } = useAuth();
    const [isChangePassOpen, setIsChangePassOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNavData = async () => {
            try {
                const [cats, counts] = await Promise.all([
                    getCategories(),
                    getCountries()
                ]);
                setCategories(cats || []);
                setCountries(counts || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNavData();

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Live search logic
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (searchQuery.trim().length > 1) {
            debounceTimer.current = setTimeout(async () => {
                setIsSearching(true);
                setShowSuggestions(true);
                try {
                    const results = await searchMovies(searchQuery);
                    // Merge results and limit to 5
                    const merged = [
                        ...(results.local || []),
                        ...(results.kkphim?.items || []),
                        ...(results.ophim?.data?.items || [])
                    ].slice(0, 6);
                    setSuggestions(merged);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSearching(false);
                }
            }, 500);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    const handleMouseEnter = (type) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveDropdown(type);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 300); // Wait 300ms before closing
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?keyword=${searchQuery}`);
            setIsMenuOpen(false);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (movie) => {
        const source = movie.source || (movie.origin_name ? 'kkphim' : 'local');
        navigate(`/movie/${movie.slug}?source=${source}`);
        setShowSuggestions(false);
        setSearchQuery('');
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000,
            padding: '1.2rem 0',
            transition: 'all 0.4s ease',
            background: scrolled ? 'rgba(15, 12, 21, 0.95)' : 'linear-gradient(to bottom, rgba(15, 12, 21, 0.8), transparent)',
            backdropFilter: scrolled ? 'blur(10px)' : 'none'
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                    <div style={{
                        background: 'var(--primary-color)',
                        padding: '0.4rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Play size={20} fill="black" stroke="black" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }} className="logo-text">
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-1px' }}>
                            NET<span style={{ color: 'var(--primary-color)' }}>PHIM</span>
                        </span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.6, letterSpacing: '1px' }} className="logo-subtext">Phim cực nét</span>
                    </div>
                </Link>

                {/* Search Bar */}
                <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '450px' }}>
                    <form onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm phim, diễn viên..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '0.8rem 1rem 0.8rem 3.2rem',
                                color: 'white',
                                width: '100%',
                                fontSize: '0.95rem',
                                transition: '0.3s',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
                        />
                        <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        {searchQuery && (
                            <X 
                                size={18} 
                                onClick={() => setSearchQuery('')}
                                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, cursor: 'pointer' }} 
                            />
                        )}
                    </form>

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{
                                    position: 'absolute',
                                    top: '120%',
                                    left: 0,
                                    right: 0,
                                    background: '#1a1a1e',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    zIndex: 1001
                                }}
                            >
                                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.5px' }}>
                                    DANH SÁCH PHIM
                                </div>

                                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    {isSearching ? (
                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                            <div className="loader" style={{ width: '20px', height: '20px', margin: '0 auto' }}></div>
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <>
                                            {suggestions.map((movie) => (
                                                <div 
                                                    key={movie._id}
                                                    onClick={() => handleSuggestionClick(movie)}
                                                    style={{ 
                                                        display: 'flex', 
                                                        gap: '1rem', 
                                                        padding: '0.8rem 1rem', 
                                                        cursor: 'pointer',
                                                        transition: '0.2s',
                                                        borderBottom: '1px solid rgba(255,255,255,0.03)'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <img 
                                                        src={movie.thumb_url?.startsWith('http') 
                                                            ? movie.thumb_url 
                                                            : (movie.source === 'ophim' 
                                                                ? `https://img.ophim.live/uploads/movies/${movie.thumb_url}`
                                                                : `https://phimimg.com/${movie.thumb_url}`)} 
                                                        referrerPolicy="no-referrer"
                                                        style={{ width: '50px', height: '70px', borderRadius: '6px', objectFit: 'cover' }}
                                                        alt={movie.name}
                                                        onError={(e) => {
                                                            if (movie.source === 'ophim') e.target.src = `https://phimimg.com/${movie.thumb_url}`;
                                                            else e.target.src = `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;
                                                        }}
                                                    />
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.2rem' }}>
                                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#fff' }}>{movie.name}</h4>
                                                        <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.origin_name}</p>
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.7rem', opacity: 0.4 }}>
                                                            <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>T16</span>
                                                            <span>•</span>
                                                            <span>{movie.year}</span>
                                                            <span>•</span>
                                                            <span>{movie.episode_current || 'HD'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div 
                                                onClick={handleSearch}
                                                style={{ 
                                                    padding: '1rem', 
                                                    textAlign: 'center', 
                                                    fontSize: '0.85rem', 
                                                    fontWeight: 700, 
                                                    color: 'var(--primary-color)',
                                                    cursor: 'pointer',
                                                    background: 'rgba(248, 212, 72, 0.05)'
                                                }}
                                            >
                                                Toàn bộ kết quả
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.5 }}>
                                            Không tìm thấy phim phù hợp
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Nav */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.5rem', 
                    fontSize: '0.9rem', 
                    fontWeight: 500,
                    marginLeft: 'auto'
                }} className="desktop-nav">
                    <Link to="/" className="nav-link">Trang Chủ</Link>
                    
                    <div 
                        className={`nav-dropdown ${activeDropdown === 'category' ? 'active' : ''}`} 
                        onMouseEnter={() => handleMouseEnter('category')} 
                        onMouseLeave={handleMouseLeave}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            Thể loại <ChevronDown size={14} />
                        </span>
                        {activeDropdown === 'category' && (
                            <div className="dropdown-grid">
                                {categories.map((cat) => (
                                    <Link key={cat._id} to={`/category/${cat.slug}`} onClick={() => setActiveDropdown(null)}>
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div 
                        className={`nav-dropdown ${activeDropdown === 'country' ? 'active' : ''}`} 
                        onMouseEnter={() => handleMouseEnter('country')} 
                        onMouseLeave={handleMouseLeave}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            Quốc Gia <ChevronDown size={14} />
                        </span>
                        {activeDropdown === 'country' && (
                            <div className="dropdown-grid">
                                {countries.map((count) => (
                                    <Link key={count._id} to={`/country/${count.slug}`} onClick={() => setActiveDropdown(null)}>
                                        {count.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link to="/category/phim-le" className="nav-link">Phim Lẻ</Link>
                    <Link to="/category/phim-bo" className="nav-link">Phim Bộ</Link>
                </div>

                {/* Right Actions: Login/User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="user-actions">
                            {user.isAdmin && (
                                <Link to="/admin" className="nav-link admin-link" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>Admin</Link>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }} className="user-pill">
                                <Link 
                                    to="/profile"
                                    style={{ 
                                        fontSize: '0.8rem', 
                                        fontWeight: 500, 
                                        color: '#fff',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}
                                >
                                    <User size={14} /> <span className="username-text">{user.username}</span>
                                </Link>
                                <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem' }}>Thoát</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', fontSize: '0.85rem' }}>Đăng nhập</Link>
                    )}
                </div>

                <ChangePasswordModal isOpen={isChangePassOpen} onClose={() => setIsChangePassOpen(false)} />

                {/* Mobile Toggle Button */}
                <div 
                    className="mobile-toggle" 
                    onClick={() => setIsMenuOpen(true)} 
                    style={{ 
                        display: 'none', 
                        cursor: 'pointer',
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <Menu size={24} />
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(15, 12, 21, 0.98)',
                            backdropFilter: 'blur(20px)',
                            zIndex: 2000,
                            padding: '2rem'
                        }}
                    >
                        {/* Header of Menu */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '12px' }}>
                                    <Play size={24} fill="black" stroke="black" />
                                </div>
                                <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>NETPHIM</span>
                            </div>
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '0.8rem', borderRadius: '50%', cursor: 'pointer' }}
                            >
                                <X size={28} />
                            </button>
                        </div>

                        {/* Menu Grid Items */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '2rem 1rem',
                        }}>
                            <Link to="/" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Trang Chủ</Link>
                            <div style={mobileNavLinkStyle} onClick={() => setActiveDropdown(activeDropdown === 'cat_m' ? null : 'cat_m')}>
                                Thể loại <ChevronDown size={16} />
                                {activeDropdown === 'cat_m' && (
                                    <div style={mobileSubMenuStyle}>
                                        {categories.map(cat => (
                                            <Link key={cat._id} to={`/category/${cat.slug}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', opacity: 0.8, fontSize: '1rem' }}>{cat.name}</Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={mobileNavLinkStyle} onClick={() => setActiveDropdown(activeDropdown === 'cou_m' ? null : 'cou_m')}>
                                Quốc Gia <ChevronDown size={16} />
                                {activeDropdown === 'cou_m' && (
                                    <div style={mobileSubMenuStyle}>
                                        {countries.map(c => (
                                            <Link key={c._id} to={`/country/${c.slug}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', opacity: 0.8, fontSize: '1rem' }}>{c.name}</Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Link to="/category/phim-le" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Phim Lẻ</Link>
                            <Link to="/category/phim-bo" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Phim Bộ</Link>
                            <Link to="/list/phim-moi" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Phim Mới</Link>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Hồ Sơ</Link>
                            {user?.isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Admin</Link>}
                        </div>

                        {/* Search in Menu */}
                        <div style={{ marginTop: '4rem' }}>
                            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                                <input 
                                    type="text" 
                                    placeholder="Tìm phim..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', padding: '1rem 1rem 1rem 3.5rem', color: '#fff', fontSize: '1.1rem' }}
                                />
                                <Search size={22} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .nav-link:hover { color: var(--primary-color); }
                .nav-dropdown { 
                    position: relative; 
                    cursor: pointer; 
                    height: 100%; 
                    display: flex; 
                    alignItems: center;
                    padding: 0.5rem 0.8rem;
                    border-radius: 4px;
                    transition: 0.2s;
                    border: 1px solid transparent;
                }
                .nav-dropdown.active {
                    border-color: rgba(255,255,255,0.8);
                }
                .dropdown-grid {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    left: 0;
                    width: 700px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem 2rem;
                    padding: 2.5rem;
                    border-radius: 12px;
                    background: #14141b;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.8);
                    z-index: 1001;
                }
                .dropdown-grid a { 
                    font-size: 0.95rem; 
                    color: #fff;
                    opacity: 0.8; 
                    transition: 0.2s;
                    white-space: nowrap;
                }
                .dropdown-grid a:hover { 
                    opacity: 1; 
                    color: var(--primary-color); 
                    transform: translateX(5px);
                }
                
                @media (max-width: 1200px) {
                    .dropdown-grid { width: 500px; grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 1100px) {
                    .desktop-nav { gap: 0.5rem !important; }
                    .nav-dropdown { padding: 0.5rem 0.4rem; }
                }
                @media (max-width: 900px) {
                    .desktop-nav { display: none !important; }
                    .mobile-toggle { display: block !important; }
                    .logo-text span:first-child { fontSize: 1.3rem !important; }
                    .logo-subtext { display: none !important; }
                    .username-text { display: none !important; }
                    .user-pill { padding: 0.3rem 0.5rem !important; }
                    .admin-link { display: none !important; }
                    .container { gap: 0.8rem !important; }
                }
                @media (max-width: 400px) {
                    .logo-text { display: none !important; }
                    .container { justify-content: space-between !important; }
                }
            `}</style>
        </nav>
    );
};

const mobileNavLinkStyle = {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none'
};

const mobileSubMenuStyle = {
    position: 'fixed',
    top: '20%',
    left: '10%',
    right: '10%',
    background: '#1a1625',
    padding: '1.5rem',
    borderRadius: '20px',
    zIndex: 2100,
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
    maxHeight: '60vh',
    overflowY: 'auto',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem 1rem'
};

export default Navbar;
