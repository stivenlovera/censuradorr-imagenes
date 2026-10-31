import JSZip from 'jszip';
import { getFormat, getZeroFill } from './nameFile';
import type { IImage } from '../App';

// Con rename, cada archivo se llama por su posición (01.png, 02.png…); sin él, conserva su nombre
// original. En ese caso, si dos archivos se llaman igual se añade un sufijo para que JSZip no pise uno con otro.
export function exportFile(files: IImage[], nameFile: string, rename: boolean) {
    const zip = new JSZip();
    const used = new Set<string>();
    files.forEach((file, index) => {
        let name: string;
        if (rename) {
            const format = getFormat(file.file!.type)
            const num = getZeroFill(index + 1, files.length)
            name = `${num}.${format}`;
        } else {
            name = uniqueName(file.file!.name, used);
        }
        used.add(name);
        zip.file(name, file.file!);
    });

    zip.generateAsync({ type: "blob" }).then(function (content) {
        const link = document.createElement("a");
        link.download = `${nameFile}.zip`;
        link.href = URL.createObjectURL(content);
        link.click();
        URL.revokeObjectURL(link.href);
    });
}

function uniqueName(name: string, used: Set<string>): string {
    if (!used.has(name)) return name;
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let i = 2;
    while (used.has(`${base}-${i}${ext}`)) i++;
    return `${base}-${i}${ext}`;
}