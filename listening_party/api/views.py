from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.views import Response

# Create your views here.

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

# APIView allows default methods to be overwritten i.e. get, post, etc.
class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def get(self, request):
        return Response("Data to be returned")

    def post(self, request, format=None):
        # create a session if current user doesn't have active connection with server
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        # serialize the request data
        serializer = self.serializer_class(data=request.data)
        
        # check if two required fields are in the serializer and assign them to a room, assign a host for the room
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            # create or update a Room object by searching for host
            defaults = {"host":host, "guest_can_pause":guest_can_pause, "votes_to_skip":votes_to_skip}
            obj, created = Room.objects.update_or_create(host=host,defaults=defaults)
            room = obj
            room.save()
            if not created:
                status_code = status.HTTP_200_OK
            else:
                status_code = status.HTTP_201_CREATED
            return Response(RoomSerializer(room).data, status=status_code)
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
            
            

