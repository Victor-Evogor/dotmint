type DotMint = { color: string; position: [number, number] }[]

export async function generateDotMint(imageSrc: string): Promise<DotMint> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas rendering context not available.')
  }

  // Set up the canvas to match the image dimensions
  canvas.width = 1024
  canvas.height = 1024

  const image = new Image()
  image.src = imageSrc

  // Wait for the image to load
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  // Draw the image onto the canvas
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  const gridSize = 30
  const cellSize = 1024 / gridSize // Each cell is 34.1333x34.1333 pixels
  const dotmint: DotMint = []

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const startX = Math.floor(x * cellSize)
      const startY = Math.floor(y * cellSize)
      const imageData = ctx.getImageData(startX, startY, Math.ceil(cellSize), Math.ceil(cellSize))

      const avgColor = getAverageColor(imageData)
      dotmint.push({ color: avgColor, position: [x, y] })
    }
  }

  return dotmint
}

function getAverageColor(imageData: ImageData): string {
  const data = imageData.data
  let r = 0,
    g = 0,
    b = 0

  for (let i = 0; i < data.length; i += 4) {
    r += data[i] // Red
    g += data[i + 1] // Green
    b += data[i + 2] // Blue
  }

  const pixelCount = data.length / 4
  r = Math.floor(r / pixelCount)
  g = Math.floor(g / pixelCount)
  b = Math.floor(b / pixelCount)

  return rgbToHex(r, g, b)
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// Usage example:
// generateDotMint("path/to/image.jpg").then(dotmint => console.log(dotmint));
