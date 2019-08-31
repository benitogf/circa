import React, { useCallback, useState } from 'react'
import Quill from 'quill'
import _ from 'lodash'
import { ImageDrop } from './formats/image-drop'
import { ImageResize } from './formats/image-resize'
import LinearProgress from '@material-ui/core/LinearProgress'

const noop = () => { }

export default ({ value, onChange = noop, disabled, onFocus = noop, onBlur = noop, editing = false, readOnly = false }) => {
  const [editor, setEditor] = useState(null)
  const editorRoot = useCallback(current => {
    if (current && !editor) {
      if (!readOnly && !Quill.imports['modules/imageDrop']) {
        Quill.register({
          'modules/imageDrop': ImageDrop
        })
      }

      if (!readOnly && !Quill.imports['modules/imageResize']) {
        Quill.register({
          'modules/imageResize': ImageResize
        })
      }
      const quill = new Quill(current, {
        modules: !readOnly ? {
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
          },
        } : {
            toolbar: null
          },
        theme: !readOnly ? 'snow' : null
      })
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
      setEditor(quill)
    }
  }, [onBlur, onFocus, onChange, value, editor, readOnly])

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
    <div ref={editorRoot}></div>
  </div>
}