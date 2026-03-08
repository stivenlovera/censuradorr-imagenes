import { useImageEditor } from "@ozdemircibaris/react-image-editor/core";
import { useEffect } from "react";

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
                    <canvas className="text-center h-full " ref={editor.canvasRef} />
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
