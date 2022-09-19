from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
import requests
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID


def get_user_tokens(session_key):
    user_tokens = SpotifyToken.objects.filter(user=session_key)
    if user_tokens:
        return user_tokens[0]
    else:
        return None

def update_or_create_tokens(session_key,access_token,token_type,expires_in, refresh_token):
    tokens = get_user_tokens(session_key)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token','token_type','expires_in', 'refresh_token'])
    else:
        tokens = SpotifyToken(user=session_key, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()

def is_spotify_authenticated(session_key):
    tokens = get_user_tokens(session_key)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_key)
        return True
    return False

def refresh_spotify_token(session_key):
    refresh_token = get_user_tokens(session_key).refresh_token
    url = 'https://accounts.spotfy.com/api/token'
    reponse = requests.post(url=url,data={
        'grant_type' : 'refresh_token',
        'refresh_token' : refresh_token,
        'client_id' : CLIENT_ID,
        'client_secret' : CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')

    update_or_create_tokens(session_key, access_token, token_type, expires_in, refresh_token)

def make_spotify_api_request(session_key,endpoint, method):
    tokens = get_user_tokens(session_key)
    headers = {'Content-Type':'application/json','Authorization' : 'Bearer ' + tokens.access_token}
    base_url = 'https://api.spotify.com/v1/me/'
    url = base_url + endpoint

    if method == 'POST':
        requests.post(url=url, headers=headers)
    elif method == 'PUT':
        requests.put(url=url, headers=headers)
    else:
        try:
            response = requests.get(url=url, headers=headers)
            return response.json()
        except:
            return {'Error' : 'Issue with request'}
