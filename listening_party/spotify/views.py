from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
import requests
from rest_framework import status
from rest_framework.response import Response
from .util import update_or_create_tokens, is_spotify_authenticated

# Create your views here.
class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = 'https://accounts.spotify.com/authorize'
        prepped_url = requests.Request(method='GET',url=url, params={
            'scope':scopes,
            'response_type':'code',
            'redirect_uri':REDIRECT_URI,
            'client_id':CLIENT_ID
        }).prepare().url

        return Response({'url':prepped_url},status=status.HTTP_200_OK)
    
def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')
    url = 'https://accounts.spotfy.com/api/token'
    response = request.post(url=url,data={
        'grant_type' : 'authorization_code',
        'code' : code,
        'redirect_uri' : REDIRECT_URI,
        'client_id' : CLIENT_ID,
        'client_secret' : CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not self.request.session.exists(self.request.session.session_key):
        self.request.session.create()
    
    update_or_create_tokens(session_key=request.session.session_key, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)

    return redirect('frontend:')    # use colon to redirect to a different django app

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated},status=status.HTTP_200_OK)