/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：首页 canvas 背景动画
 * 功能说明：全屏粒子漂移 + 邻近粒子连线 + 鼠标吸附效果，作为首页背景动画
 */

// 获取 canvas 画布与绘图上下文
const ly_canvas = document.getElementById('ly_canvas');
const ly_ctx = ly_canvas.getContext('2d');

// 粒子数量、连线距离阈值与粒子列表（ly_ 前缀）
const ly_particle_count = 90;
const ly_link_distance = 130;
const ly_particles = [];

// 鼠标位置（用于吸附效果）
let ly_mouse = { x: null, y: null };

// 功能：根据窗口尺寸调整画布大小
function ly_resize_canvas() {
  ly_canvas.width = window.innerWidth;
  ly_canvas.height = window.innerHeight;
}

// 功能：在随机位置创建一个粒子对象
function ly_create_particle() {
  return {
    x: Math.random() * ly_canvas.width,
    y: Math.random() * ly_canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    r: Math.random() * 2 + 1
  };
}

// 功能：初始化全部粒子
function ly_init_particles() {
  ly_particles.length = 0;
  for (let i = 0; i < ly_particle_count; i++) {
    ly_particles.push(ly_create_particle());
  }
}

// 功能：绘制粒子连线（距离小于阈值的两点之间）
function ly_draw_links() {
  for (let i = 0; i < ly_particles.length; i++) {
    for (let j = i + 1; j < ly_particles.length; j++) {
      const dx = ly_particles[i].x - ly_particles[j].x;
      const dy = ly_particles[i].y - ly_particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ly_link_distance) {
        // 距离越近线条越亮
        ly_ctx.strokeStyle = `rgba(126, 232, 250, ${1 - dist / ly_link_distance})`;
        ly_ctx.lineWidth = 1;
        ly_ctx.beginPath();
        ly_ctx.moveTo(ly_particles[i].x, ly_particles[i].y);
        ly_ctx.lineTo(ly_particles[j].x, ly_particles[j].y);
        ly_ctx.stroke();
      }
    }
  }
}

// 功能：更新并绘制每一帧（粒子移动、边界反弹、鼠标吸附）
function ly_animate() {
  ly_ctx.clearRect(0, 0, ly_canvas.width, ly_canvas.height);

  for (const p of ly_particles) {
    // 粒子移动
    p.x += p.vx;
    p.y += p.vy;

    // 碰到边界反向运动
    if (p.x < 0 || p.x > ly_canvas.width) p.vx = -p.vx;
    if (p.y < 0 || p.y > ly_canvas.height) p.vy = -p.vy;

    // 鼠标附近粒子轻微吸附
    if (ly_mouse.x !== null) {
      const dx = ly_mouse.x - p.x;
      const dy = ly_mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0.001) {
        p.x += dx * 0.012;
        p.y += dy * 0.012;
      }
    }

    // 绘制粒子圆点
    ly_ctx.beginPath();
    ly_ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ly_ctx.fillStyle = 'rgba(238, 192, 198, 0.85)';
    ly_ctx.fill();
  }

  ly_draw_links();
  requestAnimationFrame(ly_animate);
}

// 功能：记录鼠标当前位置
function ly_track_mouse(e) {
  ly_mouse.x = e.clientX;
  ly_mouse.y = e.clientY;
}

// 功能：鼠标移出画布时清除吸附点
function ly_clear_mouse() {
  ly_mouse.x = null;
  ly_mouse.y = null;
}

// 监听窗口尺寸变化与鼠标事件
window.addEventListener('resize', () => {
  ly_resize_canvas();
  ly_init_particles();
});
window.addEventListener('mousemove', ly_track_mouse);
window.addEventListener('mouseout', ly_clear_mouse);

// 启动动画
ly_resize_canvas();
ly_init_particles();
ly_animate();
