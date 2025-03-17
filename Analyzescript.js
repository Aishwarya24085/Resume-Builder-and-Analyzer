const ROLE_SKILLS = {
    "Data Analyst": new Set(["Python", "SQL", "Excel", "Tableau", "Power BI", "Statistics"]),
    "Frontend Developer": new Set(["html", "css", "JavaScript", "React", "Vue", "Bootstrap"]),
    "Full Stack Developer": new Set(["python","c++","java", "Django", "React", "Node.js", "sql", "MongoDB"])
};

// Load PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

// Function to check if the PDF contains text
async function isTextBasedPDF(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async function () {
            try {
                const typedArray = new Uint8Array(reader.result);
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                const firstPage = await pdf.getPage(1);
                const content = await firstPage.getTextContent();
                
                // If text content exists, it's a text-based PDF
                resolve(content.items.length > 0);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Function to extract text from normal PDFs
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function () {
            const typedArray = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
            let text = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(" ") + " ";
            }
            resolve(text.toLowerCase());
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Function to extract text from image-based PDFs using OCR
async function extractTextFromImagePDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function () {
            const typedArray = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
            let extractedText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const scale = 2;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport }).promise;

                // Preprocess image before OCR
                preprocessImage(canvas);

                // Convert canvas to image and run OCR
                const image = canvas.toDataURL("image/png");
                const { data: { text } } = await Tesseract.recognize(image, "eng", {
                    logger: m => console.log(m) // Debugging
                });

                extractedText += text + " ";
            }
            resolve(extractedText.toLowerCase());
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
function preprocessImage(canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert to grayscale
        const avg = (r + g + b) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg > 128 ? 255 : 0; // Thresholding
    }

    ctx.putImageData(imageData, 0, 0);
}


// Function to extract text from DOCX files
async function extractTextFromDOCX(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const result = await window.mammoth.extractRawText({ arrayBuffer: event.target.result });
            resolve(result.value.toLowerCase());
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Function to extract text from TXT files
async function extractTextFromTXT(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.toLowerCase());
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Function to determine extraction method based on file type
async function extractTextFromResume(file) {
    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "pdf") {
        const isTextPDF = await isTextBasedPDF(file);
        return isTextPDF ? await extractTextFromPDF(file) : await extractTextFromImagePDF(file);
    } else if (fileType === "docx") {
        return await extractTextFromDOCX(file);
    } else if (fileType === "txt") {
        return await extractTextFromTXT(file);
    } else {
        alert("Unsupported file format. Please upload a PDF, DOCX, or TXT file.");
        return "";
    }
}

// Function to extract individual words from text
function extractWords(text) {
    const words = text.split(/[\s,]+/).map(word => word.trim()).filter(word => word);
    return new Set(words);
}

// Function to compare extracted skills with required skills
function matchSkills(userSkills, requiredSkills) {
    const matched = new Set([...userSkills].filter(skill => requiredSkills.has(skill)));
    const missing = new Set([...requiredSkills].filter(skill => !userSkills.has(skill)));
    const matchPercentage = (matched.size / requiredSkills.size) * 100;
    return { matched, missing, matchPercentage: Math.round(matchPercentage) };
}

// Event listener for form submission
document.getElementById("resumeForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const fileInput = document.getElementById("resume");

    if (!fileInput.files.length) {
        alert("Please upload a resume file.");
        return;
    }

    const text = await extractTextFromResume(fileInput.files[0]);
    const userSkills = extractWords(text);
    const requiredSkills = ROLE_SKILLS[role] || new Set();
    console.log("User Skills:", userSkills);
    console.log("Required Skills:", requiredSkills);
    const { matched, missing, matchPercentage } = matchSkills(userSkills, requiredSkills);

    document.getElementById("result").innerHTML = `
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Match Percentage:</strong> ${matchPercentage}%</p>
        <p><strong>Matched Skills:</strong> ${[...matched].join(", ") || "None"}</p>
        <p><strong>Missing Skills:</strong> <span style="color: red;">${[...missing].join(", ") || "None"}</span></p>
    `;
});
