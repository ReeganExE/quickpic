export async function upload(data: string | Blob): Promise<ImageDetails> {
  const token: string = await fetch(process.env.UPANH_HOST + '/?lang=en', {
    credentials: 'include',
  })
    .then((r) => r.text())
    .then((r) => r.match(/PF.obj.config.auth_token = "([0-9a-z]+)";/)[1])

  const d = {
    type: 'file',
    action: 'upload',
    timestamp: Date.now(),
    auth_token: token,
    nsfw: '0',
  }
  const form = new FormData()
  Object.keys(d).forEach((k) => {
    form.append(k, d[k])
  })
  form.append('source', data, 'image')
  return fetch(process.env.UPANH_HOST + '/json', {
    method: 'post',
    body: form,
  })
    .then<UpanhResponse>((a) => a.json())
    .then((r) => r.image)
}

interface ImageDetails {
  name?: string
  extension?: string
  size?: number
  width?: string
  height?: string
  filename?: string
  url: string
  ratio?: number
  size_formatted?: string
}

interface UpanhResponse {
  status_code: number
  image: ImageDetails
}
