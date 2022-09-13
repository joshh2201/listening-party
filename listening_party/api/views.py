from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.views import Response
from django.http import JsonResponse
# Create your views here.

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class JoinRoom(APIView):
    lookup_kwarg = 'code'
    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        code = request.data.get(self.lookup_kwarg)
        if code:
            room_query = Room.objects.filter(code=code)
            if room_query:
                room = room_query[0]
                self.request.session['room_code'] = code    # holds the code for the user session
                return Response({'message' : 'Room Joined'}, status=status.HTTP_200_OK)
            return Response({'Room Not Found' : 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request' : 'Invalid post data, no code key found'}, status=status.HTTP_400_BAD_REQUEST)            

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_kwarg = 'code'

    def get(self,request,format=None):
        code = request.GET.get(self.lookup_kwarg)   # looks for parameters in url that match the arguement
        if code:
            room = Room.objects.filter(code=code)
            if room:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host  # checks if user is host based on session key
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found':'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request':'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

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
            self.request.session['room_code'] = room.code 
            if not created:
                status_code = status.HTTP_200_OK
            else:
                status_code = status.HTTP_201_CREATED
            return Response(RoomSerializer(room).data, status=status_code)
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
            
class UserInRoom(APIView):
    def get(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {'code' : self.request.session.get('room_code')}
        return JsonResponse(data, status=status.HTTP_200_OK)

class LeaveRoom(APIView):
    def post(self,request,formate=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if room_results:
                room = room_results[0]
                room.delete()
                print('here', room)
        return Response({'Message' : 'Success'}, status=status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    
    def patch(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            room_results = Room.objects.filter(code=code)
            if room_results:
                room = room_results[0]
                user_id = self.request.session.session_key
                if room.host != user_id:
                    return Response({'Message':'User is Not The Host'}, status=status.HTTP_403_FORBIDDEN)
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_field['guest_can_pause','votes_to_skip'])
                return Response(RoomSerializer(room).data,status=status.HTTP_200_OK)
            else:
                return Response({'Room Not Found':'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request' : 'Invalid Data'}, status=status.HTTP_400_BAD_REQUEST)