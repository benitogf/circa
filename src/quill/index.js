import React, { useRef, useState } from 'react'
import Quill from 'quill'
import _ from 'lodash'
import { ImageDrop } from './formats/image-drop'
import { ImageResize } from './formats/image-resize'
import LinearProgress from '@material-ui/core/LinearProgress'

export default ({ value, onChange, disabled, onFocus, onBlur, editing }) => {
  const editorRoot = useRef(null)
  const toolbarRoot = useRef(null)
  const [editor, setEditor] = useState(false)
  if (editorRoot && editorRoot.current && !editor) {
    if (!Quill.imports['modules/imageDrop']) {
      Quill.register({
        'modules/imageDrop': ImageDrop
      })
    }

    if (!Quill.imports['modules/imageResize']) {
      Quill.register({
        'modules/imageResize': ImageResize
      })
    }
    const quill = new Quill(editorRoot.current, {
      modules: {
        imageDrop: true,
        imageResize: {
          modules: ['Resize', 'DisplaySize']
        },
        toolbar: {
          container: [
            [{ list: 'ordered' }, { list: 'bullet' }, { align: [false, 'center', 'right', 'justify'] }],
            ['bold', 'italic', 'underline'],
            ['image']
          ]
        }
      },
      theme: 'snow'
    })
    setEditor(quill)
    try {
      quill.setContents(value)
    } catch (e) {
      console.error(e)
      quill.setContents({ ops: [] })
    }
    quill.on('selection-change', range => !range ?
      onBlur({ target: { value: quill.getContents() } }) :
      onFocus())
    quill.on('text-change', () => onChange(quill.getContents()))
  }

  if (editor) {
    editor.enable(!disabled)
    if (!editing && !_.isEqual(value.ops, editor.getContents().ops)) {
      try {
        editor.setContents(value)
      } catch (e) {
        console.error(e)
        editor.setContents({ ops: [] })
      }
    }
  }

  return <div>
    {!editor && <LinearProgress />}
    <div ref={toolbarRoot}></div>
    <div ref={editorRoot}></div>
  </div>
}