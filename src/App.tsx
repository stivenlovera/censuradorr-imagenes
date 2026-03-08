//import './App.css'
import { useState } from 'react';
import { EditorCustom } from './components/editor-custom'
import { v4 as uuidv4 } from 'uuid';
import { blobToFile } from './utils/others';
import { getZeroFill } from './utils/nameFile';
import { exportFile } from './utils/zip';

export interface IImage {
  pagina: number,
  data: string,
  description: string,
  file?: File
}

function App() {
  const [namePack, setNamePack] = useState<string>('')
  const [imagesOriginal, setImageOriginal] = useState<IImage[]>([])
  const [openModalOriginal, setOpenModalOriginal] = useState<boolean>(false)
  const [preview, setPreview] = useState<number>(0)

  const onChangeImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      filesArray.forEach((file, index) => {
        imagesOriginal.push({
          pagina: index + 1,
          data: URL.createObjectURL(file),
          description: uuidv4(),
          file: file
        })
      });
      setImageOriginal([...imagesOriginal]);
      console.log(imagesOriginal)
    } else {
      console.log('error')
    }
  }

  return (
    <>
      <div className='p-5'>
        <h3 className='col-span-2 text-2xl text-center text-white p-1'> CENSURAR IMAGENES</h3>
        <h3 className='col-span-2 text-2xl text-center text-white p-1'> {namePack} Total paginas:{imagesOriginal.length}</h3>
        <input
          className='w-full bg-amber-50 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-950 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow'
          placeholder='nombre de pack'
          onChange={(e) => {
            setNamePack(e.target.value)
          }}
          type="text" />
        <div className='py-5'>
          <input className="w-full bg-amber-50 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-950 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
            type="file"
            placeholder="Seleciona imagenes"
            multiple
            onChange={onChangeImages}
          />
        </div>

        <div className="grid grid-cols-6 gap-3">
          {
            imagesOriginal.map((img, i) => {
              return (
                <div className="max-w-xl w-full rounded-md bg-slate-950 pb-8 p-1" key={i} >
                  <img
                    onClick={() => { setOpenModalOriginal(true); setPreview(i); console.log(i) }}
                    src={img.data}
                    alt="" className="text-center h-full"
                    onKeyDown={() => {
                      console.log('onKeyDown')
                    }}
                  />
                  <div className='text-center text-white'>
                    {img.file?.name}
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className='col-span-2 py-4'>
          <button className='bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'
            type='button'
            onClick={() => {
              exportFile(imagesOriginal, namePack)
            }}
          >
            Export archivos
          </button>
        </div>
      </div>
      {
        openModalOriginal ? (

          <EditorCustom
            imageUrl={imagesOriginal[preview].data}
            closedModal={((state) => setOpenModalOriginal(state))}
            onSave={((blob) => {
              console.log('ejecutando', preview)
              //const format = getFormat(file.file!.type)
              const num = getZeroFill(preview + 1, imagesOriginal.length)
              const myFile = blobToFile(blob, `${num}.png`, `image/png`);
              const nuevo = imagesOriginal.map((file) => {
                if (file.pagina === preview + 1) {
                  file = {
                    pagina: preview + 1,
                    data: URL.createObjectURL(myFile),
                    description: uuidv4(),
                    file: myFile
                  }
                }
                return file
              })
              setImageOriginal(nuevo)
              setOpenModalOriginal(false)
            })}
          >

          </EditorCustom>

        ) : (<></>)
      }
    </>
  )
}

export default App
