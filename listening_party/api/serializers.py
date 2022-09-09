# serializers take models in python code and translate into a JSON response
from rest_framework import serializers
from .models import Room
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause', 
                'votes_to_skip', 'created_at') # all fields from room model to serialize, id is primary key from database

class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')   # two fields that are assigned by request i.e. user inputs
