function print() {
  const printWindow = window.open("/print", "_blank");
  printWindow.onload = function () {
    printWindow.print();
    // Close the print window after a delay
    setTimeout(() => printWindow.close(), 500);
  };
}

function generatePDF() {
  // Get the print layout URL
  const printURL = new URL("print", window.location.href).href;

  // Fetch the print layout content
  fetch(printURL)
    .then((response) => response.text())
    .then((html) => {
      // Create a temporary container
      const container = document.createElement("div");
      container.className = "pdf-content";
      container.innerHTML = html;
      const experienceItems = container.querySelectorAll(
        ".experiences-section > .item",
      );
      for (const index of [1, 6]) {
        if (experienceItems[index]) {
          experienceItems[index].classList.add("html2pdf__page-break");
        }
      }

      // Get name from the DOM (as defined in data.yml)
      const name = document.querySelector(".name").textContent;
      // Format filename: replace spaces with underscores and append _resume.pdf
      const filename = `${name.replace(/\s+/g, "_")}_Resume.pdf`;
      const sidebarColor = getComputedStyle(
        document.querySelector(".sidebar-wrapper"),
      )
        .backgroundColor.match(/\d+/g)
        .slice(0, 3)
        .map(Number);
      const sidebarColorPatch = document.createElement("canvas");
      sidebarColorPatch.width = 16;
      sidebarColorPatch.height = 16;
      const sidebarColorContext = sidebarColorPatch.getContext("2d");
      sidebarColorContext.fillStyle = `rgb(${sidebarColor.join(", ")})`;
      sidebarColorContext.fillRect(
        0,
        0,
        sidebarColorPatch.width,
        sidebarColorPatch.height,
      );
      const sidebarColorImage = sidebarColorPatch.toDataURL("image/jpeg", 1);

      // Configure pdf options
      const opt = {
        // Keep content clear of the page edges, especially after page breaks.
        margin: [10, -0.1, 8, 0],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [
            "p",
            "blockquote",
            "li",
            ".certifications-section .item",
            ".projects-section .item",
            ".sidebar-wrapper .item",
            ".meta",
            ".upper-row",
            ".details",
            ".container-block",
            ".skillset",
          ],
        },
      };

      // Generate PDF
      html2pdf()
        .set(opt)
        .from(container)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          let pageCount = pdf.internal.getNumberOfPages();
          if (pageCount === 4) {
            pdf.deletePage(pageCount);
            pageCount -= 1;
          }
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const sidebarWidth = pageWidth * 0.3;

          for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
            pdf.setPage(pageNumber);
            pdf.addImage(
              sidebarColorImage,
              "JPEG",
              0,
              0,
              sidebarWidth,
              opt.margin[0],
            );
            if (pageNumber < pageCount) {
              pdf.addImage(
                sidebarColorImage,
                "JPEG",
                0,
                pageHeight - opt.margin[2],
                sidebarWidth,
                opt.margin[2],
              );
            }
          }
        })
        .save()
        .catch((err) => console.error("Error generating PDF:", err));
    })
    .catch((err) => console.error("Error fetching print layout:", err));
}
