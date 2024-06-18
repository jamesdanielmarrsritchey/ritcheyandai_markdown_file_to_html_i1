async function convertMarkdownToHTML(markdownFilePath, htmlElementId) {
  try {
    const response = await fetch(markdownFilePath);
    const markdownText = await response.text();
    const htmlContent = markdownToHTML(markdownText);
    document.getElementById(htmlElementId).innerHTML = htmlContent;
  } catch (error) {
    console.error("Error reading or converting Markdown:", error);
  }
}

function markdownToHTML(markdownText) {
  let html = '';
  const lines = markdownText.split('\n');

  lines.forEach(line => {
    // Process each markdown element
    if (line.startsWith('#')) {
      html += convertHeading(line);
    } else if (line.match(/^\*\s/)) {
      html += convertUnorderedList(line);
    } else if (line.match(/^\d+\.\s/)) {
      html += convertOrderedList(line);
    } else if (line.startsWith('>')) {
      html += convertBlockquote(line);
    } else if (line.match(/\*\*(.*?)\*\*/)) {
      html += convertBold(line);
    } else if (line.match(/\*(.*?)\*/)) {
      html += convertItalic(line);
    } else if (detectVideo(line)) {
      // Process video links with optional protocol
      html += convertVideo(line);
    } else if (line.match(/!\[(.*?)\]\((.*?)\)/)) {
      // Image conversion with additional check for "video:" prefix in alt text
      if (!line.match(/!\[video:(.*?)\]/)) {
        html += convertImage(line);
      }
    } else if (line.match(/\[(.*?)\]\((.*?)\)/)) {
      html += convertLink(line);
    } else {
      html += line;
    }
    html += '\n';
  });

  return html;
}

function detectVideo(line) {
  // Adjusted regex to make protocol optional
  const directVideoRegex = /!\[video:(.*?)\]\(((?:https?:\/\/)?[^\)]+\.(mp4|mov|avi|webm))\)/;
  const embeddedVideoRegex = /!\[embed:(.*?)\]\(((?:https?:\/\/)?www\.youtube\.com\/watch\?v=[^\)]+)\)/;
  return directVideoRegex.test(line) || embeddedVideoRegex.test(line);
}

function convertVideo(line) {
  // Direct video URL conversion with optional protocol
  const directVideoRegex = /!\[video:(.*?)\]\(((?:https?:\/\/)?[^\)]+\.(mp4|mov|avi|webm))\)/;
  line = line.replace(directVideoRegex, '<video controls><source src="$2" type="video/$3">Your browser does not support the video tag.</video>');

  // Embedded YouTube video URL conversion with optional protocol
  const embeddedVideoRegex = /!\[embed:(.*?)\]\(((?:https?:\/\/)?www\.youtube\.com\/watch\?v=([^\)]+))\)/;
  line = line.replace(embeddedVideoRegex, '<iframe src="https://www.youtube.com/embed/$3" frameborder="0" allowfullscreen></iframe>');

  return line;
}

function convertImage(line) {
  const imageRegex = /!\[(.*?)\]\((.*?)\)/;
  line = line.replace(imageRegex, '<img src="$2" alt="$1">');
  return line;
}

// Other conversion functions (convertHeading, convertUnorderedList, etc.) remain unchanged

function convertHeading(text) {
  const level = text.match(/^#+/)[0].length;
  return `<h${level}>${text.slice(level + 1).trim()}</h${level}>`;
}

function convertUnorderedList(text) {
  return `<ul>\n<li>${text.slice(2).trim()}</li>\n</ul>`;
}

function convertOrderedList(text) {
  return `<ol>\n<li>${text.slice(text.indexOf('.') + 2).trim()}</li>\n</ol>`;
}

function convertBlockquote(text) {
  return `<blockquote>${text.slice(2).trim()}</blockquote>`;
}

function convertBold(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function convertItalic(text) {
  // Matches italic text, ensuring not to interfere with bold text
  // Uses negative lookbehind (?<!\*) and negative lookahead (?!*) to avoid matching asterisks that are part of bold syntax (**)
  // The central capturing group (.+?) is non-greedy, ensuring it stops at the first asterisk that is not part of a bold marker
  return text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
}

function convertLink(text) {
  return text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
}

/*
Example:

window.onload = function() {
    const element = document.querySelector("#myElement");
    if (element) {
        convertMarkdownToHTML(markdownFilePath, htmlElementId);
    }
};

OnClick Example: 

document.querySelector("#myButton").addEventListener("click", function() {
    const element = document.querySelector("#myElement");
    if (element) {
        convertMarkdownToHTML(markdownFilePath, htmlElementId);
    }
});

*/