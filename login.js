// 图像处理实验室 - 登录功能
document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('password-toggle');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const logoContainer = document.getElementById('logo-container');

    // 配置
    const CORRECT_PASSWORD = 'xdugaodai'; // 可以修改为您想要的密码
    const AUTH_TOKEN = 'imageLabAuth';

    // 检查是否已经登录
    checkExistingAuth();

    // 事件监听器
    loginForm.addEventListener('submit', handleLogin);
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    passwordInput.addEventListener('input', clearError);
    passwordInput.addEventListener('keypress', handleKeyPress);

    // 加载自定义logo
    loadCustomLogo();

    // 添加logo上传功能
    setupLogoUpload();

    function checkExistingAuth() {
        const authToken = sessionStorage.getItem(AUTH_TOKEN);
        if (authToken === 'authenticated') {
            // 已登录，直接跳转到主应用
            window.location.href = 'app.html';
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        
        const password = passwordInput.value.trim();
        
        if (!password) {
            showError('请输入密码');
            return;
        }

        // 显示加载状态
        setLoadingState(true);

        // 模拟网络延迟
        setTimeout(() => {
            if (password === CORRECT_PASSWORD) {
                // 登录成功
                sessionStorage.setItem(AUTH_TOKEN, 'authenticated');
                
                // 添加成功动画
                loginBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                loginBtn.innerHTML = '<span>✓ 登录成功</span>';
                
                setTimeout(() => {
                    window.location.href = 'app.html';
                }, 1000);
            } else {
                // 登录失败
                setLoadingState(false);
                showError('密码错误，请重试');
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 1500);
    }

    function togglePasswordVisibility() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        passwordToggle.textContent = isPassword ? '🙈' : '👁️';
    }

    function clearError() {
        if (!errorMessage.classList.contains('d-none')) {
            errorMessage.classList.add('d-none');
        }
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            handleLogin(event);
        }
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('d-none');
        
        // 添加震动效果
        errorMessage.style.animation = 'none';
        setTimeout(() => {
            errorMessage.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }

    function setLoadingState(loading) {
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoading = loginBtn.querySelector('.btn-loading');
        
        if (loading) {
            loginBtn.classList.add('loading');
            btnText.style.opacity = '0';
            btnLoading.classList.remove('d-none');
            loginBtn.disabled = true;
        } else {
            loginBtn.classList.remove('loading');
            btnText.style.opacity = '1';
            btnLoading.classList.add('d-none');
            loginBtn.disabled = false;
        }
    }

    function loadCustomLogo() {
        const customLogo = localStorage.getItem('customLogo');
        const appLogo = document.getElementById('app-logo');
        
        if (customLogo && appLogo) {
            appLogo.src = customLogo;
        }
    }

    function setupLogoUpload() {
        // 双击logo可以上传自定义logo
        const appLogo = document.getElementById('app-logo');
        let clickCount = 0;
        
        appLogo.addEventListener('click', function() {
            clickCount++;
            setTimeout(() => {
                if (clickCount === 2) {
                    uploadCustomLogo();
                }
                clickCount = 0;
            }, 300);
        });
    }

    function uploadCustomLogo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const appLogo = document.getElementById('app-logo');
                    appLogo.src = e.target.result;
                    localStorage.setItem('customLogo', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    // 添加键盘快捷键
    document.addEventListener('keydown', function(event) {
        // Ctrl + L 聚焦到密码输入框
        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            passwordInput.focus();
        }
        
        // Escape 清除错误消息
        if (event.key === 'Escape') {
            clearError();
        }
    });

    // 添加页面可见性检测
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // 页面重新可见时检查登录状态
            checkExistingAuth();
        }
    });

    // 添加一些增强效果
    function addEnhancedEffects() {
        // 鼠标移动视差效果
        document.addEventListener('mousemove', function(e) {
            const circles = document.querySelectorAll('.decoration-circle');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            circles.forEach((circle, index) => {
                const speed = (index + 1) * 0.5;
                const x = (mouseX - 0.5) * speed * 20;
                const y = (mouseY - 0.5) * speed * 20;
                circle.style.transform = `translate(${x}px, ${y}px)`;
            });
        });

        // 功能项点击效果
        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach(item => {
            item.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-2px)';
                }, 150);
            });
        });
    }

    // 初始化增强效果
    addEnhancedEffects();

    // 添加加载完成动画
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 导出一些有用的函数供其他脚本使用
window.ImageLabLogin = {
    checkAuth: function() {
        return sessionStorage.getItem('imageLabAuth') === 'authenticated';
    },
    
    logout: function() {
        sessionStorage.removeItem('imageLabAuth');
        window.location.href = 'index.html';
    }
};
