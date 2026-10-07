/**
 * Safe Image URL helpers for NETPHIM
 */
export const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22450%22%20viewBox%3D%220%200%20300%20450%22%3E%3Crect%20fill%3D%22%231a1a1e%22%20width%3D%22300%22%20height%3D%22450%22%2F%3E%3Cpath%20d%3D%22M150%20180%20a30%2030%200%201%200%200.0001%200%20M120%20250%20l60%200%20l-15%20-25%20l-15%2015%20l-15%20-10%20z%22%20fill%3D%22%23444%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2265%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%3ENETPHIM%3C%2Ftext%3E%3C%2Fsvg%3E';

export const getSafeImageUrl = (url, fallback = DEFAULT_PLACEHOLDER) => {
    if (!url || typeof url !== 'string') return fallback;
    const trimmed = url.trim();
    if (!trimmed) return fallback;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    return `https://phimimg.com/${trimmed}`;
};

export const getMovieImageUrl = (movie, preferredField = 'thumb_url', fallback = DEFAULT_PLACEHOLDER) => {
    if (!movie) return fallback;
    const rawUrl = preferredField === 'poster_url' 
        ? (movie.poster_url || movie.thumb_url)
        : (movie.thumb_url || movie.poster_url);
    
    return getSafeImageUrl(rawUrl, fallback);
};

export default {
    getSafeImageUrl,
    getMovieImageUrl,
    DEFAULT_PLACEHOLDER
};
