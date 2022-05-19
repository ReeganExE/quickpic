import axios from 'axios'
import { ImageDetails, OnProgress } from './types'

export async function upload(data: string | Blob, onProgress?: OnProgress): Promise<ImageDetails> {
  const d = {
    forum_id: '747',
  }
  const form = new FormData()
  Object.keys(d).forEach((k) => {
    form.append(k, d[k])
  })
  form.append('file', data)
  return axios
    .post<TtvnResponse>(process.env.TTVN_URL + '&oauth_token=' + process.env.TTVN_TOKEN, form, {
      onUploadProgress: onProgress,
    })
    .then((r) => ({ url: r.data.attachment.links.permalink }))
}

interface TtvnResponse {
  attachment: Attachment
  system_info: SystemInfo
}

interface Attachment {
  attachment_id: number
  attachment_download_count: number
  filename: string
  links: Links
  attachment_width: number
  attachment_height: number
  attachment_is_video: boolean
  permissions: Permissions
}

interface Links {
  permalink: string
  data: string
  thumbnail: string
}

interface Permissions {
  view: boolean
  delete: boolean
}

interface SystemInfo {
  visitor_id: number
  time: number
}
