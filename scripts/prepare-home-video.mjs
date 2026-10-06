import { chromium } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage()
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  const { poster, ...metadata } = await page.evaluate(async () => {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    video.src = '/assets/home-1006.mp4'
    await new Promise((resolve, reject) => {
      video.addEventListener('loadeddata', resolve, { once: true })
      video.addEventListener('error', () => reject(new Error('The supplied video could not be decoded.')), { once: true })
      video.load()
    })
    await new Promise(resolve => {
      video.addEventListener('seeked', resolve, { once: true })
      video.currentTime = Math.min(1, video.duration / 2)
    })
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return { width: video.videoWidth, height: video.videoHeight, duration: video.duration, poster: canvas.toDataURL('image/jpeg', .88) }
  })
  await writeFile('public/assets/home-1006-poster.jpg', Buffer.from(poster.split(',')[1], 'base64'))
  await writeFile('test-results/home-1006-metadata.json', JSON.stringify(metadata, null, 2))
  console.log(metadata)
} finally {
  await browser.close()
}
