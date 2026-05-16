import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../utils/api';
import MovieCard from '../components/MovieCard';
import FilterSection from '../components/FilterSection';
import { Filter, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ListingPage = () => {
    const { slug } = useParams();
    const location = useLocation();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);
    const [title, setTitle] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const isCategory = location.pathname.includes('category');
    const isList = location.pathname.includes('list') || ['phim-le', 'phim-bo', 'phim-moi'].includes(slug);
    const type = isList ? 'danh-sach' : (isCategory ? 'the-loai' : 'quoc-gia');

    useEffect(() => {
        setMovies([]);
        setCurrentPage(1);
        setActiveFilters(null);
        setShowFilters(false);
    }, [slug, location.pathname]);

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            try {
                if (activeFilters) {
                    const res = await api.get('/movies/filter', { 
                        params: { ...activeFilters, page: currentPage, limit: 48 } 
                    });
                    setMovies(res.data.movies);
                    setTotalPages(res.data.totalPages);
                    setTotalItems(res.data.total);
                    setTitle(`Kết quả lọc (${res.data.total} phim)`);
                } else {
                    const res = await api.get(`/${type}/${slug}?page=${currentPage}`);
                    if (res.data.data?.items) {
                        setMovies(res.data.data.items);
                        const pagin = res.data.data.params?.pagination;
                        if (pagin) {
                            setTotalPages(Math.ceil(pagin.totalItems / pagin.totalItemsPerPage));
                            setTotalItems(pagin.totalItems);
                        }
                        setTitle(res.data.data.titlePage || 'Danh sách phim');
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [slug, type, currentPage, activeFilters]);

    const handleFilterSubmit = (filters) => {
        setActiveFilters(filters);
        setCurrentPage(1);
        setShowFilters(false);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
            <h1 style={{ marginBottom: '2rem' }}>{title}</h1>
            
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Filter size={20} />
                    Bộ lọc chi tiết
                </button>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <FilterSection 
                        onClose={() => setShowFilters(false)}
                        onFilter={handleFilterSubmit}
                    />
                )}
            </AnimatePresence>
            
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <div className="loader"></div>
                </div>
            ) : movies.length === 0 ? (
                <p>Không tìm thấy phim nào trong mục này.</p>
            ) : (
                <>
                    <div className="movie-grid">
                        {movies.map((movie) => (
                            <MovieCard key={movie.slug || movie._id} movie={movie} source={activeFilters ? 'local' : (isList ? 'kkphim' : 'ophim')} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            marginBottom: '5rem',
                            marginTop: '2rem'
                        }}>
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '10px',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.3 : 1
                                }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                border: '1px solid',
                                                borderColor: currentPage === pageNum ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                                background: currentPage === pageNum ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                                color: currentPage === pageNum ? '#000' : '#fff',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '10px',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.3 : 1
                                }}
                            >
                                <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
                                    <ChevronLeft size={18} />
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ListingPage;
