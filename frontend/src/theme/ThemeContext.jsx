import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { THEMES } from './themes';
import { detectCurrentHoliday, getMillisecondsUntilNextVietnamMonth } from './holidayScheduler';
import { useAuth } from '../context/AuthContext';

const ThemeContext = createContext();

const THEME_MODE_KEY = 'netphim_theme_mode'; // 'auto' | 'manual'
const MANUAL_THEME_KEY = 'netphim_manual_theme'; // theme id

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const isAdmin = Boolean(user?.isAdmin);

    // 1. Khởi tạo trạng thái từ localStorage (mặc định là 'auto' cho người dùng mới)
    const [themeMode, setThemeModeState] = useState(() => {
        try {
            return localStorage.getItem(THEME_MODE_KEY) || 'auto';
        } catch {
            return 'auto';
        }
    });

    const [manualThemeId, setManualThemeIdState] = useState(() => {
        try {
            return localStorage.getItem(MANUAL_THEME_KEY) || 'default';
        } catch {
            return 'default';
        }
    });

    const [holidayInfo, setHolidayInfo] = useState(() => detectCurrentHoliday());
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

    // 2. Lập lịch đúng thời điểm sang tháng mới, đồng thời xử lý tab/máy vừa thức dậy.
    const refreshHoliday = useCallback(() => {
        setHolidayInfo(detectCurrentHoliday());
    }, []);

    useEffect(() => {
        let timeoutId;

        const scheduleNextMonth = () => {
            clearTimeout(timeoutId);
            refreshHoliday();
            timeoutId = setTimeout(scheduleNextMonth, getMillisecondsUntilNextVietnamMonth());
        };
        const refreshWhenActive = () => {
            if (document.visibilityState !== 'hidden') {
                scheduleNextMonth();
            }
        };

        scheduleNextMonth();
        window.addEventListener('focus', refreshWhenActive);
        window.addEventListener('pageshow', refreshWhenActive);
        window.addEventListener('online', refreshWhenActive);
        document.addEventListener('visibilitychange', refreshWhenActive);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('focus', refreshWhenActive);
            window.removeEventListener('pageshow', refreshWhenActive);
            window.removeEventListener('online', refreshWhenActive);
            document.removeEventListener('visibilitychange', refreshWhenActive);
        };
    }, [refreshHoliday]);

    // 3. Tính toán Theme ID đang được áp dụng
    const activeThemeId = useMemo(() => {
        if (!isAdmin || themeMode === 'auto') {
            return holidayInfo.themeId || 'default';
        }
        return THEMES[manualThemeId] ? manualThemeId : 'default';
    }, [isAdmin, themeMode, holidayInfo.themeId, manualThemeId]);

    const activeTheme = useMemo(() => {
        return THEMES[activeThemeId] || THEMES.default;
    }, [activeThemeId]);

    // 4. Áp dụng Design Tokens / CSS Variables lên :root và thẻ <html>
    useEffect(() => {
        const root = document.documentElement;
        const colors = activeTheme.colors;

        root.style.setProperty('--bg-color', colors.background);
        root.style.setProperty('--surface-color', colors.surface);
        root.style.setProperty('--primary-color', colors.primary);
        root.style.setProperty('--secondary-color', colors.secondary);
        root.style.setProperty('--accent-color', colors.accent);
        root.style.setProperty('--text-primary', colors.text);
        root.style.setProperty('--text-secondary', colors.textSecondary);
        root.style.setProperty('--glass-bg', colors.glassBg);
        root.style.setProperty('--glass-border', colors.glassBorder);
        root.style.setProperty('--theme-glow', colors.glow);

        // Thiết lập data-theme để CSS có thể style riêng biệt nếu cần
        root.setAttribute('data-theme', activeTheme.id);

        // Đồng bộ màu nền trang web để tránh viền trắng khi cuộn
        document.body.style.backgroundColor = colors.background;
        document.body.style.color = colors.text;
    }, [activeTheme]);

    // 5. Hàm đổi theme (áp dụng tức thì trong 0ms và lưu trữ bền vững)
    const setAutoMode = useCallback(() => {
        setThemeModeState('auto');
        try {
            localStorage.setItem(THEME_MODE_KEY, 'auto');
        } catch (e) {
            console.warn('Cannot write localStorage:', e);
        }
    }, []);

    const setManualTheme = useCallback((themeId) => {
        if (!isAdmin || !THEMES[themeId]) return;
        setThemeModeState('manual');
        setManualThemeIdState(themeId);
        try {
            localStorage.setItem(THEME_MODE_KEY, 'manual');
            localStorage.setItem(MANUAL_THEME_KEY, themeId);
        } catch (e) {
            console.warn('Cannot write localStorage:', e);
        }
    }, [isAdmin]);

    const openThemeModal = useCallback(() => {
        if (isAdmin) {
            setIsThemeModalOpen(true);
        }
    }, [isAdmin]);
    const closeThemeModal = useCallback(() => setIsThemeModalOpen(false), []);

    const value = {
        theme: activeTheme,
        themeId: activeThemeId,
        themeMode,
        isAuto: !isAdmin || themeMode === 'auto',
        canManageTheme: isAdmin,
        manualThemeId,
        holidayInfo,
        setAutoMode,
        setManualTheme,
        isThemeModalOpen,
        openThemeModal,
        closeThemeModal
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
