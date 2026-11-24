"use client";
import React, { useRef, useState } from "react";

export default function HandTool({ children }) {
  const [isHandActive, setIsHandActive] = useState(true); // сразу включена или по клику
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    const canPan = isHandActive || e.button === 1;
    if (!canPan) return;

    e.preventDefault();
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: pan.x, y: pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleReset = () => {
    setPan({ x: 0, y: 0 });
  };

  const getCursor = () => {
    if (!isHandActive) return "default";
    return isPanning ? "grabbing" : "grab";
  };

  return (
    <div className="editor_workspace">
      <div className="workspace_bar">
        <button
          type="button"
          className={`hand_btn ${isHandActive ? "active" : ""}`}
          onClick={() => setIsHandActive((prev) => !prev)}
        >
          Рука
        </button>

        <button type="button" className="hand_btn" onClick={handleReset}>
          Сброс
        </button>
      </div>

      <div
        className="workspace_area"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{ cursor: getCursor() }}
      >
        <div
          className="paper_sheet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}