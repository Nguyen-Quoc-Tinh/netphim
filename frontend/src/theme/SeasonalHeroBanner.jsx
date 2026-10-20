import React from 'react';
import { useTheme } from './ThemeContext';
import { Sparkles, Heart, Star, Moon, Ghost, Gift } from 'lucide-react';

/**
 * Seasonal Festive Banner displayed elegantly in the Hero section.
 * Automatically adapts text, colors, and badge according to the active theme.
 */
export const SeasonalHeroBanner = () => {
    const { themeId, theme, holidayInfo } = useTheme();

    if (themeId === 'default' || !theme?.banner?.text) {
        return null;
    }

    const currentYear = new Date().getFullYear();
    const bannerTitle = theme.banner.showYear 
        ? `${theme.banner.text} ${currentYear}`
        : theme.banner.text;

    const getIcon = () => {
        switch (themeId) {
            case 'tet': return <Sparkles size={16} color="#ffd700" />;
            case 'valentine': return <Heart size={16} fill="#ff4d6d" color="#ff4d6d" />;
            case 'vietnam': return <Star size={16} fill="#ffda44" color="#ffda44" />;
            case 'trungthu': return <Moon size={16} fill="#fbbf24" color="#fbbf24" />;
            case 'halloween': return <Ghost size={16} color="#ff7518" />;
            case 'christmas': return <Gift size={16} color="#facc15" />;
            default: return <Sparkles size={16} color="var(--primary-color)" />;
        }
    };

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: `linear-gradient(135deg, ${theme.colors.surface}, rgba(255,255,255,0.06))`,
            border: `1.5px solid ${theme.colors.primary}`,
            boxShadow: `0 4px 20px ${theme.colors.glow}`,
            backdropFilter: 'blur(12px)',
            padding: '0.45rem 1.1rem',
            borderRadius: '50px',
            animation: 'fadeIn 0.6s ease-out'
        }}>
            {getIcon()}
            <span style={{
                fontSize: '0.82rem',
                fontWeight: 900,
                letterSpacing: '1px',
                color: theme.colors.accent || theme.colors.primary,
                textTransform: 'uppercase'
            }}>
                {bannerTitle}
            </span>
            {theme.badge && (
                <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    opacity: 0.8,
                    color: '#fff',
                    borderLeft: '1px solid rgba(255,255,255,0.2)',
                    paddingLeft: '8px'
                }}>
                    {theme.badge}
                </span>
            )}
        </div>
    );
};

export default SeasonalHeroBanner;
