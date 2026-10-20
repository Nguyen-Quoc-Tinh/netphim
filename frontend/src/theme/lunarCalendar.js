/**
 * Vietnamese Lunar Calendar Converter (Lịch Âm Việt Nam - Múi giờ Asia/Ho_Chi_Minh GMT+7)
 * Based on Dr. Ho Ngoc Duc's verified algorithm + verified astronomical lookup tables.
 */

// Bảng đối soát ngày lễ âm lịch đã kiểm chứng tại Việt Nam (GMT+7) từ 2024 - 2036
// Đảm bảo chính xác 100% không bao giờ sai lệch hoặc đoán ngày
export const VERIFIED_LUNAR_HOLIDAYS = {
    2024: {
        tet: { month: 2, day: 10 },        // Mùng 1 Tết Giáp Thìn: 10/02/2024
        midAutumn: { month: 9, day: 17 }   // Rằm tháng 8: 17/09/2024
    },
    2025: {
        tet: { month: 1, day: 29 },        // Mùng 1 Tết Ất Tỵ: 29/01/2025
        midAutumn: { month: 10, day: 6 }   // Rằm tháng 8: 06/10/2025
    },
    2026: {
        tet: { month: 2, day: 17 },        // Mùng 1 Tết Bính Ngọ: 17/02/2026
        midAutumn: { month: 9, day: 25 }   // Rằm tháng 8: 25/09/2026
    },
    2027: {
        tet: { month: 2, day: 6 },         // Mùng 1 Tết Đinh Mùi: 06/02/2027
        midAutumn: { month: 9, day: 15 }   // Rằm tháng 8: 15/09/2027
    },
    2028: {
        tet: { month: 1, day: 26 },        // Mùng 1 Tết Mậu Thân: 26/01/2028
        midAutumn: { month: 10, day: 3 }   // Rằm tháng 8: 03/10/2028
    },
    2029: {
        tet: { month: 2, day: 13 },        // Mùng 1 Tết Kỷ Dậu: 13/02/2029
        midAutumn: { month: 9, day: 22 }   // Rằm tháng 8: 22/09/2029
    },
    2030: {
        tet: { month: 2, day: 3 },         // Mùng 1 Tết Canh Tuất: 03/02/2030
        midAutumn: { month: 9, day: 12 }   // Rằm tháng 8: 12/09/2030
    },
    2031: {
        tet: { month: 1, day: 23 },        // Mùng 1 Tết Tân Hợi: 23/01/2031
        midAutumn: { month: 10, day: 1 }   // Rằm tháng 8: 01/10/2031
    },
    2032: {
        tet: { month: 2, day: 11 },        // Mùng 1 Tết Nhâm Tý: 11/02/2032
        midAutumn: { month: 9, day: 19 }   // Rằm tháng 8: 19/09/2032
    },
    2033: {
        tet: { month: 1, day: 31 },        // Mùng 1 Tết Quý Sửu: 31/01/2033
        midAutumn: { month: 9, day: 8 }    // Rằm tháng 8: 08/09/2033
    },
    2034: {
        tet: { month: 2, day: 19 },        // Mùng 1 Tết Giáp Dần: 19/02/2034
        midAutumn: { month: 9, day: 27 }   // Rằm tháng 8: 27/09/2034
    },
    2035: {
        tet: { month: 2, day: 8 },         // Mùng 1 Tết Ất Mão: 08/02/2035
        midAutumn: { month: 9, day: 16 }   // Rằm tháng 8: 16/09/2035
    },
    2036: {
        tet: { month: 1, day: 28 },        // Mùng 1 Tết Bính Thìn: 28/01/2036
        midAutumn: { month: 10, day: 4 }   // Rằm tháng 8: 04/10/2036
    }
};

/**
 * Thuật toán thiên văn tính lịch âm Việt Nam (Hồ Ngọc Đức - múi giờ GMT+7)
 */
const INT = (d) => Math.floor(d);

const jdFromDate = (dd, mm, yy) => {
    let a = INT((14 - mm) / 12);
    let y = yy + 4800 - a;
    let m = mm + 12 * a - 3;
    let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) {
        jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
};

const getNewMoonDay = (k, timeZone = 7.0) => {
    let T = k / 1236.85;
    let T2 = T * T;
    let T3 = T2 * T;
    let dr = Math.PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    let Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * M * dr);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * Mpr * dr);
    C1 = C1 - 0.0004 * Math.sin(3 * Mpr * dr);
    C1 = C1 + 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin((M + Mpr) * dr);
    C1 = C1 - 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
    C1 = C1 - 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
    C1 = C1 + 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((M + 2 * Mpr) * dr);
    let deltat;
    if (T < -11) {
        deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    } else {
        deltat = -0.000078 + 0.000206 * T + 0.00010175 * T2;
    }
    let JdNew = Jd1 + C1 - deltat;
    return INT(JdNew + 0.5 + timeZone / 24.0);
};

const getSunLongitude = (dayNumber, timeZone = 7.0) => {
    let T = (dayNumber - 0.5 - timeZone / 24.0 - 2451545.0) / 36525;
    let T2 = T * T;
    let dr = Math.PI / 180;
    let M = 357.52910 + 35999.05029 * T - 0.0001537 * T2;
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr);
    DL = DL + (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) + 0.000289 * Math.sin(3 * M * dr);
    let L = L0 + DL;
    L = L * dr;
    L = L - Math.PI * 2 * INT(L / (Math.PI * 2));
    return INT(L / Math.PI * 6);
};

export const convertSolar2Lunar = (dd, mm, yy, timeZone = 7.0) => {
    let dayNumber = jdFromDate(dd, mm, yy);
    let k = INT((dayNumber - 2415021.0769986) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
        monthStart = getNewMoonDay(k, timeZone);
    }
    let a11 = getNewMoonDay(INT((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853), timeZone);
    let b11 = a11;
    if (getSunLongitude(a11, timeZone) >= 9) {
        b11 = getNewMoonDay(INT((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853) - 1, timeZone);
    }
    let lunarDay = dayNumber - monthStart + 1;
    let diff = INT((monthStart - b11) / 29);
    let lunarMonth = diff + 11;
    let lunarYear = yy;
    if (lunarMonth > 12) {
        lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
        lunarYear -= 1;
    }
    return { day: lunarDay, month: lunarMonth, year: lunarYear };
};

/**
 * Lấy khoảng thời gian của Tết Nguyên Đán cho một năm dương lịch
 * Quy tắc: Từ 7 ngày trước mùng 1 Tết đến 7 ngày sau mùng 1 Tết (bao gồm cả 2 đầu)
 */
export const getLunarNewYearRange = (solarYear) => {
    // 1. Dùng bảng kiểm chứng trước (cực nhanh và chính xác 100%)
    if (VERIFIED_LUNAR_HOLIDAYS[solarYear]?.tet) {
        const { month, day } = VERIFIED_LUNAR_HOLIDAYS[solarYear].tet;
        const tetDate = new Date(solarYear, month - 1, day, 0, 0, 0);
        const start = new Date(tetDate);
        start.setDate(tetDate.getDate() - 7);
        const end = new Date(tetDate);
        end.setDate(tetDate.getDate() + 7);
        end.setHours(23, 59, 59, 999);
        return { start, end, exact: tetDate };
    }

    // 2. Thuật toán thiên văn dự phòng cho các năm ngoài bảng
    for (let m = 1; m <= 2; m++) {
        for (let d = 15; d <= 31; d++) {
            const l = convertSolar2Lunar(d, m, solarYear);
            if (l.day === 1 && l.month === 1) {
                const tetDate = new Date(solarYear, m - 1, d, 0, 0, 0);
                const start = new Date(tetDate);
                start.setDate(tetDate.getDate() - 7);
                const end = new Date(tetDate);
                end.setDate(tetDate.getDate() + 7);
                end.setHours(23, 59, 59, 999);
                return { start, end, exact: tetDate };
            }
        }
    }
    return null;
};

/**
 * Lấy khoảng thời gian của Tết Trung Thu cho một năm dương lịch
 * Quy tắc: Từ 7 ngày trước Rằm tháng 8 (15/8 âm) đến 1 ngày sau Rằm tháng 8
 */
export const getMidAutumnRange = (solarYear) => {
    // 1. Dùng bảng kiểm chứng
    if (VERIFIED_LUNAR_HOLIDAYS[solarYear]?.midAutumn) {
        const { month, day } = VERIFIED_LUNAR_HOLIDAYS[solarYear].midAutumn;
        const midDate = new Date(solarYear, month - 1, day, 0, 0, 0);
        const start = new Date(midDate);
        start.setDate(midDate.getDate() - 7);
        const end = new Date(midDate);
        end.setDate(midDate.getDate() + 1);
        end.setHours(23, 59, 59, 999);
        return { start, end, exact: midDate };
    }

    // 2. Thuật toán thiên văn dự phòng
    for (let m = 8; m <= 10; m++) {
        for (let d = 1; d <= 31; d++) {
            const l = convertSolar2Lunar(d, m, solarYear);
            if (l.day === 15 && l.month === 8) {
                const midDate = new Date(solarYear, m - 1, d, 0, 0, 0);
                const start = new Date(midDate);
                start.setDate(midDate.getDate() - 7);
                const end = new Date(midDate);
                end.setDate(midDate.getDate() + 1);
                end.setHours(23, 59, 59, 999);
                return { start, end, exact: midDate };
            }
        }
    }
    return null;
};
