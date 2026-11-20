'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './editor.module.css';

const MIN_SIZE = 16;
const MAX_SIZE = 2048;
const ZOOM_LEVELS = [25, 50, 75, 100, 150, 200, 300, 400, 600, 800, 1200, 1600];

const clampSize = (value, fallback = 512) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(num)));
};

const createLayerCanvas = (width, height, fillWhite = false) => {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  if (fillWhite) {
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
  }
  return c;
};

export default function FullPhotoShopEditor() {
  const displayCanvasRef = useRef(null);
  const layerCanvasesRef = useRef({});
  const layerCounterRef = useRef(1);

  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);

  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#ff0000');
  const [size, setSize] = useState(5);
  const [fillShape, setFillShape] = useState(false);
  const [whiteBg, setWhiteBg] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(32);
  const [textInput, setTextInput] = useState('Ваш текст');
  const [zoom, setZoom] = useState(75);

  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(500);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  const [historyState, setHistoryState] = useState({
    items: [],
    index: -1,
  });

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);

  // Отрисовка всех видимых слоёв на главный canvas
  const renderComposite = useCallback(
    (customLayers = layers, customW = canvasWidth, customH = canvasHeight) => {
      const display = displayCanvasRef.current;
      if (!display) return;

      if (display.width !== customW) display.width = customW;
      if (display.height !== customH) display.height = customH;

      const dCtx = display.getContext('2d');
      if (!dCtx) return;

      dCtx.globalCompositeOperation = 'source-over';
      dCtx.clearRect(0, 0, customW, customH);

      customLayers.forEach((layer) => {
        if (!layer.visible) return;
        const lCanvas = layerCanvasesRef.current[layer.id];
        if (lCanvas) {
          dCtx.drawImage(lCanvas, 0, 0);
        }
      });
    },
    [layers, canvasWidth, canvasHeight]
  );

  // Сохранение снимка всех слоёв в историю
  const saveSnapshotToHistory = useCallback(
    (customLayers = layers, customActiveId = activeLayerId, w = canvasWidth, h = canvasHeight) => {
      const serializedLayers = customLayers.map((l) => {
        const c = layerCanvasesRef.current[l.id];
        return {
          id: l.id,
          name: l.name,
          visible: l.visible,
          dataUrl: c ? c.toDataURL('image/png') : '',
        };
      });

      const entry = {
        width: w,
        height: h,
        activeLayerId: customActiveId,
        layers: serializedLayers,
      };

      setHistoryState((prev) => {
        const base = prev.index >= 0 ? prev.items.slice(0, prev.index + 1) : [];
        const nextItems = [...base, entry];
        return {
          items: nextItems,
          index: nextItems.length - 1,
        };
      });
    },
    [layers, activeLayerId, canvasWidth, canvasHeight]
  );

  // Инициализация первого слоя при запуске
  useEffect(() => {
    const initialId = 'layer-1';
    layerCanvasesRef.current[initialId] = createLayerCanvas(800, 500, true);
    const initialLayers = [{ id: initialId, name: 'Слой 1 (Фон)', visible: true }];

    setLayers(initialLayers);
    setActiveLayerId(initialId);

    const display = displayCanvasRef.current;
    if (display) {
      display.width = 800;
      display.height = 500;
      const dCtx = display.getContext('2d');
      if (dCtx) {
        dCtx.drawImage(layerCanvasesRef.current[initialId], 0, 0);
      }
    }

    setHistoryState({
      items: [
        {
          width: 800,
          height: 500,
          activeLayerId: initialId,
          layers: [
            {
              id: initialId,
              name: 'Слой 1 (Фон)',
              visible: true,
              dataUrl: layerCanvasesRef.current[initialId].toDataURL('image/png'),
            },
          ],
        },
      ],
      index: 0,
    });
  }, []);

  useEffect(() => {
    renderComposite(layers, canvasWidth, canvasHeight);
  }, [layers, canvasWidth, canvasHeight, renderComposite]);

  useEffect(() => {
    if (!displayCanvasRef.current) return;
    displayCanvasRef.current.style.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
  }, [brightness, contrast, grayscale, sepia]);

  const restoreHistoryEntry = useCallback(async (entry) => {
    if (!entry) return;

    const newCanvases = {};
    await Promise.all(
      entry.layers.map(
        (l) =>
          new Promise((resolve) => {
            const c = createLayerCanvas(entry.width, entry.height, false);
            const img = new Image();
            img.onload = () => {
              const ctx = c.getContext('2d');
              if (ctx) ctx.drawImage(img, 0, 0);
              newCanvases[l.id] = c;
              resolve();
            };
            img.onerror = () => {
              newCanvases[l.id] = c;
              resolve();
            };
            img.src = l.dataUrl;
          })
      )
    );

    layerCanvasesRef.current = newCanvases;
    const restoredMeta = entry.layers.map(({ id, name, visible }) => ({ id, name, visible }));
    setCanvasWidth(entry.width);
    setCanvasHeight(entry.height);
    setLayers(restoredMeta);
    setActiveLayerId(entry.activeLayerId);
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index <= 0) return prev;
      const nextIndex = prev.index - 1;
      restoreHistoryEntry(prev.items[nextIndex]);
      return { ...prev, index: nextIndex };
    });
  }, [restoreHistoryEntry]);

  const handleRedo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index >= prev.items.length - 1) return prev;
      const nextIndex = prev.index + 1;
      restoreHistoryEntry(prev.items[nextIndex]);
      return { ...prev, index: nextIndex };
    });
  }, [restoreHistoryEntry]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const getActiveLayerContext = () => {
    if (!activeLayerId) return null;
    const lCanvas = layerCanvasesRef.current[activeLayerId];
    if (!lCanvas) return null;
    const ctx = lCanvas.getContext('2d', { willReadFrequently: true });
    return ctx ? { canvas: lCanvas, ctx } : null;
  };

  // Управление слоями
  const handleAddLayer = () => {
    layerCounterRef.current += 1;
    const newId = `layer-${layerCounterRef.current}-${Date.now()}`;
    layerCanvasesRef.current[newId] = createLayerCanvas(canvasWidth, canvasHeight, false);

    const nextLayers = [
      ...layers,
      { id: newId, name: `Слой ${layerCounterRef.current}`, visible: true },
    ];
    setLayers(nextLayers);
    setActiveLayerId(newId);
    saveSnapshotToHistory(nextLayers, newId);
  };

  const handleDeleteLayer = (id) => {
    if (layers.length <= 1) return;
    const nextLayers = layers.filter((l) => l.id !== id);
    delete layerCanvasesRef.current[id];

    const nextActive = activeLayerId === id ? nextLayers[nextLayers.length - 1].id : activeLayerId;
    setLayers(nextLayers);
    setActiveLayerId(nextActive);
    saveSnapshotToHistory(nextLayers, nextActive);
  };

  const handleToggleLayerVisibility = (id) => {
    const nextLayers = layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l));
    setLayers(nextLayers);
    saveSnapshotToHistory(nextLayers, activeLayerId);
  };

  const handleMoveLayer = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= layers.length) return;
    const nextLayers = [...layers];
    const [moved] = nextLayers.splice(index, 1);
    nextLayers.splice(targetIndex, 0, moved);
    setLayers(nextLayers);
    saveSnapshotToHistory(nextLayers, activeLayerId);
  };

  // Зум
  const handleZoomOut = () => {
    const prev = [...ZOOM_LEVELS].reverse().find((z) => z < zoom);
    if (prev) setZoom(prev);
  };

  const handleZoomIn = () => {
    const next = ZOOM_LEVELS.find((z) => z > zoom);
    if (next) setZoom(next);
  };

  // Размер холста
  const handleResizeCanvas = () => {
    const w = clampSize(canvasWidth, 512);
    const h = clampSize(canvasHeight, 512);
    setCanvasWidth(w);
    setCanvasHeight(h);

    layers.forEach((l, idx) => {
      const oldC = layerCanvasesRef.current[l.id];
      const newC = createLayerCanvas(w, h, idx === 0 && whiteBg);
      const nCtx = newC.getContext('2d');
      if (nCtx && oldC) {
        nCtx.drawImage(oldC, 0, 0);
      }
      layerCanvasesRef.current[l.id] = newC;
    });

    renderComposite(layers, w, h);
    saveSnapshotToHistory(layers, activeLayerId, w, h);
  };

  const handleToggleWhiteBg = (checked) => {
    setWhiteBg(checked);
    if (!layers.length) return;

    const baseLayerId = layers[0].id;
    const baseCanvas = layerCanvasesRef.current[baseLayerId];
    const bCtx = baseCanvas?.getContext('2d');
    if (!bCtx || !baseCanvas) return;

    if (checked) {
      bCtx.save();
      bCtx.globalCompositeOperation = 'destination-over';
      bCtx.fillStyle = '#ffffff';
      bCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
      bCtx.restore();
      renderComposite();
      saveSnapshotToHistory();
    }
  };

  const handleClearLayer = () => {
    const active = getActiveLayerContext();
    if (!active) return;

    active.ctx.globalCompositeOperation = 'source-over';
    active.ctx.clearRect(0, 0, active.canvas.width, active.canvas.height);

    if (layers[0]?.id === activeLayerId && whiteBg) {
      active.ctx.fillStyle = '#ffffff';
      active.ctx.fillRect(0, 0, active.canvas.width, active.canvas.height);
    }

    renderComposite();
    saveSnapshotToHistory();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') return;

      const img = new Image();
      img.onload = () => {
        const w = clampSize(img.width, 512);
        const h = clampSize(img.height, 512);

        layers.forEach((l, idx) => {
          const oldC = layerCanvasesRef.current[l.id];
          const newC = createLayerCanvas(w, h, idx === 0 && whiteBg);
          const nCtx = newC.getContext('2d');
          if (nCtx && oldC && l.id !== activeLayerId) {
            nCtx.drawImage(oldC, 0, 0);
          }
          layerCanvasesRef.current[l.id] = newC;
        });

        const targetId = activeLayerId || layers[0]?.id;
        const targetCanvas = layerCanvasesRef.current[targetId];
        const tCtx = targetCanvas?.getContext('2d');
        if (tCtx) {
          tCtx.globalCompositeOperation = 'source-over';
          tCtx.drawImage(img, 0, 0, w, h);
        }

        setCanvasWidth(w);
        setCanvasHeight(h);
        renderComposite(layers, w, h);
        saveSnapshotToHistory(layers, targetId, w, h);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getCoords = (e) => {
    const display = displayCanvasRef.current;
    if (!display) return { x: 0, y: 0 };

    const rect = display.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };

    const touch = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;

    return {
      x: (clientX - rect.left) * (canvasWidth / rect.width),
      y: (clientY - rect.top) * (canvasHeight / rect.height),
    };
  };

  const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map((val) => val.toString(16).padStart(2, '0')).join('');

  const hexToRgba = (hex) => {
    const clean = (hex || '#000000').replace('#', '');
    if (clean.length !== 6) return [0, 0, 0, 255];
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
      255,
    ];
  };

  const floodFill = (startX, startY, fillColorHex) => {
    const active = getActiveLayerContext();
    if (!active) return;

    const { canvas, ctx } = active;
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
    renderComposite();
    saveSnapshotToHistory();
  };

  const startAction = (e) => {
    const active = getActiveLayerContext();
    const display = displayCanvasRef.current;
    if (!active || !display) return;

    if (e.cancelable) e.preventDefault();

    const pos = getCoords(e);
    setStartPos(pos);

    if (tool === 'fill') {
      floodFill(pos.x, pos.y, color);
      return;
    }

    if (tool === 'eyedropper') {
      const dCtx = display.getContext('2d', { willReadFrequently: true });
      if (!dCtx) return;
      const px = Math.max(0, Math.min(canvasWidth - 1, Math.floor(pos.x)));
      const py = Math.max(0, Math.min(canvasHeight - 1, Math.floor(pos.y)));
      const pixel = dCtx.getImageData(px, py, 1, 1).data;
      setColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
      setTool('brush');
      return;
    }

    if (tool === 'text') {
      if (!textInput.trim()) return;
      active.ctx.globalCompositeOperation = 'source-over';
      active.ctx.font = `${Math.max(10, size * 4)}px sans-serif`;
      active.ctx.fillStyle = color;
      active.ctx.fillText(textInput, pos.x, pos.y);
      renderComposite();
      saveSnapshotToHistory();
      return;
    }

    setIsDrawing(true);
    setSnapshot(active.ctx.getImageData(0, 0, active.canvas.width, active.canvas.height));

    active.ctx.beginPath();
    active.ctx.moveTo(pos.x, pos.y);
    active.ctx.lineWidth = size;
    active.ctx.lineCap = 'round';
    active.ctx.lineJoin = 'round';

    const isBottomWhiteBgLayer = layers[0]?.id === activeLayerId && whiteBg;

    if (tool === 'eraser') {
      if (isBottomWhiteBgLayer) {
        active.ctx.globalCompositeOperation = 'source-over';
        active.ctx.strokeStyle = '#ffffff';
      } else {
        active.ctx.globalCompositeOperation = 'destination-out';
        active.ctx.strokeStyle = 'rgba(0,0,0,1)';
      }
    } else {
      active.ctx.globalCompositeOperation = 'source-over';
      active.ctx.strokeStyle = color;
      active.ctx.fillStyle = color;
    }
  };

  const moveAction = (e) => {
    if (!isDrawing) return;
    const active = getActiveLayerContext();
    if (!active) return;

    if (e.cancelable) e.preventDefault();

    const pos = getCoords(e);
    const { ctx } = active;

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      renderComposite();
    } else if (tool === 'rect' && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      if (fillShape) {
        ctx.fillRect(startPos.x, startPos.y, w, h);
      } else {
        ctx.strokeRect(startPos.x, startPos.y, w, h);
      }
      renderComposite();
    } else if (tool === 'circle' && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      const radius = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      if (fillShape) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
      renderComposite();
    }
  };

  const endAction = () => {
    if (!isDrawing) return;
    const active = getActiveLayerContext();
    if (active) {
      active.ctx.globalCompositeOperation = 'source-over';
    }
    setIsDrawing(false);
    setSnapshot(null);
    renderComposite();
    saveSnapshotToHistory();
  };

  const handleRotate = () => {
    const newW = canvasHeight;
    const newH = canvasWidth;

    layers.forEach((l) => {
      const oldC = layerCanvasesRef.current[l.id];
      if (!oldC) return;

      const rotatedC = createLayerCanvas(newW, newH, false);
      const rCtx = rotatedC.getContext('2d');
      if (!rCtx) return;

      rCtx.translate(newW / 2, newH / 2);
      rCtx.rotate(Math.PI / 2);
      rCtx.drawImage(oldC, -oldC.width / 2, -oldC.height / 2);
      layerCanvasesRef.current[l.id] = rotatedC;
    });

    setCanvasWidth(newW);
    setCanvasHeight(newH);
    renderComposite(layers, newW, newH);
    saveSnapshotToHistory(layers, activeLayerId, newW, newH);
  };

  const handleFlip = () => {
    layers.forEach((l) => {
      const oldC = layerCanvasesRef.current[l.id];
      if (!oldC) return;

      const flippedC = createLayerCanvas(canvasWidth, canvasHeight, false);
      const fCtx = flippedC.getContext('2d');
      if (!fCtx) return;

      fCtx.translate(canvasWidth, 0);
      fCtx.scale(-1, 1);
      fCtx.drawImage(oldC, 0, 0);
      layerCanvasesRef.current[l.id] = flippedC;
    });

    renderComposite();
    saveSnapshotToHistory();
  };

  const applyFiltersToCanvas = () => {
    const active = getActiveLayerContext();
    if (!active) return;

    const tempCanvas = createLayerCanvas(canvasWidth, canvasHeight, false);
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
    tempCtx.drawImage(active.canvas, 0, 0);

    active.ctx.globalCompositeOperation = 'source-over';
    active.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    active.ctx.drawImage(tempCanvas, 0, 0);

    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
    setSepia(0);
    renderComposite();
    saveSnapshotToHistory();
  };

  const handleSave = () => {
    const tempCanvas = createLayerCanvas(canvasWidth, canvasHeight, false);
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
    layers.forEach((l) => {
      if (!l.visible) return;
      const lCanvas = layerCanvasesRef.current[l.id];
      if (lCanvas) tempCtx.drawImage(lCanvas, 0, 0);
    });

    const link = document.createElement('a');
    link.download = 'character-sprite.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  const getCanvasClassName = () => {
    const classes = [styles.canvas];
    if (zoom > 100) classes.push(styles.pixelated);
    if (tool === 'text') classes.push(styles.cursorText);
    if (tool === 'eyedropper') classes.push(styles.cursorPipette);
    if (tool === 'fill') classes.push(styles.cursorFill);
    return classes.join(' ');
  };

  const scaledWidth = Math.round((canvasWidth * zoom) / 100);
  const scaledHeight = Math.round((canvasHeight * zoom) / 100);
  const scaledGridSize = (gridSize * zoom) / 100;

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
            type="button"
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
            min={MIN_SIZE}
            max={MAX_SIZE}
          />
          <span className={styles.sizeSeparator}>×</span>
          <input
            type="number"
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(e.target.value)}
            className={styles.sizeInput}
            placeholder="Высота"
            min={MIN_SIZE}
            max={MAX_SIZE}
          />
        </div>

        <div className={styles.presetRow}>
          <button
            type="button"
            onClick={() => { setCanvasWidth(32); setCanvasHeight(32); }}
            className={`${styles.btnAction} ${styles.presetBtn}`}
          >
            32×32
          </button>
          <button
            type="button"
            onClick={() => { setCanvasWidth(64); setCanvasHeight(64); }}
            className={`${styles.btnAction} ${styles.presetBtn}`}
          >
            64×64
          </button>
          <button
            type="button"
            onClick={() => { setCanvasWidth(512); setCanvasHeight(512); }}
            className={`${styles.btnAction} ${styles.presetBtn}`}
          >
            512×512
          </button>
        </div>

        <button type="button" onClick={handleResizeCanvas} className={styles.btnResize}>
          📐 Изменить размер
        </button>

        <hr className={styles.divider} />

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={whiteBg}
            onChange={(e) => handleToggleWhiteBg(e.target.checked)}
          />
          <span>Белый фон (слой 1)</span>
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
              <option value={8}>8 × 8 px</option>
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
        <button type="button" onClick={handleRotate} className={styles.btnAction}>🔄 Повернуть 90°</button>
        <button type="button" onClick={handleFlip} className={styles.btnAction}>↔️ Отразить</button>
      </div>

      {/* Центр */}
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <label className={styles.fileLabel}>
            📂 Открыть фото
            <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
          </label>

          <button
            type="button"
            onClick={handleUndo}
            disabled={historyState.index <= 0}
            className={styles.btnTop}
          >
            ↩️ Назад
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyState.index >= historyState.items.length - 1}
            className={styles.btnTop}
          >
            ↪️ Вперёд
          </button>

          <div className={styles.zoomControls}>
            <button type="button" onClick={handleZoomOut} className={styles.btnTop} title="Уменьшить">−</button>
            <span
              className={styles.zoomLabel}
              onClick={() => setZoom(100)}
              title="Сбросить масштаб до 100%"
            >
              {zoom}%
            </span>
            <button type="button" onClick={handleZoomIn} className={styles.btnTop} title="Увеличить">+</button>
          </div>

          <button type="button" onClick={handleClearLayer} className={styles.btnClear}>🗑️ Очистить слой</button>

          <button type="button" onClick={handleSave} className={styles.btnSave}>
            💾 Сохранить PNG
          </button>
        </div>

        <div className={styles.canvasArea}>
          <div
            className={styles.canvasWrapper}
            style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}
          >
            <canvas
              ref={displayCanvasRef}
              onMouseDown={startAction}
              onMouseMove={moveAction}
              onMouseUp={endAction}
              onMouseLeave={endAction}
              onTouchStart={startAction}
              onTouchMove={moveAction}
              onTouchEnd={endAction}
              style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}
              className={getCanvasClassName()}
            />
            {showGrid && (
              <div
                className={styles.gridOverlay}
                style={{ backgroundSize: `${scaledGridSize}px ${scaledGridSize}px` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Правая панель */}
      <div className={styles.sidebarRight}>
        {/* Слои */}
        <div className={styles.layersSection}>
          <div className={styles.layersHeader}>
            <h3 className={styles.subTitle}>Слои</h3>
            <button type="button" onClick={handleAddLayer} className={styles.btnAddLayer}>
              + Новый
            </button>
          </div>

          <div className={styles.layersList}>
            {[...layers].reverse().map((layer, revIdx) => {
              const realIdx = layers.length - 1 - revIdx;
              const isActive = layer.id === activeLayerId;

              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`${styles.layerItem} ${isActive ? styles.layerItemActive : ''}`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLayerVisibility(layer.id);
                    }}
                    className={styles.layerIconBtn}
                    title={layer.visible ? 'Скрыть слой' : 'Показать слой'}
                  >
                    {layer.visible ? '👁️' : '🚫'}
                  </button>

                  <span className={styles.layerName}>{layer.name}</span>

                  <div className={styles.layerActions} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={realIdx === layers.length - 1}
                      onClick={() => handleMoveLayer(realIdx, 1)}
                      className={styles.layerSmallBtn}
                      title="Выше"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={realIdx === 0}
                      onClick={() => handleMoveLayer(realIdx, -1)}
                      className={styles.layerSmallBtn}
                      title="Ниже"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      disabled={layers.length <= 1}
                      onClick={() => handleDeleteLayer(layer.id)}
                      className={styles.layerDeleteBtn}
                      title="Удалить слой"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Цветокоррекция */}
        <h3 className={styles.subTitle}>Цветокоррекция</h3>

        <label className={styles.labelControl}>
          <span>Яркость: {brightness}%</span>
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </label>

        <label className={styles.labelControl}>
          <span>Контраст: {contrast}%</span>
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </label>

        <label className={styles.labelControl}>
          <span>Чёрно-белое: {grayscale}%</span>
          <input
            type="range"
            min="0"
            max="100"
            value={grayscale}
            onChange={(e) => setGrayscale(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </label>

        <label className={styles.labelControl}>
          <span>Сепия: {sepia}%</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sepia}
            onChange={(e) => setSepia(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </label>

        <button type="button" onClick={applyFiltersToCanvas} className={styles.btnFilter}>
          ✓ Применить к слою
        </button>
      </div>
    </div>
  );
}