import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronRight } from 'lucide-react';

const FilterSection = ({ onFilter, onClose }) => {
    const [filters, setFilters] = useState({
        country: 'Tất cả',
        type: 'Tất cả',
        rating: 'Tất cả',
        genre: 'Tất cả',
        year: 'Tất cả',
        sort: 'Mới nhất'
    });

    const options = {
        countries: ['Tất cả', 'Trung Quốc', 'Âu Mỹ', 'Hàn Quốc', 'Indonesia', 'Philippines', 'Nga', 'Singapore', 'Nhật Bản', 'Thái Lan', 'Anh', 'Pháp', 'Bỉ', 'Hồng Kông', 'Canada', 'Úc', 'Ý', 'Tây Ban Nha', 'Ấn Độ', 'Na Uy', 'Đức', 'Việt Nam', 'Thổ Nhĩ Kỳ', 'Argentina', 'Hà Lan', 'Quốc Gia Khác'],
        types: ['Tất cả', 'Phim lẻ', 'Phim bộ'],
        ratings: ['Tất cả', 'P (Mọi lứa tuổi)', 'K (Dưới 13 tuổi)', 'T13 (13 tuổi trở lên)', 'T16 (16 tuổi trở lên)', 'T18 (18 tuổi trở lên)'],
        genres: ['Tất cả', 'Chính kịch', 'Hài Hước', 'Bí ẩn', 'Gia Đình', 'Hành Động', 'Viễn Tưởng', 'Hình Sự', 'Kinh Dị', 'Phiêu Lưu', 'Khoa Học', 'Cổ Trang', 'Võ Thuật', 'Short Drama', 'Tình Cảm', 'Tài Liệu', 'Tâm Lý', 'Âm Nhạc', 'Thể Thao', 'Chiến Tranh', 'Thần Thoại', 'Học Đường', 'Hoạt Hình', 'Chiếu Rạp'],
        years: ['Tất cả', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'],
        sorts: ['Mới nhất', 'Điểm IMDb', 'Lượt xem']
    };

    const handleSelect = (category, value) => {
        setFilters(prev => ({ ...prev, [category]: value }));
    };

    const FilterRow = ({ label, category, items }) => (
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.2rem', alignItems: 'flex-start' }}>
            <span style={{ minWidth: '100px', fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, paddingTop: '8px' }}>{label}:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {items.map(item => (
                    <button
                        key={item}
                        onClick={() => handleSelect(category, item)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            border: '1px solid transparent',
                            background: filters[category] === item ? 'rgba(248, 212, 72, 0.15)' : 'transparent',
                            color: filters[category] === item ? 'var(--primary-color)' : '#ccc',
                            fontWeight: filters[category] === item ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
                background: '#121214',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '3rem'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <Filter size={18} />
                <span style={{ fontWeight: 800 }}>Bộ lọc</span>
            </div>

            <FilterRow label="Quốc gia" category="country" items={options.countries} />
            <FilterRow label="Loại phim" category="type" items={options.types} />
            <FilterRow label="Xếp hạng" category="rating" items={options.ratings} />
            <FilterRow label="Thể loại" category="genre" items={options.genres} />
            <FilterRow label="Năm sản xuất" category="year" items={options.years} />
            <FilterRow label="Sắp xếp" category="sort" items={options.sorts} />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button 
                    onClick={() => onFilter(filters)}
                    style={{
                        background: 'var(--primary-color)',
                        color: '#000',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        border: 'none'
                    }}
                >
                    Lọc kết quả <ChevronRight size={18} />
                </button>
                <button 
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    Đóng
                </button>
            </div>
        </motion.div>
    );
};

export default FilterSection;
