const axios = require('axios');
const mongoose = require('mongoose');

// Helper to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fastSync() {
    // Lấy model Movie (đã được định nghĩa trong index.js hoặc định nghĩa mới nếu chưa có)
    const Movie = mongoose.models.Movie || mongoose.model('Movie', new mongoose.Schema({}, { strict: false }), 'movies');

    console.log(`\n⏰ [${new Date().toLocaleString()}] [Auto-Cron] Bắt đầu chu kỳ quét phim mới...`);
    
    const sources = [
        { name: 'KKPHIM', baseUrl: 'https://phimapi.com', listPath: '/danh-sach/phim-moi-cap-nhat' },
        { name: 'OPHIM', baseUrl: 'https://phimapi.com', listPath: '/danh-sach/phim-moi-cap-nhat' }
    ];

    for (const source of sources) {
        let addedInSource = 0;
        // Chỉ quét 5 trang đầu để lấy phim mới nhất
        for (let page = 1; page <= 5; page++) {
            try {
                const response = await axios.get(`${source.baseUrl}${source.listPath}?page=${page}`, { timeout: 10000 });
                const items = response.data.items || (response.data.data && response.data.data.items);
                
                if (!items) break;

                for (const item of items) {
                    try {
                        const detailRes = await axios.get(`${source.baseUrl}/phim/${item.slug}`, { timeout: 10000 });
                        const movieDetail = detailRes.data.movie;
                        if (!movieDetail) continue;

                        if (detailRes.data.episodes) movieDetail.episodes = detailRes.data.episodes;
                        delete movieDetail._id;

                        const existing = await Movie.findOne({ slug: movieDetail.slug });
                        await Movie.findOneAndUpdate({ slug: movieDetail.slug }, movieDetail, { upsert: true });

                        if (!existing) {
                            addedInSource++;
                            console.log(`   ✨ [Auto-Cron] [${source.name}] Phim mới: ${movieDetail.name}`);
                        }
                    } catch (e) {}
                    await delay(300);
                }
            } catch (error) {
                console.error(`   ❌ [Auto-Cron] Lỗi khi quét ${source.name} trang ${page}:`, error.message);
            }
        }
        console.log(`✅ [Auto-Cron] Hoàn thành nguồn ${source.name}. Đã thêm ${addedInSource} phim mới.`);
    }
    console.log(`💤 [Auto-Cron] Chu kỳ kết thúc. Sẽ quét lại sau 30 phút...`);
}

function startAutoCron() {
    console.log('🚀 [Auto-Cron] Hệ thống quét tự động đã được kích hoạt cùng Server!');
    // Chạy lần đầu ngay khi bật
    fastSync();
    // Thiết lập chu kỳ 5 phút
    setInterval(fastSync, 5 * 60 * 1000);
}

module.exports = startAutoCron;
