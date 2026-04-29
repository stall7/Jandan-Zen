// ==UserScript==
// @name         煎蛋网ZEN
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  去广告、简化网站元素
// @author       jasond
// @match        https://jandan.net/*
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // =========================================
    // 0. 智能路由检测
    // =========================================
    const path = location.pathname;
    const isArticlePage = /^\/p\/\d+/.test(path) || /^\/t\/\d+/.test(path);
    if (!isArticlePage) {
        document.documentElement.classList.add('jd-list-page');
    }

    // =========================================
    // 1. 定义跳转链接列表
    // =========================================
    const navLinks = [
        { name: '首页', url: 'https://jandan.net/' },
        { name: '问答', url: 'https://jandan.net/qa' },
        { name: '树洞', url: 'https://jandan.net/treehole' },
        { name: '女装', url: 'https://jandan.net/beauty' },
        { name: '随手', url: 'https://jandan.net/ooxx' },
        { name: '无聊', url: 'https://jandan.net/pic' },
        { name: '鱼塘', url: 'https://jandan.net/new/forum' },
        { name: '热榜', url: 'https://jandan.net/top#tab=4hr' },
        { name: '吐槽', url: 'https://jandan.net/tucao' },
        { name: '用户', url: 'https://jandan.net/new/member' }
    ];

    // =========================================
    // 2. 注入全局 CSS 样式
    // =========================================
    let customHiddenRules = '';

    if (path === '/' || path === '/index.php' || /^\/page\/\d+/.test(path)) {
        customHiddenRules = `
            main > div:first-child { display: none !important; }
            .row.text-center { display: none !important; }
        `;
    } else if (['/qa', '/treehole', '/beauty', '/ooxx', '/pic'].some(p => path.startsWith(p))) {
        customHiddenRules = '.post { display: none !important; }';
    } else if (['/top', '/tucao'].some(p => path.startsWith(p))) {
        customHiddenRules = '.post-content { display: none !important; }';
    }

    const style = document.createElement('style');
    style.textContent = `
        /* =========================================
           终极隐藏：原生 Header、导航、广告、面包屑、大标题、投稿按钮全部干掉
           ========================================= */
        #header, .nav-tabs, #nav_top, #nav,
        .bg-dark.text-white.text-center.py-4, .ad-title,
        .breadcrumb,  .page-title,
        .quick-form a.btn-secondary, a[href*="showQuickForm"],
        .post-content a[href*="/go/redirect/"],
        .post-content a[href*="jandan.net/go/"] {
            display: none !important;
        }

        /* --- 依据用户需求：按 URL 路径精准打击特定容器 --- */
        ${customHiddenRules}

        /* =========================================
           排版优化：解决顶部贴边与多余间隙问题
           ========================================= */
        main {
            margin-top: 0 !important;
            padding-top: 28px !important;
            padding-bottom: 80px !important;
        }
        .cp-pagenavi, .commentlist, #comments {
            margin-top: 0 !important;
        }

        /* =========================================
           基因级去线规则
           ========================================= */
        hr { display: none !important; }

        main, #content, #comments, .container, .row, [class*="col-"],
        .bg-white, .post-item, .cp-pagenavi, .page-nav {
            border: none !important; box-shadow: none !important; outline: none !important;
        }

        .top-nav {
            border: none !important; box-shadow: none !important; margin-top: 0 !important;
        }

        .border, .border-top, .border-bottom, .border-start, .border-end,
        .shadow, .shadow-sm, .rounded, .rounded-3,
        .nav, .nav-item, .nav-link {
            border: none !important; box-shadow: none !important;
        }
        main > div, main > form, #content > div, #content > form, #comments > div,
        h2, h3, h4, .title {
            border: none !important; box-shadow: none !important;
        }

        .title::after, .title::before,
        .top-nav::after, .top-nav::before,
        .post-neighbor-nav::after, .post-neighbor-nav::before { display: none !important; }

        main :not(input):not(textarea):not(button):not(select)[style*="border"],
        #content :not(input):not(textarea):not(button):not(select)[style*="border"] {
            border: none !important;
        }
        .post, .entry-header, .entry-content, .entry-footer,
        .post-navigation, .nav-single, .nav-previous, .nav-next, .post-neighbor-nav,
        .comments-title, #reply-title, .comment-respond, .post-info, .post-meta {
            border: none !important; box-shadow: none !important; outline: none !important;
        }
        main ul, main ol, main li, #content ul, #content ol, #content li,
        #comments ul, #comments ol, #comments li,
        [class*="comment"], [id^="comment-"], [class*="tucao"] {
            border: none !important; border-top: none !important; border-bottom: none !important;
            box-shadow: none !important; outline: none !important;
        }

        /* --- 悬浮翻页面板 (底部居中) --- */
        #jd-page-nav {
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 12px; z-index: 9000;
        }
        .jd-page-btn {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1)) !important;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.8) !important;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.8) !important;
            padding: 10px 24px; color: #333 !important; font-size: 14px; font-weight: 800;
            cursor: pointer; transition: all 0.2s ease; user-select: none;
            text-decoration: none !important; display: flex; align-items: center; justify-content: center;
        }
        .jd-page-btn:hover:not(.disabled) {
            background: rgba(255, 255, 255, 0.6) !important;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.9) !important;
            color: #e65100 !important;
        }
        .jd-page-btn.disabled {
            opacity: 0.35; cursor: not-allowed; pointer-events: none;
        }
        .jd-page-number {
            display: none; /* 默认隐藏，有数据时加上 .show 类显示 */
            align-items: center; justify-content: center;
            padding: 0 18px; color: #111; font-size: 15px; font-weight: 900;
            background: rgba(255, 255, 255, 0.3); border-radius: 20px;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4) !important;
            box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
            user-select: none;
        }
        .jd-page-number.show {
            display: flex;
        }

        /* --- 右下角液态玻璃导航栏 --- */
        #jd-quick-nav {
            position: fixed; right: 8px; bottom: 40px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.02));
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.5) !important;
            border-left: 1px solid rgba(255, 255, 255, 0.5) !important;
            border-radius: 18px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.4) !important;
            z-index: 9000; display: flex; flex-direction: column; align-items: center;
            padding: 10px 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; gap: 4px;
        }
        .jd-glass-btn {
            text-decoration: none !important; color: #333 !important; font-size: 13px; font-weight: 600;
            padding: 6px 14px; border-radius: 10px; background: rgba(255, 255, 255, 0.1);
            border: 1px solid transparent !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
            transition: all 0.2s ease; white-space: nowrap; display: block; text-align: center;
            width: 100%; box-sizing: border-box; cursor: pointer;
        }
        .jd-glass-btn:hover {
            background: rgba(255, 255, 255, 0.3) !important; border: 1px solid rgba(255, 255, 255, 0.6) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.8) !important;
            transform: scale(1.05);
            color: #e65100 !important;
        }
        .jd-glass-btn.active {
            background: rgba(255, 255, 255, 0.4) !important; border: 1px solid rgba(255, 255, 255, 0.6) !important;
            box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0,0,0,0.05) !important;
            font-weight: 800; color: #e65100 !important; text-shadow: 0 0 6px rgba(230, 81, 0, 0.25);
        }
        .jd-glass-divider {
            width: 80%; height: 1px; background: rgba(255, 255, 255, 0.2);
            margin: 2px 0; box-shadow: 0 1px 0 rgba(0,0,0,0.02) !important; border: none !important;
        }

        /* --- 居中弹出的液态玻璃设置面板 --- */
        #jd-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
            z-index: 9998; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        #jd-settings-modal {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -45%) scale(0.95);
            width: 320px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.5));
            backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
            border: 1px solid rgba(255, 255, 255, 0.6) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.9) !important;
            border-left: 1px solid rgba(255, 255, 255, 0.9) !important;
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9) !important;
            padding: 24px; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            z-index: 9999; opacity: 0; pointer-events: none;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        #jd-modal-overlay.show, #jd-settings-modal.show {
            opacity: 1; pointer-events: auto;
        }
        #jd-settings-modal.show {
            transform: translate(-50%, -50%) scale(1);
        }
        .jd-modal-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
        }
        .jd-modal-title { font-size: 18px; font-weight: 800; color: #111; }
        .jd-modal-close {
            cursor: pointer; font-size: 20px; color: #888; transition: color 0.2s;
            line-height: 1; width: 24px; height: 24px; text-align: center;
        }
        .jd-modal-close:hover { color: #e65100; }
        .jd-setting-group { margin-bottom: 20px; }
        .jd-setting-label {
            font-size: 14px; font-weight: 700; color: #333; padding-bottom: 8px; margin-bottom: 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        .jd-radio-item {
            display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500;
            color: #555; cursor: pointer; margin-bottom: 10px; transition: color 0.2s;
        }
        .jd-radio-item:hover { color: #e65100; }
        .jd-radio-item input[type="radio"] { accent-color: #e65100; cursor: pointer; margin: 0; }
        .jd-empty-state { text-align: center; color: #888; font-size: 14px; font-weight: 600; padding: 20px 0; }
    `;
    document.head.appendChild(style);

    // =========================================
    // 3. 清理页面结构 & 移除广告
    // =========================================
    document.querySelectorAll('.ad-title').forEach(el => {
        const postItem = el.closest('.post-item.row');
        if (postItem) postItem.remove();
    });
    const memberOverlay = document.evaluate('/html/body/div[1]/div/div[2]/i', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (memberOverlay) memberOverlay.remove();
    const mainEl = document.querySelector('main');
    const asideEl = document.querySelector('aside');
    if (mainEl && asideEl) {
        const mainRect = mainEl.getBoundingClientRect();
        const asideRect = asideEl.getBoundingClientRect();
        const totalWidth = asideRect.right - mainRect.left;
        asideEl.remove();
        mainEl.style.width = totalWidth + 'px';
        mainEl.style.maxWidth = totalWidth + 'px';
        mainEl.style.flex = 'none';
    }

    if(mainEl) {
        mainEl.style.marginTop = '0px';
        mainEl.style.paddingTop = '0px';
    }

    // =========================================
    // 4. 构建右下角导航栏
    // =========================================
    const navContainer = document.createElement('div');
    navContainer.id = 'jd-quick-nav';
    document.body.appendChild(navContainer);

    navLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.name;
        a.className = 'jd-glass-btn';
        if (new URL(link.url, location.origin).pathname === path) a.classList.add('active');
        navContainer.appendChild(a);
    });

    const divider = document.createElement('div');
    divider.className = 'jd-glass-divider';
    navContainer.appendChild(divider);

    const topBtn = document.createElement('a');
    topBtn.textContent = '顶部';
    topBtn.className = 'jd-glass-btn';
    topBtn.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    navContainer.appendChild(topBtn);

    // =========================================
    // 5. 构建居中设置弹窗 Modal
    // =========================================
    const overlay = document.createElement('div');
    overlay.id = 'jd-modal-overlay';
    document.body.appendChild(overlay);

    const modal = document.createElement('div');
    modal.id = 'jd-settings-modal';
    modal.innerHTML = `
        <div class="jd-modal-header">
            <div class="jd-modal-title">⚙ 页面设置</div>
            <div class="jd-modal-close" id="jd-modal-close">✕</div>
        </div>
        <div id="jd-settings-content">
            <div class="jd-empty-state">正在提取设置项...</div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = document.getElementById('jd-modal-close');
    const contentArea = document.getElementById('jd-settings-content');

    const closeModal = () => {
        overlay.classList.remove('show');
        modal.classList.remove('show');
    };
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    GM_registerMenuCommand('⚙ 设置 (图床/动图)', () => {
        overlay.classList.add('show');
        modal.classList.add('show');
    });

    // =========================================
    // 6. 高级探针：侦测设置项
    // =========================================
    let origImgRadios = [];
    let origGifRadios = [];
    let settingsFound = false;

    function getRadioText(radio) {
        let text = '';
        let curr = radio.nextSibling;
        while(curr) {
            if (curr.nodeType === 3) text += curr.textContent;
            else if (curr.tagName === 'INPUT') break;
            curr = curr.nextSibling;
        }
        text = text.trim().replace(/^[：:]+/, '').trim();
        if (!text) {
            if (radio.value === '0') text = '通道1 (全球适用)';
            if (radio.value === '1') text = '通道2 (国内优化)';
            if (radio.value === 'true') text = '开启';
            if (radio.value === 'false') text = '关闭';
        }
        return text;
    }

    function extractSettings() {
        if (settingsFound) return;
        const quickForm = document.querySelector('.quick-form');
        if (!quickForm) return;

        const allRadios = quickForm.querySelectorAll('input[type="radio"]');
        if (allRadios.length === 0) return;

        quickForm.querySelectorAll('label').forEach(label => {
            const text = label.textContent || '';
            if (text.includes('图床线路') || text.includes('动图自动加载')) {
                label.style.display = 'none';
            }
        });

        allRadios.forEach(r => {
            const parentP = r.closest('p, div');
            if (parentP && parentP.classList.contains('quick-form') === false) {
                parentP.style.display = 'none';
            }

            if (['0', '1', '2'].includes(r.value)) {
                if (!origImgRadios.includes(r)) origImgRadios.push(r);
            } else if (['true', 'false'].includes(r.value)) {
                if (!origGifRadios.includes(r)) origGifRadios.push(r);
            }
        });

        if (origImgRadios.length > 0 || origGifRadios.length > 0) {
            settingsFound = true;
            renderSettingsUI();
        }
    }

    function renderSettingsUI() {
        let html = '';
        if (origImgRadios.length > 0) {
            html += `<div class="jd-setting-group"><div class="jd-setting-label">🖼️ 图床线路选择</div>`;
            origImgRadios.forEach((r) => {
                const isChecked = r.checked ? 'checked' : '';
                html += `<label class="jd-radio-item"><input type="radio" name="jd_img_route" value="${r.value}" ${isChecked}> ${getRadioText(r)}</label>`;
            });
            html += `</div>`;
        }
        if (origGifRadios.length > 0) {
            html += `<div class="jd-setting-group"><div class="jd-setting-label">▶️ 动图自动加载</div>`;
            origGifRadios.forEach((r) => {
                const isChecked = r.checked ? 'checked' : '';
                html += `<label class="jd-radio-item"><input type="radio" name="jd_gif_load" value="${r.value}" ${isChecked}> ${getRadioText(r)}</label>`;
            });
            html += `</div>`;
        }

        contentArea.innerHTML = html;

        contentArea.querySelectorAll('input[name="jd_img_route"]').forEach(myRadio => {
            myRadio.addEventListener('change', (e) => {
                const targetOrig = origImgRadios.find(orig => orig.value === e.target.value);
                if (targetOrig) targetOrig.click();
            });
        });
        contentArea.querySelectorAll('input[name="jd_gif_load"]').forEach(myRadio => {
            myRadio.addEventListener('change', (e) => {
                const targetOrig = origGifRadios.find(orig => orig.value === e.target.value);
                if (targetOrig) targetOrig.click();
            });
        });
    }

    // =========================================
    // 7. 全局强制渲染翻页 UI 及平滑 DOM 更新
    // =========================================
    const isExcluded = ['/new/member', '/top', '/new/forum', '/tucao'].some(p => path.startsWith(p));

    function updatePaginationUI() {
        if (isExcluded) return;

        let prevUrl = null;
        let nextUrl = null;
        let displayPage = null;

        // 【规则1：首页逻辑】
        if (path === '/' || path === '/index.php' || /^\/page\/\d+/.test(path)) {
            let currentPage = 1;
            const match = path.match(/^\/page\/(\d+)/);
            if (match) currentPage = parseInt(match[1]);

            if (currentPage > 1) prevUrl = '/page/' + (currentPage - 1);
            nextUrl = '/page/' + (currentPage + 1);
            displayPage = currentPage;
        }
        // 【规则2：其他各大版块 (采用 Hash #page=x 逻辑)】
        else if (!isArticlePage) {
            let activePageEl = document.querySelector('.page-nav .active, .cp-pagenavi .current');
            if (activePageEl) {
                let num = parseInt(activePageEl.textContent.trim());
                if (!isNaN(num)) {
                    displayPage = num;

                    if (location.hash !== '#page=' + num) {
                        history.replaceState(null, null, location.pathname + '#page=' + num);
                    }

                    let hasPrev = false;
                    let hasNext = false;
                    document.querySelectorAll('.page-nav li, .page-nav a, .page-nav button, .cp-pagenavi a, .cp-pagenavi span').forEach(el => {
                        let txt = el.textContent.toUpperCase();
                        if (txt.includes('PREV') || txt.includes('上一页')) hasPrev = true;
                        if (txt.includes('NEXT') || txt.includes('下一页')) hasNext = true;
                    });

                    if (hasPrev) prevUrl = location.pathname + '#page=' + (num + 1);
                    if (hasNext) nextUrl = location.pathname + '#page=' + (num - 1);
                }
            }
        }
        // 【规则3：文章详情页】
        else {
            document.querySelectorAll('.post-navigation a, .nav-single a, .post-neighbor-nav a, a[rel="prev"], a[rel="next"]').forEach(a => {
                let txt = a.textContent.toUpperCase();
                if (a.rel === 'next' || txt.includes('上一篇') || txt.includes('PREV')) prevUrl = a.href;
                if (a.rel === 'prev' || txt.includes('下一篇') || txt.includes('NEXT')) nextUrl = a.href;
            });
        }

        window.jdPrevUrl = prevUrl;
        window.jdNextUrl = nextUrl;

        // 核心修复：只创建一次 DOM，后续仅修改属性，彻底解决重渲染导致的悬停鬼畜问题
        let pageNav = document.getElementById('jd-page-nav');
        if (!pageNav) {
            pageNav = document.createElement('div');
            pageNav.id = 'jd-page-nav';
            pageNav.innerHTML = `
                <a class="jd-page-btn jd-page-prev disabled">← PREV</a>
                <span class="jd-page-number"></span>
                <a class="jd-page-btn jd-page-next disabled">NEXT →</a>
            `;
            document.body.appendChild(pageNav);
        }

        const prevBtn = pageNav.querySelector('.jd-page-prev');
        const nextBtn = pageNav.querySelector('.jd-page-next');
        const numSpan = pageNav.querySelector('.jd-page-number');

        // 平滑更新状态
        if (prevUrl) {
            if (prevBtn.getAttribute('href') !== prevUrl) prevBtn.setAttribute('href', prevUrl);
            prevBtn.classList.remove('disabled');
        } else {
            prevBtn.removeAttribute('href');
            prevBtn.classList.add('disabled');
        }

        if (nextUrl) {
            if (nextBtn.getAttribute('href') !== nextUrl) nextBtn.setAttribute('href', nextUrl);
            nextBtn.classList.remove('disabled');
        } else {
            nextBtn.removeAttribute('href');
            nextBtn.classList.add('disabled');
        }

        if (displayPage !== null) {
            if (numSpan.textContent !== String(displayPage)) numSpan.textContent = displayPage;
            if (!numSpan.classList.contains('show')) numSpan.classList.add('show');
        } else {
            if (numSpan.classList.contains('show')) numSpan.classList.remove('show');
        }
    }

    // 键盘监听防跳页处理：仅接管首页
    let isNavigating = false;
    document.addEventListener('keydown', function(e) {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        const isHomeRoute = path === '/' || path === '/index.php' || /^\/page\/\d+/.test(path);
        if (!isHomeRoute) return;

        if (e.key === 'ArrowLeft' && window.jdPrevUrl && !isNavigating) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            isNavigating = true;
            window.location.href = window.jdPrevUrl;
        } else if (e.key === 'ArrowRight' && window.jdNextUrl && !isNavigating) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            isNavigating = true;
            window.location.href = window.jdNextUrl;
        }
    }, true);

    // 核心轮询扫描器
    setInterval(() => {
        extractSettings();
        updatePaginationUI();
    }, 300);

})();
