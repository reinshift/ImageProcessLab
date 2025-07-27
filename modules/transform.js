// 图像变换模块
window.ImageTransform = {
    container: null,
    currentImage: null,
    originalImageData: null,
    canvas: null,
    ctx: null,
    
    init: function(container) {
        this.container = container;
        this.render();
        this.setupEventListeners();
    },
    
    render: function() {
        this.container.innerHTML = `
            <div class="transform-workspace">
                <!-- 图像上传区域 -->
                <div class="upload-section">
                    <div class="upload-area" id="upload-area">
                        <div class="upload-content">
                            <div class="upload-icon">📁</div>
                            <h3>选择图像文件</h3>
                            <p>支持 JPG、PNG、GIF 格式</p>
                            <input type="file" id="image-input" accept="image/*" style="display: none;">
                            <button class="upload-btn" onclick="document.getElementById('image-input').click()">
                                选择文件
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- 图像处理区域 -->
                <div class="processing-section d-none" id="processing-section">
                    <!-- 图像显示区域 -->
                    <div class="image-display">
                        <div class="image-container">
                            <h4>原始图像</h4>
                            <img id="original-image" class="preview-image" alt="原始图像">
                        </div>
                        <div class="image-container">
                            <h4>处理结果</h4>
                            <canvas id="result-canvas" class="preview-image"></canvas>
                        </div>
                    </div>

                    <!-- 浮动控制面板 -->
                    <div class="floating-control-panel" id="floating-control-panel">
                        <div class="panel-header" id="panel-header">
                            <div class="panel-title">
                                <span class="panel-icon">🎛️</span>
                                <span>控制面板</span>
                            </div>
                            <div class="panel-actions">
                                <button class="panel-btn minimize-btn" id="minimize-btn" title="最小化">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>

                                <button class="panel-btn close-btn" id="close-btn" title="关闭面板">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="panel-content" id="panel-content">
                            <div class="control-panel">
                        <div class="control-tabs">
                            <button class="tab-btn active" data-tab="basic">基础变换</button>
                            <button class="tab-btn" data-tab="color">色彩调节</button>
                            <button class="tab-btn" data-tab="geometry">几何变换</button>
                        </div>
                        
                        <!-- 基础变换 -->
                        <div class="tab-content active" id="basic-tab">
                            <div class="control-group">
                                <button class="transform-btn" data-action="grayscale">转为灰度</button>
                                <button class="transform-btn" data-action="reset">重置</button>
                            </div>
                        </div>
                        
                        <!-- 色彩调节 -->
                        <div class="tab-content" id="color-tab">
                            <div class="color-section">
                                <h5>RGB 通道调节</h5>
                                <div class="control-group">
                                    <label>红色通道</label>
                                    <input type="range" id="red-slider" min="0" max="200" value="100" class="color-slider">
                                    <span id="red-value">100%</span>
                                </div>
                                <div class="control-group">
                                    <label>绿色通道</label>
                                    <input type="range" id="green-slider" min="0" max="200" value="100" class="color-slider">
                                    <span id="green-value">100%</span>
                                </div>
                                <div class="control-group">
                                    <label>蓝色通道</label>
                                    <input type="range" id="blue-slider" min="0" max="200" value="100" class="color-slider">
                                    <span id="blue-value">100%</span>
                                </div>
                            </div>

                            <div class="color-section">
                                <h5>HSV 调节</h5>
                                <div class="control-group">
                                    <label>色相 (H)</label>
                                    <input type="range" id="hue-slider" min="-180" max="180" value="0" class="color-slider">
                                    <span id="hue-value">0°</span>
                                </div>
                                <div class="control-group">
                                    <label>饱和度 (S)</label>
                                    <input type="range" id="saturation-slider" min="0" max="200" value="100" class="color-slider">
                                    <span id="saturation-value">100%</span>
                                </div>
                                <div class="control-group">
                                    <label>明度 (V)</label>
                                    <input type="range" id="value-slider" min="0" max="200" value="100" class="color-slider">
                                    <span id="value-value">100%</span>
                                </div>
                            </div>

                            <div class="color-section">
                                <h5>其他调节</h5>
                                <div class="control-group">
                                    <label>对比度</label>
                                    <input type="range" id="contrast-slider" min="50" max="200" value="100" class="color-slider">
                                    <span id="contrast-value">100%</span>
                                </div>
                                <div class="control-group">
                                    <label>亮度</label>
                                    <input type="range" id="brightness-slider" min="0" max="200" value="100" class="color-slider">
                                    <span id="brightness-value">100%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 几何变换 -->
                        <div class="tab-content" id="geometry-tab">
                            <div class="geometry-section">
                                <h5>旋转和缩放</h5>
                                <div class="control-group">
                                    <label>旋转角度</label>
                                    <input type="range" id="rotation-slider" min="0" max="360" value="0" class="geometry-slider">
                                    <span id="rotation-value">0°</span>
                                </div>
                                <div class="control-group">
                                    <label>缩放比例</label>
                                    <input type="range" id="scale-slider" min="10" max="300" value="100" class="geometry-slider">
                                    <span id="scale-value">100%</span>
                                </div>
                            </div>

                            <div class="geometry-section">
                                <h5>平移</h5>
                                <div class="control-group">
                                    <label>水平偏移</label>
                                    <input type="range" id="translate-x" min="-200" max="200" value="0" class="geometry-slider">
                                    <span id="translate-x-value">0px</span>
                                </div>
                                <div class="control-group">
                                    <label>垂直偏移</label>
                                    <input type="range" id="translate-y" min="-200" max="200" value="0" class="geometry-slider">
                                    <span id="translate-y-value">0px</span>
                                </div>
                            </div>

                            <div class="geometry-section">
                                <h5>镜像操作</h5>
                                <div class="control-group">
                                    <button class="transform-btn" data-action="flip-horizontal">水平镜像</button>
                                    <button class="transform-btn" data-action="flip-vertical">垂直镜像</button>
                                    <button class="transform-btn" data-action="rotate-90">顺时针90°</button>
                                    <button class="transform-btn" data-action="rotate-180">旋转180°</button>
                                    <button class="transform-btn secondary" data-action="reset-geometry">重置镜像</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 操作按钮 -->
                        <div class="action-buttons">
                            <button class="action-btn secondary" id="download-btn">下载结果</button>
                            <button class="action-btn primary" id="new-image-btn">处理新图像</button>
                        </div>
                            </div>
                        </div>

                        <!-- 缩放手柄 -->
                        <div class="resize-handle n" data-direction="n"></div>
                        <div class="resize-handle s" data-direction="s"></div>
                        <div class="resize-handle w" data-direction="w"></div>
                        <div class="resize-handle e" data-direction="e"></div>
                        <div class="resize-handle nw" data-direction="nw"></div>
                        <div class="resize-handle ne" data-direction="ne"></div>
                        <div class="resize-handle sw" data-direction="sw"></div>
                        <div class="resize-handle se" data-direction="se"></div>
                    </div>

                    <!-- 控制面板切换按钮 -->
                    <div class="panel-toggle-area">
                        <button class="panel-toggle-btn" id="panel-toggle-btn" style="display: none;">
                            <span class="toggle-icon">🎛️</span>
                            <span class="toggle-text">显示控制面板</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .transform-workspace {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                }

                .upload-section {
                    margin-bottom: 2rem;
                }

                .upload-area {
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    padding: 3rem 2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .upload-area:hover {
                    border-color: var(--primary-color);
                    background: rgba(102, 126, 234, 0.05);
                }

                .upload-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                /* 图像显示区域 */
                .image-display {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                /* 浮动控制面板 */
                .floating-control-panel {
                    position: fixed;
                    top: 120px;
                    right: 20px;
                    width: 380px;
                    height: 500px;
                    background: var(--background-white);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    border: 2px solid var(--border-color);
                    z-index: 1000;
                    transition: box-shadow 0.3s ease;
                    backdrop-filter: blur(10px);
                    overflow: hidden;
                    min-width: 280px;
                    min-height: 300px;
                    max-width: 800px;
                    max-height: calc(100vh - 40px);
                    display: flex;
                    flex-direction: column;
                }

                .floating-control-panel.minimized {
                    height: 50px;
                    overflow: hidden;
                }

                .floating-control-panel.hidden {
                    transform: translateX(100%);
                    opacity: 0;
                    pointer-events: none;
                }

                .floating-control-panel.resizing {
                    transition: none;
                    user-select: none;
                }

                /* 缩放手柄 */
                .resize-handle {
                    position: absolute;
                    background: transparent;
                    z-index: 10;
                }

                .resize-handle.n {
                    top: -3px;
                    left: 10px;
                    right: 10px;
                    height: 6px;
                    cursor: n-resize;
                }

                .resize-handle.s {
                    bottom: -3px;
                    left: 10px;
                    right: 10px;
                    height: 6px;
                    cursor: s-resize;
                }

                .resize-handle.w {
                    left: -3px;
                    top: 10px;
                    bottom: 10px;
                    width: 6px;
                    cursor: w-resize;
                }

                .resize-handle.e {
                    right: -3px;
                    top: 10px;
                    bottom: 10px;
                    width: 6px;
                    cursor: e-resize;
                }

                .resize-handle.nw {
                    top: -3px;
                    left: -3px;
                    width: 12px;
                    height: 12px;
                    cursor: nw-resize;
                }

                .resize-handle.ne {
                    top: -3px;
                    right: -3px;
                    width: 12px;
                    height: 12px;
                    cursor: ne-resize;
                }

                .resize-handle.sw {
                    bottom: -3px;
                    left: -3px;
                    width: 12px;
                    height: 12px;
                    cursor: sw-resize;
                }

                .resize-handle.se {
                    bottom: -3px;
                    right: -3px;
                    width: 12px;
                    height: 12px;
                    cursor: se-resize;
                }

                .resize-handle:hover {
                    background: rgba(102, 126, 234, 0.3);
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 16px 16px 0 0;
                    cursor: move;
                    user-select: none;
                    flex-shrink: 0; /* 防止标题栏被压缩 */
                }

                .panel-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    font-size: 14px;
                }

                .panel-icon {
                    font-size: 16px;
                }

                .panel-actions {
                    display: flex;
                    gap: 4px;
                }

                .panel-btn {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s ease;
                }

                .panel-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .panel-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0;
                    min-height: 0; /* 重要：允许flex子元素缩小 */
                }

                /* 控制面板切换按钮 */
                .panel-toggle-area {
                    position: fixed;
                    top: 120px;
                    right: 20px;
                    z-index: 999;
                }

                .panel-toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    transition: all 0.3s ease;
                    font-size: 14px;
                    font-weight: 500;
                }

                .panel-toggle-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                }

                .toggle-icon {
                    font-size: 16px;
                }

                .upload-btn {
                    padding: 0.75rem 2rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 1rem;
                }
                

                
                .image-container {
                    text-align: center;
                }
                
                .image-container h4 {
                    margin-bottom: 1rem;
                    color: var(--text-color);
                }
                
                .preview-image {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                .control-panel {
                    background: transparent;
                    border-radius: 0;
                    padding: 16px;
                }
                
                .control-tabs {
                    display: flex;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .tab-btn {
                    padding: 0.75rem 1.5rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                
                .tab-btn.active {
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                }
                
                .tab-content {
                    display: none;
                }
                
                .tab-content.active {
                    display: block;
                }
                
                .control-group {
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .control-group label {
                    min-width: 80px;
                    font-weight: 500;
                }

                .color-slider, .geometry-slider {
                    flex: 1;
                    margin: 0 1rem;
                }

                .color-section {
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 8px;
                    border-left: 4px solid var(--primary-color);
                }

                .color-section h5 {
                    margin-bottom: 1rem;
                    color: var(--text-color);
                    font-size: 1rem;
                    font-weight: 600;
                }

                .geometry-section {
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 8px;
                    border-left: 4px solid var(--secondary-color);
                }

                .geometry-section h5 {
                    margin-bottom: 1rem;
                    color: var(--text-color);
                    font-size: 1rem;
                    font-weight: 600;
                }
                
                .transform-btn {
                    padding: 0.5rem 1rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-right: 0.5rem;
                    margin-bottom: 0.5rem;
                    transition: all 0.3s ease;
                }

                .transform-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                }

                .transform-btn.secondary {
                    background: var(--background-light);
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                }

                .transform-btn.secondary:hover {
                    background: var(--border-color);
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }
                
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border-color);
                }
                
                .action-btn {
                    flex: 1;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                
                .action-btn.primary {
                    background: var(--primary-color);
                    color: white;
                }
                
                .action-btn.secondary {
                    background: var(--background-light);
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                }
                
                @media (max-width: 768px) {
                    .image-display {
                        grid-template-columns: 1fr;
                    }

                    .floating-control-panel {
                        position: fixed;
                        top: 80px;
                        left: 10px;
                        right: 10px;
                        width: auto;
                        max-height: calc(100vh - 100px);
                    }

                    .panel-toggle-area {
                        top: 80px;
                        right: 10px;
                    }

                    .control-group {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .action-buttons {
                        flex-direction: column;
                    }
                }

                /* 滚动条样式 */
                .panel-content::-webkit-scrollbar {
                    width: 8px;
                }

                .panel-content::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                    margin: 4px 0;
                }

                .panel-content::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 4px;
                    transition: background 0.2s ease;
                }

                .panel-content::-webkit-scrollbar-thumb:hover {
                    background: var(--primary-color);
                }

                /* 确保内容有适当的内边距，避免与滚动条重叠 */
                .control-panel {
                    padding-right: 12px;
                }

                /* 深色主题支持 */
                [data-theme="dark"] .floating-control-panel {
                    background: var(--background-white);
                    border-color: var(--border-color);
                }

                [data-theme="dark"] .panel-content::-webkit-scrollbar-track {
                    background: var(--background-light);
                }

                /* 拖拽时的样式 */
                .floating-control-panel.dragging {
                    transition: none;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
                    transform: scale(1.02);
                }
            </style>
        `;
    },
    
    setupEventListeners: function() {
        // 文件上传
        const imageInput = document.getElementById('image-input');
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // 拖拽上传
        const uploadArea = document.getElementById('upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadImage(files[0]);
            }
        });
        
        // 标签页切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // 变换按钮
        const transformBtns = document.querySelectorAll('.transform-btn');
        transformBtns.forEach(btn => {
            btn.addEventListener('click', () => this.applyTransform(btn.dataset.action));
        });

        // 颜色滑块事件监听器
        this.setupColorSliders();

        // 操作按钮事件监听器
        this.setupActionButtons();

        // 浮动面板功能
        this.setupFloatingPanel();
    },
    
    handleImageUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    },
    
    loadImage: function(file) {
        if (!window.ImageLabUtils.validateImageFile(file)) {
            return;
        }

        window.ImageLabUtils.showLoading(true, '加载图像中...');

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.setupCanvas();
                this.showProcessingSection();
                window.ImageLabUtils.showLoading(false);
                window.ImageLabUtils.showNotification('图像加载成功', 'success');
            };
            img.onerror = () => {
                window.ImageLabUtils.showLoading(false);
                window.ImageLabUtils.showNotification('图像加载失败，请检查文件格式', 'error');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            window.ImageLabUtils.showLoading(false);
            window.ImageLabUtils.showNotification('文件读取失败', 'error');
        };
        reader.readAsDataURL(file);
    },
    
    setupCanvas: function() {
        const originalImage = document.getElementById('original-image');
        const canvas = document.getElementById('result-canvas');
        
        originalImage.src = this.currentImage.src;
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        canvas.width = this.currentImage.width;
        canvas.height = this.currentImage.height;
        
        // 绘制原始图像
        this.ctx.drawImage(this.currentImage, 0, 0);
        
        // 保存原始图像数据
        this.originalImageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    },
    
    showProcessingSection: function() {
        document.querySelector('.upload-section').classList.add('d-none');
        document.getElementById('processing-section').classList.remove('d-none');

        // 显示滑块重置功能提示
        if (window.ImageLabUtils && window.ImageLabUtils.showSliderResetTip) {
            // 延迟1秒显示，让用户先看到界面
            setTimeout(() => {
                window.ImageLabUtils.showSliderResetTip();
            }, 1000);
        }
    },
    
    switchTab: function(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 更新标签内容
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    },
    
    applyTransform: function(action) {
        switch(action) {
            case 'grayscale':
                this.applyGrayscale();
                break;
            case 'reset':
                this.resetImage();
                break;
            case 'flip-horizontal':
                this.flipHorizontal();
                break;
            case 'flip-vertical':
                this.flipVertical();
                break;
            case 'rotate-90':
                this.rotateImage(90);
                break;
            case 'rotate-180':
                this.rotateImage(180);
                break;
            case 'reset-geometry':
                this.resetGeometry();
                break;
        }
    },
    
    applyGrayscale: function() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;     // Red
            data[i + 1] = gray; // Green
            data[i + 2] = gray; // Blue
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    },
    
    resetImage: function() {
        this.ctx.putImageData(this.originalImageData, 0, 0);
    },

    resetGeometry: function() {
        // 重置到原始图像状态
        this.ctx.putImageData(this.originalImageData, 0, 0);

        // 重置几何变换相关的滑块
        const translateXSlider = document.getElementById('translate-x');
        const translateYSlider = document.getElementById('translate-y');
        const translateXValue = document.getElementById('translate-x-value');
        const translateYValue = document.getElementById('translate-y-value');

        if (translateXSlider) {
            translateXSlider.value = 0;
            translateXValue.textContent = '0px';
        }

        if (translateYSlider) {
            translateYSlider.value = 0;
            translateYValue.textContent = '0px';
        }

        // 显示成功提示
        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('镜像和几何变换已重置', 'success', 2000);
        }
    },
    
    flipHorizontal: function() {
        // 保存当前画布内容
        const currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 保存变换状态
        this.ctx.save();

        // 应用水平镜像变换
        this.ctx.scale(-1, 1);
        this.ctx.translate(-this.canvas.width, 0);

        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(currentImageData, 0, 0);

        // 绘制镜像后的图像
        this.ctx.drawImage(tempCanvas, 0, 0);

        // 恢复变换状态
        this.ctx.restore();
    },

    flipVertical: function() {
        // 保存当前画布内容
        const currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 保存变换状态
        this.ctx.save();

        // 应用垂直镜像变换
        this.ctx.scale(1, -1);
        this.ctx.translate(0, -this.canvas.height);

        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(currentImageData, 0, 0);

        // 绘制镜像后的图像
        this.ctx.drawImage(tempCanvas, 0, 0);

        // 恢复变换状态
        this.ctx.restore();
    },

    rotateImage: function(degrees) {
        // 保存当前画布内容
        const currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 保存变换状态
        this.ctx.save();

        // 移动到画布中心
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        // 旋转
        this.ctx.rotate((degrees * Math.PI) / 180);

        // 移回原点
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(currentImageData, 0, 0);

        // 绘制旋转后的图像
        this.ctx.drawImage(tempCanvas, 0, 0);

        // 恢复变换状态
        this.ctx.restore();
    },
    
    setupColorSliders: function() {
        const sliders = [
            { id: 'red-slider', valueId: 'red-value', suffix: '%', defaultValue: 100 },
            { id: 'green-slider', valueId: 'green-value', suffix: '%', defaultValue: 100 },
            { id: 'blue-slider', valueId: 'blue-value', suffix: '%', defaultValue: 100 },
            { id: 'hue-slider', valueId: 'hue-value', suffix: '°', defaultValue: 0 },
            { id: 'saturation-slider', valueId: 'saturation-value', suffix: '%', defaultValue: 100 },
            { id: 'value-slider', valueId: 'value-value', suffix: '%', defaultValue: 100 },
            { id: 'contrast-slider', valueId: 'contrast-value', suffix: '%', defaultValue: 100 },
            { id: 'brightness-slider', valueId: 'brightness-value', suffix: '%', defaultValue: 100 },
            { id: 'rotation-slider', valueId: 'rotation-value', suffix: '°', defaultValue: 0 },
            { id: 'scale-slider', valueId: 'scale-value', suffix: '%', defaultValue: 100 },
            { id: 'translate-x', valueId: 'translate-x-value', suffix: 'px', defaultValue: 0 },
            { id: 'translate-y', valueId: 'translate-y-value', suffix: 'px', defaultValue: 0 }
        ];

        sliders.forEach(slider => {
            const sliderElement = document.getElementById(slider.id);
            const valueElement = document.getElementById(slider.valueId);

            if (sliderElement && valueElement) {
                sliderElement.addEventListener('input', () => {
                    valueElement.textContent = sliderElement.value + slider.suffix;
                });

                // 使用防抖处理变换应用，提高性能
                const debouncedTransform = window.ImageLabUtils.debounce(() => {
                    this.applyAllTransformations();
                }, 100);

                sliderElement.addEventListener('input', debouncedTransform);

                // 双击重置功能 - 滑块
                sliderElement.addEventListener('dblclick', () => {
                    sliderElement.value = slider.defaultValue;
                    valueElement.textContent = slider.defaultValue + slider.suffix;
                    this.applyAllTransformations();

                    if (window.ImageLabUtils) {
                        window.ImageLabUtils.showNotification(
                            `${slider.id.replace('-', ' ')} 已重置`,
                            'info',
                            1500
                        );
                    }
                });

                // 双击重置功能 - 标签
                const labelElement = valueElement.parentElement.querySelector('label');
                if (labelElement) {
                    labelElement.style.cursor = 'pointer';
                    labelElement.title = '双击重置到默认值';

                    labelElement.addEventListener('dblclick', () => {
                        sliderElement.value = slider.defaultValue;
                        valueElement.textContent = slider.defaultValue + slider.suffix;
                        this.applyAllTransformations();

                        if (window.ImageLabUtils) {
                            window.ImageLabUtils.showNotification(
                                `${labelElement.textContent} 已重置`,
                                'info',
                                1500
                            );
                        }
                    });
                }
            }
        });
    },

    applyAllTransformations: function() {
        if (!this.originalImageData) return;

        // 先应用颜色调整
        this.applyColorAdjustments();

        // 然后应用几何变换
        this.applyGeometryTransformations();
    },

    applyColorAdjustments: function() {
        if (!this.originalImageData) return;

        // 获取所有滑块的值
        const red = parseFloat(document.getElementById('red-slider')?.value || 100) / 100;
        const green = parseFloat(document.getElementById('green-slider')?.value || 100) / 100;
        const blue = parseFloat(document.getElementById('blue-slider')?.value || 100) / 100;
        const hue = parseFloat(document.getElementById('hue-slider')?.value || 0);
        const saturation = parseFloat(document.getElementById('saturation-slider')?.value || 100) / 100;
        const brightness = parseFloat(document.getElementById('value-slider')?.value || 100) / 100;
        const contrast = parseFloat(document.getElementById('contrast-slider')?.value || 100) / 100;
        const brightnessAdjust = parseFloat(document.getElementById('brightness-slider')?.value || 100) / 100;

        // 复制原始图像数据
        const imageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // RGB调节
            r *= red;
            g *= green;
            b *= blue;

            // 亮度和对比度调节
            r = ((r / 255 - 0.5) * contrast + 0.5) * 255 * brightnessAdjust;
            g = ((g / 255 - 0.5) * contrast + 0.5) * 255 * brightnessAdjust;
            b = ((b / 255 - 0.5) * contrast + 0.5) * 255 * brightnessAdjust;

            // HSV调节
            if (hue !== 0 || saturation !== 1 || brightness !== 1) {
                const hsv = this.rgbToHsv(r, g, b);
                hsv.h = (hsv.h + hue + 360) % 360;
                hsv.s *= saturation;
                hsv.v *= brightness;

                const rgb = this.hsvToRgb(hsv.h, hsv.s, hsv.v);
                r = rgb.r;
                g = rgb.g;
                b = rgb.b;
            }

            // 确保值在有效范围内
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        this.ctx.putImageData(imageData, 0, 0);
    },

    applyGeometryTransformations: function() {
        const rotation = parseFloat(document.getElementById('rotation-slider')?.value || 0);
        const scale = parseFloat(document.getElementById('scale-slider')?.value || 100) / 100;
        const translateX = parseFloat(document.getElementById('translate-x')?.value || 0);
        const translateY = parseFloat(document.getElementById('translate-y')?.value || 0);

        if (rotation === 0 && scale === 1 && translateX === 0 && translateY === 0) {
            return; // 没有几何变换需要应用
        }

        // 保存当前画布内容
        const currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 保存当前变换状态
        this.ctx.save();

        // 移动到画布中心
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        // 应用旋转
        if (rotation !== 0) {
            this.ctx.rotate((rotation * Math.PI) / 180);
        }

        // 应用缩放
        if (scale !== 1) {
            this.ctx.scale(scale, scale);
        }

        // 应用平移
        this.ctx.translate(translateX, translateY);

        // 移回原点并绘制图像
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

        // 创建临时画布来绘制当前图像
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(currentImageData, 0, 0);

        // 绘制变换后的图像
        this.ctx.drawImage(tempCanvas, 0, 0);

        // 恢复变换状态
        this.ctx.restore();
    },

    rgbToHsv: function(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let h = 0;
        let s = max === 0 ? 0 : diff / max;
        let v = max;

        if (diff !== 0) {
            switch (max) {
                case r:
                    h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / diff + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / diff + 4) / 6;
                    break;
            }
        }

        return { h: h * 360, s: s, v: v };
    },

    hsvToRgb: function(h, s, v) {
        h /= 360;
        const c = v * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = v - c;

        let r = 0, g = 0, b = 0;

        if (h < 1/6) {
            r = c; g = x; b = 0;
        } else if (h < 2/6) {
            r = x; g = c; b = 0;
        } else if (h < 3/6) {
            r = 0; g = c; b = x;
        } else if (h < 4/6) {
            r = 0; g = x; b = c;
        } else if (h < 5/6) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }

        return {
            r: (r + m) * 255,
            g: (g + m) * 255,
            b: (b + m) * 255
        };
    },

    setupActionButtons: function() {
        const downloadBtn = document.getElementById('download-btn');
        const newImageBtn = document.getElementById('new-image-btn');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadResult());
        }

        if (newImageBtn) {
            newImageBtn.addEventListener('click', () => this.loadNewImage());
        }
    },

    downloadResult: function() {
        if (!this.canvas) {
            window.ImageLabUtils.showNotification('没有可下载的图像', 'warning');
            return;
        }

        try {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'transformed_image.png';
            link.href = this.canvas.toDataURL('image/png');

            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.ImageLabUtils.showNotification('图像下载成功', 'success');
        } catch (error) {
            console.error('下载失败:', error);
            window.ImageLabUtils.showNotification('下载失败，请重试', 'error');
        }
    },

    loadNewImage: function() {
        // 重置所有滑块到默认值
        const sliders = [
            { id: 'red-slider', value: 100 },
            { id: 'green-slider', value: 100 },
            { id: 'blue-slider', value: 100 },
            { id: 'hue-slider', value: 0 },
            { id: 'saturation-slider', value: 100 },
            { id: 'value-slider', value: 100 },
            { id: 'contrast-slider', value: 100 },
            { id: 'brightness-slider', value: 100 },
            { id: 'rotation-slider', value: 0 },
            { id: 'scale-slider', value: 100 },
            { id: 'translate-x', value: 0 },
            { id: 'translate-y', value: 0 }
        ];

        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            if (element) {
                element.value = slider.value;
                // 触发input事件来更新显示值
                element.dispatchEvent(new Event('input'));
            }
        });

        // 重置文件输入框
        const imageInput = document.getElementById('image-input');
        if (imageInput) {
            imageInput.value = '';
            // 移除并重新添加事件监听器以确保正常工作
            const newInput = imageInput.cloneNode(true);
            imageInput.parentNode.replaceChild(newInput, imageInput);

            // 重新绑定事件监听器
            newInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // 显示上传区域，隐藏处理区域
        document.querySelector('.upload-section').classList.remove('d-none');
        document.getElementById('processing-section').classList.add('d-none');

        // 清理当前图像
        this.currentImage = null;
        this.originalImageData = null;
        this.canvas = null;
        this.ctx = null;

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已重置，可以上传新图像', 'info');
        }
    },

    setupFloatingPanel: function() {
        const panel = document.getElementById('floating-control-panel');
        const panelHeader = document.getElementById('panel-header');
        const minimizeBtn = document.getElementById('minimize-btn');
        const closeBtn = document.getElementById('close-btn');
        const toggleBtn = document.getElementById('panel-toggle-btn');

        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        // 拖拽功能
        panelHeader.addEventListener('mousedown', (e) => {
            if (e.target.closest('.panel-btn')) return; // 不在按钮上才能拖拽

            isDragging = true;
            panel.classList.add('dragging');

            const rect = panel.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;

            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', handleDragEnd);
            e.preventDefault();
        });

        function handleDrag(e) {
            if (!isDragging) return;

            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;

            // 限制在视窗内
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;

            const constrainedX = Math.max(0, Math.min(x, maxX));
            const constrainedY = Math.max(0, Math.min(y, maxY));

            panel.style.left = constrainedX + 'px';
            panel.style.top = constrainedY + 'px';
            panel.style.right = 'auto'; // 取消right定位
        }

        function handleDragEnd() {
            isDragging = false;
            panel.classList.remove('dragging');
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
        }

        // 最小化功能
        minimizeBtn.addEventListener('click', () => {
            panel.classList.toggle('minimized');
            const isMinimized = panel.classList.contains('minimized');
            minimizeBtn.innerHTML = isMinimized ?
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>' :
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
            minimizeBtn.title = isMinimized ? '还原' : '最小化';
        });

        // 缩放功能
        this.setupResizeHandles(panel);

        // 关闭功能
        closeBtn.addEventListener('click', () => {
            panel.classList.add('hidden');
            toggleBtn.style.display = 'flex';
        });

        // 显示面板功能
        toggleBtn.addEventListener('click', () => {
            panel.classList.remove('hidden');
            toggleBtn.style.display = 'none';
        });

        // 双击标题栏重置位置
        panelHeader.addEventListener('dblclick', () => {
            panel.style.top = '120px';
            panel.style.right = '20px';
            panel.style.left = 'auto';
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('面板位置已重置', 'info', 1500);
            }
        });

        // 窗口大小改变时调整面板位置
        window.addEventListener('resize', () => {
            const rect = panel.getBoundingClientRect();
            if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
                panel.style.top = '120px';
                panel.style.right = '20px';
                panel.style.left = 'auto';
            }
        });
    },

    setupResizeHandles: function(panel) {
        const resizeHandles = panel.querySelectorAll('.resize-handle');

        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const direction = handle.dataset.direction;
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = parseInt(window.getComputedStyle(panel).width, 10);
                const startHeight = parseInt(window.getComputedStyle(panel).height, 10);
                const startLeft = panel.offsetLeft;
                const startTop = panel.offsetTop;

                panel.classList.add('resizing');

                const handleMouseMove = (e) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;

                    let newWidth = startWidth;
                    let newHeight = startHeight;
                    let newLeft = startLeft;
                    let newTop = startTop;

                    // 根据方向调整尺寸和位置
                    if (direction.includes('e')) {
                        newWidth = Math.max(280, Math.min(800, startWidth + deltaX));
                    }
                    if (direction.includes('w')) {
                        newWidth = Math.max(280, Math.min(800, startWidth - deltaX));
                        newLeft = startLeft + (startWidth - newWidth);
                    }
                    if (direction.includes('s')) {
                        newHeight = Math.max(300, Math.min(window.innerHeight - 40, startHeight + deltaY));
                    }
                    if (direction.includes('n')) {
                        newHeight = Math.max(300, Math.min(window.innerHeight - 40, startHeight - deltaY));
                        newTop = startTop + (startHeight - newHeight);
                    }

                    // 确保面板不会超出屏幕边界
                    newLeft = Math.max(0, Math.min(window.innerWidth - newWidth, newLeft));
                    newTop = Math.max(0, Math.min(window.innerHeight - newHeight, newTop));

                    panel.style.width = newWidth + 'px';
                    panel.style.height = newHeight + 'px';
                    panel.style.left = newLeft + 'px';
                    panel.style.top = newTop + 'px';
                    panel.style.right = 'auto';
                    panel.style.bottom = 'auto';
                };

                const handleMouseUp = () => {
                    panel.classList.remove('resizing');
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });
        });
    },

    cleanup: function() {
        // 清理资源
        this.currentImage = null;
        this.originalImageData = null;
        this.canvas = null;
        this.ctx = null;
    }
};
