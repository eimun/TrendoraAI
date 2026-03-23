import logging
import os
from datetime import datetime

def setup_logger(name='trendora'):
    """Configure application-wide logging"""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)

    # File handler (if logs directory exists)
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)

    file_handler = logging.FileHandler(
        os.path.join(log_dir, f'trendora_{datetime.now().strftime("%Y%m%d")}.log')
    )
    file_handler.setLevel(logging.DEBUG)
    file_format = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s'
    )
    file_handler.setFormatter(file_format)
    logger.addHandler(file_handler)

    return logger


def log_request(logger):
    """Log incoming API requests"""
    from flask import request

    def decorator(f):
        from functools import wraps
        @wraps(f)
        def decorated(*args, **kwargs):
            logger.info(f"→ {request.method} {request.path} from {request.remote_addr}")
            try:
                result = f(*args, **kwargs)
                logger.info(f"← {request.method} {request.path} → {result[1] if isinstance(result, tuple) else 200}")
                return result
            except Exception as e:
                logger.error(f"✗ {request.method} {request.path} → ERROR: {str(e)}")
                raise
        return decorated
    return decorator


# Create default logger
logger = setup_logger()
