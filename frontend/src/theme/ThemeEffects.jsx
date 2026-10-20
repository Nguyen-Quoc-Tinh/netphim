import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';
import { useLocation } from 'react-router-dom';

/**
 * High-performance, GPU-accelerated seasonal particle & effect engine.
 * Renders on a single lightweight <canvas> with pointer-events: none.
 * Automatically throttles and pauses when hidden or on video player page.
 */
export const ThemeEffects = () => {
    const { themeId, theme } = useTheme();
    const canvasRef = useRef(null);
    const location = useLocation();

    // Tắt hiệu ứng mạnh nếu người dùng đang ở trang xem phim (để tối ưu 100% FPS cho video player)
    const isWatchPage = location.pathname.startsWith('/movie/');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Nếu theme là default hoặc không có hiệu ứng, hoặc đang xem phim -> dừng canvas
        if (themeId === 'default' || !theme?.effects?.length || isWatchPage) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Khởi tạo các hạt tùy theo từng chủ đề
        let particles = [];
        const count = Math.min(28, Math.floor(width / 50)); // Throttled count < 30 hạt

        // 1. TẾT: Cánh hoa mai (vàng) & hoa đào (hồng phấn)
        if (themeId === 'tet') {
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 8 + 6,
                    speedY: Math.random() * 1.2 + 0.6,
                    speedX: Math.random() * 1.2 - 0.6,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 2,
                    isPeach: Math.random() > 0.4, // Đào hoặc Mai
                    opacity: Math.random() * 0.5 + 0.4
                });
            }
        }
        // 2. VALENTINE: Trái tim bay bổng
        else if (themeId === 'valentine') {
            for (let i = 0; i < Math.floor(count * 0.7); i++) {
                particles.push({
                    x: Math.random() * width,
                    y: height + Math.random() * 100,
                    size: Math.random() * 12 + 8,
                    speedY: -(Math.random() * 0.8 + 0.4),
                    speedX: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.45 + 0.25,
                    hue: Math.random() > 0.5 ? '#ff4d6d' : '#ff8fab'
                });
            }
        }
        // 3. VIỆT NAM: Ngôi sao vàng & đốm sáng lễ hội
        else if (themeId === 'vietnam') {
            for (let i = 0; i < Math.floor(count * 0.8); i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 4 + 2,
                    speedY: -(Math.random() * 0.6 + 0.2),
                    speedX: (Math.random() - 0.5) * 0.4,
                    opacity: Math.random() * 0.5 + 0.2,
                    isStar: Math.random() > 0.6,
                    color: Math.random() > 0.4 ? '#ffda44' : '#da251d'
                });
            }
        }
        // 4. TRUNG THU: Đèn lồng bay chậm & sao lấp lánh
        else if (themeId === 'trungthu') {
            for (let i = 0; i < Math.floor(count * 0.6); i++) {
                particles.push({
                    x: Math.random() * width,
                    y: height + Math.random() * 200,
                    size: Math.random() * 14 + 10,
                    speedY: -(Math.random() * 0.4 + 0.2),
                    speedX: Math.sin(Math.random()) * 0.4,
                    sway: Math.random() * Math.PI,
                    opacity: Math.random() * 0.6 + 0.3
                });
            }
        }
        // 5. HALLOWEEN: Dơi bay ngang & đốm ma quái
        else if (themeId === 'halloween') {
            for (let i = 0; i < Math.floor(count * 0.6); i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * (height * 0.7),
                    size: Math.random() * 12 + 8,
                    speedX: Math.random() * 1.5 + 1.2,
                    speedY: Math.sin(Math.random()) * 0.8,
                    wingState: 0,
                    opacity: Math.random() * 0.6 + 0.25
                });
            }
        }
        // 6. GIÁNG SINH: Tuyết rơi tự nhiên
        else if (themeId === 'christmas') {
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 3 + 1,
                    density: Math.random() * 20,
                    speedY: Math.random() * 1.2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.6,
                    opacity: Math.random() * 0.6 + 0.3
                });
            }
        }

        // Vòng lặp render chính
        let step = 0;
        const render = () => {
            step++;
            ctx.clearRect(0, 0, width, height);

            // VẼ TỪNG CHỦ ĐỀ
            if (themeId === 'tet') {
                // Vẽ cánh hoa đào / hoa mai
                particles.forEach(p => {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.fillStyle = p.isPeach 
                        ? `rgba(255, 143, 171, ${p.opacity})` 
                        : `rgba(255, 215, 0, ${p.opacity})`;
                    
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    p.y += p.speedY;
                    p.x += p.speedX + Math.sin(step * 0.02) * 0.5;
                    p.rotation += p.rotationSpeed;

                    if (p.y > height + 20) {
                        p.y = -20;
                        p.x = Math.random() * width;
                    }
                });
            } 
            else if (themeId === 'valentine') {
                // Vẽ trái tim bay chậm
                particles.forEach(p => {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.fillStyle = p.hue;
                    ctx.globalAlpha = p.opacity;
                    ctx.beginPath();
                    const d = p.size;
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(-d / 2, -d / 2, -d, d / 3, 0, d);
                    ctx.bezierCurveTo(d, d / 3, d / 2, -d / 2, 0, 0);
                    ctx.fill();
                    ctx.restore();

                    p.y += p.speedY;
                    p.x += p.speedX + Math.sin(step * 0.02 + p.y * 0.01) * 0.3;

                    if (p.y < -30) {
                        p.y = height + 30;
                        p.x = Math.random() * width;
                    }
                });
            }
            else if (themeId === 'vietnam') {
                // Vẽ ngôi sao vàng hoặc đốm ánh sáng
                particles.forEach(p => {
                    ctx.save();
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.opacity;
                    if (p.isStar) {
                        ctx.translate(p.x, p.y);
                        ctx.beginPath();
                        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();

                    p.y += p.speedY;
                    p.x += p.speedX;
                    if (p.y < -20) {
                        p.y = height + 20;
                        p.x = Math.random() * width;
                    }
                });
            }
            else if (themeId === 'trungthu') {
                // Vẽ đèn lồng nhỏ bay lên
                particles.forEach(p => {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity})`;
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
                    ctx.beginPath();
                    ctx.roundRect(-p.size / 2, -p.size * 0.6, p.size, p.size * 1.2, 4);
                    ctx.fill();
                    ctx.restore();

                    p.y += p.speedY;
                    p.x += Math.sin(step * 0.015 + p.sway) * 0.4;
                    if (p.y < -40) {
                        p.y = height + 40;
                        p.x = Math.random() * width;
                    }
                });
            }
            else if (themeId === 'halloween') {
                // Vẽ bóng dơi bay
                particles.forEach(p => {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.fillStyle = `rgba(20, 16, 28, ${p.opacity})`;
                    ctx.strokeStyle = `rgba(249, 115, 22, ${p.opacity * 0.4})`;
                    ctx.lineWidth = 1;
                    p.wingState = Math.sin(step * 0.15) * 4;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(-p.size, -p.size / 2 + p.wingState, -p.size * 1.5, p.wingState);
                    ctx.quadraticCurveTo(-p.size * 0.5, p.size * 0.5, 0, p.size * 0.3);
                    ctx.quadraticCurveTo(p.size * 0.5, p.size * 0.5, p.size * 1.5, p.wingState);
                    ctx.quadraticCurveTo(p.size, -p.size / 2 + p.wingState, 0, 0);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();

                    p.x += p.speedX;
                    p.y += p.speedY + Math.sin(step * 0.05) * 0.8;
                    if (p.x > width + 50) {
                        p.x = -50;
                        p.y = Math.random() * (height * 0.7);
                    }
                });
            }
            else if (themeId === 'christmas') {
                // Vẽ bông tuyết rơi
                particles.forEach(p => {
                    ctx.save();
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    p.y += p.speedY;
                    p.x += p.speedX + Math.sin(step * 0.01 + p.density) * 0.4;
                    if (p.y > height + 10) {
                        p.y = -10;
                        p.x = Math.random() * width;
                    }
                });
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [themeId, theme, isWatchPage]);

    if (themeId === 'default' || isWatchPage) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 4, // Nằm trên nền nhưng dưới modals/dropdowns (z-index 1000)
                opacity: 0.85
            }}
        />
    );
};
