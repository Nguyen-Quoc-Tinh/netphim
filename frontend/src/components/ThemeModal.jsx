import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Palette } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { THEME_LIST } from '../theme/themes';

const ThemeModal = () => {
    const { 
        themeId, 
        isAuto, 
        holidayInfo, 
        setAutoMode, 
        setManualTheme, 
        isThemeModalOpen, 
        closeThemeModal,
        canManageTheme
    } = useTheme();

    if (!canManageTheme || !isThemeModalOpen) return null;

    return (
        <AnimatePresence>
            <div 
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    background: 'rgba(0, 0, 0, 0.78)',
                    backdropFilter: 'blur(10px)'
                }}
                onClick={closeThemeModal}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '680px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        background: '#14141a',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '20px',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px var(--theme-glow, rgba(139, 92, 246, 0.2))',
                        padding: '1.8rem',
                        color: '#fff'
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 15px var(--primary-color)'
                                }}>
                                    <Palette size={18} color="#000" />
                                </div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Giao Diện Lễ Hội</h3>
                            </div>
                            <p style={{ fontSize: '0.85rem', opacity: 0.65, marginTop: '4px', marginBottom: 0 }}>
                                Thay đổi diện mạo website theo không gian điện ảnh và các dịp lễ hội truyền thống Việt Nam
                            </p>
                        </div>

                        <button 
                            onClick={closeThemeModal}
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* AUTO Mode Card (Khuyên dùng) */}
                    <div 
                        onClick={setAutoMode}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.1rem 1.3rem',
                            borderRadius: '14px',
                            background: isAuto 
                                ? 'linear-gradient(135deg, rgba(245, 197, 24, 0.15), rgba(139, 92, 246, 0.15))' 
                                : 'rgba(255, 255, 255, 0.04)',
                            border: isAuto 
                                ? '1.5px solid #f5c518' 
                                : '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            marginBottom: '1.5rem',
                            transition: 'all 0.25s ease',
                            boxShadow: isAuto ? '0 0 20px rgba(245, 197, 24, 0.2)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background: isAuto ? '#f5c518' : 'rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.3rem'
                            }}>
                                ⚡
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>AUTO – Tự động theo ngày lễ</span>
                                    {isAuto && (
                                        <span style={{
                                            background: '#f5c518',
                                            color: '#000',
                                            fontSize: '0.65rem',
                                            fontWeight: 900,
                                            padding: '2px 8px',
                                            borderRadius: '20px'
                                        }}>
                                            ĐANG BẬT
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.8rem', opacity: 0.65, margin: '2px 0 0 0' }}>
                                    Hệ thống tự động kích hoạt giao diện theo lịch lễ hội Việt Nam (Tết, Trung Thu, 30/4, Halloween,...)
                                </p>
                                {holidayInfo.isHoliday && (
                                    <span style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '4px',
                                        fontSize: '0.75rem', 
                                        color: '#facc15', 
                                        fontWeight: 700, 
                                        marginTop: '4px' 
                                    }}>
                                        <Sparkles size={12} /> Đang diễn ra: {holidayInfo.holidayName}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isAuto && (
                            <div style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: '#f5c518',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000'
                            }}>
                                <Check size={16} strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    {/* Section Title */}
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                        Hoặc chọn thủ công 7 chủ đề điện ảnh:
                    </div>

                    {/* 7 Themes Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '0.8rem'
                    }}>
                        {THEME_LIST.map((t) => {
                            const isCurrent = !isAuto && themeId === t.id;

                            return (
                                <div
                                    key={t.id}
                                    onClick={() => setManualTheme(t.id)}
                                    style={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.9rem 1rem',
                                        borderRadius: '12px',
                                        background: isCurrent 
                                            ? `linear-gradient(135deg, ${t.colors.surface}, ${t.colors.background})` 
                                            : 'rgba(255, 255, 255, 0.03)',
                                        border: isCurrent 
                                            ? `1.5px solid ${t.colors.primary}` 
                                            : '1px solid rgba(255, 255, 255, 0.07)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isCurrent ? `0 0 16px ${t.colors.glow}` : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.6rem' }}>{t.icon}</span>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                                                    {t.name}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.72rem', opacity: 0.6, margin: '1px 0 4px 0' }}>
                                                {t.styleName}
                                            </p>
                                            {/* Color Palette Dots */}
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.primary, border: '1px solid rgba(255,255,255,0.2)' }} title="Primary" />
                                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.secondary, border: '1px solid rgba(255,255,255,0.2)' }} title="Secondary" />
                                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.background, border: '1px solid rgba(255,255,255,0.2)' }} title="Background" />
                                            </div>
                                        </div>
                                    </div>

                                    {isCurrent && (
                                        <div style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            background: t.colors.primary,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            boxShadow: `0 0 10px ${t.colors.primary}`
                                        }}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ThemeModal;
