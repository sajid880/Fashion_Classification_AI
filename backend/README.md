# Flask Backend for Clothing Classification

## Setup Instructions

1. **Install Python dependencies:**
   ```bash
   cd flask_backend
   pip install -r requirements.txt
   ```

2. **Add your model file:**
   - Place your `model.h5` file in the `flask_backend` directory
   - The model should accept 224x224 RGB images as input
   - The model should output a single value between 0-1 (0 = female, 1 = male)

3. **Run the Flask server:**
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

- `POST /classify` - Classify an image
  - Body: `{"image_url": "https://example.com/image.jpg"}`
  - Response: `{"prediction": "male|female", "confidence": 0.85}`

- `GET /health` - Check server health
  - Response: `{"status": "healthy", "model_loaded": true}`

## Model Requirements

Your `model.h5` file should:
- Accept input shape of (None, 224, 224, 3) for RGB images
- Output a single probability value between 0 and 1
- Be trained where 0 represents female clothing and 1 represents male clothing

If your model has different requirements, update the preprocessing logic in `app.py`.
