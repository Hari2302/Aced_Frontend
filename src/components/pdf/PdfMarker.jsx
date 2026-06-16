import { useEffect, useRef, useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MARK_TYPES = {
  circle: { label: "Circle", color: "border-red-600 text-red-600" },
  tick: { label: "Tick", color: "border-green-600 text-green-700" },
  cross: { label: "Cross", color: "border-red-600 text-red-600" },
};

const PdfMarker = ({ pdfBytes, onSave, disabled }) => {
  const [pages, setPages] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [marks, setMarks] = useState([]);
  const [markType, setMarkType] = useState("circle");
  const [saving, setSaving] = useState(false);
  const canvasRefs = useRef({});

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      if (!pdfBytes) {
        setPages([]);
        setMarks([]);
        return;
      }

      const task = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
      const pdf = await task.promise;
      const nextPages = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        nextPages.push({ pageNumber, page });
      }

      if (!cancelled) {
        setPages(nextPages);
        setMarks([]);
      }
    };

    loadPdf().catch(() => {
      if (!cancelled) setPages([]);
    });

    return () => {
      cancelled = true;
    };
  }, [pdfBytes]);

  useEffect(() => {
    const renderTasks = [];

    pages.forEach(({ pageNumber, page }) => {
      const canvas = canvasRefs.current[pageNumber];
      if (!canvas) return;

      const viewport = page.getViewport({ scale: zoom });
      const context = canvas.getContext("2d");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      renderTasks.push(page.render({ canvasContext: context, viewport }));
    });

    return () => {
      renderTasks.forEach((task) => task?.cancel?.());
    };
  }, [pages, zoom]);

  const addMark = (event, pageNumber) => {
    if (disabled || saving) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;

    if (xRatio < 0 || xRatio > 1 || yRatio < 0 || yRatio > 1) return;

    setMarks((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type: markType,
        pageNumber,
        xRatio,
        yRatio,
      },
    ]);
  };

  const zoomBy = (delta) => {
    setZoom((prev) =>
      Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.5), 2),
    );
  };

  const undo = () => setMarks((prev) => prev.slice(0, -1));

  const drawMarkOnPage = (pdfPage, mark) => {
    const { width, height } = pdfPage.getSize();
    const x = mark.xRatio * width;
    const y = height - mark.yRatio * height;

    if (mark.type === "tick") {
      pdfPage.drawText("✓", {
        x: x - 6,
        y: y - 8,
        size: 20,
        color: rgb(0, 0.55, 0.16),
      });
      return;
    }

    if (mark.type === "cross") {
      pdfPage.drawText("X", {
        x: x - 6,
        y: y - 8,
        size: 18,
        color: rgb(0.9, 0, 0),
      });
      return;
    }

    pdfPage.drawEllipse({
      x,
      y,
      xScale: 10,
      yScale: 10,
      borderColor: rgb(0.9, 0, 0),
      borderWidth: 2,
    });
  };

  const saveMarkedPdf = async () => {
    if (!marks.length) return;
    try {
      setSaving(true);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pdfPages = pdfDoc.getPages();

      marks.forEach((mark) => {
        const pdfPage = pdfPages[mark.pageNumber - 1];
        if (pdfPage) drawMarkOnPage(pdfPage, mark);
      });

      onSave(await pdfDoc.save());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <button type="button" className="admin-action-icon-btn" onClick={() => zoomBy(-0.1)} disabled={disabled || zoom <= 0.5} title="Zoom out">
            -
          </button>
          <span className="min-w-16 text-center text-sm font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" className="admin-action-icon-btn" onClick={() => zoomBy(0.1)} disabled={disabled || zoom>= 2} title="Zoom in">
            +
          </button>
        </div>

        <div className="text-sm font-semibold text-slate-700">
          {pages.length ? `${pages.length} page${pages.length > 1 ? "s" : ""}` : "Loading PDF"}
        </div>

        <div className="flex items-center gap-2">
          <select className="h-8 rounded border border-slate-300 bg-white px-2 text-sm" value={markType} onChange={event => setMarkType(event.target.value)} disabled={disabled || saving}>
            {Object.entries(MARK_TYPES).map(([value, item]) => (
              <option key={value} value={value}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" className="admin-secondary-btn py-1.5! px-3!" onClick={undo} disabled={disabled || saving || marks.length === 0}>
            Undo
          </button>
          <button type="button" className="admin-primary-btn py-1.5! px-3!" onClick={saveMarkedPdf} disabled={disabled || saving || marks.length === 0}>
            {saving ? "Saving..." : "Save Marked PDF"}
          </button>
        </div>
      </div>

      <div className="max-h-[62vh] overflow-auto bg-slate-200 p-4">
        {pages.map(({ pageNumber, page }) => {
          const viewport = page.getViewport({ scale: zoom });
          const pageMarks = marks.filter((mark) => mark.pageNumber === pageNumber);

          return (
            <div key={pageNumber} className="relative mx-auto mb-5 bg-white shadow-lg" style={{ width: viewport.width, height: viewport.height }} onClick={event => addMark(event, pageNumber)} role="button" tabIndex={0}>
              <canvas ref={node => { canvasRefs.current[pageNumber] = node; }} className="block" />
              {pageMarks.map((mark) => (
                <span key={mark.id} className={`pointer-events-none absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white/20 text-lg font-bold ${MARK_TYPES[mark.type]?.color}`} style={{ left: `${mark.xRatio * 100}%`, top: `${mark.yRatio * 100}%` }}>
                  {mark.type === "tick" ? "✓" : mark.type === "cross" ? "X" : ""}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PdfMarker;
