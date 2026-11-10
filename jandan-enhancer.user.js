// ==UserScript==
// @name         煎蛋网ZEN
// @namespace    http://tampermonkey.net/
// @version      1.1
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
    const isHomePage = path === '/' || path === '/index.php' || /^\/page\/\d+/.test(path);
    if (!isArticlePage) {
        document.documentElement.classList.add('jd-list-page');
    }
    if (isHomePage) {
        document.documentElement.classList.add('jd-home-page');
    }
    document.documentElement.classList.add(isArticlePage ? 'jd-article-page' : 'jd-section-page');

    // =========================================
    // 1. 定义跳转链接列表
    // =========================================
    const navLinks = [
        { name: '首页', url: 'https://jandan.net/' },
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

    if (isHomePage) {
        customHiddenRules = `
            main > div:first-child { display: none !important; }
            .row.text-center { display: none !important; }
            a[href="/qa"], a[href^="https://jandan.net/qa"] { display: none !important; }
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
            padding-bottom: 80px !important; /* 给底部悬浮翻页按钮留出充足的呼吸空间 */
            padding-right: 85px !important; /* 核心优化：强制右侧留白，防止平板屏幕下被玻璃导航栏遮挡！ */
            box-sizing: border-box !important;
        }
        .cp-pagenavi, .commentlist, #comments {
            margin-top: 0 !important;
        }

        /* --- 首页：居中内容列、统一条目节奏并保留舒适留白 --- */
        .jd-home-page body {
            overflow-x: hidden;
        }
        .jd-home-page main {
            width: min(100%, 1040px) !important;
            max-width: 1040px !important;
            flex: 0 1 1040px !important;
            margin: 0 auto !important;
            padding: 24px 32px 104px !important;
            box-sizing: border-box;
        }
        .jd-home-page main > .container,
        .jd-home-page main > .container-fluid,
        .jd-home-page #content {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        .jd-home-page .post-item {
            width: 100% !important;
            margin: 0 !important;
            padding: 16px 0 !important;
            min-height: 0 !important;
            align-items: flex-start !important;
            gap: 24px;
        }
        .jd-home-page .post-item + .post-item {
            border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        .jd-home-page .post-item img {
            max-width: 100%;
            height: auto;
        }
        .jd-home-page .post-item > .col-12 {
            display: grid;
            grid-template-columns: 3ch minmax(0, 1fr);
            gap: 8px 20px;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
            align-content: start;
            min-width: 0;
        }
        .jd-home-page .post-item > .col-12:has(.post-thumb) {
            grid-template-columns: 3ch minmax(0, 1fr) 180px;
        }
        .jd-home-page .post-item .post-title,
        .jd-home-page .post-item .post-excerpt,
        .jd-home-page .post-item .post-tucao,
        .jd-home-page .post-item .post-comment-count {
            grid-column: 2;
            width: auto !important;
            max-width: 100%;
            margin: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            overflow-wrap: anywhere;
        }
        .jd-home-page .post-item .post-thumb {
            display: block !important;
            position: static !important;
            grid-column: 3;
            grid-row: 1 / span 3;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            align-self: start;
        }
        .jd-home-page .post-item .post-thumb img {
            display: block;
            width: 100% !important;
            height: auto !important;
            max-height: 130px;
            object-fit: contain;
            border-radius: 8px;
        }
        .jd-home-page .post-item .post-tucao {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
            line-height: 1.7 !important;
            margin: 0 !important;
        }
        .jd-home-page .post-item .post-comment-count {
            display: block !important;
            position: static !important;
            grid-column: 1;
            grid-row: 1;
            align-self: start;
            justify-self: end;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            width: auto !important;
            transform: none !important;
            font-size: 22px !important;
            line-height: 1.45 !important;
            text-align: right;
            white-space: nowrap;
        }
        .jd-home-page .post-item h2,
        .jd-home-page .post-item h3,
        .jd-home-page .post-item .title {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            line-height: 1.45 !important;
        }
        .jd-home-page .post-item p {
            margin: 0 0 12px !important;
            line-height: 1.75 !important;
        }

        @media (max-width: 720px) {
            .jd-home-page main {
                padding: 14px 16px 96px !important;
            }
            .jd-home-page .post-item {
                padding: 14px 0 !important;
                gap: 14px;
            }
            .jd-home-page .post-item > .col-12:has(.post-thumb) {
                grid-template-columns: 3ch minmax(0, 1fr);
            }
            .jd-home-page .post-item .post-thumb {
                grid-column: 2;
                grid-row: auto;
                max-width: 180px;
            }
            #jd-quick-nav {
                right: 6px;
                bottom: 92px;
                max-height: calc(100vh - 112px);
                overflow-y: auto;
            }
            #jd-page-nav {
                bottom: 18px;
                width: calc(100% - 32px);
                justify-content: center;
                gap: 8px;
            }
            .jd-page-btn {
                min-width: 0;
                padding: 9px 16px;
            }
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

        /* --- 悬浮翻页面板 (底部居中 - 已恢复) --- */
        .jd-home-page .page-navi-btn { display: none !important; }
        .jd-side-page {
            position: fixed; top: 50%; transform: translateY(-50%);
            z-index: 8999; padding: 12px 18px;
            color: #a0a7af !important; font: 64px/1 sans-serif;
            text-decoration: none !important;
        }
        .jd-side-page:hover { color: #e65100 !important; }
        #jd-side-prev { left: 8px; }
        #jd-side-next { right: 8px; }
        @media (max-width: 1200px) {
            .jd-side-page { display: none; }
        }
        #jd-page-nav {
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 12px; z-index: 9000;
        }
        .jd-page-btn {
            background: rgba(255, 255, 255, 0.97) !important;
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
            background: #fff !important;
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
            background: rgba(255, 255, 255, 0.97); border-radius: 20px;
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

        /* 其他页面沿用首页的内容列和阅读节奏；不裁切完整评论。 */
        html:not(.jd-home-page) main {
            width: 100% !important;
            max-width: 960px !important;
            flex: 0 1 960px !important;
            margin: 0 auto !important;
            padding: 24px 32px 104px !important;
            box-sizing: border-box !important;
            min-width: 0;
        }
        .jd-article-page main {
            max-width: 860px !important;
            flex-basis: 860px !important;
        }
        html:not(.jd-home-page) main > .container,
        html:not(.jd-home-page) main > .container-fluid,
        html:not(.jd-home-page) main #content {
            width: 100% !important; max-width: 100% !important;
            margin: 0 !important; padding: 0 !important;
            box-sizing: border-box;
        }
        html:not(.jd-home-page) main .post-h1 {
            padding: 0 !important; margin: 0 0 16px !important;
            font-size: clamp(24px, 3vw, 32px);
            line-height: 1.45; font-weight: 750; overflow-wrap: anywhere;
        }
        html:not(.jd-home-page) main .post-meta {
            margin: 0 0 20px !important; color: #858b93;
            font-size: 13px; line-height: 1.6;
        }
        html:not(.jd-home-page) main .post-content {
            font-size: 16px; line-height: 1.85; overflow-wrap: anywhere;
        }
        html:not(.jd-home-page) main .post-content p { margin: 0 0 18px; }
        html:not(.jd-home-page) main .post-content :is(img, video),
        html:not(.jd-home-page) #jandan-app video {
            max-width: 100% !important; height: auto; border-radius: 8px;
        }
        html:not(.jd-home-page) main .post-content blockquote {
            margin: 20px 0; padding: 14px 18px; background: #f7f8fa;
            border-radius: 8px; color: #626973;
        }
        html:not(.jd-home-page) #jandan-app {
            width: 100%; min-width: 0; margin-top: 24px;
            font-size: 15px; line-height: 1.75; overflow-wrap: anywhere;
        }
        html:not(.jd-home-page) .jdcomment-row {
            margin: 0 !important; padding: 18px 0 !important;
        }
        html:not(.jd-home-page) .jdcomment-row + .jdcomment-row {
            border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        html:not(.jd-home-page) .jdcomment-content {
            padding: 8px 0 !important; line-height: 1.75 !important;
            overflow-wrap: anywhere;
        }
        html:not(.jd-home-page) .jdcomment-content :is(img, video) {
            max-width: 100% !important; height: auto; border-radius: 8px;
        }
        html:not(.jd-home-page) .jdcomment-author,
        html:not(.jd-home-page) .jdcomment-function {
            color: #858b93; font-size: 12px; line-height: 1.6;
        }
        html:not(.jd-home-page) .comment-form button {
            width: auto !important; max-width: 100%;
            margin: 10px 0 !important; padding: 8px 20px;
            border-radius: 16px; background: #f7f8fa; color: #333;
        }
        html:not(.jd-home-page) :is(.commentlist, .comment-list) {
            padding-left: 0; margin-bottom: 24px; list-style: none;
        }
        html:not(.jd-home-page) :is(.commentlist, .comment-list) > li {
            padding: 18px 0 !important; margin: 0 !important;
        }
        html:not(.jd-home-page) :is(.commentlist, .comment-list) > li + li {
            border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        html:not(.jd-home-page) main :is(textarea, .form-control, .form-select) {
            max-width: 100%; box-sizing: border-box; border-radius: 8px;
            border: 1px solid #e2e5e9 !important;
            background: #fff; color: #333; padding: 10px 12px;
        }
        html:not(.jd-home-page) main :is(textarea, .form-control, .form-select):focus {
            border-color: #b7bec7 !important;
            outline: 2px solid rgba(183, 190, 199, 0.25) !important;
            outline-offset: 2px;
        }
        html:not(.jd-home-page) main :is(.page-nav, .cp-pagenavi) {
            display: flex; flex-wrap: wrap; align-items: center;
            justify-content: center; gap: 8px; padding: 16px 0;
        }
        html:not(.jd-home-page) main :is(.page-nav, .cp-pagenavi) a {
            border-radius: 16px; background: #f7f8fa;
            padding: 6px 12px; text-decoration: none; color: #333;
        }
        #jd-quick-nav { background: rgba(255, 255, 255, 0.97); }
        @media (min-width: 721px) and (max-width: 1180px) {
            html:not(.jd-home-page) main {
                padding-right: 100px !important;
            }
        }
        @media (max-width: 720px) {
            html:not(.jd-home-page) main { padding: 16px 16px 104px !important; }
            #jd-quick-nav {
                top: 8px; bottom: auto; right: 8px; left: 8px;
                flex-direction: row; justify-content: flex-start;
                overflow-x: auto; overflow-y: hidden; max-height: none;
                padding: 6px; gap: 2px; border-radius: 14px;
            }
            #jd-quick-nav .jd-glass-btn { width: auto; flex: 0 0 auto; padding: 7px 10px; }
            #jd-quick-nav .jd-glass-divider { display: none; }
            html body main { margin-top: 56px !important; }
            #jd-settings-modal { width: min(320px, calc(100vw - 32px)); box-sizing: border-box; }
        }
    `;
    document.head.appendChild(style);

    // =========================================
    // 3. 清理页面结构 & 释放布局宽度
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
        asideEl.remove();
        // 让内容充满，但被 CSS 里的 padding-right: 85px 限制右边界，防遮挡
        mainEl.style.width = '100%';
        mainEl.style.maxWidth = '100%';
        mainEl.style.flex = 'none';
    }

    if(mainEl) {
        mainEl.style.marginTop = '0px';
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
    // 7. 全局底部分页 UI (恢复为稳定渲染防鬼畜版)
    // =========================================
    // 将文章详情页(isArticlePage)也加入排除翻页显示的名单
    const isExcluded = isArticlePage || ['/new/member', '/top', '/new/forum', '/tucao'].some(p => path.startsWith(p));

    function updatePaginationUI() {
        if (isExcluded) return;

        let prevUrl = null;
        let nextUrl = null;
        let displayPage = null;

        if (path === '/' || path === '/index.php' || /^\/page\/\d+/.test(path)) {
            let currentPage = 1;
            const match = path.match(/^\/page\/(\d+)/);
            if (match) currentPage = parseInt(match[1]);

            if (currentPage > 1) prevUrl = currentPage === 2 ? '/' : '/page/' + (currentPage - 1);
            nextUrl = '/page/' + (currentPage + 1);
            displayPage = currentPage;
        }
        else {
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

        window.jdPrevUrl = prevUrl;
        window.jdNextUrl = nextUrl;

        // 首页侧边箭头与底部分页共用链接，补齐原站第二页缺失的上一页。
        if (isHomePage) {
            [['prev', prevUrl, '‹', '上一页'], ['next', nextUrl, '›', '下一页']].forEach(([direction, url, label, title]) => {
                const id = 'jd-side-' + direction;
                let arrow = document.getElementById(id);
                if (!url) {
                    if (arrow) arrow.remove();
                    return;
                }
                if (!arrow) {
                    arrow = document.createElement('a');
                    arrow.id = id;
                    arrow.className = 'jd-side-page';
                    arrow.textContent = label;
                    arrow.setAttribute('aria-label', title);
                    arrow.title = title;
                    document.body.appendChild(arrow);
                }
                if (arrow.getAttribute('href') !== url) arrow.setAttribute('href', url);
            });
        }

        // 核心修复：只创建一次 DOM，后续仅修改属性
        let pageNav = document.getElementById('jd-page-nav');
        if (!pageNav) {
            pageNav = document.createElement('div');
            pageNav.id = 'jd-page-nav';
            pageNav.innerHTML = `
                <a class="jd-page-btn jd-page-prev disabled">PREV</a>
                <span class="jd-page-number"></span>
                <a class="jd-page-btn jd-page-next disabled">NEXT</a>
            `;
            document.body.appendChild(pageNav);
        }

        const prevBtn = pageNav.querySelector('.jd-page-prev');
        const nextBtn = pageNav.querySelector('.jd-page-next');
        const numSpan = pageNav.querySelector('.jd-page-number');

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
