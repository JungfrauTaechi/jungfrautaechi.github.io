import { useEffect, useRef, useState } from "react";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { appPath } from "./site-paths.js";

function PdfPage({ document, number }) {
  const canvasRef = useRef(null);
  const sheetRef = useRef(null);
  const textLayerRef = useRef(null);
  const [availableWidth, setAvailableWidth] = useState(() => Math.max(1, window.innerWidth - 16));

  useEffect(() => {
    let frame;
    const updateWidth = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setAvailableWidth(Math.max(1, window.innerWidth - 16)));
    };
    addEventListener("resize", updateWidth);
    return () => {
      removeEventListener("resize", updateWidth);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let renderTask;
    let textLayer;

    const render = async () => {
      const [page, pdfjs] = await Promise.all([document.getPage(number), import("pdfjs-dist")]);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(1.6, availableWidth / unscaledViewport.width) });
      const canvas = canvasRef.current;
      const sheet = sheetRef.current;
      const textContainer = textLayerRef.current;
      if (!canvas || !sheet || !textContainer || cancelled) return;
      const context = canvas.getContext("2d", { alpha: false });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      textContainer.replaceChildren();
      sheet.style.setProperty("--total-scale-factor", viewport.scale);
      renderTask = page.render({ canvasContext: context, viewport });
      textLayer = new pdfjs.TextLayer({
        textContentSource: page.streamTextContent({ includeMarkedContent: true }),
        container: textContainer,
        viewport,
      });
      await Promise.all([renderTask.promise, textLayer.render()]);
    };

    render().catch((error) => {
      if (!cancelled && error?.name !== "RenderingCancelledException") console.error(error);
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
      textLayer?.cancel();
    };
  }, [availableWidth, document, number]);

  return <figure className="protocol-pdf-page"><div className="protocol-pdf-sheet" ref={sheetRef}><canvas ref={canvasRef} aria-hidden="true" /><div className="textLayer protocol-pdf-text-layer" ref={textLayerRef} role="document" aria-label={`Text von Seite ${number}`} /></div><figcaption>Seite {number}</figcaption></figure>;
}

export function ProtocolPdfViewer({ year }) {
  const siteBase = import.meta.env.BASE_URL;
  const pdfUrl = `${siteBase}assets/documents/hv/protokoll-hv-${year}.pdf`;
  const [pdfDocument, setPdfDocument] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    window.document.title = `Protokoll HV ${year} | Jungfrau-Tächi Grindelwald`;
  }, [year]);

  useEffect(() => {
    let active = true;
    let loadingTask;

    const load = async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      loadingTask = pdfjs.getDocument(pdfUrl);
      const loadedDocument = await loadingTask.promise;
      if (active) setPdfDocument(loadedDocument);
      else loadedDocument.destroy();
    };

    load().catch(() => active && setError("Das Protokoll konnte nicht angezeigt werden."));
    return () => {
      active = false;
      loadingTask?.destroy();
    };
  }, [pdfUrl]);

  return <div className="protocol-viewer-page"><header className="protocol-viewer-header"><div><p className="eyebrow">Vereinsdokumente</p><h1>Protokoll HV {year}</h1><p>{pdfDocument ? `${pdfDocument.numPages} Seiten` : error || "Dokument wird geladen …"}</p></div><div className="protocol-viewer-actions"><a href={appPath("/club#dokumente", siteBase)}>Zurück zum Club</a><a href={pdfUrl} download={`protokoll-hv-${year}.pdf`}>PDF herunterladen</a></div></header><main className="protocol-pdf-pages" aria-busy={!pdfDocument && !error}>{error && <div className="protocol-pdf-error"><p>{error}</p><a href={pdfUrl} download={`protokoll-hv-${year}.pdf`}>PDF herunterladen</a></div>}{pdfDocument && Array.from({ length: pdfDocument.numPages }, (_, index) => <PdfPage key={index + 1} document={pdfDocument} number={index + 1} />)}</main></div>;
}
