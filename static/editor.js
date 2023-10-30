var editorMarkdown = document.querySelector("#editor-markdown");
var editorHtml = document.querySelector("#editor-html");
var editorPreview = document.querySelector("#editor-preview");
var converter = new showdown.Converter();


function updatePreview() {
    var markdownText = editorMarkdown.value;

    // Markdown metnini HTML'e çevir
    var markdownHTML = converter.makeHtml(markdownText);

    // HTML metnini ekranda göster
    editorHtml.value = markdownHTML;

    // Markdown'dan oluşturulan HTML'i önizleme alanında göster
    editorPreview.innerHTML = markdownHTML;
  }

  // Sayfa yüklendiğinde de önizlemeyi güncelle
  // Markdown alanının değişikliklerini dinle
  editorMarkdown.addEventListener("input", updatePreview);
  updatePreview();