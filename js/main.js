/**
 * BNI よさげチャプター Zoom背景画像生成ツール
 * Canvas APIを使用してZoom用バーチャル背景を生成
 */

class BNIBackgroundGenerator {
    constructor() {
        // DOM要素
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.form = document.getElementById('backgroundForm');
        this.loadingModal = document.getElementById('loadingModal');
        this.previewActions = document.getElementById('previewActions');
        
        // 設定値
        this.config = {
            colors: {
                bniRed: '#C8102E',
                bniDarkBlue: '#003366',
                bniGray: '#666666',
                white: '#FFFFFF',
                lightGray: '#F5F5F5'
            },
            fonts: {
                memberName: 'bold 72px "Noto Sans JP", "Meiryo", "Hiragino Kaku Gothic Pro", sans-serif',
                businessCategory: 'bold 54px "Noto Sans JP", "Meiryo", "Hiragino Kaku Gothic Pro", sans-serif',
                chapterText: 'bold 32px "Noto Sans JP", "Meiryo", "Hiragino Kaku Gothic Pro", sans-serif',
                jobTitle: 'bold 72px "Noto Sans JP", "Meiryo", "Hiragino Kaku Gothic Pro", sans-serif'
            },
            layout: {
                canvasWidth: 1920,
                canvasHeight: 1080,
                bniLogoSize: 280,
                bnaiLogoWidth: 480,
                accentLineHeight: 40,
                positions: {
                    bniLogo: { x: 80, y: 60 },
                    bnaiLogo: { x: 60, y: 510 },
                    rightInfo: { x: 1840, y: 60 },
                    chapterOffset: 20,
                    categoryOffset: 90
                }
            }
        };
        
        // 画像オブジェクト
        this.images = {
            bni: null,
            bnai: null,
            personal: null
        };
        
        this.init();
    }

    init() {
        this.initializeEvents();
        this.loadImages();
    }

    initializeEvents() {
        // フォーム送信
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateBackground();
        });
        
        // ダウンロードボタン
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
        
        // フォームバリデーション
        this.form.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('input', () => this.validateForm());
        });
        
        // 画像アップロード
        this.initializeImageUpload();
    }

    loadImages() {
        // BNIロゴ
        this.images.bni = new Image();
        this.images.bni.onload = () => console.log('BNIロゴが正常に読み込まれました');
        this.images.bni.onerror = () => console.error('BNIロゴの読み込みに失敗しました');
        this.images.bni.src = 'images/bni-logo.png';

        // BNAIロゴ
        this.images.bnai = new Image();
        this.images.bnai.onload = () => console.log('BNAIロゴが正常に読み込まれました:', this.images.bnai.width, 'x', this.images.bnai.height);
        this.images.bnai.onerror = () => console.error('BNAIロゴの読み込みに失敗しました');
        this.images.bnai.src = 'images/bnai-logo.png';
    }

    validateForm() {
        const memberName = document.getElementById('memberName').value.trim();
        const businessCategory = document.getElementById('businessCategory').value.trim();
        
        const isValid = memberName.length > 0 && memberName.length <= 20 && 
                       businessCategory.length > 0 && businessCategory.length <= 30;
        
        document.getElementById('generateBtn').disabled = !isValid;
        return isValid;
    }

    initializeImageUpload() {
        const fileInput = document.getElementById('personalImage');
        const uploadWrapper = document.querySelector('.image-upload-wrapper');
        
        // ファイル選択とドラッグ&ドロップ
        fileInput.addEventListener('change', (e) => this.handleImageSelect(e));
        
        // イベント委譲で削除ボタン
        document.addEventListener('click', (e) => {
            if (e.target.closest('#removeImage')) {
                e.preventDefault();
                this.removeImage();
            }
        });
        
        // ドラッグ&ドロップ
        uploadWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadWrapper.classList.add('drag-over');
        });
        
        uploadWrapper.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadWrapper.classList.remove('drag-over');
        });
        
        uploadWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadWrapper.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) this.handleImageFile(files[0]);
        });
    }

    handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) this.handleImageFile(file);
    }

    handleImageFile(file) {
        // ファイル形式・サイズチェック
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください。');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImagePreview(e.target.result);
            this.loadPersonalImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    displayImagePreview(imageSrc) {
        const previewDiv = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const uploadLabel = document.querySelector('.file-upload-label');
        const removeBtn = document.getElementById('removeImage');
        
        previewImg.src = imageSrc;
        previewDiv.style.display = 'block';
        uploadLabel.style.display = 'none';
        
        // 削除ボタンのイベント再設定
        removeBtn.onclick = (e) => {
            e.preventDefault();
            this.removeImage();
        };
    }

    loadPersonalImage(imageSrc) {
        this.images.personal = new Image();
        this.images.personal.onload = () => console.log('個人画像が正常に読み込まれました');
        this.images.personal.onerror = () => console.error('個人画像の読み込みに失敗しました');
        this.images.personal.src = imageSrc;
    }

    removeImage() {
        const previewDiv = document.getElementById('imagePreview');
        const uploadLabel = document.querySelector('.file-upload-label');
        const fileInput = document.getElementById('personalImage');
        
        previewDiv.style.display = 'none';
        uploadLabel.style.display = 'flex';
        fileInput.value = '';
        this.images.personal = null;
    }

    toggleLoading(show) {
        this.loadingModal.style.display = show ? 'flex' : 'none';
    }

    async generateBackground() {
        if (!this.validateForm()) {
            alert('入力内容をご確認ください。');
            return;
        }

        this.toggleLoading(true);
        
        try {
            const memberName = document.getElementById('memberName').value.trim();
            const businessCategory = document.getElementById('businessCategory').value.trim();
            const jobTitle = document.getElementById('jobTitle').value.trim();
            
            this.canvas.width = this.config.layout.canvasWidth;
            this.canvas.height = this.config.layout.canvasHeight;
            
            await this.drawBackground(memberName, businessCategory, jobTitle);
            this.previewActions.style.display = 'flex';
            
        } catch (error) {
            console.error('背景画像生成エラー:', error);
            alert('背景画像の生成に失敗しました。もう一度お試しください。');
        } finally {
            this.toggleLoading(false);
        }
    }

    async drawBackground(memberName, businessCategory, jobTitle) {
        return new Promise((resolve) => {
            const { colors, layout } = this.config;
            
            // 白背景
            this.ctx.clearRect(0, 0, layout.canvasWidth, layout.canvasHeight);
            this.ctx.fillStyle = colors.white;
            this.ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight);
            
            // 各要素を描画
            this.drawBNAILogo();
            this.drawBNILogo();
            this.drawPersonalInfo(memberName, businessCategory);
            this.drawJobTitle(jobTitle);
            this.drawPersonalImage();
            this.drawAccentElements();
            
            resolve();
        });
    }

    drawBNAILogo() {
        if (!this.images.bnai?.complete) return;
        
        const { positions, bnaiLogoWidth } = this.config.layout;
        const height = (this.images.bnai.height / this.images.bnai.width) * bnaiLogoWidth;
        const centeredY = positions.bnaiLogo.y - (height / 2);
        
        this.ctx.drawImage(this.images.bnai, positions.bnaiLogo.x, centeredY, bnaiLogoWidth, height);
    }

    drawBNILogo() {
        if (!this.images.bni?.complete) return;
        
        const { colors, fonts, layout } = this.config;
        const { positions, bniLogoSize } = layout;
        const logoHeight = (this.images.bni.height / this.images.bni.width) * bniLogoSize;
        
        // 白背景とロゴ描画
        const padding = 15;
        this.ctx.fillStyle = colors.white;
        this.ctx.fillRect(
            positions.bniLogo.x - padding,
            positions.bniLogo.y - padding,
            bniLogoSize + (padding * 2),
            logoHeight + (padding * 2)
        );
        
        // ロゴ透過処理
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = bniLogoSize;
        tempCanvas.height = logoHeight;
        
        tempCtx.fillStyle = colors.white;
        tempCtx.fillRect(0, 0, bniLogoSize, logoHeight);
        tempCtx.drawImage(this.images.bni, 0, 0, bniLogoSize, logoHeight);
        
        const imageData = tempCtx.getImageData(0, 0, bniLogoSize, logoHeight);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
            if ((r < 50 && g < 50 && b < 50) || a < 200) {
                data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 255;
            }
        }
        tempCtx.putImageData(imageData, 0, 0);
        
        this.ctx.drawImage(tempCanvas, positions.bniLogo.x, positions.bniLogo.y);
        
        // チャプターテキスト
        this.ctx.fillStyle = colors.bniDarkBlue;
        this.ctx.font = fonts.chapterText;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('よさげチャプター', positions.bniLogo.x, positions.bniLogo.y + logoHeight + positions.chapterOffset);
    }

    drawPersonalInfo(memberName, businessCategory) {
        const { colors, fonts, layout } = this.config;
        const { positions } = layout;
        
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        
        // メンバー名
        this.ctx.fillStyle = colors.bniDarkBlue;
        this.ctx.font = fonts.memberName;
        this.ctx.fillText(memberName, positions.rightInfo.x, positions.rightInfo.y);
        
        // ビジネスカテゴリ
        this.ctx.fillStyle = colors.bniGray;
        this.ctx.font = fonts.businessCategory;
        this.ctx.fillText(businessCategory, positions.rightInfo.x, positions.rightInfo.y + positions.categoryOffset);
    }

    drawJobTitle(jobTitle) {
        if (!jobTitle) return;
        
        const { colors, fonts, layout } = this.config;
        
        const centerX = layout.canvasWidth / 2;
        const topY = layout.positions.rightInfo.y;
        
        this.ctx.fillStyle = colors.bniRed;
        this.ctx.font = fonts.jobTitle;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(jobTitle, centerX, topY);
    }

    drawPersonalImage() {
        if (!this.images.personal?.complete) return;
        
        const { layout } = this.config;
        const imageSize = 600;
        const padding = 60;
        
        const x = layout.canvasWidth - padding - imageSize;
        const y = (layout.canvasHeight - imageSize) / 2 + 20;
        
        this.drawFittedImage(this.images.personal, x, y, imageSize);
    }

    drawFittedImage(img, x, y, maxSize) {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const imgRatio = imgWidth / imgHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgRatio > 1) {
            // 横長：横幅600pxに合わせる
            drawWidth = maxSize;
            drawHeight = maxSize / imgRatio;
            drawX = x;
            drawY = y + (maxSize - drawHeight) / 2;
        } else {
            // 縦長：縦幅600pxに合わせる
            drawHeight = maxSize;
            drawWidth = maxSize * imgRatio;
            drawX = x + (maxSize - drawWidth) / 2;
            drawY = y;
        }
        
        this.ctx.drawImage(img, 0, 0, imgWidth, imgHeight, drawX, drawY, drawWidth, drawHeight);
    }

    drawAccentElements() {
        const { colors, layout } = this.config;
        
        // 下部アクセントライン
        const lineY = layout.canvasHeight - layout.accentLineHeight;
        this.ctx.fillStyle = colors.bniRed;
        this.ctx.fillRect(0, lineY, layout.canvasWidth, layout.accentLineHeight);
        
        // 右下装飾ライン
        this.ctx.strokeStyle = colors.lightGray;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(layout.canvasWidth - 300, layout.canvasHeight - 200);
        this.ctx.lineTo(layout.canvasWidth - 100, layout.canvasHeight - 100);
        this.ctx.stroke();
    }

    downloadImage() {
        try {
            const memberName = document.getElementById('memberName').value.trim();
            const businessCategory = document.getElementById('businessCategory').value.trim();
            const jobTitle = document.getElementById('jobTitle').value.trim();
            const date = new Date();
            const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
            
            const jobTitlePart = jobTitle ? `_${jobTitle}` : '';
            const fileName = `BNI_${memberName}_${businessCategory}${jobTitlePart}_Zoom背景_${dateStr}.png`;
            
            this.canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = fileName;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 'image/png');
            
        } catch (error) {
            console.error('ダウンロードエラー:', error);
            alert('画像のダウンロードに失敗しました。');
        }
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new BNIBackgroundGenerator();
});

// PWA対応
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('ServiceWorker registration successful'))
            .catch(() => console.log('ServiceWorker registration failed'));
    });
}