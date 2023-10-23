function createRaw(message: string, color = "white", italic = false, bold = false, extra: null | {color: string} = null) {
  return {
    text: message,
    color: color,
    italic: italic,
    bold: bold,
    extra: extra === null ? [{text: "", color: "white"}] : [extra],
  };
}

export { createRaw };
