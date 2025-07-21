// 图像处理实验室 - 工具函数
window.ImageLabUtils = {
    
    // 显示通知消息
    showNotification: function(message, type = 'info', duration = 3000) {
        // 创建通知容器（如果不存在）
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        // 添加图标
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <span style="font-size: 1.2rem;">${icon}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: auto;
                opacity: 0.7;
            ">×</button>
        `;
        
        container.appendChild(notification);
        
        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }, duration);
        }
    },
    
    getNotificationColor: function(type) {
        const colors = {
            'info': '#667eea',
            'success': '#28a745',
            'warning': '#ffc107',
            'error': '#dc3545'
        };
        return colors[type] || colors.info;
    },
    
    getNotificationIcon: function(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || icons.info;
    },
    
    // 显示加载状态
    showLoading: function(show, message = '处理中...') {
        let overlay = document.getElementById('global-loading-overlay');
        
        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'global-loading-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(5px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                `;
                
                overlay.innerHTML = `
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 4px solid #e1e5e9;
                        border-top: 4px solid #667eea;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 1rem;
                    "></div>
                    <p style="
                        color: #333;
                        font-size: 1rem;
                        margin: 0;
                    ">${message}</p>
                `;
                
                document.body.appendChild(overlay);
            }
            overlay.style.display = 'flex';
        } else {
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
    },
    
    // 确认对话框
    showConfirm: function(message, onConfirm, onCancel) {
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
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                text-align: center;
            ">
                <h3 style="margin-bottom: 1rem; color: #333;">确认操作</h3>
                <p style="margin-bottom: 2rem; color: #666; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="confirm-cancel" style="
                        padding: 0.75rem 1.5rem;
                        background: #f8f9fa;
                        border: 1px solid #e1e5e9;
                        border-radius: 8px;
                        cursor: pointer;
                        color: #333;
                    ">取消</button>
                    <button id="confirm-ok" style="
                        padding: 0.75rem 1.5rem;
                        background: #667eea;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        color: white;
                    ">确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const cleanup = () => {
            document.body.removeChild(modal);
        };
        
        modal.querySelector('#confirm-ok').onclick = () => {
            cleanup();
            if (onConfirm) onConfirm();
        };
        
        modal.querySelector('#confirm-cancel').onclick = () => {
            cleanup();
            if (onCancel) onCancel();
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                cleanup();
                if (onCancel) onCancel();
            }
        };
    },
    
    // 验证图像文件
    validateImageFile: function(file) {
        if (!file) {
            this.showNotification('请选择文件', 'error');
            return false;
        }
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('请选择图像文件（JPG、PNG、GIF等）', 'error');
            return false;
        }
        
        // 检查文件大小（限制为10MB）
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showNotification('文件大小不能超过10MB', 'error');
            return false;
        }
        
        return true;
    },
    
    // 格式化文件大小
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 检测浏览器支持
    checkBrowserSupport: function() {
        const features = {
            canvas: !!document.createElement('canvas').getContext,
            fileReader: !!window.FileReader,
            dragDrop: 'draggable' in document.createElement('div'),
            localStorage: !!window.localStorage
        };
        
        const unsupported = Object.keys(features).filter(key => !features[key]);
        
        if (unsupported.length > 0) {
            this.showNotification(
                `您的浏览器不支持以下功能：${unsupported.join(', ')}。建议使用最新版本的Chrome、Firefox或Safari。`,
                'warning',
                10000
            );
            return false;
        }
        
        return true;
    },
    
    // 添加键盘快捷键
    addKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: 下载当前结果
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const downloadBtn = document.querySelector('#download-btn:not(.d-none)');
                if (downloadBtn) {
                    downloadBtn.click();
                    this.showNotification('正在下载...', 'info');
                }
            }
            
            // Ctrl/Cmd + N: 处理新图像
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const newImageBtn = document.querySelector('#new-image-btn:not(.d-none)');
                if (newImageBtn) {
                    newImageBtn.click();
                }
            }
            
            // Ctrl/Cmd + R: 重置当前设置
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                const resetBtn = document.querySelector('[data-action="reset"]:not(.d-none)');
                if (resetBtn) {
                    resetBtn.click();
                }
            }
        });
    }
};

// 初始化工具函数
document.addEventListener('DOMContentLoaded', function() {
    // 检查浏览器支持
    window.ImageLabUtils.checkBrowserSupport();
    
    // 添加键盘快捷键
    window.ImageLabUtils.addKeyboardShortcuts();
    
    // 添加全局样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .notification:hover {
            transform: translateX(-5px) !important;
        }
        
        .notification button:hover {
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);
});
