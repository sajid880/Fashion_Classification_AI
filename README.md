# Fashion Classification AI — Gender & Clothing-Type Classification
### Full-Stack Deep Learning System (React + Flask + TensorFlow)

ClothingAI is an end-to-end image classification system capable of identifying clothing types and gender categories from user-uploaded images.  
The system classifies images into **four categories**:

- **Trousers Male**  
- **Jeans Male**  
- **Trousers Female**  
- **Jeans Female**

This project consists of a **React frontend**, a **Flask backend**, and a **TensorFlow model** trained through extensive experimentation using both custom CNNs and pretrained architectures.

---

## How to Use the Codebase

### Environment Variables

Create a `.env` file in both the **frontend** and **backend** folders.

#### **Frontend (.env)**
```
VITE_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-cloudinary-preset
VITE_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
VITE_PUBLIC_CLOUDINARY_URL=your-cloudinary-url
```

#### **Backend (.env)**
```
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

###  Add the Model File  
Create a `model` folder inside the backend directory and place `model.keras` inside it.

### Frontend Setup  
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup  
```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

## Features

### Clothing Classification  
Upload an image → model predicts the clothing type and gender with a confidence score.

### Deep Learning Models  
Includes:  
- **16 custom CNN experiments**  
- Pretrained models: **MobileNetV2**, **ResNet50**, **EfficientNetB0**  
- Final model selected based on validation accuracy, generalization, and inference speed  

### Cloudinary Integration  
- Secure image uploads  
- Backend retrieves the Cloudinary URL for prediction  
- Automatic image deletion after 5 minutes  

### Flask Backend  
- Loads TensorFlow model once at startup  
- `/classify` for predictions  
- `/health` for diagnostics  

### 🖥️ React Frontend  
- Clean UI for image upload and preview  
- Instant prediction  
- Toast notifications for feedback  

---

## Project Architecture

```
ClothingAI/
│
├── frontend/            # React UI
│
├── backend/             # Flask API
│   ├── app.py
│   ├── model/
│   │   └── model.keras  # Final deployed model
│   └── training/        # Notebooks and experiments
│
└── README.md
```

---

## The Model

### Final Deployed Model  
`backend/model/model.keras`

Selected because of:  
- High validation accuracy  
- Strong generalization  
- Lightweight structure  
- Fast inference times  

---

## API Endpoints

### **POST /classify**  
Classifies an image using the Cloudinary URL.

Request:
```json
{
  "image_url": "https://res.cloudinary.com/.../example.jpg"
}
```

Response:
```json
{
  "success": true,
  "prediction": "Jeans Female",
  "confidence": 0.91
}
```

### **GET /health**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

---

## Model Training
Training includes:  
- Hyperparameter search  
- Model evaluation  
- CNN architecture experiments  
- Pretrained network fine-tuning  

---

## Future Improvements

- Add more clothing categories  
- Multi-label classification (e.g., detect accessories + clothing)  
- Expand dataset for better generalization  
- Improve jeans vs trousers separation using bounding-box cropping  
- Implement on-device inference (TensorFlow.js or TFLite)  
- Add user account system + prediction history  

---

## 📜 License  
MIT License.
