// 图像加密模块 - 重写版本
window.ImageEncryption = {
    container: null,
    currentImage: null,
    originalImageData: null,
    canvas: null,
    ctx: null,

    // 行列置换相关
    rowOrder: null,
    colOrder: null,

    // Arnold加密相关
    arnoldParams: { a: 1, b: 1 },
    encryptionSteps: [],
    
    init: function(container) {
        this.container = container;
        this.render();
        this.setupEventListeners();
    },
    
    render: function() {
        this.container.innerHTML = `
            <div class="encryption-workspace">
                <!-- 图像上传区域 -->
                <div class="upload-section">
                    <div class="upload-area" id="upload-area">
                        <div class="upload-content">
                            <div class="upload-icon">🔐</div>
                            <h3>选择要加密的图像</h3>
                            <p>支持 JPG、PNG、GIF 格式</p>
                            <input type="file" id="image-input" accept="image/*" style="display: none;">
                            <button class="upload-btn" onclick="document.getElementById('image-input').click()">
                                选择文件
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 加密处理区域 -->
                <div class="processing-section d-none" id="processing-section">
                    <!-- 图像裁剪区域 (仅Arnold加密需要) -->
                    <div class="crop-section d-none" id="crop-section">
                        <div class="crop-container">
                            <h4>图像裁剪 - Arnold加密需要正方形图像</h4>
                            <p>请拖拽选择一个正方形区域进行裁剪</p>
                            <div class="crop-area">
                                <canvas id="crop-canvas" class="crop-canvas"></canvas>
                                <div class="crop-overlay" id="crop-overlay">
                                    <div class="crop-box" id="crop-box"></div>
                                </div>
                            </div>
                            <div class="crop-controls">
                                <button class="crop-btn" id="confirm-crop">确认裁剪</button>
                                <button class="crop-btn secondary" id="cancel-crop">取消</button>
                            </div>
                        </div>
                    </div>

                    <div class="encryption-methods">
                        <div class="method-tabs">
                            <button class="tab-btn active" data-method="rowcol">行列置换</button>
                            <button class="tab-btn" data-method="arnold">Arnold变换</button>
                        </div>

                        <!-- 行列置换 -->
                        <div class="method-content active" id="rowcol-method">
                            <div class="method-description">
                                <h4>行列置换算法</h4>
                                <p>通过随机打乱图像的行和列顺序实现置换，支持分步骤演示</p>
                            </div>

                            <div class="rowcol-controls">
                                <div class="control-group">
                                    <label>置换类型:</label>
                                    <select id="rowcol-type">
                                        <option value="row">仅行置换</option>
                                        <option value="col">仅列置换</option>
                                        <option value="both">行列置换</option>
                                    </select>
                                </div>
                                <div class="control-group">
                                    <button class="encrypt-btn" data-action="rowcol-encrypt">开始置换</button>
                                    <button class="encrypt-btn" data-action="rowcol-decrypt">逆置换</button>
                                    <button class="encrypt-btn secondary" data-action="rowcol-demo">演示过程</button>
                                </div>
                            </div>
                        </div>

                        <!-- Arnold变换 -->
                        <div class="method-content" id="arnold-method">
                            <div class="method-description">
                                <h4>Arnold变换加密</h4>
                                <p>基于Arnold映射的图像置乱算法，需要正方形图像</p>
                            </div>

                            <div class="arnold-controls">
                                <div class="control-group">
                                    <label>参数 a:</label>
                                    <input type="number" id="arnold-a" min="1" max="10" value="1">
                                </div>
                                <div class="control-group">
                                    <label>参数 b:</label>
                                    <input type="number" id="arnold-b" min="1" max="10" value="1">
                                </div>
                                <div class="control-group">
                                    <label>迭代次数:</label>
                                    <input type="range" id="arnold-iterations" min="1" max="20" value="5">
                                    <span id="arnold-iterations-value">5</span>
                                </div>
                                <div class="control-group">
                                    <button class="encrypt-btn" data-action="arnold-encrypt">开始加密</button>
                                    <button class="encrypt-btn" data-action="arnold-decrypt">解密</button>
                                    <button class="encrypt-btn secondary" data-action="arnold-demo">演示过程</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 图像显示区域 -->
                    <div class="image-display">
                        <div class="image-container">
                            <h4>原始图像</h4>
                            <div class="image-upload-area" id="original-image-area">
                                <img id="original-image" class="preview-image" alt="原始图像" style="display: none;">
                                <div class="upload-placeholder" id="upload-placeholder">
                                    <div class="upload-icon">📁</div>
                                    <p>点击上传图像</p>
                                    <input type="file" id="direct-image-input" accept="image/*" style="display: none;">
                                </div>
                            </div>
                        </div>
                        <div class="image-swap-container">
                            <button class="swap-btn" id="swap-images" title="将右图设为左图">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M7 13l5 5 5-5"></path>
                                    <path d="M7 6l5 5 5-5"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="image-container">
                            <h4>置换结果</h4>
                            <canvas id="result-canvas" class="preview-image"></canvas>
                        </div>
                    </div>

                    <!-- 演示区域 -->
                    <div class="demo-section d-none" id="demo-section">
                        <h4>置换过程演示</h4>
                        <div class="demo-steps" id="demo-steps">
                            <!-- 动态生成演示步骤 -->
                        </div>
                        <div class="demo-controls">
                            <p class="demo-hint">点击任意子图可放大查看</p>
                        </div>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <button class="action-btn secondary" id="download-btn">下载结果</button>
                        <button class="action-btn primary" id="new-image-btn">处理新图像</button>
                    </div>
                </div>
            </div>
            
            <style>
                .encryption-workspace {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                /* 裁剪区域样式 */
                .crop-section {
                    background: var(--background-light);
                    border-radius: 12px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .crop-area {
                    position: relative;
                    display: inline-block;
                    margin: 1rem 0;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .crop-canvas {
                    display: block;
                    max-width: 100%;
                    max-height: 400px;
                }

                .crop-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    cursor: crosshair;
                }

                .crop-box {
                    position: absolute;
                    border: 2px solid var(--primary-color);
                    background: rgba(102, 126, 234, 0.2);
                    cursor: move;
                }

                .crop-controls {
                    margin-top: 1rem;
                }

                .crop-btn {
                    padding: 0.75rem 1.5rem;
                    margin: 0 0.5rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .crop-btn.secondary {
                    background: var(--background-light);
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                }

                .crop-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
                
                .upload-btn {
                    padding: 0.75rem 2rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 1rem;
                }
                
                .encryption-methods {
                    background: var(--background-light);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .method-tabs {
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
                
                .method-content {
                    display: none;
                }
                
                .method-content.active {
                    display: block;
                }
                
                .method-description {
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 8px;
                    border-left: 4px solid var(--primary-color);
                }
                
                .method-description h4 {
                    margin-bottom: 0.5rem;
                    color: var(--text-color);
                }
                
                .method-description p {
                    color: var(--text-light);
                    font-size: 0.9rem;
                }
                
                .control-group {
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .control-group label {
                    min-width: 100px;
                    font-weight: 500;
                }
                
                .encrypt-btn {
                    padding: 0.5rem 1rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-right: 0.5rem;
                }
                
                .encrypt-btn.secondary {
                    background: var(--background-light);
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                }
                
                .image-display {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    align-items: center;
                }

                .image-swap-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .swap-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .swap-btn:hover {
                    background: var(--primary-hover);
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                }

                .swap-btn svg {
                    transform: rotate(90deg);
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

                .image-upload-area {
                    position: relative;
                    min-height: 200px;
                    border: 2px dashed var(--border-color);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .image-upload-area:hover {
                    border-color: var(--primary-color);
                    background: rgba(102, 126, 234, 0.05);
                }

                .image-upload-area.has-image {
                    border: none;
                    cursor: default;
                }

                .image-upload-area.has-image:hover {
                    background: transparent;
                }

                .upload-placeholder {
                    text-align: center;
                    color: var(--text-muted);
                }

                .upload-placeholder .upload-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .upload-placeholder p {
                    margin: 0;
                    font-size: 0.9rem;
                }
                
                .demo-section {
                    background: var(--background-light);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .demo-steps {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .demo-step {
                    text-align: center;
                    padding: 1rem;
                    background: white;
                    border-radius: 8px;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .demo-step:hover {
                    border-color: var(--primary-color);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
                    transform: translateY(-2px);
                }

                .demo-step canvas {
                    width: 100%;
                    max-width: 120px;
                    border-radius: 4px;
                    margin-bottom: 0.5rem;
                    transition: transform 0.3s ease;
                }

                .demo-step:hover canvas {
                    transform: scale(1.05);
                }

                .demo-hint {
                    text-align: center;
                    color: var(--text-light);
                    font-size: 0.9rem;
                    margin: 0;
                    font-style: italic;
                }
                
                .demo-controls {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                }
                
                .demo-btn {
                    padding: 0.5rem 1rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
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
                    
                    .control-group {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                    }
                    
                    .demo-steps {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>
        `;
    },
    
    setupEventListeners: function() {
        // 文件上传
        const imageInput = document.getElementById('image-input');
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

        // 直接上传功能
        const directImageInput = document.getElementById('direct-image-input');
        const uploadPlaceholder = document.getElementById('upload-placeholder');
        const originalImageArea = document.getElementById('original-image-area');

        if (directImageInput && uploadPlaceholder && originalImageArea) {
            directImageInput.addEventListener('change', (e) => this.handleImageUpload(e));

            uploadPlaceholder.addEventListener('click', () => {
                directImageInput.click();
            });

            originalImageArea.addEventListener('click', (e) => {
                if (!this.currentImage && e.target.closest('.upload-placeholder')) {
                    directImageInput.click();
                }
            });
        }

        // 方法切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchMethod(btn.dataset.method));
        });

        // 加密按钮
        const encryptBtns = document.querySelectorAll('.encrypt-btn');
        encryptBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleEncryption(btn.dataset.action));
        });

        // Arnold参数和迭代次数
        const arnoldA = document.getElementById('arnold-a');
        const arnoldB = document.getElementById('arnold-b');
        const arnoldIterations = document.getElementById('arnold-iterations');
        const arnoldIterationsValue = document.getElementById('arnold-iterations-value');

        if (arnoldA) arnoldA.addEventListener('change', () => this.updateArnoldParams());
        if (arnoldB) arnoldB.addEventListener('change', () => this.updateArnoldParams());
        if (arnoldIterations) {
            arnoldIterations.addEventListener('input', () => {
                arnoldIterationsValue.textContent = arnoldIterations.value;
            });
        }

        // 裁剪相关事件
        this.setupCropEvents();

        // 操作按钮事件监听器
        this.setupActionButtons();

        // 图像交换按钮
        const swapBtn = document.getElementById('swap-images');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapImages());
        }
    },
    
    handleImageUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    },
    
    loadImage: function(file) {
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
                this.showProcessingSection();
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
        
        // 保存原始图像数据
        this.originalImageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    },
    
    showProcessingSection: function() {
        document.querySelector('.upload-section').classList.add('d-none');
        document.getElementById('processing-section').classList.remove('d-none');

        // 更新原始图像显示
        this.updateOriginalImageDisplay();

        // 显示滑块重置功能提示
        if (window.ImageLabUtils && window.ImageLabUtils.showSliderResetTip) {
            // 延迟1秒显示，让用户先看到界面
            setTimeout(() => {
                window.ImageLabUtils.showSliderResetTip();
            }, 1000);
        }
    },

    updateOriginalImageDisplay: function() {
        const originalImage = document.getElementById('original-image');
        const uploadPlaceholder = document.getElementById('upload-placeholder');
        const originalImageArea = document.getElementById('original-image-area');

        if (this.currentImage && originalImage) {
            originalImage.src = this.currentImage.src;
            originalImage.style.display = 'block';
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
            if (originalImageArea) originalImageArea.classList.add('has-image');
        } else {
            if (originalImage) originalImage.style.display = 'none';
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
            if (originalImageArea) originalImageArea.classList.remove('has-image');
        }
    },
    
    switchMethod: function(method) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-method="${method}"]`).classList.add('active');

        // 更新方法内容
        document.querySelectorAll('.method-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${method}-method`).classList.add('active');

        // 清空当前图片，允许重新上传
        this.clearCurrentImages();

        // 显示上传区域，隐藏处理区域
        document.querySelector('.upload-section').classList.remove('d-none');
        document.getElementById('processing-section').classList.add('d-none');

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification(`已切换到${method === 'rowcol' ? '行列置换' : 'Arnold变换'}模式`, 'info');
        }
    },

    clearCurrentImages: function() {
        // 清理当前图像和相关数据
        this.currentImage = null;
        this.originalImageData = null;
        this.canvas = null;
        this.ctx = null;
        this.lastRowOrder = null;
        this.lastColOrder = null;

        // 更新原始图像显示
        this.updateOriginalImageDisplay();

        // 清空结果画布
        const resultCanvas = document.getElementById('result-canvas');
        if (resultCanvas) {
            const ctx = resultCanvas.getContext('2d');
            ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
        }

        // 重置文件输入框
        const imageInput = document.getElementById('image-input');
        const directImageInput = document.getElementById('direct-image-input');

        if (imageInput) {
            imageInput.value = '';
        }

        if (directImageInput) {
            directImageInput.value = '';
        }
    },
    
    handleEncryption: function(action) {
        switch(action) {
            case 'rowcol-encrypt':
                this.rowColEncrypt();
                break;
            case 'rowcol-decrypt':
                this.rowColDecrypt();
                break;
            case 'rowcol-demo':
                this.rowColDemo();
                break;
            case 'arnold-encrypt':
                this.arnoldEncrypt();
                break;
            case 'arnold-decrypt':
                this.arnoldDecrypt();
                break;
            case 'arnold-demo':
                this.arnoldDemo();
                break;
        }
    },

    // 行列置换功能
    rowColEncrypt: function() {
        if (!this.originalImageData) return;

        const type = document.getElementById('rowcol-type').value;

        // 清理之前的序列
        this.rowOrder = null;
        this.colOrder = null;

        const imageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        let result = imageData;

        if (type === 'row' || type === 'both') {
            result = this.scrambleRows(result);
        }

        if (type === 'col' || type === 'both') {
            result = this.scrambleColumns(result);
        }

        this.ctx.putImageData(result, 0, 0);

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('行列置换完成', 'success');
        }
    },

    rowColDecrypt: function() {
        const type = document.getElementById('rowcol-type').value;

        // 检查是否有对应的加密序列
        let hasRequiredSequence = false;
        if (type === 'row' && this.rowOrder) {
            hasRequiredSequence = true;
        } else if (type === 'col' && this.colOrder) {
            hasRequiredSequence = true;
        } else if (type === 'both' && this.rowOrder && this.colOrder) {
            hasRequiredSequence = true;
        }

        if (!hasRequiredSequence) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification(`请先执行${type === 'row' ? '行' : type === 'col' ? '列' : '行列'}加密操作`, 'warning');
            }
            return;
        }

        let currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // 逆置换顺序与置换相反
        if (type === 'col' || type === 'both') {
            currentImageData = this.unscrambleColumns(currentImageData);
        }

        if (type === 'row' || type === 'both') {
            currentImageData = this.unscrambleRows(currentImageData);
        }

        this.ctx.putImageData(currentImageData, 0, 0);

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('行列逆置换完成', 'success');
        }
    },
    
    // 行置换 - 基于MATLAB代码实现
    scrambleRows: function(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = new Uint8ClampedArray(imageData.data);

        // 生成随机行序列 (类似MATLAB的randsample)
        this.rowOrder = this.generateRandomSequence(height);

        // 创建新的图像数据
        const newImageData = new ImageData(width, height);
        const newData = newImageData.data;

        // 按照随机序列重排行
        for (let i = 0; i < height; i++) {
            const newRowIndex = this.rowOrder[i];
            for (let j = 0; j < width; j++) {
                const oldIndex = (i * width + j) * 4;
                const newIndex = (newRowIndex * width + j) * 4;

                newData[newIndex] = data[oldIndex];         // R
                newData[newIndex + 1] = data[oldIndex + 1]; // G
                newData[newIndex + 2] = data[oldIndex + 2]; // B
                newData[newIndex + 3] = data[oldIndex + 3]; // A
            }
        }

        return newImageData;
    },

    // 列置换
    scrambleColumns: function(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = new Uint8ClampedArray(imageData.data);

        // 生成随机列序列
        this.colOrder = this.generateRandomSequence(width);

        // 创建新的图像数据
        const newImageData = new ImageData(width, height);
        const newData = newImageData.data;

        // 按照随机序列重排列
        for (let j = 0; j < width; j++) {
            const newColIndex = this.colOrder[j];
            for (let i = 0; i < height; i++) {
                const oldIndex = (i * width + j) * 4;
                const newIndex = (i * width + newColIndex) * 4;

                newData[newIndex] = data[oldIndex];         // R
                newData[newIndex + 1] = data[oldIndex + 1]; // G
                newData[newIndex + 2] = data[oldIndex + 2]; // B
                newData[newIndex + 3] = data[oldIndex + 3]; // A
            }
        }

        return newImageData;
    },

    // 行逆置换
    unscrambleRows: function(imageData) {
        if (!this.rowOrder) return imageData;

        const width = imageData.width;
        const height = imageData.height;
        const data = new Uint8ClampedArray(imageData.data);

        // 创建逆序列
        const inverseOrder = new Array(height);
        for (let i = 0; i < height; i++) {
            inverseOrder[this.rowOrder[i]] = i;
        }

        // 创建新的图像数据
        const newImageData = new ImageData(width, height);
        const newData = newImageData.data;

        // 逆向还原行
        for (let i = 0; i < height; i++) {
            const originalRowIndex = inverseOrder[i];
            for (let j = 0; j < width; j++) {
                const oldIndex = (i * width + j) * 4;
                const newIndex = (originalRowIndex * width + j) * 4;

                newData[newIndex] = data[oldIndex];         // R
                newData[newIndex + 1] = data[oldIndex + 1]; // G
                newData[newIndex + 2] = data[oldIndex + 2]; // B
                newData[newIndex + 3] = data[oldIndex + 3]; // A
            }
        }

        return newImageData;
    },

    // 列逆置换
    unscrambleColumns: function(imageData) {
        if (!this.colOrder) return imageData;

        const width = imageData.width;
        const height = imageData.height;
        const data = new Uint8ClampedArray(imageData.data);

        // 创建逆序列
        const inverseOrder = new Array(width);
        for (let j = 0; j < width; j++) {
            inverseOrder[this.colOrder[j]] = j;
        }

        // 创建新的图像数据
        const newImageData = new ImageData(width, height);
        const newData = newImageData.data;

        // 逆向还原列
        for (let j = 0; j < width; j++) {
            const originalColIndex = inverseOrder[j];
            for (let i = 0; i < height; i++) {
                const oldIndex = (i * width + j) * 4;
                const newIndex = (i * width + originalColIndex) * 4;

                newData[newIndex] = data[oldIndex];         // R
                newData[newIndex + 1] = data[oldIndex + 1]; // G
                newData[newIndex + 2] = data[oldIndex + 2]; // B
                newData[newIndex + 3] = data[oldIndex + 3]; // A
            }
        }

        return newImageData;
    },

    // 生成随机序列 (类似MATLAB的randsample)
    generateRandomSequence: function(length) {
        const sequence = Array.from({length}, (_, i) => i);

        // Fisher-Yates洗牌算法
        for (let i = length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }

        return sequence;
    },

    // Arnold加密 - 基于Python代码实现
    arnoldEncrypt: function() {
        if (!this.originalImageData) return;

        // 检查是否为正方形图像
        if (this.originalImageData.width !== this.originalImageData.height) {
            this.showCropSection();
            return;
        }

        const iterations = parseInt(document.getElementById('arnold-iterations').value);
        this.updateArnoldParams();

        let currentImageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        // 执行Arnold变换
        for (let i = 0; i < iterations; i++) {
            currentImageData = this.applyArnoldTransform(currentImageData);
        }

        this.ctx.putImageData(currentImageData, 0, 0);

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification(`Arnold加密完成 (${iterations}次迭代)`, 'success');
        }
    },

    arnoldDecrypt: function() {
        if (!this.originalImageData) return;

        const iterations = parseInt(document.getElementById('arnold-iterations').value);
        this.updateArnoldParams();

        let currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // 执行Arnold逆变换
        for (let i = 0; i < iterations; i++) {
            currentImageData = this.applyInverseArnoldTransform(currentImageData);
        }

        this.ctx.putImageData(currentImageData, 0, 0);

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification(`Arnold解密完成 (${iterations}次逆迭代)`, 'success');
        }
    },

    updateArnoldParams: function() {
        const a = parseInt(document.getElementById('arnold-a').value) || 1;
        const b = parseInt(document.getElementById('arnold-b').value) || 1;
        this.arnoldParams = { a, b };
    },

    arnoldStepDemo: function() {
        if (!this.originalImageData) return;

        const iterations = parseInt(document.getElementById('arnold-iterations').value);
        this.showArnoldStepByStep(iterations);
    },
    
    scrambleEncrypt: function() {
        if (!this.originalImageData) return;

        const type = document.getElementById('scramble-type').value;
        let resultImageData;

        switch(type) {
            case 'row':
                resultImageData = this.scrambleRows(this.originalImageData);
                break;
            case 'column':
                resultImageData = this.scrambleColumns(this.originalImageData);
                break;
            case 'both':
                // 先行置乱，再列置乱
                const rowScrambled = this.scrambleRows(this.originalImageData);
                resultImageData = this.scrambleColumns(rowScrambled);
                break;
            default:
                return;
        }

        this.ctx.putImageData(resultImageData, 0, 0);
    },

    scrambleDecrypt: function() {
        if (!this.lastRowOrder && !this.lastColOrder) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('请先执行置换操作以生成逆置换序列', 'warning');
            }
            return;
        }

        const type = document.getElementById('scramble-type').value;

        // 获取当前画布内容
        let currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let resultImageData;

        switch(type) {
            case 'row':
                if (!this.lastRowOrder) {
                    if (window.ImageLabUtils) {
                        window.ImageLabUtils.showNotification('没有行置乱序列，请先执行行置乱', 'warning');
                    }
                    return;
                }
                resultImageData = this.unscrambleRows(currentImageData);
                break;
            case 'column':
                if (!this.lastColOrder) {
                    if (window.ImageLabUtils) {
                        window.ImageLabUtils.showNotification('没有列置乱序列，请先执行列置乱', 'warning');
                    }
                    return;
                }
                resultImageData = this.unscrambleColumns(currentImageData);
                break;
            case 'both':
                if (!this.lastRowOrder || !this.lastColOrder) {
                    if (window.ImageLabUtils) {
                        window.ImageLabUtils.showNotification('没有完整的置乱序列，请先执行行列置乱', 'warning');
                    }
                    return;
                }
                // 逆序：先列解乱，再行解乱
                const colUnscrambled = this.unscrambleColumns(currentImageData);
                resultImageData = this.unscrambleRows(colUnscrambled);
                break;
            default:
                return;
        }

        this.ctx.putImageData(resultImageData, 0, 0);

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('像素置乱逆置换完成', 'success');
        }
    },

    scrambleDemo: function() {
        if (!this.originalImageData) return;

        const type = document.getElementById('scramble-type').value;
        this.showScrambleStepByStep(type);
    },
    
    // Arnold变换 - 基于Python代码的encode函数
    applyArnoldTransform: function(imageData) {
        const N = imageData.width; // 正方形图像
        const data = imageData.data;
        const { a, b } = this.arnoldParams;

        // 创建新的图像数据
        const newImageData = new ImageData(N, N);
        const newData = newImageData.data;

        for (let ori_h = 0; ori_h < N; ori_h++) {
            for (let ori_w = 0; ori_w < N; ori_w++) {
                // Arnold变换公式
                const new_h = (1 * ori_h + a * ori_w) % N;
                const new_w = (b * ori_h + (a * b + 1) * ori_w) % N;

                // 计算像素索引
                const oldIndex = (ori_h * N + ori_w) * 4;
                const newIndex = (new_h * N + new_w) * 4;

                // 复制像素数据
                newData[newIndex] = data[oldIndex];         // R
                newData[newIndex + 1] = data[oldIndex + 1]; // G
                newData[newIndex + 2] = data[oldIndex + 2]; // B
                newData[newIndex + 3] = data[oldIndex + 3]; // A
            }
        }

        return newImageData;
    },

    calculateArnoldPeriod: function(width, height) {
        // Arnold变换的周期计算
        // 对于标准Arnold映射 [[1,1],[1,2]]，周期与图像尺寸相关
        // 这里使用一个简化的周期估算方法

        // 对于正方形图像，周期通常较小
        if (width === height) {
            // 常见的周期值
            const commonPeriods = [3, 6, 12, 24, 48, 96];
            for (let period of commonPeriods) {
                if (width % period === 0) {
                    return period;
                }
            }
            return Math.min(width, 96); // 最大周期限制
        }

        // 对于非正方形图像，使用更复杂的计算
        const gcd = this.gcd(width, height);
        return Math.min(gcd * 6, 96);
    },

    gcd: function(a, b) {
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    },

    // Arnold逆变换 - 基于Python代码的decode函数
    applyInverseArnoldTransform: function(imageData) {
        const N = imageData.width; // 正方形图像
        const data = imageData.data;
        const { a, b } = this.arnoldParams;

        // 创建新的图像数据
        const newImageData = new ImageData(N, N);
        const newData = newImageData.data;

        for (let new_h = 0; new_h < N; new_h++) {
            for (let new_w = 0; new_w < N; new_w++) {
                // Arnold逆变换公式
                let rec_h = ((a * b + 1) * new_h + (-a) * new_w) % N;
                let rec_w = ((-b) * new_h + new_w) % N;

                // 处理负数模运算
                if (rec_h < 0) rec_h += N;
                if (rec_w < 0) rec_w += N;

                // 计算像素索引
                const oldIndex = (new_h * N + new_w) * 4;
                const newIndex = (rec_h * N + rec_w) * 4;

                // 复制像素数据
                newData[newIndex] = data[oldIndex];         // R
                newData[newIndex + 1] = data[oldIndex + 1]; // G
                newData[newIndex + 2] = data[oldIndex + 2]; // B
                newData[newIndex + 3] = data[oldIndex + 3]; // A
            }
        }

        return newImageData;
    },

    // 图像裁剪功能
    showCropSection: function() {
        const cropSection = document.getElementById('crop-section');
        cropSection.classList.remove('d-none');

        // 设置裁剪画布
        const cropCanvas = document.getElementById('crop-canvas');
        const cropCtx = cropCanvas.getContext('2d');

        // 计算合适的显示尺寸
        const maxSize = 400;
        const scale = Math.min(maxSize / this.currentImage.width, maxSize / this.currentImage.height);

        cropCanvas.width = this.currentImage.width * scale;
        cropCanvas.height = this.currentImage.height * scale;

        // 绘制图像
        cropCtx.drawImage(this.currentImage, 0, 0, cropCanvas.width, cropCanvas.height);

        // 初始化裁剪框
        this.initializeCropBox();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('Arnold加密需要正方形图像，请选择裁剪区域', 'info');
        }
    },

    initializeCropBox: function() {
        const cropCanvas = document.getElementById('crop-canvas');
        const cropBox = document.getElementById('crop-box');
        const cropOverlay = document.getElementById('crop-overlay');

        // 计算初始正方形裁剪框
        const size = Math.min(cropCanvas.width, cropCanvas.height) * 0.8;
        const left = (cropCanvas.width - size) / 2;
        const top = (cropCanvas.height - size) / 2;

        cropBox.style.left = left + 'px';
        cropBox.style.top = top + 'px';
        cropBox.style.width = size + 'px';
        cropBox.style.height = size + 'px';

        this.cropData = { left, top, size };

        // 添加拖拽功能
        this.setupCropDrag();
    },

    setupCropDrag: function() {
        const cropBox = document.getElementById('crop-box');
        const cropOverlay = document.getElementById('crop-overlay');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        cropBox.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = this.cropData.left;
            startTop = this.cropData.top;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const newLeft = Math.max(0, Math.min(startLeft + deltaX, cropOverlay.clientWidth - this.cropData.size));
            const newTop = Math.max(0, Math.min(startTop + deltaY, cropOverlay.clientHeight - this.cropData.size));

            this.cropData.left = newLeft;
            this.cropData.top = newTop;

            cropBox.style.left = newLeft + 'px';
            cropBox.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    },

    setupCropEvents: function() {
        const confirmCrop = document.getElementById('confirm-crop');
        const cancelCrop = document.getElementById('cancel-crop');

        if (confirmCrop) {
            confirmCrop.addEventListener('click', () => this.applyCrop());
        }

        if (cancelCrop) {
            cancelCrop.addEventListener('click', () => this.cancelCrop());
        }
    },

    applyCrop: function() {
        const cropCanvas = document.getElementById('crop-canvas');
        const scale = this.currentImage.width / cropCanvas.width;

        // 计算实际裁剪区域
        const actualLeft = this.cropData.left * scale;
        const actualTop = this.cropData.top * scale;
        const actualSize = this.cropData.size * scale;

        // 创建裁剪后的画布
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = actualSize;
        croppedCanvas.height = actualSize;
        const croppedCtx = croppedCanvas.getContext('2d');

        // 裁剪图像
        croppedCtx.drawImage(
            this.currentImage,
            actualLeft, actualTop, actualSize, actualSize,
            0, 0, actualSize, actualSize
        );

        // 更新当前图像
        const croppedImage = new Image();
        croppedImage.onload = () => {
            this.currentImage = croppedImage;
            this.setupCanvas();
            this.hideCropSection();

            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('图像裁剪完成，现在可以进行Arnold加密', 'success');
            }
        };
        croppedImage.src = croppedCanvas.toDataURL();
    },

    cancelCrop: function() {
        this.hideCropSection();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已取消裁剪', 'info');
        }
    },

    hideCropSection: function() {
        const cropSection = document.getElementById('crop-section');
        cropSection.classList.add('d-none');
    },

    // 演示功能
    rowColDemo: function() {
        if (!this.originalImageData) return;

        const type = document.getElementById('rowcol-type').value;
        this.showDemo('rowcol', type);
    },

    arnoldDemo: function() {
        if (!this.originalImageData) return;

        if (this.originalImageData.width !== this.originalImageData.height) {
            this.showCropSection();
            return;
        }

        const iterations = parseInt(document.getElementById('arnold-iterations').value);
        this.showDemo('arnold', iterations);
    },

    showDemo: function(type, param) {
        const demoSection = document.getElementById('demo-section');
        const demoSteps = document.getElementById('demo-steps');

        demoSection.classList.remove('d-none');
        demoSteps.innerHTML = '';

        if (type === 'rowcol') {
            this.generateRowColDemo(param);
        } else if (type === 'arnold') {
            this.generateArnoldDemo(param);
        }
    },

    generateRowColDemo: function(type) {
        const demoSteps = document.getElementById('demo-steps');

        // 添加原始图像
        this.addDemoStep(demoSteps, this.originalImageData, 0, '原始图像');

        let currentImageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        if (type === 'row' || type === 'both') {
            currentImageData = this.scrambleRows(currentImageData);
            this.addDemoStep(demoSteps, currentImageData, 1, '行置换');
        }

        if (type === 'col' || type === 'both') {
            currentImageData = this.scrambleColumns(currentImageData);
            const stepNum = type === 'both' ? 2 : 1;
            this.addDemoStep(demoSteps, currentImageData, stepNum, '列置换');
        }
    },

    generateArnoldDemo: function(iterations) {
        const demoSteps = document.getElementById('demo-steps');
        this.updateArnoldParams();

        // 添加原始图像
        this.addDemoStep(demoSteps, this.originalImageData, 0, '原始图像');

        let currentImageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        // 逐步应用Arnold变换
        for (let i = 1; i <= iterations; i++) {
            currentImageData = this.applyArnoldTransform(currentImageData);
            this.addDemoStep(demoSteps, currentImageData, i, `第${i}次迭代`);
        }
    },

    addDemoStep: function(container, imageData, stepNumber, title) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'demo-step';
        stepDiv.dataset.step = stepNumber;

        // 创建小画布显示步骤图像
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');

        // 缩放图像到小画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);

        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

        // 添加点击放大功能
        stepDiv.addEventListener('click', () => {
            this.showImageModal(tempCanvas.toDataURL(), title);
        });

        stepDiv.innerHTML = `
            <div class="step-title">${title}</div>
        `;
        stepDiv.appendChild(canvas);

        container.appendChild(stepDiv);
    },

    showImageModal: function(imageSrc, title) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
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
            padding: 2rem;
            max-width: 90vw;
            max-height: 90vh;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;

        modalContent.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--text-color);">${title}</h3>
            <img src="${imageSrc}" style="
                max-width: 100%;
                max-height: 70vh;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            ">
            <div style="margin-top: 1rem;">
                <button onclick="this.closest('.modal').remove()" style="
                    padding: 0.75rem 2rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                ">关闭</button>
            </div>
        `;

        modal.className = 'modal';
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // ESC键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    },

    setupDemoControls: function(totalSteps) {
        // 演示控制现在只是显示提示信息
        // 所有交互都通过点击子图实现
        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('演示已生成，点击任意子图可放大查看', 'info', 3000);
        }
    },



    showScrambleStepByStep: function(type) {
        const demoSection = document.getElementById('demo-section');
        const demoSteps = document.getElementById('demo-steps');

        // 显示演示区域
        demoSection.classList.remove('d-none');

        // 清空之前的步骤
        demoSteps.innerHTML = '';

        // 添加原始图像
        this.addDemoStep(demoSteps, this.originalImageData, 0, '原始图像');

        let currentImageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        switch(type) {
            case 'row':
                currentImageData = this.scrambleRows(currentImageData);
                this.addDemoStep(demoSteps, currentImageData, 1, '行置乱结果');
                break;

            case 'column':
                currentImageData = this.scrambleColumns(currentImageData);
                this.addDemoStep(demoSteps, currentImageData, 1, '列置乱结果');
                break;

            case 'both':
                // 先行置乱
                currentImageData = this.scrambleRows(currentImageData);
                this.addDemoStep(demoSteps, currentImageData, 1, '第一步：行置乱');

                // 再列置乱
                currentImageData = this.scrambleColumns(currentImageData);
                this.addDemoStep(demoSteps, currentImageData, 2, '第二步：列置乱');
                break;
        }

        // 设置演示控制
        const totalSteps = type === 'both' ? 2 : 1;
        this.setupDemoControls(totalSteps);
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
        if (!this.canvas) return;

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'encrypted_image.png';
        link.href = this.canvas.toDataURL('image/png');

        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    loadNewImage: function() {
        // 隐藏演示区域
        const demoSection = document.getElementById('demo-section');
        if (demoSection) {
            demoSection.classList.add('d-none');
        }

        // 重置迭代次数
        const arnoldIterations = document.getElementById('arnold-iterations');
        const arnoldIterationsValue = document.getElementById('arnold-iterations-value');
        if (arnoldIterations && arnoldIterationsValue) {
            arnoldIterations.value = 5;
            arnoldIterationsValue.textContent = '5';
        }

        // 重置置乱类型
        const scrambleType = document.getElementById('scramble-type');
        if (scrambleType) {
            scrambleType.value = 'row';
        }

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

        // 清理当前图像和置乱序列
        this.currentImage = null;
        this.originalImageData = null;
        this.canvas = null;
        this.ctx = null;
        this.lastRowOrder = null;
        this.lastColOrder = null;

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已重置，可以上传新图像', 'info');
        }
    },

    cleanup: function() {
        // 清理资源
        this.currentImage = null;
        this.originalImageData = null;
        this.canvas = null;
        this.ctx = null;
        this.rowOrder = null;
        this.colOrder = null;
        this.arnoldParams = { a: 1, b: 1 };
        this.encryptionSteps = [];
    },

    swapImages: function() {
        if (!this.canvas) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('没有可交换的图像', 'warning');
            }
            return;
        }

        // 获取当前画布内容
        const currentCanvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // 将当前画布内容设为新的原始图像
        this.originalImageData = new ImageData(
            new Uint8ClampedArray(currentCanvasData.data),
            currentCanvasData.width,
            currentCanvasData.height
        );

        // 更新原始图像显示
        const originalImage = document.getElementById('original-image');
        if (originalImage) {
            originalImage.src = this.canvas.toDataURL();
        }

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('图像已交换，现在可以在新图像基础上继续处理', 'success');
        }
    }
};
