import os

def create_dummy_pdf(filepath):
    # Ensure the parent directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    # Write a simple mock PDF string
    with open(filepath, 'w') as f:
        f.write("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 50 >>\nstream\nBT /F1 24 Tf 100 700 Td (Mock PDF Document for Aim High Academy) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000201 00000 n\ntrailer\n<< /Size 5 >>\nstartxref\n300\n%%EOF")
    print(f"Created mock file: {filepath}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(base_dir, "uploads")
    
    mock_files = [
        "papers/cbse-10-math-2025.pdf",
        "papers/cbse-10-math-2025-key.pdf",
        "papers/class-10-physics-model.pdf",
        "papers/class-10-physics-model-key.pdf",
        "homework/math-ex-4-2.pdf",
        "submissions/mayank-math-ex-4-2.pdf",
        "receipts/inv-2026-001.pdf",
        "notes/trigo-formulas.pdf"
    ]
    
    for filename in mock_files:
        filepath = os.path.join(uploads_dir, filename)
        create_dummy_pdf(filepath)

if __name__ == "__main__":
    main()
