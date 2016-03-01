from __future__ import unicode_literals

from django.db import models
# only if you need to support python 2: 
from django.utils.encoding import python_2_unicode_compatible

@python_2_unicode_compatible    # only if you need to support python 2
class Exhibit(models.Model):
    title = models.CharField(max_length=200)
    
    def __str__(self):
        return self.title

@python_2_unicode_compatible    # only if you need to support python 2
class ExhibitItem(models.Model):
    item_id = models.CharField(max_length=200)
    exhibit = models.ForeignKey(Exhibit, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.item_id