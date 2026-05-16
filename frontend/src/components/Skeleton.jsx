import React from 'react';

const Skeleton = ({ width, height, borderRadius = '12px', className = '' }) => {
    return (
        <div 
            className={`skeleton-anim ${className}`}
            style={{
                width: width || '100%',
                height: height || '100%',
                borderRadius: borderRadius,
                background: 'linear-gradient(90deg, #1a1a2e 25%, #252545 50%, #1a1a2e 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s infinite linear'
            }}
        />
    );
};

export const MovieCardSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <Skeleton height="300px" />
        <Skeleton width="80%" height="1.2rem" />
        <Skeleton width="40%" height="0.8rem" />
    </div>
);

export const HeroSkeleton = () => (
    <div style={{ width: '100%', height: '70vh', position: 'relative', overflow: 'hidden' }}>
        <Skeleton borderRadius="0" />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '40%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton width="100%" height="3rem" />
            <Skeleton width="60%" height="1.5rem" />
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Skeleton width="120px" height="3rem" borderRadius="30px" />
                <Skeleton width="120px" height="3rem" borderRadius="30px" />
            </div>
        </div>
    </div>
);

export default Skeleton;
