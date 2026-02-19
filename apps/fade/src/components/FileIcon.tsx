import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileQuestion,
  FileText,
  FileVideo,
} from 'lucide-react'

interface FileIconProps {
  type?: string | undefined
  className?: string
}

export function FileIcon({ type, className }: FileIconProps) {
  if (!type) {
    return <FileQuestion className={className} />
  }

  if (type.startsWith('video/')) {
    return <FileVideo className={className} />
  }

  if (type.startsWith('audio/')) {
    return <FileAudio className={className} />
  }

  if (type.startsWith('text/')) {
    if (
      type.includes('html')
      || type.includes('css')
      || type.includes('javascript')
      || type.includes('json')
      || type.includes('xml')
    ) {
      return <FileCode className={className} />
    }
    return <FileText className={className} />
  }

  if (type.includes('pdf')) {
    return <FileText className={className} />
  }

  if (
    type.includes('zip')
    || type.includes('rar')
    || type.includes('tar')
    || type.includes('7z')
    || type.includes('compressed')
  ) {
    return <FileArchive className={className} />
  }

  if (type.startsWith('application/')) {
    if (
      type.includes('json')
      || type.includes('xml')
      || type.includes('javascript')
    ) {
      return <FileCode className={className} />
    }
  }

  return <File className={className} />
}
