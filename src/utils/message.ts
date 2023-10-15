function createRaw(message: string, color = 'white', italic = false, bold = false) {
  return {
    text: message,
    color: color,
    italic: italic,
    bold: bold,
  }
}

export { createRaw }
