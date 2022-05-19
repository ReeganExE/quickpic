import { FC, useCallback, useState } from 'react'
import styled from 'styled-components'
import pica from 'pica'

import { About } from './About'
import { upload } from './provider/tt'

const shouldResize = false

function Home(): JSX.Element {
  const [url, setUrl] = useState<string>()
  const [status, setStatus] = useState<string>()
  const [blob, setBlob] = useState<Blob>()

  const onPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    setStatus('')
    setUrl('')
    const file = e.clipboardData.files[0]
    if (!file) {
      setStatus('No image found')
      return
    }

    if (!shouldResize) {
      setBlob(file)
      setUrl(window.URL.createObjectURL(file))
      return
    }
    setStatus('Loading ...')
    setTimeout(() => {
      const img = new Image()
      img.src = window.URL.createObjectURL(file)
      img.onload = () => {
        const cv = document.createElement('canvas')
        const w = Math.min(img.width, 1200)
        cv.width = w
        cv.height = (w / img.width) * img.height

        const changes = `${img.width}x${img.height} -> ${cv.width}x${cv.height}`
        pica()
          .resize(img, cv, {
            quality: 3,
            alpha: true,
            unsharpAmount: 40,
            unsharpRadius: 0.5,
            unsharpThreshold: 0,
          })
          .then((cv) => {
            const b = cv.toDataURL()
            setStatus((file.size / 1024).toFixed() + 'kB / ' + changes)
            setUrl(b)
            cv.toBlob(setBlob)
          })
          .catch((e) => {
            console.error(e)
            setStatus('Cannot resize: ' + e.message)
          })
      }
    }, 1)
  }, [])

  return (
    <StyledContainer onPaste={onPaste}>
      {status && <Strong>{status}</Strong>}
      {url ? <UploadBox url={url} blob={blob} /> : <Placeholder>Paste an image</Placeholder>}
      <StyledAbout>
        <About />
      </StyledAbout>
    </StyledContainer>
  )
}

const UploadBox: FC<{ url: string; blob: Blob }> = ({ url, blob }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<string>()
  const [progress, setProgress] = useState<number>(0)
  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select()
  }, [])
  const onUpload = useCallback(() => {
    setLoading(true)
    upload(blob, (v) => setProgress(Math.ceil((v.loaded / v.total) * 100)))
      .then((r) => setResult(r.url))
      .finally(() => {
        setLoading(false)
        setProgress(0)
      })
  }, [blob])

  return (
    <>
      <StyledBtnContainer>
        <button type="button" onClick={onUpload} disabled={loading}>
          {loading ? 'Uploading ...' + progress + '%' : 'Upload'}
        </button>
      </StyledBtnContainer>
      {result && (
        <div>
          <StyledInput onFocus={onFocus} type="text" defaultValue={result} />
        </div>
      )}
      <img src={url} alt="ff" width="400px" />
    </>
  )
}

const StyledContainer = styled.div`
  margin: 2px auto;
  text-align: center;
`

const StyledAbout = styled.div`
  display: flex;
  justify-content: center;
`

const StyledInput = styled.input`
  width: 80%;
  padding: 8px 4px;
  margin: 0 20px 20px;
`

const StyledBtnContainer = styled.div`
  margin: 30px auto;
  button {
    cursor: pointer;
    overflow: hidden;
    color: rgb(33, 40, 51);
    border-radius: 4px;
    padding: 4px 16px;
    min-height: 24px;
    border: none;
    background-image: linear-gradient(rgb(248, 209, 47) 0%, rgb(240, 185, 11) 100%);
    :hover {
      box-shadow: none;
      background-image: linear-gradient(rgb(255, 226, 81) 0%, rgb(237, 196, 35) 100%);
    }

    :active {
      background-image: none;
      background-color: rgb(240, 185, 11);
    }
    :disabled {
      background-color: #d8d8d8;
      background-image: none;
    }
  }
`

const Strong = styled.strong`
  display: block;
  margin-bottom: 5px;
`

const Placeholder = styled.div`
  width: 400px;
  height: 400px;
  border: solid 1px #dcdada;
  border-radius: 5px;
  box-shadow: 1px 0px 5px 1px #c3c0c024;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default Home
