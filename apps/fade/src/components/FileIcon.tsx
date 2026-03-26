import type { LucideProps } from 'lucide-react'
import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileQuestion,
  FileText,
  FileVideo,
} from 'lucide-react'

type FileIconProps = {
  mimeType?: string | undefined
} & LucideProps

export function FileIcon({ mimeType: type, ...props }: FileIconProps) {
  if (!type) {
    return <FileQuestion {...props} />
  }

  if (type.startsWith('video/')) {
    return <FileVideo {...props} />
  }

  if (type.startsWith('audio/')) {
    return <FileAudio {...props} />
  }

  if (type.startsWith('text/')) {
    if (
      type.includes('html')
      || type.includes('css')
      || type.includes('javascript')
      || type.includes('json')
      || type.includes('xml')
    ) {
      return <FileCode {...props} />
    }
    return <FileText {...props} />
  }

  if (type.includes('pdf')) {
    return <FileText {...props} />
  }

  if (
    type.includes('zip')
    || type.includes('rar')
    || type.includes('tar')
    || type.includes('7z')
    || type.includes('compressed')
  ) {
    return <FileArchive {...props} />
  }

  if (type.startsWith('application/')) {
    if (
      type.includes('json')
      || type.includes('xml')
      || type.includes('javascript')
    ) {
      return <FileCode {...props} />
    }
  }

  return <File {...props} />
}
