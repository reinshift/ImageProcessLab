// 图像处理实验室 - 主应用
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkAuthStatus();
    
    // 加载自定义logo
    loadCustomLogo();
    
    // 设置导航栏事件监听器
    setupNavbarEvents();
    
    // 设置模块选择器
    setupModuleSelector();
    
    // 当前活动模块
    let currentModule = null;
});

function checkAuthStatus() {
    const authToken = sessionStorage.getItem('imageLabAuth');
    if (authToken !== 'authenticated') {
        // 未登录，重定向到登录页面
        window.location.href = 'index.html';
        return;
    }
}

function loadCustomLogo() {
    const customLogo = localStorage.getItem('customLogo');
    const navbarLogo = document.getElementById('navbar-logo');
    
    if (customLogo && navbarLogo) {
        navbarLogo.src = customLogo;
        navbarLogo.style.filter = 'none';
    }
}

function setupNavbarEvents() {
    // 帮助按钮
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            showHelp();
        });
    }

    // 主题切换按钮
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 退出按钮
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function setupModuleSelector() {
    const moduleCards = document.querySelectorAll('.module-card');
    const moduleSelector = document.getElementById('module-selector');
    const workspace = document.getElementById('workspace');
    const workspaceTitle = document.getElementById('workspace-title');
    const workspaceContent = document.getElementById('workspace-content');
    const backBtn = document.getElementById('back-btn');
    
    // 模块卡片点击事件
    moduleCards.forEach(card => {
        card.addEventListener('click', () => {
            const moduleType = card.dataset.module;
            loadModule(moduleType);
        });
        
        // 添加悬停效果
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('active')) {
                card.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
    
    // 返回按钮事件
    backBtn.addEventListener('click', () => {
        showModuleSelector();
    });
    
    function loadModule(moduleType) {
        // 显示加载状态
        showLoading(true);
        
        // 更新活动状态
        moduleCards.forEach(card => card.classList.remove('active'));
        document.querySelector(`[data-module="${moduleType}"]`).classList.add('active');
        
        // 设置工作区标题
        const moduleTitles = {
            'transform': '图像变换实验',
            'encryption': '图像加密实验', 
            'watermark': '水印处理实验'
        };
        
        workspaceTitle.textContent = moduleTitles[moduleType] || '实验工作区';
        
        // 加载模块内容
        setTimeout(() => {
            loadModuleContent(moduleType);
            
            // 切换到工作区
            moduleSelector.classList.add('d-none');
            workspace.classList.remove('d-none');
            
            // 设置当前模块
            currentModule = moduleType;
            
            showLoading(false);
        }, 500);
    }
    
    function loadModuleContent(moduleType) {
        // 清空工作区内容
        workspaceContent.innerHTML = '';
        
        // 根据模块类型加载对应内容
        switch(moduleType) {
            case 'transform':
                if (window.ImageTransform) {
                    window.ImageTransform.init(workspaceContent);
                } else {
                    workspaceContent.innerHTML = '<p>图像变换模块加载中...</p>';
                }
                break;
                
            case 'encryption':
                if (window.ImageEncryption) {
                    window.ImageEncryption.init(workspaceContent);
                } else {
                    workspaceContent.innerHTML = '<p>图像加密模块加载中...</p>';
                }
                break;
                
            case 'watermark':
                if (window.ImageWatermark) {
                    window.ImageWatermark.init(workspaceContent);
                } else {
                    workspaceContent.innerHTML = '<p>水印处理模块加载中...</p>';
                }
                break;
                
            default:
                workspaceContent.innerHTML = '<p>未知模块类型</p>';
        }
    }
    
    function showModuleSelector() {
        // 清理当前模块
        if (currentModule && window[getModuleClassName(currentModule)]) {
            const moduleClass = window[getModuleClassName(currentModule)];
            if (moduleClass.cleanup) {
                moduleClass.cleanup();
            }
        }
        
        // 切换到模块选择器
        workspace.classList.add('d-none');
        moduleSelector.classList.remove('d-none');
        
        // 清除活动状态
        moduleCards.forEach(card => {
            card.classList.remove('active');
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        currentModule = null;
    }
    
    function getModuleClassName(moduleType) {
        const classNames = {
            'transform': 'ImageTransform',
            'encryption': 'ImageEncryption',
            'watermark': 'ImageWatermark'
        };
        return classNames[moduleType];
    }
}

function showHelp() {
    const helpContent = `
        <div style="max-width: 600px; margin: 0 auto; padding: 2rem;">
            <h2 style="margin-bottom: 1.5rem; color: var(--primary-color);">使用帮助</h2>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">🎨 图像变换</h3>
                <ul style="margin-left: 1.5rem; line-height: 1.8;">
                    <li>灰度转换：将彩色图像转换为灰度图像</li>
                    <li>HSV调节：调整图像的色相、饱和度、明度</li>
                    <li>RGB调色：通过滑块调整红、绿、蓝通道</li>
                    <li>对比度：调整图像的对比度</li>
                    <li>几何变换：旋转、平移、镜像操作</li>
                </ul>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid var(--primary-color);">
                    <strong style="color: var(--primary-color);">💡 操作技巧：</strong><br>
                    • 双击滑动条可快速恢复该参数的默认值<br>
                    • 双击左侧参数标签文字同样可以重置<br>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">🔐 图像加密</h3>
                <ul style="margin-left: 1.5rem; line-height: 1.8;">
                    <li>Arnold变换：基于Arnold映射的图像置乱</li>
                    <li>像素置乱：行列像素点的重新排列</li>
                    <li>逐步演示：观察加密过程的每个步骤</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">💧 水印处理</h3>
                <ul style="margin-left: 1.5rem; line-height: 1.8;">
                    <li>水印添加：在图像上添加文字或图片水印</li>
                    <li>透明度调节：控制水印的透明度</li>
                    <li>位置调整：自由调整水印的位置</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <button onclick="closeHelp()" style="padding: 0.75rem 2rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;">关闭</button>
            </div>
        </div>
    `;
    
    showModal('使用帮助', helpContent);
}

function showModal(title, content) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 16px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    `;
    
    modalContent.innerHTML = content;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // 全局关闭函数
    window.closeHelp = function() {
        document.body.removeChild(modal);
        delete window.closeHelp;
    };
}

function handleLogout() {
    // 显示确认对话框
    if (confirm('确定要退出实验室吗？')) {
        // 清除登录状态
        sessionStorage.removeItem('imageLabAuth');
        
        // 添加退出动画
        document.body.style.transition = 'opacity 0.3s ease-out';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    }
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (show) {
        loadingOverlay.classList.remove('d-none');
    } else {
        loadingOverlay.classList.add('d-none');
    }
}

// 添加一些增强功能
document.addEventListener('DOMContentLoaded', function() {
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl + H 打开帮助
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            showHelp();
        }
        
        // Ctrl + Q 退出
        if (e.ctrlKey && e.key === 'q') {
            e.preventDefault();
            handleLogout();
        }
        
        // Escape 返回模块选择
        if (e.key === 'Escape' && currentModule) {
            document.getElementById('back-btn').click();
        }
    });
    
    // 添加页面可见性检测
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // 页面重新可见时检查登录状态
            checkAuthStatus();
        }
    });
    
    // 添加会话超时检测（可选）
    let sessionTimeout;
    const SESSION_DURATION = 30 * 60 * 1000; // 30分钟
    
    function resetSessionTimeout() {
        clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(() => {
            alert('会话已超时，请重新登录');
            sessionStorage.removeItem('imageLabAuth');
            window.location.href = 'index.html';
        }, SESSION_DURATION);
    }
    
    // 监听用户活动
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetSessionTimeout, true);
    });
    
    // 初始化会话超时
    resetSessionTimeout();

    // 初始化主题
    initializeTheme();
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // 显示主题切换通知
    if (window.ImageLabUtils) {
        window.ImageLabUtils.showNotification(
            `已切换到${newTheme === 'dark' ? '深色' : '浅色'}主题`,
            'info',
            2000
        );
    }
}

function initializeTheme() {
    // 从localStorage获取保存的主题，默认为浅色主题
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme || 'light'; // 默认浅色主题

    document.documentElement.setAttribute('data-theme', theme);

    // 如果没有保存的主题，保存默认主题
    if (!savedTheme) {
        localStorage.setItem('theme', 'light');
    }

    // 监听系统主题变化（仅在用户未手动设置时）
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const theme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    });
}


