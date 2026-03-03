from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import cloudinary.uploader
import tensorflow as tf
from io import BytesIO
from PIL import Image
import numpy as np
import cloudinary
import threading
import requests
import os
import re

load_dotenv()
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

app = Flask(__name__)
CORS(app)


cloudinary.config( 
  cloud_name = CLOUDINARY_CLOUD_NAME, 
  api_key = CLOUDINARY_API_KEY, 
  api_secret = CLOUDINARY_API_SECRET
)

# Load the model
MODEL_PATH = 'model/Run-9.keras'
model = None


def delete_image_later(public_id, delay_seconds=300):
    def delete_task():
        try:
            result = cloudinary.uploader.destroy(public_id)
            print("Cloudinary delete result:", result)
        except Exception as e:
            print("Cloudinary deletion error:", e)

    timer = threading.Timer(delay_seconds, delete_task)
    timer.start()


def extract_public_id(url):
    """
    Extract Cloudinary public_id from URL regardless of folders or versions.
    Works for:
    /upload/v12345/folder/image_xxx.jpg
    /upload/image_xxx.png
    """
    match = re.search(r"/upload/(?:v\d+/)?(.+?)(?:\.\w+)(?:\?.*)?$", url)
    return match.group(1) if match else None

def load_model():
    global model
    if os.path.exists(MODEL_PATH) and model is None:
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
            model = None
    elif model is not None:
        print("Model is already loaded.")
    else:
        print(f"Model file not found at {MODEL_PATH}")
        model = None

def preprocess_image(image_url):
    """Download and preprocess image for the model"""
    try:
        # Download image from URL
        response = requests.get(image_url)
        response.raise_for_status()
        
        # Open and preprocess image
        image = Image.open(BytesIO(response.content))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image (adjust size based on your model's input requirements)
        image = image.resize((224, 224))
        # image = image.resize((120, 90))
        
        # Convert to numpy array and normalize
        image_array = np.array(image) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

# Load Model at startup
load_model()

@app.route('/classify', methods=['POST'])
def classify_image():
    if model is None:
        return jsonify({
            'error': 'Model not loaded. Please ensure model.h5 is in the flask_backend directory.'
        }), 500
    
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': 'No image URL provided'}), 400
        
        # 1️⃣ Extract public_id
        public_id = extract_public_id(image_url)
        
        if not public_id:
            return jsonify({"success": False, "error": "Invalid Cloudinary URL"}), 400

        # Preprocess the image
        processed_image = preprocess_image(image_url)
        if processed_image is None:
            return jsonify({'error': 'Failed to process image'}), 400
        
        # Make prediction
        prediction = tf.nn.softmax(model.predict(processed_image)).numpy()
        class_index = np.argmax(prediction[0])
        confidence = float(prediction[0][class_index] * 100)

        class_names = ["Trousers Male", "Jeans Male", "Trousers Female", "Jeans Female"]

        result = class_names[class_index]
        
        # Delete image after classification
        delete_image_later(public_id, delay_seconds=300)

        return jsonify({
            'success': True,
            'prediction': result,
            'confidence': round(confidence, 2)
        })
        
    except Exception as e:
        print(f"Classification error: {e}")
        return jsonify({"error": f"Classification failed, please try again later."}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    load_model()
    app.run(debug=True, host='0.0.0.0', port=5000)
