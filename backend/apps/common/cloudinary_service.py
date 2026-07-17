import os
import re
import logging
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

# Check if Cloudinary is configured
IS_CLOUDINARY_CONFIGURED = False
try:
    import cloudinary
    import cloudinary.uploader
    # Verify we aren't using dummy credentials
    cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', None)
    api_key = getattr(settings, 'CLOUDINARY_API_KEY', None)
    api_secret = getattr(settings, 'CLOUDINARY_API_SECRET', None)
    
    if (cloud_name and api_key and api_secret and 
            cloud_name != 'placeholders' and 
            api_secret != 'placeholders'):
        IS_CLOUDINARY_CONFIGURED = True
except ImportError:
    pass

def get_public_id_from_url(url):
    """
    Extracts the public_id from a Cloudinary secure URL.
    Example: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/name.jpg
    Returns 'folder/name'
    """
    if not url or "res.cloudinary.com" not in url:
        return None
    
    match = re.search(r'/upload/(?:v\d+/)?([^.]+)', url)
    if match:
        # e.g., 'folder/subfolder/filename'
        return match.group(1)
    return None

def delete_from_cloudinary(url):
    """
    Deletes an asset from Cloudinary using its URL.
    """
    if not url:
        return False
        
    if IS_CLOUDINARY_CONFIGURED:
        public_id = get_public_id_from_url(url)
        if public_id:
            try:
                # Detect resource type from URL if possible
                resource_type = "image"
                if "/video/upload/" in url:
                    resource_type = "video"
                elif "/raw/upload/" in url:
                    resource_type = "raw"
                    
                cloudinary.uploader.destroy(public_id, resource_type=resource_type)
                logger.info(f"Successfully deleted {public_id} from Cloudinary")
                return True
            except Exception as e:
                logger.error(f"Failed to delete {public_id} from Cloudinary: {e}")
    else:
        # Local fallback: try to delete from local media storage
        if url.startswith('/media/'):
            local_path = url.replace('/media/', '', 1)
            try:
                if default_storage.exists(local_path):
                    default_storage.delete(local_path)
                    logger.info(f"Successfully deleted local file: {local_path}")
                    return True
            except Exception as e:
                logger.error(f"Failed to delete local file {local_path}: {e}")
    return False

def upload_avatar(file_obj, user_id):
    """
    Uploads profile avatar to Cloudinary. Resizes it to 500x500 square with good quality.
    """
    if IS_CLOUDINARY_CONFIGURED:
        try:
            result = cloudinary.uploader.upload(
                file_obj,
                folder=f"chat_app/avatars",
                public_id=f"user_{user_id}_avatar",
                overwrite=True,
                transformation=[
                    {"width": 500, "height": 500, "crop": "fill", "gravity": "face"},
                    {"quality": "auto:good"}
                ]
            )
            return result.get("secure_url")
        except Exception as e:
            logger.error(f"Cloudinary avatar upload failed, falling back to local: {e}")
            
    # Local fallback
    path = default_storage.save(f"avatars/user_{user_id}_avatar.jpg", file_obj)
    return f"/media/{path}"

def upload_cover_photo(file_obj, user_id):
    """
    Uploads cover photo to Cloudinary. Resizes to 1200x400 landscape.
    """
    if IS_CLOUDINARY_CONFIGURED:
        try:
            result = cloudinary.uploader.upload(
                file_obj,
                folder=f"chat_app/covers",
                public_id=f"user_{user_id}_cover",
                overwrite=True,
                transformation=[
                    {"width": 1200, "height": 400, "crop": "limit"},
                    {"quality": "auto:good"}
                ]
            )
            return result.get("secure_url")
        except Exception as e:
            logger.error(f"Cloudinary cover upload failed, falling back to local: {e}")
            
    # Local fallback
    path = default_storage.save(f"covers/user_{user_id}_cover.jpg", file_obj)
    return f"/media/{path}"

def upload_attachment(file_obj, filename):
    """
    Uploads message attachment to Cloudinary, detecting resource type (video, image, raw).
    Forces PDFs and other documents to 'raw' to avoid Cloudinary security blocks.
    """
    if IS_CLOUDINARY_CONFIGURED:
        try:
            # By default, auto detects PDFs as 'image', but free tiers block PDF image delivery.
            # We force known document types to 'raw'.
            res_type = "auto"
            lower_name = str(filename).lower()
            if lower_name.endswith('.pdf') or lower_name.endswith('.doc') or lower_name.endswith('.docx') or lower_name.endswith('.txt') or lower_name.endswith('.zip'):
                res_type = "raw"
                
            result = cloudinary.uploader.upload(
                file_obj,
                folder="chat_app/attachments",
                resource_type=res_type
            )
            return result.get("secure_url")
        except Exception as e:
            logger.error(f"Cloudinary attachment upload failed, falling back to local: {e}")
            
    # Local fallback
    safe_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    path = default_storage.save(f"attachments/{safe_name}", file_obj)
    return f"/media/{path}"
