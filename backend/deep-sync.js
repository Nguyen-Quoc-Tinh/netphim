const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('🚀 Đã kết nối MongoDB - Sẵn sàng quét dữ liệu!'))
    .catch(err => {
        console.error('❌ Lỗi kết nối MongoDB:', err);
        process.exit(1);
    });

const movieSchema = new mongoose.Schema({}, { strict: false });
const Movie = mongoose.model('Movie', movieSchema, 'movies');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function syncSource(name, baseUrl, listPath) {
    console.log(`\n--- Bắt đầu quét nguồn: ${name} ---`);
    let currentPage = 1;
    let hasNext = true;
    let addedCount = 0;
    let updatedCount = 0;

    while (hasNext) {
        try {
            console.log(`\n[${name}] --- Đang quét trang ${currentPage} ---`);
            const response = await axios.get(`${baseUrl}${listPath}?page=${currentPage}`, { timeout: 10000 });
            
            const data = response.data;
            const items = data.items || (data.data && data.data.items);
            
            if (!items || items.length === 0) {
                console.log(`[${name}] Đã hết dữ liệu tại trang ${currentPage}.`);
                hasNext = false;
                break;
            }

            for (const item of items) {
                try {
                    const detailUrl = `${baseUrl}/phim/${item.slug}`;
                    const detailRes = await axios.get(detailUrl, { timeout: 10000 });
                    const movieDetail = detailRes.data.movie;

                    if (!movieDetail) continue;

                    if (detailRes.data.episodes) {
                        movieDetail.episodes = detailRes.data.episodes;
                    }

                    // Xóa _id để tránh lỗi
                    delete movieDetail._id;

                    // Kiểm tra xem phim đã tồn tại chưa để báo cáo chính xác
                    const existingMovie = await Movie.findOne({ slug: movieDetail.slug });
                    
                    await Movie.findOneAndUpdate(
                        { slug: movieDetail.slug },
                        movieDetail,
                        { upsert: true }
                    );

                    if (existingMovie) {
                        updatedCount++;
                    } else {
                        addedCount++;
                        console.log(`   ✨ [MỚI] Đã khôi phục/thêm mới: ${movieDetail.name}`);
                    }
                } catch (err) {
                    console.error(`   ⚠️ Lỗi khi xử lý phim ${item.slug}:`, err.message);
                }
                await delay(200);
            }

            const pagination = data.pagination || (data.data && data.data.params && data.data.params.pagination);
            if (pagination) {
                const totalPages = Math.ceil(pagination.totalItems / pagination.totalItemsPerPage) || pagination.totalPages;
                if (currentPage >= totalPages) hasNext = false;
            }

            currentPage++;
            console.log(`\n[${name}] KẾT QUẢ TRANG HIỆN TẠI:`);
            console.log(`   - Tổng phim mới đã thêm: ${addedCount}`);
            console.log(`   - Tổng phim đã cập nhật: ${updatedCount}`);
            
        } catch (error) {
            console.error(`❌ Lỗi tại trang ${currentPage}:`, error.message);
            await delay(5000);
        }
    }
}

async function startDeepSync() {
    console.log('🔔 BẮT ĐẦU QUÁ TRÌNH QUÉT SÂU (DEEP SYNC)');
    await syncSource('KKPHIM', 'https://phimapi.com', '/danh-sach/phim-moi-cap-nhat');
    await syncSource('OPHIM', 'https://ophim1.com/v1/api', '/danh-sach/phim-moi');
    process.exit(0);
}

startDeepSync();
