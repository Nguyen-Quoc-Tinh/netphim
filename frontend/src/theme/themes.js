/**
 * Seasonal Theme Engine - Theme Configurations
 * 7 Cinematic Themes for NETPHIM
 */

export const THEMES = {
    default: {
        id: 'default',
        name: 'Default Cinema',
        displayName: '🌑 Mặc định',
        subtitle: 'Giao diện điện ảnh cao cấp tiêu chuẩn',
        styleName: 'Premium Dark Cinema',
        icon: '🌑',
        colors: {
            primary: '#E50914',
            secondary: '#A1A1AA',
            background: '#09090B',
            surface: '#141418',
            accent: '#EF4444',
            text: '#FFFFFF',
            textSecondary: '#A1A1AA',
            glassBg: 'rgba(20, 20, 24, 0.75)',
            glassBorder: 'rgba(255, 255, 255, 0.07)',
            glow: 'rgba(229, 9, 20, 0.35)'
        },
        banner: {
            text: 'NETPHIM CINEMA',
            subtext: 'Trải nghiệm điện ảnh đỉnh cao'
        },
        effects: [],
        badge: null
    },

    tet: {
        id: 'tet',
        name: 'Lunar New Year',
        displayName: '🧧 Tết Nguyên Đán',
        subtitle: 'Tết Cổ Truyền Việt Nam & Khởi Đầu Thịnh Vượng',
        styleName: 'Vietnamese Luxury Lunar New Year',
        icon: '🧧',
        colors: {
            primary: '#C8102E',
            secondary: '#FFD700',
            background: '#160909',
            surface: '#261010',
            accent: '#FFCC33',
            text: '#FFFDF5',
            textSecondary: '#E2C0A5',
            glassBg: 'rgba(38, 16, 16, 0.8)',
            glassBorder: 'rgba(255, 215, 0, 0.18)',
            glow: 'rgba(200, 16, 46, 0.45)'
        },
        banner: {
            text: 'CHÚC MỪNG NĂM MỚI',
            subtext: 'Vạn Sự Như Ý • An Khang Thịnh Vượng',
            showYear: true
        },
        effects: ['blossom_petals', 'golden_shimmer', 'lanterns'],
        badge: '🧧 Tết Nguyên Đán'
    },

    valentine: {
        id: 'valentine',
        name: 'Valentine Cinema',
        displayName: '❤️ Valentine',
        subtitle: 'Không gian lãng mạn cho những tín đồ điện ảnh',
        styleName: 'Romantic Dark Cinema',
        icon: '❤️',
        colors: {
            primary: '#FF4D6D',
            secondary: '#FF8FAB',
            background: '#160B14',
            surface: '#241220',
            accent: '#FFB3C6',
            text: '#FFF5F8',
            textSecondary: '#D9A9BE',
            glassBg: 'rgba(36, 18, 32, 0.8)',
            glassBorder: 'rgba(255, 77, 109, 0.18)',
            glow: 'rgba(255, 77, 109, 0.45)'
        },
        banner: {
            text: 'LOVE IS IN THE AIR',
            subtext: 'Tuyển tập phim tình cảm ngọt ngào & lắng đọng',
            showYear: false
        },
        effects: ['floating_hearts', 'rose_glow'],
        badge: '❤️ Mùa Yêu Thương'
    },

    vietnam: {
        id: 'vietnam',
        name: 'Vietnam Celebration',
        displayName: '🇻🇳 Việt Nam',
        subtitle: 'Chào mừng các ngày lễ trọng đại của non sông',
        styleName: 'Vietnam National Celebration',
        icon: '🇻🇳',
        colors: {
            primary: '#DA251D',
            secondary: '#FFDA44',
            background: '#160909',
            surface: '#281010',
            accent: '#FFD700',
            text: '#FFFBEA',
            textSecondary: '#E5C5A8',
            glassBg: 'rgba(40, 16, 16, 0.82)',
            glassBorder: 'rgba(255, 218, 68, 0.22)',
            glow: 'rgba(218, 37, 29, 0.45)'
        },
        banner: {
            text: 'RẠNG RỠ VIỆT NAM',
            subtext: 'Tự hào non sông gấm vóc đất Việt',
            showYear: false
        },
        effects: ['golden_stars', 'festive_sparks'],
        badge: '🇻🇳 Tự Hào Việt Nam'
    },

    trungthu: {
        id: 'trungthu',
        name: 'Mid-Autumn Festival',
        displayName: '🥮 Tết Trung Thu',
        subtitle: 'Đêm hội trăng rằm huyền ảo và ký ức tuổi thơ',
        styleName: 'Moonlight Fantasy Cinema',
        icon: '🥮',
        colors: {
            primary: '#A78BFA',
            secondary: '#FBBF24',
            background: '#0B1026',
            surface: '#151D3B',
            accent: '#FDE68A',
            text: '#F5F7FF',
            textSecondary: '#A9B7DB',
            glassBg: 'rgba(21, 29, 59, 0.8)',
            glassBorder: 'rgba(251, 191, 36, 0.18)',
            glow: 'rgba(167, 139, 250, 0.45)'
        },
        banner: {
            text: 'ĐÊM HỘI TRĂNG RẰM',
            subtext: 'Ánh trăng vằng vặc soi sáng mùa đoàn viên',
            showYear: false
        },
        effects: ['moon_glow', 'sky_lanterns', 'twinkling_stars'],
        badge: '🥮 Hội Trăng Rằm'
    },

    halloween: {
        id: 'halloween',
        name: 'Halloween Horror Nights',
        displayName: '🎃 Halloween',
        subtitle: 'Không gian rùng rợn, ma mị và đầy bí ẩn',
        styleName: 'Dark Horror Cinema',
        icon: '🎃',
        colors: {
            primary: '#FF7518',
            secondary: '#9333EA',
            background: '#070609',
            surface: '#181220',
            accent: '#F97316',
            text: '#FDFCF7',
            textSecondary: '#A89DB5',
            glassBg: 'rgba(24, 18, 32, 0.85)',
            glassBorder: 'rgba(255, 117, 24, 0.22)',
            glow: 'rgba(255, 117, 24, 0.45)'
        },
        banner: {
            text: 'HALLOWEEN HORROR NIGHTS',
            subtext: 'Đắm chìm vào thế giới kinh dị rùng rợn nhất',
            showYear: false
        },
        effects: ['flying_bats', 'drifting_fog', 'ember_particles'],
        badge: '🎃 Đêm Lễ Halloween'
    },

    christmas: {
        id: 'christmas',
        name: 'Christmas Wonderland',
        displayName: '🎄 Giáng sinh',
        subtitle: 'Xứ sở mùa đông diệu kỳ & ấm áp',
        styleName: 'Winter Wonderland Cinema',
        icon: '🎄',
        colors: {
            primary: '#DC2626',
            secondary: '#16A34A',
            background: '#0B1423',
            surface: '#122238',
            accent: '#FACC15',
            text: '#F8FAFC',
            textSecondary: '#94A3B8',
            glassBg: 'rgba(18, 34, 56, 0.82)',
            glassBorder: 'rgba(220, 38, 38, 0.2)',
            glow: 'rgba(220, 38, 38, 0.45)'
        },
        banner: {
            text: 'MERRY CHRISTMAS',
            subtext: 'Mùa an lành, ngập tràn ánh sáng và niềm vui',
            showYear: false
        },
        effects: ['gentle_snow', 'fairy_lights'],
        badge: '🎄 Giáng Sinh An Lành'
    }
};

export const THEME_LIST = Object.values(THEMES);
