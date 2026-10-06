export const applicationEmail = 'miellewellness@gmail.com'

const supportedResumeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export function resumeError(file?: File) {
  if (!file) return 'Please select your resume.'
  if (!supportedResumeTypes[file.name.split('.').pop()?.toLowerCase() ?? '']) return 'Choose a PDF, DOC or DOCX resume.'
  if (!file.size) return 'This file is empty. Choose your resume again.'
  if (file.size > 10 * 1024 * 1024) return 'Choose a resume smaller than 10 MB.'
  return ''
}

