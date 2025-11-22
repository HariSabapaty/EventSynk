"""
Image Upload Manager Singleton
Centralized image upload handling with singleton pattern.
"""
import requests
import base64
from PIL import Image
from io import BytesIO

class ImageUploadManager:
    """
    Singleton Image Upload Manager
    Handles image validation and upload operations with single instance.
    """
    _instance = None
    _api_key = None
    
    def __new__(cls):
        """Override __new__ to implement Singleton pattern."""
        if cls._instance is None:
            cls._instance = super(ImageUploadManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize upload manager."""
        pass
    
    @classmethod
    def get_instance(cls):
        """Get the singleton instance."""
        if cls._instance is None:
            cls._instance = ImageUploadManager()
        return cls._instance
    
    def set_api_key(self, api_key):
        """Set ImgBB API key."""
        self._api_key = api_key
    
    def validate_image_file(self, file):
        """
        Validate uploaded file by checking MIME type and verifying actual image content.
        Returns (is_valid, error_message)
        """
        ALLOWED_MIMES = {'image/png', 'image/jpeg', 'image/jpg', 'image/gif'}
        
        # Check MIME type from the upload
        if file.mimetype not in ALLOWED_MIMES:
            return False, 'Invalid file type. Only PNG, JPG, JPEG, and GIF images are allowed.'
        
        # Verify the file is actually a valid image by trying to open it with Pillow
        try:
            file.stream.seek(0)  # Reset stream to beginning
            img = Image.open(file.stream)
            img.verify()  # Verify it's a valid image
            file.stream.seek(0)  # Reset stream again for later use
            return True, None
        except Exception as e:
            return False, 'Uploaded file is not a valid image or is corrupted.'
    
    def upload_to_imgbb(self, file):
        """
        Upload validated image file to ImgBB cloud storage.
        Returns (success, url_or_error_message)
        """
        if not self._api_key or self._api_key == 'your_imgbb_api_key_here':
            return False, 'ImgBB API key not configured. Please add IMGBB_API_KEY to .env file'
        
        try:
            # Read file and encode to base64
            file.stream.seek(0)
            image_data = base64.b64encode(file.stream.read()).decode('utf-8')
            
            # Upload to ImgBB
            url = 'https://api.imgbb.com/1/upload'
            payload = {
                'key': self._api_key,
                'image': image_data,
            }
            
            response = requests.post(url, data=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    image_url = result['data']['url']  # Direct image URL
                    return True, image_url
                else:
                    return False, 'ImgBB upload failed: ' + str(result.get('error', {}).get('message', 'Unknown error'))
            else:
                return False, f'ImgBB API error: HTTP {response.status_code}'
                
        except requests.exceptions.Timeout:
            return False, 'Upload timeout - please try again'
        except Exception as e:
            return False, f'Upload failed: {str(e)}'
    
    @classmethod
    def reset_instance(cls):
        """Reset singleton instance (useful for testing)."""
        cls._instance = None
        cls._api_key = None
