'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './editor.module.css';

export default function FullPhotoShopEditor() {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);

  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#ff0000');
  const [size, setSize] = useState(5);
  const [fillShape, setFillShape] = useState(false);
  const [whiteBg, setWhiteBg] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(32);
  const [textInput, setTextInput] = useState('Ваш текст');
  const [isDark, setIsDark] = useState(true);

  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(500);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);

  const saveToHistory = useCallback((context, canvas) => {
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => {
      const sliced = prev.slice(0, historyStep + 1);
      return [...sliced, dataUrl];
    });
    setHistoryStep((prev) => prev + 1);
  }, [historyStep]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 500;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setCtx(context);
    setHistory([canvas.toDataURL()]);
    setHistoryStep(0);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.style.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
  }, [brightness, contrast, grayscale, sepia]);

  const restoreCanvas = useCallback((dataUrl) => {
    if (!ctx || !canvasRef.current) return;
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }, [ctx]);

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      const step = historyStep - 1;
      setHistoryStep(step);
      restoreCanvas(history[step]);
    }
  }, [historyStep, history, restoreCanvas]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const step = historyStep + 1;
      setHistoryStep(step);
      restoreCanvas(history[step]);
    }
  }, [historyStep, history, restoreCanvas]);

  // Горячие клавиши Ctrl+Z и Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleResizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    const w = Number(canvasWidth);
    const h = Number(canvasHeight);
    if (w <= 0 || h <= 0) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = w;
    canvas.height = h;

    ctx.globalCompositeOperation = 'source-over';
    if (whiteBg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    ctx.drawImage(tempCanvas, 0, 0);
    saveToHistory(ctx, canvas);
  };

  const handleToggleWhiteBg = (checked) => {
    setWhiteBg(checked);
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    if (checked) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      saveToHistory(ctx, canvas);
    } else {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      saveToHistory(ctx, canvas);
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (whiteBg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    saveToHistory(ctx, canvas);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        setCanvasWidth(img.width);
        setCanvasHeight(img.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0);
        saveToHistory(ctx, canvas);
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map((val) => val.toString(16).padStart(2, '0')).join('');

  const hexToRgba = (hex) => {
    const clean = hex.replace('#', '');
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
      255,
    ];
  };

  const floodFill = (startX, startY, fillColorHex) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const x0 = Math.floor(startX);
    const y0 = Math.floor(startY);

    if (x0 < 0 || x0 >= width || y0 < 0 || y0 >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const startIdx = (y0 * width + x0) * 4;

    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];

    const [fillR, fillG, fillB, fillA] = hexToRgba(fillColorHex);

    if (
      targetR === fillR &&
      targetG === fillG &&
      targetB === fillB &&
      targetA === fillA
    ) {
      return;
    }

    const matchTarget = (idx) =>
      Math.abs(data[idx] - targetR) <= 15 &&
      Math.abs(data[idx + 1] - targetG) <= 15 &&
      Math.abs(data[idx + 2] - targetB) <= 15 &&
      Math.abs(data[idx + 3] - targetA) <= 15;

    const visited = new Uint8Array(width * height);
    const stack = [[x0, y0]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const pixelPos = y * width + x;

      if (visited[pixelPos]) continue;
      const idx = pixelPos * 4;

      if (matchTarget(idx)) {
        visited[pixelPos] = 1;
        data[idx] = fillR;
        data[idx + 1] = fillG;
        data[idx + 2] = fillB;
        data[idx + 3] = fillA;

        if (x > 0) stack.push([x - 1, y]);
        if (x < width - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < height - 1) stack.push([x, y + 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    saveToHistory(ctx, canvas);
  };

  const startAction = (e) => {
    if (!ctx) return;
    const pos = getCoords(e);
    setStartPos(pos);

    if (tool === 'fill') {
      floodFill(pos.x, pos.y, color);
      return;
    }

    if (tool === 'eyedropper') {
      const pixel = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
      setColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
      setTool('brush');
      return;
    }

    if (tool === 'text') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = `${size * 4}px sans-serif`;
      ctx.fillStyle = color;
      ctx.fillText(textInput, pos.x, pos.y);
      saveToHistory(ctx, canvasRef.current);
      return;
    }

    setIsDrawing(true);
    setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = size;
    ctx.lineCap = 'round';

    if (tool === 'eraser') {
      if (whiteBg) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      }
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
  };

  const moveAction = (e) => {
    if (!isDrawing || !ctx) return;
    const pos = getCoords(e);

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.putImageData(snapshot, 0, 0);
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      if (fillShape) {
        ctx.fillRect(startPos.x, startPos.y, w, h);
      } else {
        ctx.strokeRect(startPos.x, startPos.y, w, h);
      }
    } else if (tool === 'circle') {
      ctx.putImageData(snapshot, 0, 0);
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      if (fillShape) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }
  };

  const endAction = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    ctx.globalCompositeOperation = 'source-over';
    saveToHistory(ctx, canvasRef.current);
  };

  const handleRotate = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((90 * Math.PI) / 180);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    setCanvasWidth(canvas.width);
    setCanvasHeight(canvas.height);

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tempCanvas, 0, 0);
    saveToHistory(ctx, canvas);
  };

  const handleFlip = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.translate(canvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(canvas, 0, 0);

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    saveToHistory(ctx, canvas);
  };

  const applyFiltersToCanvas = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
    tempCtx.drawImage(canvas, 0, 0);

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);

    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
    setSepia(0);
    saveToHistory(ctx, canvas);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
    tempCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = 'sprite-art.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  const getCanvasClassName = () => {
    if (tool === 'text') return `${styles.canvas} ${styles.cursorText}`;
    if (tool === 'eyedropper') return `${styles.canvas} ${styles.cursorPipette}`;
    if (tool === 'fill') return `${styles.canvas} ${styles.cursorFill}`;
    return styles.canvas;
  };

  return (
    <div className={styles.container}>
      
      {/* Левая панель */}
      <div className={styles.sidebarLeft}>
        <Link href="/" className={styles.linkHome}>← На главную</Link>
        <h3 className={styles.title}>Инструменты</h3>

        {[
          { id: 'brush', label: '🖌️ Кисть' },
          { id: 'fill', label: '🪣 Заливка' },
          { id: 'eraser', label: '🧹 Ластик' },
          { id: 'eyedropper', label: '💉 Пипетка' },
          { id: 'rect', label: '⬜ Прямоугольник' },
          { id: 'circle', label: '⭕ Круг' },
          { id: 'text', label: '🔤 Текст (клик)' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTool(item.id)}
            className={`${styles.btn} ${tool === item.id ? styles.btnActive : ''}`}
          >
            {item.label}
          </button>
        ))}

        {(tool === 'rect' || tool === 'circle') && (
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={fillShape}
              onChange={(e) => setFillShape(e.target.checked)}
            />
            <span>Заливать фигуру</span>
          </label>
        )}

        {tool === 'text' && (
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Введите текст..."
            className={styles.inputField}
          />
        )}

        <hr className={styles.divider} />
        <h3 className={styles.subTitle}>Размер холста</h3>

        <div className={styles.sizeRow}>
          <input
            type="number"
            value={canvasWidth}
            onChange={(e) => setCanvasWidth(e.target.value)}
            className={styles.sizeInput}
            placeholder="Ширина"
            min="16"
            max="2048"
          />
          <span style={{ color: '#aaa' }}>×</span>
          <input
            type="number"
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(e.target.value)}
            className={styles.sizeInput}
            placeholder="Высота"
            min="16"
            max="2048"
          />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => { setCanvasWidth(32); setCanvasHeight(32); }} className={styles.btnAction} style={{ flex: 1, fontSize: '11px' }}>32×32</button>
          <button onClick={() => { setCanvasWidth(64); setCanvasHeight(64); }} className={styles.btnAction} style={{ flex: 1, fontSize: '11px' }}>64×64</button>
          <button onClick={() => { setCanvasWidth(512); setCanvasHeight(512); }} className={styles.btnAction} style={{ flex: 1, fontSize: '11px' }}>512×512</button>
        </div>

        <button onClick={handleResizeCanvas} className={styles.btnResize}>
          📐 Изменить размер
        </button>

        <hr className={styles.divider} />

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={whiteBg}
            onChange={(e) => handleToggleWhiteBg(e.target.checked)}
          />
          <span>Белый фон</span>
        </label>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          <span>Показать сетку</span>
        </label>

        {showGrid && (
          <label className={styles.labelControl}>
            <span>Шаг сетки:</span>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className={styles.selectField}
            >
              <option value={16}>16 × 16 px</option>
              <option value={32}>32 × 32 px</option>
              <option value={64}>64 × 64 px</option>
            </select>
          </label>
        )}

        <hr className={styles.divider} />

        <label className={styles.labelControl}>
          <div className={styles.colorRow}>
            <span>Цвет:</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </label>

        <label className={styles.labelControl}>
          <span>Размер: {size}px</span>
          <input
            type="range"
            min="1"
            max="50"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </label>

        <hr className={styles.divider} />
        <h3 className={styles.subTitle}>Трансформация</h3>
        <button onClick={handleRotate} className={styles.btnAction}>🔄 Повернуть 90°</button>
        <button onClick={handleFlip} className={styles.btnAction}>↔️ Отразить</button>
      </div>

      {/* Центр */}
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <label className={styles.fileLabel}>
            📂 Открыть фото
            <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
          </label>

          <button onClick={handleUndo} disabled={historyStep <= 0} className={styles.btnTop}>↩️ Назад</button>
          <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className={styles.btnTop}>↪️ Вперёд</button>
          <button onClick={handleClearCanvas} className={styles.btnClear}>🗑️ Очистить</button>

          <button onClick={handleSave} className={styles.btnSave}>
            💾 Сохранить PNG
          </button>
        </div>

        <div className={styles.canvasArea}>
          <div className={styles.canvasWrapper}>
            <canvas
              ref={canvasRef}
              onMouseDown={startAction}
              onMouseMove={moveAction}
              onMouseUp={endAction}
              onMouseLeave={endAction}
              onTouchStart={startAction}
              onTouchMove={moveAction}
              onTouchEnd={endAction}
              className={getCanvasClassName()}
            />
            {showGrid && (
              <div
                className={styles.gridOverlay}
                style={{ backgroundSize: `${gridSize}px ${gridSize}px` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Правая панель */}
      <div className={styles.sidebarRight}>
        <h3 className={styles.subTitle}>Цветокоррекция</h3>

        <label className={styles.labelControl}>
          <span>Яркость: {brightness}%</span>
          <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className={styles.rangeInput} />
        </label>

        <label className={styles.labelControl}>
          <span>Контраст: {contrast}%</span>
          <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className={styles.rangeInput} />
        </label>

        <label className={styles.labelControl}>
          <span>Чёрно-белое: {grayscale}%</span>
          <input type="range" min="0" max="100" value={grayscale} onChange={(e) => setGrayscale(Number(e.target.value))} className={styles.rangeInput} />
        </label>

        <label className={styles.labelControl}>
          <span>Сепия: {sepia}%</span>
          <input type="range" min="0" max="100" value={sepia} onChange={(e) => setSepia(Number(e.target.value))} className={styles.rangeInput} />
        </label>

        <button onClick={applyFiltersToCanvas} className={styles.btnFilter}>
          ✓ Применить фильтры
        </button>
      </div>
    </div>
  );
}