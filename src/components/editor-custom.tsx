import { useImageEditor } from "@ozdemircibaris/react-image-editor/core";
import { useEffect, useRef, useState } from "react";

interface EditorCustomProps {
    imageUrl: string
    closedModal: (closed: boolean) => void
    onSave: (blob: Blob) => void
}

export const EditorCustom = ({ imageUrl, closedModal, onSave }: EditorCustomProps) => {
    const editor = useImageEditor({
        imageUrl: imageUrl,
        defaultColor: "#000000",
        defaultStrokeWidth: 0,
        blurIntensity: 10,
        canvasPadding: 0,
        blurThrottleMs: 0
    });

    const [zoom, setZoomState] = useState(1);

    const [panMode, setPanMode] = useState(false);
    const lastPoint = useRef<{ x: number, y: number } | null>(null);

    const applyZoom = (level: number) => {
        const next = Math.min(5, Math.max(0.5, Math.round(level * 100) / 100));
        setZoomState(next);
        editor.zoom.set(next);
    };

    const resetView = () => {
        applyZoom(1);
        const canvas = editor.canvas;
        if (canvas) {
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            canvas.requestRenderAll();
        }
    };

    // Se usa la fase de captura para que fabric no reciba el gesto y no seleccione objetos
    const isPanGesture = (event: React.PointerEvent) => event.button === 1 || (panMode && event.button === 0);

    const onPanStart = (event: React.PointerEvent) => {
        if (!isPanGesture(event)) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        lastPoint.current = { x: event.clientX, y: event.clientY };
    };

    const onPanMove = (event: React.PointerEvent) => {
        const last = lastPoint.current;
        const canvas = editor.canvas;
        if (!last || !canvas?.viewportTransform) return;
        event.stopPropagation();
        const vpt = [...canvas.viewportTransform];
        vpt[4] += event.clientX - last.x;
        vpt[5] += event.clientY - last.y;
        lastPoint.current = { x: event.clientX, y: event.clientY };
        canvas.setViewportTransform(vpt);
        canvas.requestRenderAll();
    };

    const onPanEnd = (event: React.PointerEvent) => {
        if (!lastPoint.current) return;
        event.stopPropagation();
        lastPoint.current = null;
    };

    useEffect(() => {
        editor.style.setStrokeWidth(0);
    })

    return (
        <div
            tabIndex={0}
            className={'flex justify-center items-center fixed w-full z-10 inset-0 bg-transparent'}
            onClick={() => closedModal(false)}
        >
            <div className='bg-gray-600 p-4 border-gray-950 border-2'
                onClick={(event) => {
                    console.log('in modal')
                    event.preventDefault();
                    event.stopPropagation();
                }}>
                <div className="grid grid-cols-1 gap-2">
                    <div
                        className={`overflow-hidden ${panMode ? 'cursor-grab' : ''}`}
                        onPointerDownCapture={onPanStart}
                        onPointerMoveCapture={onPanMove}
                        onPointerUpCapture={onPanEnd}
                        onPointerCancelCapture={onPanEnd}
                        onMouseDownCapture={(event) => { if (isPanGesture(event as unknown as React.PointerEvent)) event.stopPropagation() }}
                        onWheel={(event) => {
                            applyZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25))
                        }}
                    >
                        <canvas className="text-center h-full " ref={editor.canvasRef} />
                    </div>
                    <div className="flex justify-center items-center gap-2 text-white">
                        <button onClick={() => applyZoom(zoom - 0.25)}>−</button>
                        <span className="w-16 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => applyZoom(zoom + 0.25)}>+</button>
                        <button className={panMode ? 'underline font-bold' : ''} onClick={() => setPanMode(!panMode)}>Mover</button>
                        <button onClick={resetView}>Restablecer zoom</button>
                    </div>
                    <div>
                        <div className="grid grid-cols-1  md:grid-cols-5 xl:grid-cols-5 gap-2 text-white">
                            {/* <button onClick={() => editor.text.addText()}>Add Text</button> */}
                            <button onClick={() => editor.blur.add()}>Añadir censura</button>
                            {/* <button onClick={() => editor.style.setStrokeWidth(0)}>setStrokeWidth</button> */}
                            <button onClick={() => editor.text.setColor('#ffffff')}>Eliminar todo lo censurado</button>
                            {/* <button onClick={() => editor.crop.start()}>Crop</button>
                            <button onClick={() => editor.shapes.add("rectangle")}>Rectangle</button>
                            <button onClick={() => editor.drawing.toggle()}>Draw</button> */}
                            <button onClick={() => { editor.history.undo() }} > {/* disabled={!editor.history.canUndo} */}
                                Deshacer
                            </button>
                            <button onClick={() => { editor.history.redo() }} > {/* disabled={!editor.history.canRedo} */}
                                Rehacer
                            </button>

                            <button onClick={async () => {
                                resetView();
                                const blob = await editor.exportToBlob();
                                onSave(blob!)
                                // Handle the blob
                            }}>
                                Guardar
                            </button>
                        </div>

                    </div>

                    {/* {editor.crop.isActive ===true ? (
                <div>

                    <h2>
                        Activo
                    </h2>
                    <button onClick={() => editor.crop.apply()}>Apply</button>
                    <button onClick={() => editor.crop.cancel()}>Cancel</button>
                </div>
            ): null} */}


                </div>
            </div>
        </div>
    );
}
