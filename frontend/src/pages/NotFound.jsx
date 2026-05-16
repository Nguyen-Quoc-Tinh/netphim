import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0c 100%)',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ 
                    fontSize: '10rem', 
                    fontWeight: 900, 
                    lineHeight: 1,
                    background: 'linear-gradient(to bottom, var(--primary-color), transparent)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 0.2,
                    marginBottom: '-3rem'
                }}>
                    404
                </div>
                
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                    Ồ! Bạn đi lạc rồi
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: '500px', marginBottom: '3rem' }}>
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di dời sang một vũ trụ khác.
                </p>

                <Link to="/" style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    background: 'var(--primary-color)',
                    color: '#000',
                    padding: '1rem 2.5rem',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    transition: '0.3s',
                    boxShadow: '0 10px 20px rgba(255, 183, 0, 0.2)'
                }}>
                    <Home size={20} /> Về trang chủ
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
