/**
 * Automatic monthly holiday theme scheduler for Vietnam (Asia/Ho_Chi_Minh).
 */

import { getLunarNewYearRange, getMidAutumnRange } from './lunarCalendar.js';

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Lấy đối tượng thời gian hiện tại theo múi giờ Asia/Ho_Chi_Minh.
 */
export const getVietnamNow = () => {
    try {
        const vietnamDate = new Date().toLocaleString('en-US', { timeZone: VIETNAM_TIME_ZONE });
        return new Date(vietnamDate);
    } catch {
        const now = new Date();
        return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + VIETNAM_OFFSET_MS);
    }
};

const getVietnamCalendarDate = (date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: VIETNAM_TIME_ZONE,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
    return new Date(values.year, values.month - 1, values.day);
};

/**
 * Lấy tháng dương lịch chứa ngày lễ âm lịch Việt Nam.
 */
export const getLunarHolidayMonths = (solarYear) => ({
    tet: getLunarNewYearRange(solarYear)?.exact?.getMonth() + 1 || null,
    midAutumn: getMidAutumnRange(solarYear)?.exact?.getMonth() + 1 || null
});

const MONTHLY_THEME_CANDIDATES = {
    1: [],
    2: [{ themeId: 'valentine' }],
    3: [],
    4: [{ themeId: 'vietnam' }],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [{ themeId: 'vietnam' }],
    10: [{ themeId: 'halloween' }],
    11: [],
    12: [{ themeId: 'christmas' }]
};

const THEME_PRIORITY = ['tet', 'trungthu', 'halloween', 'christmas', 'vietnam', 'valentine', 'default'];

const getThemeDetails = (themeId, year) => ({
    default: {
        holidayName: '🌑 Mặc Định',
        bannerText: 'NETPHIM CINEMA',
        subtext: 'Trải nghiệm điện ảnh đỉnh cao',
        isHoliday: false
    },
    tet: {
        holidayName: '🧧 Tết Nguyên Đán',
        bannerText: `CHÚC MỪNG NĂM MỚI ${year}`,
        subtext: 'Xuân An Khang • Vạn Sự Như Ý • Phát Tài Phát Lộc',
        isHoliday: true
    },
    trungthu: {
        holidayName: '🥮 Tết Trung Thu',
        bannerText: 'ĐÊM HỘI TRĂNG RẰM',
        subtext: 'Ánh trăng rằm tháng 8 soi sáng ấm áp muôn nơi',
        isHoliday: true
    },
    halloween: {
        holidayName: '🎃 Lễ Hội Halloween',
        bannerText: 'HALLOWEEN HORROR NIGHTS',
        subtext: 'Đêm hội huyền bí & những thước phim kinh dị rùng rợn',
        isHoliday: true
    },
    christmas: {
        holidayName: '🎄 Giáng Sinh An Lành',
        bannerText: 'MERRY CHRISTMAS',
        subtext: 'Mùa Giáng Sinh an lành, hạnh phúc và ấm áp yêu thương',
        isHoliday: true
    },
    vietnam: {
        holidayName: '🇻🇳 Vietnam Celebration',
        bannerText: 'RẠNG RỠ VIỆT NAM',
        subtext: 'Tự hào non sông gấm vóc đất Việt',
        isHoliday: true
    },
    valentine: {
        holidayName: '❤️ Valentine Cinema',
        bannerText: 'LOVE IS IN THE AIR',
        subtext: 'Tuyển tập phim lãng mạn ngọt ngào nhất',
        isHoliday: true
    }
})[themeId] || {
    holidayName: '🌑 Mặc Định',
    bannerText: 'NETPHIM CINEMA',
    subtext: 'Trải nghiệm điện ảnh đỉnh cao',
    isHoliday: false
};

/**
 * Chọn một theme tự động cho toàn bộ tháng dương lịch hiện tại.
 */
export const getMonthlyTheme = (date) => {
    const currentDate = getVietnamCalendarDate(date);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const lunarMonths = getLunarHolidayMonths(year);
    const candidates = [...(MONTHLY_THEME_CANDIDATES[month] || [])];

    if (lunarMonths.tet === month && !candidates.some(({ themeId }) => themeId === 'tet')) {
        candidates.push({ themeId: 'tet' });
    }
    if (lunarMonths.midAutumn === month && !candidates.some(({ themeId }) => themeId === 'trungthu')) {
        candidates.push({ themeId: 'trungthu' });
    }

    const selected = THEME_PRIORITY
        .map((themeId) => candidates.find((candidate) => candidate.themeId === themeId))
        .find(Boolean);
    const themeId = selected?.themeId || 'default';

    return {
        themeId,
        month,
        year,
        ...getThemeDetails(themeId, year)
    };
};

/**
 * Số mili-giây tới 00:00:00 ngày đầu tháng kế tiếp theo giờ Việt Nam.
 */
export const getMillisecondsUntilNextVietnamMonth = (date = new Date()) => {
    const vietnamDate = getVietnamCalendarDate(date);
    const nextMonthUtc = Date.UTC(vietnamDate.getFullYear(), vietnamDate.getMonth() + 1, 1);
    const nextMonthVietnamUtc = nextMonthUtc - VIETNAM_OFFSET_MS;
    return Math.max(0, nextMonthVietnamUtc - date.getTime());
};

export const detectCurrentHoliday = (customDate = null) => (
    getMonthlyTheme(customDate || new Date())
);
