// 水印处理模块
window.ImageWatermark = {
    container: null,
    currentImage: null,
    watermarkImage: null,
    canvas: null,
    ctx: null,
    isTextWatermarkMode: false,
    
    init: function(container) {
        this.container = container;
        this.render();
        this.setupEventListeners();
    },
    
    render: function() {
        this.container.innerHTML = `
            <div class="watermark-workspace">
                <!-- 图像上传区域 -->
                <div class="upload-section">
                    <div class="upload-grid">
                        <div class="upload-area" id="main-upload-area">
                            <div class="upload-content">
                                <div class="upload-icon">🖼️</div>
                                <h3>选择主图像</h3>
                                <p>要添加水印的图像</p>
                                <input type="file" id="main-image-input" accept="image/*" style="display: none;">
                                <button class="upload-btn" onclick="document.getElementById('main-image-input').click()">
                                    选择文件
                                </button>
                            </div>
                        </div>
                        
                        <div class="upload-area" id="watermark-upload-area">
                            <div class="upload-content">
                                <div class="upload-icon">💧</div>
                                <h3>选择水印图像</h3>
                                <p>或使用预设水印</p>
                                <input type="file" id="watermark-image-input" accept="image/*" style="display: none;">
                                <button class="upload-btn" onclick="document.getElementById('watermark-image-input').click()">
                                    选择文件
                                </button>
                                <div class="preset-watermarks">
                                    <button class="preset-btn" data-watermark="text">文字水印</button>
                                    <button class="preset-btn" data-watermark="logo">Logo水印</button>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- 开始处理按钮 -->
                    <div class="start-processing-section" style="text-align: center; margin-top: 2rem;">
                        <button class="start-processing-btn" id="start-processing-btn" style="display: none;">
                            开始水印处理
                        </button>
                        <p class="processing-hint" style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                            请选择主图像和水印图像（或选择预设水印）后开始处理
                        </p>
                    </div>
                </div>
                
                <!-- 水印处理区域 -->
                <div class="processing-section d-none" id="processing-section">
                    <!-- 图像显示区域 -->
                    <div class="image-display">
                        <div class="image-container">
                            <h4>原始图像</h4>
                            <img id="original-image" class="preview-image" alt="原始图像">
                        </div>
                        <div class="image-container">
                            <h4>水印预览</h4>
                            <canvas id="result-canvas" class="preview-image"></canvas>
                        </div>
                    </div>
                    
                    <!-- 水印控制面板 -->
                    <div class="watermark-controls">
                        <div class="control-tabs">
                            <button class="tab-btn active" data-tab="position">位置调节</button>
                            <button class="tab-btn" data-tab="appearance">外观设置</button>
                            <button class="tab-btn" data-tab="text">文字水印</button>
                        </div>
                        
                        <!-- 位置调节 -->
                        <div class="tab-content active" id="position-tab">
                            <div class="position-grid">
                                <button class="position-btn" data-position="top-left">左上</button>
                                <button class="position-btn" data-position="top-center">上中</button>
                                <button class="position-btn" data-position="top-right">右上</button>
                                <button class="position-btn" data-position="center-left">左中</button>
                                <button class="position-btn active" data-position="center">居中</button>
                                <button class="position-btn" data-position="center-right">右中</button>
                                <button class="position-btn" data-position="bottom-left">左下</button>
                                <button class="position-btn" data-position="bottom-center">下中</button>
                                <button class="position-btn" data-position="bottom-right">右下</button>
                            </div>
                            <div class="control-group">
                                <label>X偏移:</label>
                                <input type="range" id="x-offset" min="-100" max="100" value="0">
                                <span id="x-offset-value">0px</span>
                            </div>
                            <div class="control-group">
                                <label>Y偏移:</label>
                                <input type="range" id="y-offset" min="-100" max="100" value="0">
                                <span id="y-offset-value">0px</span>
                            </div>
                        </div>
                        
                        <!-- 外观设置 -->
                        <div class="tab-content" id="appearance-tab">
                            <div class="control-group">
                                <label>透明度:</label>
                                <input type="range" id="opacity" min="10" max="100" value="50">
                                <span id="opacity-value">50%</span>
                            </div>
                            <div class="control-group">
                                <label>缩放:</label>
                                <input type="range" id="scale" min="10" max="200" value="100">
                                <span id="scale-value">100%</span>
                            </div>
                            <div class="control-group">
                                <label>旋转:</label>
                                <input type="range" id="rotation" min="0" max="360" value="0">
                                <span id="rotation-value">0°</span>
                            </div>
                            <div class="control-group">
                                <label>混合模式:</label>
                                <select id="blend-mode">
                                    <option value="normal">正常</option>
                                    <option value="multiply">正片叠底</option>
                                    <option value="screen">滤色</option>
                                    <option value="overlay">叠加</option>
                                    <option value="soft-light">柔光</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- 文字水印 -->
                        <div class="tab-content" id="text-tab">
                            <div class="control-group">
                                <label>水印文字:</label>
                                <input type="text" id="watermark-text" placeholder="输入水印文字" value="WATERMARK">
                            </div>
                            <div class="control-group">
                                <label>字体大小:</label>
                                <input type="range" id="font-size" min="12" max="100" value="36">
                                <span id="font-size-value">36px</span>
                            </div>
                            <div class="control-group">
                                <label>字体颜色:</label>
                                <input type="color" id="font-color" value="#ffffff">
                            </div>
                            <div class="control-group">
                                <label>字体样式:</label>
                                <select id="font-family">
                                    <option value="Arial">Arial</option>
                                    <option value="Microsoft YaHei">微软雅黑</option>
                                    <option value="SimHei">黑体</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 水印处理演示 -->
                    <div class="demo-section">
                        <h4>水印处理过程</h4>
                        <div class="process-steps">
                            <div class="step-item">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h5>加载水印</h5>
                                    <p>选择或创建水印图像</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h5>透明处理</h5>
                                    <p>调整水印透明度和混合模式</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h5>位置调整</h5>
                                    <p>设置水印在图像中的位置</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h5>合成输出</h5>
                                    <p>将水印合成到原图像上</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <button class="action-btn secondary" id="preview-btn">预览效果</button>
                        <button class="action-btn secondary" id="download-btn">下载结果</button>
                        <button class="action-btn primary" id="new-image-btn">处理新图像</button>
                    </div>
                </div>
            </div>
            
            <style>
                .watermark-workspace {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                
                .upload-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .upload-area {
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    padding: 2rem 1.5rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .upload-area:hover {
                    border-color: var(--primary-color);
                    background: rgba(102, 126, 234, 0.05);
                }
                
                .upload-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }
                
                .upload-btn {
                    padding: 0.75rem 1.5rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 1rem;
                    margin-bottom: 1rem;
                }

                .upload-btn.secondary {
                    background: var(--background-light);
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                }

                .upload-area.uploaded {
                    border-color: var(--success-color);
                    background: rgba(40, 167, 69, 0.05);
                }

                .start-processing-btn {
                    padding: 1rem 3rem;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 1.1rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .start-processing-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                }
                
                .preset-watermarks {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                }
                
                .preset-btn {
                    padding: 0.5rem 1rem;
                    background: var(--background-light);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                
                .image-display {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
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
                
                .watermark-controls {
                    background: var(--background-light);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
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
                
                .position-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    max-width: 300px;
                }
                
                .position-btn {
                    padding: 0.75rem;
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.8rem;
                }
                
                .position-btn.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }
                
                .control-group {
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .control-group label {
                    min-width: 80px;
                    font-weight: 500;
                }
                
                .control-group input[type="range"] {
                    flex: 1;
                }
                
                .control-group input[type="text"] {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                }
                
                .demo-section {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    border: 1px solid var(--border-color);
                }
                
                .process-steps {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                
                .step-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--background-light);
                    border-radius: 8px;
                }
                
                .step-number {
                    width: 30px;
                    height: 30px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                
                .step-content h5 {
                    margin-bottom: 0.25rem;
                    color: var(--text-color);
                }
                
                .step-content p {
                    font-size: 0.85rem;
                    color: var(--text-light);
                    margin: 0;
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
                    .upload-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .image-display {
                        grid-template-columns: 1fr;
                    }
                    
                    .control-group {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                    }
                    
                    .process-steps {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    },
    
    setupEventListeners: function() {
        // 文件上传
        const mainImageInput = document.getElementById('main-image-input');
        const watermarkImageInput = document.getElementById('watermark-image-input');
        
        mainImageInput.addEventListener('change', (e) => this.handleMainImageUpload(e));
        watermarkImageInput.addEventListener('change', (e) => this.handleWatermarkImageUpload(e));
        
        // 标签页切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // 位置按钮
        const positionBtns = document.querySelectorAll('.position-btn');
        positionBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setPosition(btn.dataset.position));
        });
        
        // 预设水印
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => this.usePresetWatermark(btn.dataset.watermark));
        });

        // 开始处理按钮
        const startProcessingBtn = document.getElementById('start-processing-btn');
        if (startProcessingBtn) {
            startProcessingBtn.addEventListener('click', () => this.enterProcessingMode());
        }

        // 滑块事件监听器
        this.setupSliders();

        // 操作按钮事件监听器
        this.setupActionButtons();
    },
    
    handleMainImageUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadMainImage(file);
        }
    },
    
    handleWatermarkImageUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadWatermarkImage(file);
        }
    },
    
    loadMainImage: function(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图像文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.setupCanvas();
                this.checkReadyToProcess();

                if (window.ImageLabUtils) {
                    window.ImageLabUtils.showNotification('主图像已加载', 'success');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },
    
    loadWatermarkImage: function(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图像文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 处理水印背景透明化
                this.watermarkImage = this.processWatermarkTransparency(img);
                this.isTextWatermarkMode = false; // 清除文字水印模式

                // 显示水印预览
                this.showWatermarkPreview(this.watermarkImage);

                // 检查是否可以进入处理界面
                this.checkReadyToProcess();

                if (window.ImageLabUtils) {
                    window.ImageLabUtils.showNotification('水印图像已加载', 'success');
                }
            };
            img.src = e.target.result;
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
    },
    
    checkReadyToProcess: function() {
        // 更新上传区域的状态显示
        this.updateUploadStatus();

        // 检查是否可以进入处理界面
        const canProcess = this.canEnterProcessing();

        if (canProcess) {
            // 显示进入处理界面的按钮
            this.showProcessButton();
        } else {
            // 隐藏进入处理界面的按钮
            this.hideProcessButton();
        }
    },

    canEnterProcessing: function() {
        // 必须有主图像，并且有水印图像或准备使用文字水印
        return this.currentImage && (this.watermarkImage || this.isTextWatermarkMode);
    },

    updateUploadStatus: function() {
        const mainUploadArea = document.getElementById('main-upload-area');
        const watermarkUploadArea = document.getElementById('watermark-upload-area');

        // 更新主图像上传区域状态
        if (this.currentImage) {
            mainUploadArea.classList.add('uploaded');
            const content = mainUploadArea.querySelector('.upload-content h3');
            if (content) content.textContent = '✓ 主图像已选择';
        } else {
            mainUploadArea.classList.remove('uploaded');
            const content = mainUploadArea.querySelector('.upload-content h3');
            if (content) content.textContent = '选择主图像';
        }

        // 更新水印上传区域状态
        if (this.watermarkImage) {
            watermarkUploadArea.classList.add('uploaded');
            const content = watermarkUploadArea.querySelector('.upload-content h3');
            if (content) content.textContent = '✓ 水印图像已选择';
        } else if (this.isTextWatermarkMode) {
            watermarkUploadArea.classList.add('uploaded');
            const content = watermarkUploadArea.querySelector('.upload-content h3');
            if (content) content.textContent = '✓ 文字水印模式';
        } else {
            watermarkUploadArea.classList.remove('uploaded');
            const content = watermarkUploadArea.querySelector('.upload-content h3');
            if (content) content.textContent = '选择水印图像';
        }
    },

    showProcessButton: function() {
        const processBtn = document.getElementById('start-processing-btn');
        if (processBtn) {
            processBtn.style.display = 'block';
        }
    },

    hideProcessButton: function() {
        const processBtn = document.getElementById('start-processing-btn');
        if (processBtn) {
            processBtn.style.display = 'none';
        }
    },

    enterProcessingMode: function() {
        if (!this.canEnterProcessing()) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('请先选择主图像和水印', 'warning');
            }
            return;
        }

        // 进入处理界面
        document.querySelector('.upload-section').classList.add('d-none');
        document.getElementById('processing-section').classList.remove('d-none');

        // 如果是文字水印模式但没有文字，设置默认文字
        if (this.isTextWatermarkMode && !this.hasTextWatermark()) {
            const watermarkText = document.getElementById('watermark-text');
            if (watermarkText) {
                watermarkText.value = 'WATERMARK';
            }
        }

        this.updateWatermark();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已进入水印处理界面', 'success');
        }
    },

    hasTextWatermark: function() {
        const watermarkText = document.getElementById('watermark-text');
        return watermarkText && watermarkText.value.trim().length > 0;
    },
    
    switchTab: function(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 更新标签内容
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    },
    
    setPosition: function(position) {
        // 更新位置按钮状态
        document.querySelectorAll('.position-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-position="${position}"]`).classList.add('active');
        
        // 应用新位置
        this.applyWatermark();
    },
    
    usePresetWatermark: function(type) {
        if (type === 'text') {
            // 启用文字水印模式
            this.enableTextWatermarkMode();
        } else if (type === 'logo') {
            // 使用预设logo
            this.createLogoWatermark();
        }
    },

    enableTextWatermarkMode: function() {
        // 设置文字水印模式标志
        this.isTextWatermarkMode = true;
        this.watermarkImage = null; // 清除图像水印

        // 更新状态
        this.checkReadyToProcess();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已启用文字水印模式', 'info');
        }
    },
    
    createTextWatermark: function() {
        // 创建文字水印的实现
        alert('创建文字水印功能');
    },
    
    createLogoWatermark: function() {
        // 创建logo水印的实现
        alert('创建Logo水印功能');
    },
    
    setupSliders: function() {
        const sliders = [
            { id: 'x-offset', valueId: 'x-offset-value', suffix: 'px' },
            { id: 'y-offset', valueId: 'y-offset-value', suffix: 'px' },
            { id: 'opacity', valueId: 'opacity-value', suffix: '%' },
            { id: 'scale', valueId: 'scale-value', suffix: '%' },
            { id: 'rotation', valueId: 'rotation-value', suffix: '°' },
            { id: 'font-size', valueId: 'font-size-value', suffix: 'px' }
        ];

        sliders.forEach(slider => {
            const sliderElement = document.getElementById(slider.id);
            const valueElement = document.getElementById(slider.valueId);

            if (sliderElement && valueElement) {
                sliderElement.addEventListener('input', () => {
                    valueElement.textContent = sliderElement.value + slider.suffix;
                    this.updateWatermark();
                });
            }
        });

        // 文字水印输入框
        const watermarkText = document.getElementById('watermark-text');
        const fontColor = document.getElementById('font-color');
        const fontFamily = document.getElementById('font-family');
        const blendMode = document.getElementById('blend-mode');

        if (watermarkText) {
            watermarkText.addEventListener('input', () => {
                // 检查是否可以进入处理界面
                this.checkReadyToProcess();
                // 如果已经在处理界面，更新水印
                if (!document.getElementById('processing-section').classList.contains('d-none')) {
                    this.updateWatermark();
                }
            });
        }

        if (fontColor) {
            fontColor.addEventListener('change', () => this.updateWatermark());
        }

        if (fontFamily) {
            fontFamily.addEventListener('change', () => this.updateWatermark());
        }

        if (blendMode) {
            blendMode.addEventListener('change', () => this.updateWatermark());
        }
    },

    setupActionButtons: function() {
        const previewBtn = document.getElementById('preview-btn');
        const downloadBtn = document.getElementById('download-btn');
        const newImageBtn = document.getElementById('new-image-btn');

        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewWatermark());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadResult());
        }

        if (newImageBtn) {
            newImageBtn.addEventListener('click', () => this.loadNewImage());
        }
    },

    updateWatermark: function() {
        if (!this.currentImage) return;

        // 重新绘制原始图像
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.currentImage, 0, 0);

        // 检查是否有水印图像或文字
        const watermarkText = document.getElementById('watermark-text')?.value;

        if (this.watermarkImage) {
            this.applyImageWatermark();
        } else if (watermarkText) {
            this.applyTextWatermark();
        }
    },

    applyImageWatermark: function() {
        if (!this.watermarkImage) return;

        // 获取设置值
        const opacity = parseFloat(document.getElementById('opacity')?.value || 50) / 100;
        const scale = parseFloat(document.getElementById('scale')?.value || 100) / 100;
        const rotation = parseFloat(document.getElementById('rotation')?.value || 0);
        const xOffset = parseFloat(document.getElementById('x-offset')?.value || 0);
        const yOffset = parseFloat(document.getElementById('y-offset')?.value || 0);
        const blendMode = document.getElementById('blend-mode')?.value || 'normal';

        // 计算水印位置
        const position = this.getWatermarkPosition();
        const x = position.x + xOffset;
        const y = position.y + yOffset;

        // 保存当前状态
        this.ctx.save();

        // 设置透明度和混合模式
        this.ctx.globalAlpha = opacity;
        this.ctx.globalCompositeOperation = blendMode;

        // 移动到水印位置
        this.ctx.translate(x + (this.watermarkImage.width * scale) / 2, y + (this.watermarkImage.height * scale) / 2);

        // 应用旋转
        if (rotation !== 0) {
            this.ctx.rotate((rotation * Math.PI) / 180);
        }

        // 应用缩放并绘制水印
        this.ctx.scale(scale, scale);
        this.ctx.drawImage(this.watermarkImage, -this.watermarkImage.width / 2, -this.watermarkImage.height / 2);

        // 恢复状态
        this.ctx.restore();
    },

    applyTextWatermark: function() {
        const text = document.getElementById('watermark-text')?.value || 'WATERMARK';
        const fontSize = parseFloat(document.getElementById('font-size')?.value || 36);
        const fontColor = document.getElementById('font-color')?.value || '#ffffff';
        const fontFamily = document.getElementById('font-family')?.value || 'Arial';
        const opacity = parseFloat(document.getElementById('opacity')?.value || 50) / 100;
        const rotation = parseFloat(document.getElementById('rotation')?.value || 0);
        const xOffset = parseFloat(document.getElementById('x-offset')?.value || 0);
        const yOffset = parseFloat(document.getElementById('y-offset')?.value || 0);
        const blendMode = document.getElementById('blend-mode')?.value || 'normal';

        // 设置字体
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = fontColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // 计算文字位置
        const position = this.getWatermarkPosition();
        const x = position.x + xOffset;
        const y = position.y + yOffset;

        // 保存当前状态
        this.ctx.save();

        // 设置透明度和混合模式
        this.ctx.globalAlpha = opacity;
        this.ctx.globalCompositeOperation = blendMode;

        // 移动到文字位置
        this.ctx.translate(x, y);

        // 应用旋转
        if (rotation !== 0) {
            this.ctx.rotate((rotation * Math.PI) / 180);
        }

        // 绘制文字
        this.ctx.fillText(text, 0, 0);

        // 恢复状态
        this.ctx.restore();
    },

    getWatermarkPosition: function() {
        const activePositionBtn = document.querySelector('.position-btn.active');
        const position = activePositionBtn?.dataset.position || 'center';

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // 估算水印尺寸
        let watermarkWidth, watermarkHeight;

        if (this.watermarkImage) {
            const scale = parseFloat(document.getElementById('scale')?.value || 100) / 100;
            watermarkWidth = this.watermarkImage.width * scale;
            watermarkHeight = this.watermarkImage.height * scale;
        } else {
            // 文字水印的估算尺寸
            const fontSize = parseFloat(document.getElementById('font-size')?.value || 36);
            const text = document.getElementById('watermark-text')?.value || 'WATERMARK';
            watermarkWidth = text.length * fontSize * 0.6; // 粗略估算
            watermarkHeight = fontSize;
        }

        let x, y;

        switch(position) {
            case 'top-left':
                x = watermarkWidth / 2;
                y = watermarkHeight / 2;
                break;
            case 'top-center':
                x = canvasWidth / 2;
                y = watermarkHeight / 2;
                break;
            case 'top-right':
                x = canvasWidth - watermarkWidth / 2;
                y = watermarkHeight / 2;
                break;
            case 'center-left':
                x = watermarkWidth / 2;
                y = canvasHeight / 2;
                break;
            case 'center':
                x = canvasWidth / 2;
                y = canvasHeight / 2;
                break;
            case 'center-right':
                x = canvasWidth - watermarkWidth / 2;
                y = canvasHeight / 2;
                break;
            case 'bottom-left':
                x = watermarkWidth / 2;
                y = canvasHeight - watermarkHeight / 2;
                break;
            case 'bottom-center':
                x = canvasWidth / 2;
                y = canvasHeight - watermarkHeight / 2;
                break;
            case 'bottom-right':
                x = canvasWidth - watermarkWidth / 2;
                y = canvasHeight - watermarkHeight / 2;
                break;
            default:
                x = canvasWidth / 2;
                y = canvasHeight / 2;
        }

        return { x, y };
    },

    applyWatermark: function() {
        this.updateWatermark();
    },
    
    previewWatermark: function() {
        this.updateWatermark();
    },

    downloadResult: function() {
        if (!this.canvas) return;

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'watermarked_image.png';
        link.href = this.canvas.toDataURL('image/png');

        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    loadNewImage: function() {
        // 重置所有控制项到默认值
        const controls = [
            { id: 'x-offset', value: 0 },
            { id: 'y-offset', value: 0 },
            { id: 'opacity', value: 50 },
            { id: 'scale', value: 100 },
            { id: 'rotation', value: 0 },
            { id: 'font-size', value: 36 },
            { id: 'watermark-text', value: 'WATERMARK' },
            { id: 'font-color', value: '#ffffff' },
            { id: 'font-family', value: 'Arial' },
            { id: 'blend-mode', value: 'normal' }
        ];

        controls.forEach(control => {
            const element = document.getElementById(control.id);
            if (element) {
                element.value = control.value;
                // 触发input事件来更新显示值
                if (element.type === 'range' || element.type === 'text') {
                    element.dispatchEvent(new Event('input'));
                }
            }
        });

        // 重置位置按钮
        document.querySelectorAll('.position-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-position="center"]')?.classList.add('active');

        // 重置文件输入框
        const mainImageInput = document.getElementById('main-image-input');
        const watermarkImageInput = document.getElementById('watermark-image-input');

        if (mainImageInput) {
            mainImageInput.value = '';
            const newMainInput = mainImageInput.cloneNode(true);
            mainImageInput.parentNode.replaceChild(newMainInput, mainImageInput);
            newMainInput.addEventListener('change', (e) => this.handleMainImageUpload(e));
        }

        if (watermarkImageInput) {
            watermarkImageInput.value = '';
            const newWatermarkInput = watermarkImageInput.cloneNode(true);
            watermarkImageInput.parentNode.replaceChild(newWatermarkInput, watermarkImageInput);
            newWatermarkInput.addEventListener('change', (e) => this.handleWatermarkImageUpload(e));
        }

        // 清除水印预览
        const watermarkPreview = document.querySelector('.watermark-preview');
        if (watermarkPreview) {
            watermarkPreview.remove();
        }

        // 显示上传区域，隐藏处理区域
        document.querySelector('.upload-section').classList.remove('d-none');
        document.getElementById('processing-section').classList.add('d-none');

        // 清理当前图像
        this.currentImage = null;
        this.watermarkImage = null;
        this.canvas = null;
        this.ctx = null;

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已重置，可以上传新图像', 'info');
        }
    },

    createTextWatermark: function() {
        // 切换到文字标签页
        this.switchTab('text');

        // 清除图像水印，使用文字水印
        this.watermarkImage = null;

        // 设置默认文字水印
        const watermarkText = document.getElementById('watermark-text');
        if (watermarkText && !watermarkText.value.trim()) {
            watermarkText.value = 'WATERMARK';
        }

        // 检查是否可以进入处理界面
        this.checkReadyToProcess();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已切换到文字水印模式', 'info');
        }
    },

    createLogoWatermark: function() {
        // 创建一个简单的logo水印
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');

        // 创建渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 120, 120);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        // 绘制圆形logo
        ctx.beginPath();
        ctx.arc(60, 60, 50, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 添加文字
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LOGO', 60, 60);

        // 转换为图像并处理透明度
        const img = new Image();
        img.onload = () => {
            this.watermarkImage = this.processWatermarkTransparency(img);
            this.isTextWatermarkMode = false; // 清除文字水印模式
            this.showWatermarkPreview(this.watermarkImage);

            // 检查是否可以进入处理界面
            this.checkReadyToProcess();

            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('Logo水印已创建', 'success');
            }
        };
        img.src = canvas.toDataURL('image/png');
    },

    processWatermarkTransparency: function(img) {
        // 创建临时画布处理水印透明度
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');

        // 绘制原始水印图像
        tempCtx.drawImage(img, 0, 0);

        // 获取图像数据
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        // 检测背景色（假设左上角像素为背景色）
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        // 设置容差值
        const tolerance = 30;

        // 将相似背景色设为透明
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 计算颜色差异
            const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);

            if (diff < tolerance) {
                data[i + 3] = 0; // 设为透明
            }
        }

        // 将处理后的数据放回画布
        tempCtx.putImageData(imageData, 0, 0);

        // 创建新的图像对象
        const processedImg = new Image();
        processedImg.src = tempCanvas.toDataURL('image/png');

        return processedImg;
    },

    showWatermarkPreview: function(watermarkImg) {
        // 在水印上传区域显示预览
        const watermarkUploadArea = document.getElementById('watermark-upload-area');
        if (watermarkUploadArea) {
            // 移除现有预览
            const existingPreview = watermarkUploadArea.querySelector('.watermark-preview');
            if (existingPreview) {
                existingPreview.remove();
            }

            // 创建预览元素
            const preview = document.createElement('div');
            preview.className = 'watermark-preview';
            preview.style.cssText = `
                margin-top: 1rem;
                text-align: center;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 8px;
                border: 2px solid var(--primary-color);
            `;

            const previewImg = document.createElement('img');
            previewImg.src = watermarkImg.src;
            previewImg.style.cssText = `
                max-width: 100px;
                max-height: 100px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            `;

            const previewText = document.createElement('p');
            previewText.textContent = '水印预览（已处理透明度）';
            previewText.style.cssText = `
                margin: 0.5rem 0 0 0;
                font-size: 0.8rem;
                color: var(--text-light);
            `;

            preview.appendChild(previewImg);
            preview.appendChild(previewText);
            watermarkUploadArea.appendChild(preview);
        }
    },

    cleanup: function() {
        // 清理资源
        this.currentImage = null;
        this.watermarkImage = null;
        this.canvas = null;
        this.ctx = null;
        this.isTextWatermarkMode = false;
    }
};
