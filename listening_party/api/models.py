from django.db import models
import string
import random

def get_room_code():
    length = 8
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))    # generate a random combination of 8 uppercase letters
        if Room.objects.filter(code=code).count() == 0:
            return code

# Create your models here.
class Room(models.Model):
    code = models.CharField(max_length=10,default=get_room_code,unique=True)   # access code to get into a room
    host = models.CharField(max_length=50, unique=True) # one host per room 
    guest_can_pause = models.BooleanField(null=False, default=False)    # permission for guest to pause songs
    votes_to_skip = models.IntegerField(null=False, default=1)  # vote to skip song
    created_at = models.DateTimeField(auto_now_add=True)    # auto_now_add automatically fetches date time upon creation

