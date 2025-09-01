// 水印处理模块
console.log('水印模块开始加载...');
window.ImageWatermark = {
    container: null,
    currentImage: null,
    watermarkImage: null,
    canvas: null,
    ctx: null,
    isTextWatermarkMode: false,
    isCreatingWatermark: false,
    isBatchCreating: false, // 批量创建标志

    // 多水印系统
    watermarks: [],
    selectedWatermark: null,
    watermarkIdCounter: 0,

    // 拖拽和交互状态
    isDragging: false,
    isResizing: false,
    isRotating: false,
    dragStartX: 0,
    dragStartY: 0,
    resizeHandle: null,
    initialDistance: 0,
    initialAngle: 0,

    // 水印类定义
    WatermarkInstance: function(id, type, content, x = 50, y = 50) {
        this.id = id;
        this.type = type;
        this.content = content;
        this.x = x;
        this.y = y;
        this.scale = 1;
        this.rotation = 0;
        this.opacity = 0.5;
        this.visible = true;

        if (type === 'text') {
            this.fontSize = 36;
            this.fontFamily = 'Arial';
            this.fontColor = '#ffffff';
        }
    },

    init: function(container) {
        console.log('水印模块初始化开始，容器:', container);
        this.container = container;
        this.render();
        this.setupEventListeners();
        console.log('水印模块初始化完成');
    },

    render: function() {
        this.container.innerHTML = `
            <div class="watermark-workspace">
                <!-- 图像上传区域 -->
                <div class="upload-section" id="upload-section">
                    <div class="upload-grid">
                        <!-- 背景图上传 -->
                        <div class="upload-area" id="main-upload-area">
                            <div class="upload-content">
                                <div class="upload-icon">🖼️</div>
                                <h3>上传背景图</h3>
                                <p>选择要添加水印的背景图像</p>
                                <input type="file" id="main-image-input" accept="image/*" style="display: none;">
                                <button class="upload-btn" onclick="document.getElementById('main-image-input').click()">
                                    选择背景图
                                </button>
                                <div class="upload-status" id="main-upload-status">
                                    <span class="status-text">等待上传</span>
                                </div>
                            </div>
                        </div>

                        <!-- 水印图上传 -->
                        <div class="upload-area" id="watermark-upload-area">
                            <div class="upload-content">
                                <div class="upload-icon">💧</div>
                                <h3>上传水印图</h3>
                                <p class="watermark-tip">⚠️ 请确保水印图为纯色背景</p>
                                <input type="file" id="watermark-image-input" accept="image/*" style="display: none;">
                                <button class="upload-btn" onclick="document.getElementById('watermark-image-input').click()">
                                    选择水印图
                                </button>
                                <div class="upload-status" id="watermark-upload-status">
                                    <span class="status-text">等待上传</span>
                                </div>
                                <div class="text-watermark-option">
                                    <button class="text-watermark-btn" id="use-text-watermark">
                                        使用文字水印
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 进入融合控件按钮 -->
                    <div class="start-processing-section" style="text-align: center; margin-top: 2rem;">
                        <button class="start-processing-btn" id="start-processing-btn" style="display: none;">
                            进入水印融合控件
                        </button>
                        <p class="processing-hint" id="processing-hint" style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                            请先上传背景图，然后选择水印图或使用文字水印
                        </p>
                    </div>
                </div>

                <!-- 水印融合控件 -->
                <div class="processing-section d-none" id="processing-section">
                    <!-- 水印编辑区域 -->
                    <div class="watermark-editor">
                        <!-- 左侧工具栏 -->
                        <div class="editor-sidebar">
                            <h4>水印工具</h4>

                            <!-- 水印素材预览 -->
                            <div class="watermark-source-area">
                                <div class="watermark-preview-card" id="watermark-preview-card">
                                    <div class="watermark-preview" id="watermark-preview">
                                        <div class="placeholder">水印预览</div>
                                    </div>
                                    <div class="watermark-info">
                                        <span class="watermark-type" id="watermark-type">未选择</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 创建水印按钮 -->
                            <div class="create-watermark-section">
                                <button class="create-watermark-btn" id="create-watermark-btn">
                                    <span class="btn-icon">➕</span>
                                    点击创建水印
                                </button>
                                <p class="create-hint">点击后在背景图上放置水印</p>
                            </div>

                            <!-- 一键放置按钮 -->
                            <div class="quick-placement">
                                <h5>一键放置</h5>
                                <div class="quick-buttons">
                                    <button class="quick-btn" id="fill-background-btn">
                                        <span class="btn-icon">🔲</span>
                                        铺满背景
                                    </button>
                                    <button class="quick-btn" id="diagonal-fill-btn">
                                        <span class="btn-icon">📐</span>
                                        倾斜铺满
                                    </button>
                                    <button class="quick-btn" id="corner-watermarks-btn">
                                        <span class="btn-icon">📍</span>
                                        四角放置
                                    </button>
                                </div>
                            </div>

                            <!-- 全局透明度调整 -->
                            <div class="global-opacity-control">
                                <h5>全局透明度</h5>
                                <div class="opacity-control-group">
                                    <label>水印透明度:</label>
                                    <div class="control-input">
                                        <input type="range" id="global-opacity" min="0" max="100" value="50">
                                        <span id="global-opacity-value">50%</span>
                                    </div>
                                    <p class="opacity-hint">调整所有已放置水印的透明度</p>
                                </div>
                            </div>

                            <!-- 清空操作 -->
                            <div class="clear-operations">
                                <button class="clear-btn" id="clear-all-btn">
                                    <span class="btn-icon">🗑️</span>
                                    清空所有水印
                                </button>
                            </div>
                        </div>

                        <!-- 主编辑区域 -->
                        <div class="editor-main">
                            <div class="canvas-container">
                                <h4>水印编辑区域 <span class="canvas-hint">（背景图已放大便于编辑）</span></h4>
                                <div class="canvas-wrapper" id="canvas-wrapper">
                                    <canvas id="result-canvas" class="preview-image"></canvas>
                                    <div class="watermark-overlay" id="watermark-overlay">
                                        <!-- 动态生成的水印控制框将在这里 -->
                                    </div>
                                </div>
                            </div>

                            <!-- 右侧下方工具面板 -->
                            <div class="editor-bottom-tools">
                                <!-- 文字水印编辑 -->
                                <div class="text-watermark-editor-bottom" id="text-watermark-editor-bottom" style="display: none;">
                                    <h5>📝 文字水印设置</h5>
                                    <div class="text-controls-horizontal">
                                        <div class="text-control-item">
                                            <label>水印文字:</label>
                                            <input type="text" id="watermark-text-bottom" placeholder="输入水印文字" value="WATERMARK" maxlength="50">
                                        </div>
                                        <div class="text-control-item">
                                            <label>字体大小:</label>
                                            <div class="control-input-compact">
                                                <input type="range" id="font-size-bottom" min="12" max="120" value="36">
                                                <span id="font-size-value-bottom">36px</span>
                                            </div>
                                        </div>
                                        <div class="text-control-item">
                                            <label>字体颜色:</label>
                                            <input type="color" id="font-color-bottom" value="#ffffff">
                                        </div>
                                        <div class="text-control-item">
                                            <label>字体:</label>
                                            <select id="font-family-bottom">
                                                <option value="Arial">Arial</option>
                                                <option value="Microsoft YaHei">微软雅黑</option>
                                                <option value="SimHei">黑体</option>
                                                <option value="SimSun">宋体</option>
                                                <option value="Times New Roman">Times New Roman</option>
                                                <option value="Georgia">Georgia</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <button class="action-btn secondary" id="download-btn">
                            下载结果
                        </button>
                        <button class="action-btn primary" id="new-image-btn">
                            处理新图像
                        </button>
                    </div>
                </div>
            </div>

            <style>
                .watermark-workspace {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 1.5rem;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    min-height: 100vh;
                    box-sizing: border-box;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                /* 上传区域样式 */
                .upload-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2.5rem;
                    margin-bottom: 3rem;
                }

                .upload-area {
                    border: 3px dashed var(--border-color);
                    border-radius: 16px;
                    padding: 3rem 2rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: center;
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    position: relative;
                    overflow: hidden;
                }

                .upload-area::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transition: left 0.5s;
                }

                .upload-area:hover::before {
                    left: 100%;
                }

                .upload-area:hover {
                    border-color: var(--primary-color);
                    background: linear-gradient(145deg, #ffffff, rgba(var(--primary-color-rgb), 0.05));
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(var(--primary-color-rgb), 0.15);
                }

                .upload-area.success {
                    border-color: #4CAF50;
                    background: linear-gradient(145deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
                    box-shadow: 0 8px 30px rgba(76, 175, 80, 0.2);
                }

                .upload-icon {
                    font-size: 3.5rem;
                    margin-bottom: 1.5rem;
                    display: block;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                }

                .upload-content h3 {
                    margin: 0 0 0.8rem 0;
                    color: var(--text-primary);
                    font-size: 1.4rem;
                    font-weight: 600;
                }

                .upload-content p {
                    margin: 0 0 2rem 0;
                    color: var(--text-muted);
                    font-size: 1rem;
                    line-height: 1.5;
                }

                .watermark-tip {
                    color: #ff9800 !important;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .upload-btn {
                    background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    cursor: pointer;
                    margin: 1rem 0;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.3);
                }

                .upload-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.4);
                }

                .upload-status {
                    margin-top: 1.5rem;
                    padding: 0.8rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .upload-status .status-text {
                    color: var(--text-muted);
                }

                .upload-status.success .status-text {
                    color: #4CAF50;
                }

                .text-watermark-option {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border-color);
                }

                .text-watermark-btn {
                    background: linear-gradient(135deg, #2196F3, #1976D2);
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 3px 12px rgba(33, 150, 243, 0.3);
                }

                .text-watermark-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 16px rgba(33, 150, 243, 0.4);
                }

                .start-processing-btn {
                    background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
                    color: white;
                    border: none;
                    padding: 1.2rem 3rem;
                    border-radius: 16px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    font-weight: 700;
                    box-shadow: 0 6px 25px rgba(var(--primary-color-rgb), 0.4);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .start-processing-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 35px rgba(var(--primary-color-rgb), 0.5);
                }

                .d-none { display: none !important; }

                /* 编辑器区域样式 */
                .watermark-editor {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 2.5rem;
                    margin-bottom: 2.5rem;
                    align-items: start;
                    min-height: fit-content;
                }

                .editor-sidebar {
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    border-radius: 20px;
                    padding: 2rem;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    height: fit-content;
                }

                .editor-sidebar h4, .editor-sidebar h5 {
                    margin: 0 0 1.5rem 0;
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .watermark-preview-card {
                    border: 2px solid var(--border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .watermark-preview-card:hover {
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }

                .watermark-preview {
                    width: 100%;
                    height: 100px;
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    background: #ffffff;
                    transition: all 0.3s ease;
                }

                .watermark-preview .placeholder {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    text-align: center;
                    font-style: italic;
                }

                .watermark-info {
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .create-watermark-section {
                    margin-bottom: 2rem;
                }

                .create-watermark-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    padding: 1.2rem;
                    border-radius: 16px;
                    cursor: pointer;
                    font-size: 1.1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .create-watermark-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4);
                }

                .create-watermark-btn.active {
                    background: linear-gradient(135deg, #ff9800, #f57c00);
                    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.3);
                }

                .create-hint {
                    margin: 1rem 0 0 0;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    text-align: center;
                    font-style: italic;
                }

                .quick-placement, .global-opacity-control, .clear-operations {
                    margin-bottom: 2rem;
                }

                /* 全局透明度控件样式 */
                .global-opacity-control h5 {
                    margin: 0 0 1rem 0;
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1rem;
                }

                .opacity-control-group {
                    background: var(--background-light);
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid var(--border-color);
                }

                .opacity-control-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }

                .opacity-hint {
                    margin: 0.5rem 0 0 0;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-style: italic;
                    text-align: center;
                }

                .quick-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }

                .quick-btn, .clear-btn {
                    width: 100%;
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    border: 2px solid var(--border-color);
                    padding: 1rem;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .quick-btn:hover {
                    background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
                    color: white;
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.3);
                }

                .clear-btn {
                    background: linear-gradient(135deg, #f44336, #d32f2f);
                    color: white;
                    border-color: #f44336;
                    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
                }

                .clear-btn:hover {
                    background: linear-gradient(135deg, #d32f2f, #b71c1c);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
                }

                .btn-icon {
                    font-size: 1.2rem;
                    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
                }

                /* 画布区域样式 */
                .editor-main {
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    border-radius: 20px;
                    padding: 2rem;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    min-height: fit-content;
                }

                /* 底部工具面板样式 */
                .editor-bottom-tools {
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 2px solid var(--border-color);
                }

                .editor-bottom-tools h5 {
                    margin: 0 0 1rem 0;
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* 底部文字水印编辑器 */
                .text-watermark-editor-bottom {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: var(--background-light);
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }

                .text-controls-horizontal {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: auto auto;
                    gap: 1rem;
                    align-items: end;
                }

                .text-control-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .text-control-item label {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }

                .text-control-item input[type="text"] {
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: white;
                    transition: border-color 0.3s ease;
                }

                .text-control-item input[type="text"]:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .control-input-compact {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: white;
                    padding: 0.5rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }

                .control-input-compact input[type="range"] {
                    flex: 1;
                    height: 4px;
                    border-radius: 2px;
                    background: var(--border-color);
                    outline: none;
                    -webkit-appearance: none;
                }

                .control-input-compact input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
                }

                .control-input-compact span {
                    min-width: 45px;
                    font-size: 0.85rem;
                    color: var(--text-primary);
                    text-align: right;
                    font-weight: 600;
                    background: var(--background-light);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }

                .text-control-item input[type="color"] {
                    width: 60px;
                    height: 40px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    cursor: pointer;
                    background: white;
                    padding: 2px;
                }

                .text-control-item select {
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: white;
                    cursor: pointer;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }



                .canvas-container h4 {
                    margin: 0 0 1.5rem 0;
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.3rem;
                }

                .canvas-hint {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    font-style: italic;
                }

                .canvas-wrapper {
                    position: relative;
                    display: block;
                    border: 3px solid var(--border-color);
                    border-radius: 16px;
                    overflow: hidden;
                    background: linear-gradient(145deg, #f5f5f5, #ffffff);
                    max-width: 100%;
                    width: fit-content;
                    margin: 0 auto;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .canvas-wrapper:hover {
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }

                #result-canvas {
                    display: block;
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                }

                .click-hint {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8));
                    color: white;
                    padding: 2rem;
                    border-radius: 16px;
                    text-align: center;
                    max-width: 350px;
                    z-index: 15;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                }

                .click-hint p {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    line-height: 1.6;
                    font-weight: 500;
                }

                .click-hint p:last-child {
                    margin-bottom: 0;
                }





                /* 文字水印编辑器样式 */
                .text-watermark-editor {
                    background: var(--background-light);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--border-color);
                }

                .text-watermark-editor h5 {
                    margin: 0 0 1rem 0;
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1rem;
                }

                .text-control-group {
                    margin-bottom: 1rem;
                }

                .text-control-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }

                .text-control-group input[type="text"] {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: white;
                    transition: border-color 0.3s ease;
                }

                .text-control-group input[type="text"]:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .text-control-group .control-input {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: white;
                    padding: 0.5rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }

                .text-control-group input[type="range"] {
                    flex: 1;
                    height: 4px;
                    border-radius: 2px;
                    background: var(--border-color);
                    outline: none;
                    -webkit-appearance: none;
                }

                .text-control-group input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
                }

                .text-control-group span {
                    min-width: 50px;
                    font-size: 0.85rem;
                    color: var(--text-primary);
                    text-align: right;
                    font-weight: 600;
                    background: var(--background-light);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }

                .text-control-group input[type="color"] {
                    width: 100%;
                    height: 40px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    cursor: pointer;
                    background: white;
                }

                .text-control-group select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: white;
                    cursor: pointer;
                }

                .update-text-btn {
                    width: 100%;
                    padding: 0.75rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .update-text-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                }
                /* 操作按钮样式 */
                .action-buttons {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 2rem;
                }

                .action-btn {
                    padding: 1rem 2rem;
                    border-radius: 16px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    min-width: 160px;
                    justify-content: center;
                }

                .action-btn.primary {
                    background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
                    color: white;
                    box-shadow: 0 6px 25px rgba(var(--primary-color-rgb), 0.4);
                }

                .action-btn.primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 35px rgba(var(--primary-color-rgb), 0.5);
                }

                .action-btn.secondary {
                    background: linear-gradient(145deg, #ffffff, #f8f9fa);
                    color: var(--text-primary);
                    border: 2px solid var(--border-color);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                }

                .action-btn.secondary:hover {
                    background: linear-gradient(145deg, var(--border-color), #e9ecef);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
                }

                /* 响应式设计 */
                @media (max-width: 1024px) {
                    .watermark-editor {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }

                    .editor-sidebar {
                        order: 1;
                    }

                    .editor-main {
                        order: 2;
                    }

                    .text-controls-horizontal {
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                    }
                }

                @media (max-width: 768px) {
                    .text-controls-horizontal {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto auto auto auto;
                        gap: 1rem;
                    }
                }

                @media (max-width: 768px) {
                    .watermark-workspace {
                        padding: 1rem;
                    }

                    .upload-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .upload-area {
                        padding: 2rem 1.5rem;
                    }

                    .editor-sidebar, .editor-main {
                        padding: 1.5rem;
                    }

                    .watermark-controls {
                        padding: 1.5rem;
                    }

                    .control-tabs {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .tab-btn {
                        padding: 0.8rem 1rem;
                        font-size: 0.9rem;
                    }

                    .action-buttons {
                        flex-direction: column;
                        align-items: center;
                    }

                    .action-btn {
                        width: 100%;
                        max-width: 300px;
                    }

                    .click-hint {
                        padding: 1.5rem;
                        max-width: 280px;
                    }

                    .click-hint p {
                        font-size: 0.9rem;
                    }
                }

                /* 水印控制框样式 */
                .watermark-control-box {
                    position: absolute;
                    border: 2px solid #4CAF50;
                    background: rgba(76, 175, 80, 0.1);
                    pointer-events: all;
                    cursor: move;
                    min-width: 20px;
                    min-height: 20px;
                    user-select: none;
                    z-index: 10;
                }

                .watermark-control-box.selected {
                    border-color: #ff9800;
                    background: rgba(255, 152, 0, 0.1);
                }

                .watermark-control-box:hover {
                    border-color: #2196F3;
                    background: rgba(33, 150, 243, 0.1);
                }

                .control-handle {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: #fff;
                    border: 2px solid #4CAF50;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 11;
                }

                .watermark-control-box.selected .control-handle {
                    border-color: #ff9800;
                }

                .control-handle.nw {
                    top: -6px;
                    left: -6px;
                    cursor: nw-resize;
                }
                .control-handle.ne {
                    top: -6px;
                    right: -6px;
                    cursor: ne-resize;
                }
                .control-handle.sw {
                    bottom: -6px;
                    left: -6px;
                    cursor: sw-resize;
                }
                .control-handle.se {
                    bottom: -6px;
                    right: -6px;
                    cursor: se-resize;
                }

                .rotate-handle {
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 16px;
                    height: 16px;
                    background: #2196F3;
                    border: 2px solid #fff;
                    border-radius: 50%;
                    cursor: grab;
                    z-index: 11;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    color: white;
                }

                .rotate-handle:before {
                    content: "↻";
                    font-weight: bold;
                }

                .rotate-handle:active {
                    cursor: grabbing;
                }

                .watermark-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 5;
                }

                .watermark-control-box {
                    pointer-events: all;
                }
            </style>
        `;
    },

    setupEventListeners: function() {
        // 文件上传事件
        const mainImageInput = document.getElementById('main-image-input');
        const watermarkImageInput = document.getElementById('watermark-image-input');

        if (mainImageInput) {
            mainImageInput.addEventListener('change', (e) => this.handleMainImageUpload(e));
        }
        if (watermarkImageInput) {
            watermarkImageInput.addEventListener('change', (e) => this.handleWatermarkImageUpload(e));
        }

        // 文字水印按钮
        const useTextWatermarkBtn = document.getElementById('use-text-watermark');
        if (useTextWatermarkBtn) {
            useTextWatermarkBtn.addEventListener('click', () => this.enableTextWatermarkMode());
        }

        // 文字编辑控件事件
        this.setupTextEditingEvents();

        // 全局透明度控件事件
        this.setupGlobalOpacityEvents();

        // 进入融合控件按钮
        const startBtn = document.getElementById('start-processing-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showProcessingSection());
        }

        // 创建水印按钮
        const createWatermarkBtn = document.getElementById('create-watermark-btn');
        if (createWatermarkBtn) {
            createWatermarkBtn.addEventListener('click', () => this.toggleCreateWatermarkMode());
        }

        // 一键放置按钮
        const fillBackgroundBtn = document.getElementById('fill-background-btn');
        const diagonalFillBtn = document.getElementById('diagonal-fill-btn');
        const cornerWatermarksBtn = document.getElementById('corner-watermarks-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');

        if (fillBackgroundBtn) {
            fillBackgroundBtn.addEventListener('click', () => this.fillBackgroundWithWatermarksGrid());
        }
        if (diagonalFillBtn) {
            diagonalFillBtn.addEventListener('click', () => this.fillBackgroundWithWatermarksDiagonal());
        }
        if (cornerWatermarksBtn) {
            cornerWatermarksBtn.addEventListener('click', () => this.placeWatermarksInCorners());
        }
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllWatermarks());
        }

        // 画布点击事件
        const canvasWrapper = document.getElementById('canvas-wrapper');
        if (canvasWrapper) {
            canvasWrapper.addEventListener('click', (e) => this.handleCanvasClick(e));
        }

        // 操作按钮
        const downloadBtn = document.getElementById('download-btn');
        const newImageBtn = document.getElementById('new-image-btn');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadResult());
        }
        if (newImageBtn) {
            newImageBtn.addEventListener('click', () => this.loadNewImage());
        }
    },

    // 处理背景图上传
    handleMainImageUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadMainImage(file);
        }
    },

    // 处理水印图上传
    handleWatermarkImageUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadWatermarkImage(file);
        }
    },

    // 加载背景图
    loadMainImage: function(file) {
        if (!file.type.startsWith('image/')) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('请选择图像文件', 'error');
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.updateMainImageUploadStatus(true);
                this.checkReadyToProcess();
                if (window.ImageLabUtils) {
                    window.ImageLabUtils.showNotification('背景图已上传成功', 'success');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    // 加载水印图
    loadWatermarkImage: function(file) {
        if (!file.type.startsWith('image/')) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('请选择图像文件', 'error');
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.watermarkImage = this.processWatermarkTransparency(img);
                this.isTextWatermarkMode = false;
                this.updateWatermarkPreview();
                this.updateWatermarkUploadStatus(true, '水印图已上传');
                this.checkReadyToProcess();
                if (window.ImageLabUtils) {
                    window.ImageLabUtils.showNotification('水印图已上传成功，已自动处理背景透明化', 'success');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    // 启用文字水印模式
    enableTextWatermarkMode: function() {
        this.isTextWatermarkMode = true;
        this.watermarkImage = null;
        this.updateWatermarkPreview();
        this.updateWatermarkUploadStatus(true, '文字水印模式');
        this.checkReadyToProcess();

        // 显示底部文字编辑器
        const textEditorBottom = document.getElementById('text-watermark-editor-bottom');
        if (textEditorBottom) {
            textEditorBottom.style.display = 'block';
        }

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已启用文字水印模式', 'info');
        }
    },

    // 更新背景图上传状态
    updateMainImageUploadStatus: function(success) {
        const uploadArea = document.getElementById('main-upload-area');
        const statusElement = document.getElementById('main-upload-status');

        if (success) {
            uploadArea.classList.add('success');
            statusElement.innerHTML = '<span class="status-text">✅ 背景图已上传</span>';
        }
    },

    // 更新水印图上传状态
    updateWatermarkUploadStatus: function(success, message = '') {
        const uploadArea = document.getElementById('watermark-upload-area');
        const statusElement = document.getElementById('watermark-upload-status');

        if (success) {
            uploadArea.classList.add('success');
            statusElement.innerHTML = `<span class="status-text">✅ ${message || '水印图已上传'}</span>`;
        }
    },

    // 更新水印预览
    updateWatermarkPreview: function() {
        const preview = document.getElementById('watermark-preview');
        const typeElement = document.getElementById('watermark-type');

        if (this.watermarkImage) {
            preview.innerHTML = `<img src="${this.watermarkImage.src}" alt="水印预览" style="max-width: 100%; max-height: 60px; object-fit: contain;">`;
            typeElement.textContent = '图像水印';
        } else if (this.isTextWatermarkMode) {
            const text = document.getElementById('watermark-text-bottom')?.value || 'WATERMARK';
            preview.innerHTML = `<div style="font-size: 14px; color: #333; font-weight: bold;">${text}</div>`;
            typeElement.textContent = '文字水印';
        } else {
            preview.innerHTML = '<div class="placeholder">水印预览</div>';
            typeElement.textContent = '未选择';
        }
    },

    // 检查是否可以进入处理界面
    checkReadyToProcess: function() {
        const hasBackground = !!this.currentImage;
        const hasWatermark = !!this.watermarkImage || this.isTextWatermarkMode;
        const canProcess = hasBackground && hasWatermark;

        const startBtn = document.getElementById('start-processing-btn');
        const hint = document.getElementById('processing-hint');

        if (canProcess) {
            startBtn.style.display = 'block';
            hint.textContent = '✅ 准备就绪，点击进入水印融合控件';
            hint.style.color = '#4CAF50';
        } else {
            startBtn.style.display = 'none';
            if (!hasBackground && !hasWatermark) {
                hint.textContent = '请先上传背景图，然后选择水印图或使用文字水印';
            } else if (!hasBackground) {
                hint.textContent = '请先上传背景图';
            } else if (!hasWatermark) {
                hint.textContent = '请选择水印图或使用文字水印';
            }
            hint.style.color = 'var(--text-muted)';
        }
    },

    // 显示处理界面
    showProcessingSection: function() {
        const uploadSection = document.getElementById('upload-section');
        const processingSection = document.getElementById('processing-section');

        if (uploadSection) uploadSection.style.display = 'none';
        if (processingSection) {
            processingSection.classList.remove('d-none');
            processingSection.style.display = 'block';
        }

        this.setupCanvas();
        this.updateWatermarkPreview();

        const clickHint = document.getElementById('click-hint');
        if (clickHint) clickHint.style.display = 'block';

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('进入水印融合控件', 'success');
        }
    },

    // 设置画布
    setupCanvas: function() {
        const canvas = document.getElementById('result-canvas');

        if (!canvas || !this.currentImage) return;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        const maxWidth = 800;
        const maxHeight = 600;

        let { width, height } = this.currentImage;

        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;
        const scale = Math.min(scaleX, scaleY, 1);

        canvas.width = width * scale;
        canvas.height = height * scale;

        this.ctx.drawImage(this.currentImage, 0, 0, canvas.width, canvas.height);
    },

    // 切换创建水印模式
    toggleCreateWatermarkMode: function() {
        this.isCreatingWatermark = !this.isCreatingWatermark;

        const btn = document.getElementById('create-watermark-btn');
        const hint = document.getElementById('click-hint');

        if (this.isCreatingWatermark) {
            btn.classList.add('active');
            btn.innerHTML = '<span class="btn-icon">⏹️</span>取消创建';
            if (hint) hint.style.display = 'block';

            // 显示创建提示
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('💡 现在点击背景图上的任意位置来放置水印', 'info');
            }
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<span class="btn-icon">➕</span>点击创建水印';
            if (hint) hint.style.display = 'none';
        }
    },

    // 处理画布点击
    handleCanvasClick: function(event) {
        if (!this.isCreatingWatermark) return;
        if (!this.watermarkImage && !this.isTextWatermarkMode) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('请先选择水印图或启用文字水印模式', 'warning');
            }
            return;
        }

        const canvas = document.getElementById('result-canvas');
        const rect = canvas.getBoundingClientRect();

        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        this.createWatermarkInstance(x, y);
        this.updateWatermark();

        const clickHint = document.getElementById('click-hint');
        if (clickHint) clickHint.style.display = 'none';
    },

    // 创建水印实例
    createWatermarkInstance: function(x, y) {
        const id = ++this.watermarkIdCounter;
        let watermark;

        if (this.watermarkImage) {
            watermark = new this.WatermarkInstance(id, 'image', this.watermarkImage, x, y);
        } else if (this.isTextWatermarkMode) {
            const text = document.getElementById('watermark-text-bottom')?.value || 'WATERMARK';
            watermark = new this.WatermarkInstance(id, 'text', text, x, y);
            watermark.fontSize = parseFloat(document.getElementById('font-size-bottom')?.value || 36);
            watermark.fontFamily = document.getElementById('font-family-bottom')?.value || 'Arial';
            watermark.fontColor = document.getElementById('font-color-bottom')?.value || '#ffffff';
        }

        if (watermark) {
            this.watermarks.push(watermark);
            this.createWatermarkControlBox(watermark);
            this.selectWatermark(watermark);
            // 只在单独创建水印时显示提示，批量创建时不显示
            if (window.ImageLabUtils && !this.isBatchCreating) {
                window.ImageLabUtils.showNotification('水印已创建', 'success');
            }
        }

        return watermark;
    },

    // 更新水印显示
    updateWatermark: function() {
        if (!this.currentImage || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);

        this.watermarks.forEach(watermark => {
            if (watermark.visible) {
                this.applyWatermarkToCanvas(watermark);
            }
        });

        // 更新所有控制框位置
        this.updateAllWatermarkControlBoxes();
    },

    // 应用水印到画布
    applyWatermarkToCanvas: function(watermark) {
        const blendMode = document.getElementById('blend-mode')?.value || 'normal';

        this.ctx.save();
        this.ctx.globalAlpha = watermark.opacity;
        this.ctx.globalCompositeOperation = blendMode;

        const x = (watermark.x / 100) * this.canvas.width;
        const y = (watermark.y / 100) * this.canvas.height;

        this.ctx.translate(x, y);

        if (watermark.rotation !== 0) {
            this.ctx.rotate((watermark.rotation * Math.PI) / 180);
        }

        if (watermark.type === 'image') {
            const scaledWidth = watermark.content.width * watermark.scale;
            const scaledHeight = watermark.content.height * watermark.scale;

            this.ctx.drawImage(
                watermark.content,
                -scaledWidth / 2,
                -scaledHeight / 2,
                scaledWidth,
                scaledHeight
            );
        } else if (watermark.type === 'text') {
            const fontSize = watermark.fontSize * watermark.scale;
            this.ctx.font = `${fontSize}px ${watermark.fontFamily}`;
            this.ctx.fillStyle = watermark.fontColor;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(watermark.content, 0, 0);
        }

        this.ctx.restore();
    },

    // 一键铺满背景（网格）
    fillBackgroundWithWatermarksGrid: function() {
        if (!this.watermarkImage && !this.isTextWatermarkMode) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('请先选择水印图或启用文字水印模式', 'warning');
            }
            return;
        }

        this.clearAllWatermarks();
        this.isBatchCreating = true; // 开始批量创建

        const rows = 4;
        const cols = 6;
        const marginX = 8;
        const marginY = 8;

        const stepX = (100 - 2 * marginX) / (cols - 1);
        const stepY = (100 - 2 * marginY) / (rows - 1);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = marginX + col * stepX;
                const y = marginY + row * stepY;

                const watermark = this.createWatermarkInstance(x, y);
                if (watermark) {
                    watermark.scale = 0.4;
                    watermark.opacity = 0.3;
                }
            }
        }

        this.isBatchCreating = false; // 结束批量创建
        this.updateWatermark();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification(`✅ 已创建 ${rows * cols} 个水印铺满背景`, 'success');
        }
    },

    // 一键倾斜铺满
    fillBackgroundWithWatermarksDiagonal: function() {
        if (!this.watermarkImage && !this.isTextWatermarkMode) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('请先选择水印图或启用文字水印模式', 'warning');
            }
            return;
        }

        this.clearAllWatermarks();
        this.isBatchCreating = true; // 开始批量创建

        const rows = 5;
        const cols = 7;
        const marginX = 5;
        const marginY = 5;
        let createdCount = 0;

        const stepX = (100 - 2 * marginX) / (cols - 1);
        const stepY = (100 - 2 * marginY) / (rows - 1);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const offsetX = (row % 2) * (stepX / 2);
                const x = marginX + col * stepX + offsetX;
                const y = marginY + row * stepY;

                if (x <= 95) {
                    const watermark = this.createWatermarkInstance(x, y);
                    if (watermark) {
                        watermark.scale = 0.35;
                        watermark.opacity = 0.25;
                        watermark.rotation = -15;
                        createdCount++;
                    }
                }
            }
        }

        this.isBatchCreating = false; // 结束批量创建
        this.updateWatermark();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification(`✅ 已创建 ${createdCount} 个倾斜水印铺满背景`, 'success');
        }
    },

    // 四角放置水印
    placeWatermarksInCorners: function() {
        if (!this.watermarkImage && !this.isTextWatermarkMode) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('请先选择水印图或启用文字水印模式', 'warning');
            }
            return;
        }

        this.clearAllWatermarks();
        this.isBatchCreating = true; // 开始批量创建

        const positions = [
            { x: 10, y: 10 },   // 左上
            { x: 90, y: 10 },   // 右上
            { x: 10, y: 90 },   // 左下
            { x: 90, y: 90 }    // 右下
        ];

        positions.forEach(pos => {
            const watermark = this.createWatermarkInstance(pos.x, pos.y);
            if (watermark) {
                watermark.scale = 0.6;
                watermark.opacity = 0.4;
            }
        });

        this.isBatchCreating = false; // 结束批量创建
        this.updateWatermark();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('✅ 已在四个角落放置水印', 'success');
        }
    },

    // 清空所有水印
    clearAllWatermarks: function() {
        // 清除所有控制框
        const overlay = document.getElementById('watermark-overlay');
        if (overlay) {
            overlay.innerHTML = '';
        }

        this.watermarks = [];
        this.selectedWatermark = null;
        this.updateWatermark();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已清空所有水印', 'info');
        }
    },

    // 处理水印背景透明化
    processWatermarkTransparency: function(img) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(img, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        const tolerance = 30;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);

            if (diff < tolerance) {
                data[i + 3] = 0;
            }
        }

        tempCtx.putImageData(imageData, 0, 0);

        const processedImg = new Image();
        processedImg.src = tempCanvas.toDataURL('image/png');
        return processedImg;
    },

    // 下载结果
    downloadResult: function() {
        if (!this.canvas) {
            if (window.ImageLabUtils) {
                window.ImageLabUtils.showNotification('没有可下载的图像', 'warning');
            }
            return;
        }

        const link = document.createElement('a');
        link.download = 'watermarked-image.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('图像已下载', 'success');
        }
    },

    // 处理新图像
    loadNewImage: function() {
        this.currentImage = null;
        this.watermarkImage = null;
        this.watermarks = [];
        this.selectedWatermark = null;
        this.isTextWatermarkMode = false;
        this.isCreatingWatermark = false;

        const uploadSection = document.getElementById('upload-section');
        const processingSection = document.getElementById('processing-section');

        if (uploadSection) uploadSection.style.display = 'block';
        if (processingSection) processingSection.classList.add('d-none');

        // 重置上传状态
        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach(area => area.classList.remove('success'));

        const statusElements = document.querySelectorAll('.upload-status .status-text');
        statusElements.forEach(el => el.textContent = '等待上传');

        // 重置文件输入
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => input.value = '');

        this.checkReadyToProcess();

        if (window.ImageLabUtils) {
            window.ImageLabUtils.showNotification('已重置，可以处理新图像', 'info');
        }
    },

    // 创建水印控制框
    createWatermarkControlBox: function(watermark) {
        const overlay = document.getElementById('watermark-overlay');
        if (!overlay) return;

        const controlBox = document.createElement('div');
        controlBox.className = 'watermark-control-box';
        controlBox.dataset.watermarkId = watermark.id;

        // 添加控制手柄
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(handle => {
            const handleElement = document.createElement('div');
            handleElement.className = `control-handle ${handle}`;
            handleElement.dataset.handle = handle;
            controlBox.appendChild(handleElement);
        });

        // 添加旋转手柄
        const rotateHandle = document.createElement('div');
        rotateHandle.className = 'rotate-handle';
        rotateHandle.dataset.handle = 'rotate';
        controlBox.appendChild(rotateHandle);

        overlay.appendChild(controlBox);

        // 添加事件监听器
        this.setupWatermarkInteraction(controlBox, watermark);

        // 更新控制框位置
        this.updateWatermarkControlBox(watermark);
    },

    // 设置水印交互
    setupWatermarkInteraction: function(controlBox, watermark) {
        // 点击选择水印
        controlBox.addEventListener('mousedown', (e) => {
            if (e.target === controlBox) {
                e.preventDefault();
                this.selectWatermark(watermark);
                this.startDragging(e, watermark);
            }
        });

        // 控制手柄事件
        const handles = controlBox.querySelectorAll('.control-handle, .rotate-handle');
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectWatermark(watermark);

                if (handle.classList.contains('rotate-handle')) {
                    this.startRotating(e, watermark);
                } else {
                    this.startResizing(e, watermark, handle.dataset.handle);
                }
            });
        });
    },

    // 开始拖拽
    startDragging: function(e, watermark) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        const canvas = document.getElementById('result-canvas');
        const rect = canvas.getBoundingClientRect();

        const mouseMoveHandler = (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;

            const deltaXPercent = (deltaX / rect.width) * 100;
            const deltaYPercent = (deltaY / rect.height) * 100;

            watermark.x = Math.max(5, Math.min(95, watermark.x + deltaXPercent));
            watermark.y = Math.max(5, Math.min(95, watermark.y + deltaYPercent));

            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;

            this.updateWatermark();
            this.updateWatermarkControlBox(watermark);
        };

        const mouseUpHandler = () => {
            this.isDragging = false;
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    },

    // 开始缩放
    startResizing: function(e, watermark, handle) {
        this.isResizing = true;
        this.resizeHandle = handle;

        const canvas = document.getElementById('result-canvas');
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + (watermark.x / 100) * rect.width;
        const centerY = rect.top + (watermark.y / 100) * rect.height;

        this.initialDistance = Math.sqrt(
            Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );

        const mouseMoveHandler = (e) => {
            if (!this.isResizing) return;

            const currentDistance = Math.sqrt(
                Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
            );

            const scaleRatio = currentDistance / this.initialDistance;
            watermark.scale = Math.max(0.1, Math.min(3, watermark.scale * scaleRatio));

            this.initialDistance = currentDistance;

            this.updateWatermark();
            this.updateWatermarkControlBox(watermark);
        };

        const mouseUpHandler = () => {
            this.isResizing = false;
            this.resizeHandle = null;
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    },

    // 开始旋转
    startRotating: function(e, watermark) {
        this.isRotating = true;

        const canvas = document.getElementById('result-canvas');
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + (watermark.x / 100) * rect.width;
        const centerY = rect.top + (watermark.y / 100) * rect.height;

        this.initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

        const mouseMoveHandler = (e) => {
            if (!this.isRotating) return;

            const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
            const deltaAngle = currentAngle - this.initialAngle;

            watermark.rotation = (watermark.rotation + deltaAngle) % 360;
            if (watermark.rotation < 0) watermark.rotation += 360;

            this.initialAngle = currentAngle;

            this.updateWatermark();
            this.updateWatermarkControlBox(watermark);
        };

        const mouseUpHandler = () => {
            this.isRotating = false;
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    },

    // 选择水印
    selectWatermark: function(watermark) {
        // 取消之前的选择
        if (this.selectedWatermark) {
            const prevControlBox = document.querySelector(`[data-watermark-id="${this.selectedWatermark.id}"]`);
            if (prevControlBox) {
                prevControlBox.classList.remove('selected');
            }
        }

        // 设置新的选择
        this.selectedWatermark = watermark;

        if (watermark) {
            const controlBox = document.querySelector(`[data-watermark-id="${watermark.id}"]`);
            if (controlBox) {
                controlBox.classList.add('selected');
            }
        }
    },

    // 更新水印控制框位置
    updateWatermarkControlBox: function(watermark) {
        const controlBox = document.querySelector(`[data-watermark-id="${watermark.id}"]`);
        const canvas = document.getElementById('result-canvas');

        if (!controlBox || !canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const overlay = document.getElementById('watermark-overlay');
        const overlayRect = overlay.getBoundingClientRect();

        // 计算相对于overlay的位置
        const x = (watermark.x / 100) * canvasRect.width;
        const y = (watermark.y / 100) * canvasRect.height;

        // 估算水印尺寸
        let width, height;
        if (watermark.type === 'image') {
            width = watermark.content.width * watermark.scale * 0.3;
            height = watermark.content.height * watermark.scale * 0.3;
        } else {
            const textLength = watermark.content.length;
            width = textLength * watermark.fontSize * watermark.scale * 0.4;
            height = watermark.fontSize * watermark.scale * 0.8;
        }

        controlBox.style.left = (x - width / 2) + 'px';
        controlBox.style.top = (y - height / 2) + 'px';
        controlBox.style.width = width + 'px';
        controlBox.style.height = height + 'px';
        controlBox.style.transform = `rotate(${watermark.rotation}deg)`;
    },

    // 更新所有水印控制框
    updateAllWatermarkControlBoxes: function() {
        this.watermarks.forEach(watermark => {
            this.updateWatermarkControlBox(watermark);
        });
    },

    // 设置文字编辑事件
    setupTextEditingEvents: function() {
        // 底部文字内容输入
        const watermarkTextInputBottom = document.getElementById('watermark-text-bottom');
        if (watermarkTextInputBottom) {
            watermarkTextInputBottom.addEventListener('input', () => {
                this.updateWatermarkPreview();
                this.updateAllTextWatermarks();
            });
        }

        // 底部字体大小滑块
        const fontSizeSliderBottom = document.getElementById('font-size-bottom');
        const fontSizeValueBottom = document.getElementById('font-size-value-bottom');
        if (fontSizeSliderBottom && fontSizeValueBottom) {
            fontSizeSliderBottom.addEventListener('input', () => {
                fontSizeValueBottom.textContent = fontSizeSliderBottom.value + 'px';
                this.updateAllTextWatermarksProperties();
            });
        }

        // 底部字体颜色
        const fontColorInputBottom = document.getElementById('font-color-bottom');
        if (fontColorInputBottom) {
            fontColorInputBottom.addEventListener('change', () => {
                this.updateAllTextWatermarksProperties();
            });
        }

        // 底部字体选择
        const fontFamilySelectBottom = document.getElementById('font-family-bottom');
        if (fontFamilySelectBottom) {
            fontFamilySelectBottom.addEventListener('change', () => {
                this.updateAllTextWatermarksProperties();
            });
        }
    },

    // 设置全局透明度事件
    setupGlobalOpacityEvents: function() {
        const globalOpacitySlider = document.getElementById('global-opacity');
        const globalOpacityValue = document.getElementById('global-opacity-value');

        if (globalOpacitySlider && globalOpacityValue) {
            // 防抖定时器
            let opacityNotificationTimer = null;

            globalOpacitySlider.addEventListener('input', () => {
                const opacity = parseFloat(globalOpacitySlider.value);
                globalOpacityValue.textContent = opacity + '%';
                this.updateAllWatermarksOpacity(opacity / 100, false); // 不显示通知

                // 清除之前的定时器
                if (opacityNotificationTimer) {
                    clearTimeout(opacityNotificationTimer);
                }

                // 设置新的定时器，500ms后显示通知
                opacityNotificationTimer = setTimeout(() => {
                    if (window.ImageLabUtils) {
                        window.ImageLabUtils.showNotification(`水印透明度已调整为 ${Math.round(opacity)}%`, 'info');
                    }
                }, 500);
            });
        }
    },

    // 更新所有水印的透明度
    updateAllWatermarksOpacity: function(opacity, showNotification = true) {
        this.watermarks.forEach(watermark => {
            watermark.opacity = opacity;
        });
        this.updateWatermark();

        if (showNotification && window.ImageLabUtils) {
            window.ImageLabUtils.showNotification(`水印透明度已调整为 ${Math.round(opacity * 100)}%`, 'info');
        }
    },

    // 更新所有文字水印的属性
    updateAllTextWatermarksProperties: function() {
        const fontSize = parseFloat(document.getElementById('font-size-bottom')?.value || 36);
        const fontFamily = document.getElementById('font-family-bottom')?.value || 'Arial';
        const fontColor = document.getElementById('font-color-bottom')?.value || '#ffffff';

        this.watermarks.forEach(watermark => {
            if (watermark.type === 'text') {
                watermark.fontSize = fontSize;
                watermark.fontFamily = fontFamily;
                watermark.fontColor = fontColor;
            }
        });

        this.updateWatermark();
    },

    // 更新所有文字水印的内容
    updateAllTextWatermarks: function() {
        const text = document.getElementById('watermark-text-bottom')?.value || 'WATERMARK';

        this.watermarks.forEach(watermark => {
            if (watermark.type === 'text') {
                watermark.content = text;
            }
        });

        this.updateWatermark();
    }
};

console.log('水印模块加载完成，ImageWatermark对象:', window.ImageWatermark);
