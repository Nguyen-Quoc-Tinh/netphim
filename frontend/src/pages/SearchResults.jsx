import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../utils/api';
import MovieCard from '../components/MovieCard';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('keyword');
    const [results, setResults] = useState({ local: [], ophim: [], kkphim: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const data = await searchMovies(query);
                setResults({
                    local: data.local || [],
                    ophim: data.ophim?.data?.items || [],
                    kkphim: data.kkphim?.data?.items || []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;

    const allResults = [
        ...results.kkphim.map(m => ({ ...m, source: 'kkphim' })),
        ...results.ophim.map(m => ({ ...m, source: 'ophim' }))
    ];

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Kết quả tìm kiếm cho: <span style={{ color: 'var(--primary-color)' }}>{query}</span></h1>
            
            {/* Local Results First */}
            {results.local.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ width: '4px', height: '24px', background: 'var(--primary-color)', borderRadius: '2px' }}></span>
                        Từ thư viện của bạn
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {results.local.map((movie) => (
                            <MovieCard key={movie._id} movie={movie} source="local" />
                        ))}
                    </div>
                </div>
            )}

            {/* Other Results */}
            {allResults.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1.5rem', opacity: 0.8 }}>Khám phá thêm</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {allResults.map((movie, idx) => (
                            <MovieCard key={movie._id || idx} movie={movie} source={movie.source} />
                        ))}
                    </div>
                </div>
            )}

            {results.local.length === 0 && allResults.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>Không tìm thấy phim nào phù hợp.</p>
            )}
        </div>
    );
};

export default SearchResults;
