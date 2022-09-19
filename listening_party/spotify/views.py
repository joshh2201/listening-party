from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
import requests
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room

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
    url = 'https://accounts.spotify.com/api/token'
    response = requests.post(url=url,data={
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

    if not request.session.exists(request.session.session_key):
        request.session.create()
    
    update_or_create_tokens(session_key=request.session.session_key, access_token=access_token, refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)

    return redirect('frontend:')    # use colon to redirect to a different django app

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated},status=status.HTTP_200_OK)

class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room_query = Room.objects.filter(code=room_code)
        if room_query:
            room = room_query[0]
            host = room.host
            endpoint = "player/currently-playing"
            response = make_spotify_api_request(host,endpoint,'GET')
            
            if 'error' in response or 'item' not in response:
                return Response({}, status=status.HTTP_204_NO_CONTENT)

            item = response.get('item')
            duration = item.get('duration_ms')
            progress = response .get('progress_ms')
            album_cover = item.get('album').get('images')[0].get('url')
            is_playing = response.get('is_playing')
            song_id = item.get('id')
            title = item.get('name')
            artist_string = ""

            for i, artist in enumerate(item.get('artists')):
                if i > 0:
                    artist_string += ", "
                name = artist.get('name')
                artist_string += name

            song = {
                'title': title,
                'artist': artist_string,
                'duration' : duration,
                'time' : progress,
                'image_url' : album_cover,
                'is_playing' : is_playing,
                'votes':0,
                'id': song_id
            }
            return Response(song, status=status.HTTP_200_OK)
        return Response({'Msg':'No Room Found'}, status=status.HTTP_404_NOT_FOUND)

class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            make_spotify_api_request(session_key, 'player/pause', method='PUT')
            return Response({}, status=status.HTTP_204_NO_CONTENTs)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            make_spotify_api_request(session_key, 'player/play', method='PUT')
            return Response({}, status=status.HTTP_204_NO_CONTENTs)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host:
            make_spotify_api_request(session_key, 'player/next', method='POST')
            return Response({}, status=status.HTTP_204_NO_CONTENTs)
        return Response({}, status=status.HTTP_403_FORBIDDEN)
