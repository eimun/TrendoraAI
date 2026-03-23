import pytest
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test health endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'

def test_register(client):
    """Test user registration"""
    response = client.post('/api/auth/register', json={
        'email': 'test_api@test.com',
        'password': 'testpass123'
    })
    # May be 201 (new) or 400 (exists from prior run)
    assert response.status_code in [201, 400]

def test_register_missing_fields(client):
    """Test registration with missing fields"""
    response = client.post('/api/auth/register', json={
        'email': 'incomplete@test.com'
    })
    assert response.status_code == 400

def test_login_invalid(client):
    """Test login with wrong credentials"""
    response = client.post('/api/auth/login', json={
        'email': 'nonexistent@test.com',
        'password': 'wrongpass'
    })
    assert response.status_code == 401

def test_protected_endpoint_no_token(client):
    """Test accessing protected route without token"""
    response = client.post('/api/trends/fetch', json={'niche': 'tech'})
    assert response.status_code == 401

def test_protected_endpoint_invalid_token(client):
    """Test accessing protected route with invalid token"""
    response = client.post(
        '/api/trends/fetch',
        json={'niche': 'tech'},
        headers={'Authorization': 'Bearer invalidtoken'}
    )
    assert response.status_code == 401

def test_virality_scorer():
    """Test virality scoring algorithm"""
    from virality_scorer import calculate_virality_score
    
    trend = {
        'keyword': 'test trend',
        'volume': 150000,
        'velocity': 'rising_fast'
    }
    
    result = calculate_virality_score(trend)
    assert 'score' in result
    assert 0 <= result['score'] <= 100
    assert result['confidence'] in ['Very High', 'High', 'Medium', 'Low']
    assert 'breakdown' in result

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
