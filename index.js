#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const html2pdf = require('html-pdf');

// get command line arguments
const mdFile = process.argv[2];
const outFile = process.argv[3];

// check command line parameter
if (mdFile === undefined) {
    console.error("Error: missing argument, no markdown file specified.");
    return;
}

// check if command line parameter is actually a call for help
if (['-h', '-H', '/h', '/H', '?', '/?'].indexOf(mdFile) >= 0) {
    console.log(`
    usage: md-to-pdf path/to/file.md [path/to/output.pdf]

    creates a PDF file from the specified markdown file. If output path is
    omitted, it will derive the pdf name from the markdown file name and save it
    into the directory that contains the markdown file.
    `);

    return;
}

// set file encoding
const fileEncoding = 'utf-8';

// get readme content
const markdownString = fs.readFileSync(mdFile, fileEncoding);

// get css content
const cssString = fs.readFileSync(__dirname + '/markdown.css', fileEncoding);

// combine everything into one html string
const htmlString = `<!DOCTYPE html>
<html>
<head>
<meta charset="${fileEncoding}">
<style>
${cssString}
</style>
</head>
<body>
${marked(markdownString)}
</body></html>
`;

// get or create pdf file name
const pdfFileName = outFile || path.join(path.parse(mdFile).dir, path.parse(mdFile).name + '.pdf');

// get base dir to look for assets => assume paths are relative to markdown file path
const baseDir = path.resolve(process.cwd(), path.parse(mdFile).dir);

// create pdf from html string
html2pdf.create(htmlString, {
    format: 'A4',
    border: {
        top: '30mm',
        right: '40mm',
        bottom: '30mm',
        left: '20mm'
    },
    base: "file://" + baseDir + '/',
// write to pdf file
}).toFile(pdfFileName, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log("PDF created successfully:", res.filename);
});
