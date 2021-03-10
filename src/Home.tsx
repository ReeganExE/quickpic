import { FC, useCallback, useState } from 'react'
import styled from 'styled-components'
import pica from 'pica'

import { About } from './About'

// ᗁṯṫ⍴𝘴://𝟚.ῤᵢ𝓀.𝜈𝝶/, hide from search engines 😉
const IMGUR_MASK = atob('UHtQOGI0c1s0Lnt0TUFoPWh0dHBzOi8vMi5waWsudm4v').split('P{P8b4s[4.{tMAh=')[1]

function Home(): JSX.Element {
  const [url, setUrl] = useState<string>()
  const [status, setStatus] = useState<string>()

  const onPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    setStatus('')
    setUrl('')
    const file = e.clipboardData.files[0]
    if (!file) {
      setStatus('No image found')
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
      {url ? <UploadBox url={url} /> : <Placeholder>Paste an image</Placeholder>}
      <StyledAbout>
        <About />
      </StyledAbout>
    </StyledContainer>
  )
}

const UploadBox: FC<{ url: string }> = ({ url }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<string>()
  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select()
  }, [])
  const onUpload = useCallback(() => {
    setLoading(true)
    fetch(IMGUR_MASK, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      referrer: IMGUR_MASK,
      body: 'image=' + encodeURIComponent(url),
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
    })
      .then((a) => a.json())
      .then((r) => setResult(r.saved as string))
      .finally(() => setLoading(false))
  }, [url])

  return (
    <>
      <StyledBtnContainer>
        <button type="button" onClick={onUpload} disabled={loading}>
          {loading ? 'Uploading ...' : 'Upload'}
        </button>
      </StyledBtnContainer>
      {result && (
        <div>
          <StyledInput onFocus={onFocus} type="text" defaultValue={IMGUR_MASK + result} />
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
