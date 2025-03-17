/* script.js */
function downloadPDF() {
    let element = document.getElementById("resume");
    let opt = {
        margin: [10, 10, 10, 10],
        filename: 'Professionalresume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
        let totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.text('Page ' + i + ' of ' + totalPages, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 10, { align: 'center' });
        }
    }).save();
}