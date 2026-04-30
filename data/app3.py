"""
Local Math PDF OCR using Marker
================================
Marker converts PDFs to clean, human-readable Markdown — no LaTeX.
Fractions look like 21/16, equations like (3/8) * (3/4) = 9/32.
Runs fully offline after first model download (~1-2 GB, HuggingFace cache).

Requirements:
    pip install marker-pdf

Usage:
    python app3.py input2.pdf
    python app3.py input2.pdf --output result.md
    python app3.py input2.pdf --pages 1-3
"""

import argparse
import os
import sys
from pathlib import Path


def check_marker():
    try:
        # Just check if the base package imports successfully
        import marker
    except ImportError:
        print("Error: marker-pdf is not installed.", file=sys.stderr)
        print("Install with:  pip install marker-pdf", file=sys.stderr)
        sys.exit(1)

def run_marker(pdf_path: str, output_path: str, pages: list[int] | None):
    # Use the new v1.x imports
    from marker.converters.pdf import PdfConverter
    from marker.models import create_model_dict
    from marker.output import text_from_rendered
    from marker.config.parser import ConfigParser

    print("Loading Marker models (downloads on first run, then cached)...")
    
    # Optional config for page ranges (using the original CLI input style)
    config = {
        "output_format": "markdown", # Ensures standard markdown
        "preserve_line_breaks": True, 
        "force_standard_fonts": True
    }

    # If you want to explicitly tell it NOT to use fancy math blocks:
    # Note: Marker's primary goal is clean text, so it usually 
    # defaults to this unless specialized math models are triggered.
    
    if pages:
        # The new API prefers string ranges like "0-2" instead of a list
        config["page_range"] = f"{pages[0]}-{pages[-1]}"

    converter = PdfConverter(
        config=config,  # Just pass the dictionary directly!
        artifact_dict=create_model_dict(),
    )
    print("Models loaded.\n")

    print(f"Converting: {pdf_path}")
    
    # The new API renders the document object first
    rendered = converter(pdf_path)
    text, _, images = text_from_rendered(rendered)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"\nDone! Saved to: {output_path}")


def parse_pages(spec: str) -> list[int]:
    """Convert '1-3' or '2' to a list of 0-based page indices."""
    if not spec:
        return None
    if "-" in spec:
        a, b = spec.split("-", 1)
        return list(range(int(a) - 1, int(b)))
    return [int(spec) - 1]


# def run_marker(pdf_path: str, output_path: str, pages: list[int] | None):
#     from marker.convert import convert_single_pdf
#     from marker.models import load_all_models

#     print("Loading Marker models (downloads on first run, then cached)...")
#     models = load_all_models()
#     print("Models loaded.\n")

#     print(f"Converting: {pdf_path}")
#     full_text, images, metadata = convert_single_pdf(
#         pdf_path,
#         models,
#         pages=pages,        # None = all pages
#         langs=["English"],
#     )

#     with open(output_path, "w", encoding="utf-8") as f:
#         f.write(full_text)

#     print(f"\nDone! Saved to: {output_path}")
#     print(f"Pages processed: {metadata.get('pages_converted', '?')}")


def main():
    parser = argparse.ArgumentParser(
        description="Convert math PDF to human-readable Markdown using Marker"
    )
    parser.add_argument("pdf",      help="Input PDF file")
    parser.add_argument("--output", help="Output .md file (default: <name>_ocr.md)")
    parser.add_argument("--pages",  help="Page range e.g. 1-3 (default: all)")
    args = parser.parse_args()

    if not os.path.exists(args.pdf):
        print(f"Error: file not found: {args.pdf}", file=sys.stderr)
        sys.exit(1)

    check_marker()

    output_path = args.output or (Path(args.pdf).stem + "_ocr.md")
    pages = parse_pages(args.pages) if args.pages else None

    run_marker(args.pdf, output_path, pages)


if __name__ == "__main__":
    main()